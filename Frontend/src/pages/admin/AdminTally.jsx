import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSync,
  MdSettings,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdCloudDone,
  MdHistory,
  MdCompareArrows,
  MdList
} from 'react-icons/md';
import { useAdminToast } from '../../hooks/useAdmin';
import adminService from '../../services/adminService';
import {
  getTallyStatus,
  testTallyConnection,
  syncProductToTally,
  syncCustomerToTally,
  syncAllProductsToTally
} from '../../services/additionalServices';

const AdminTally = () => {
  const navigate = useNavigate();
  const { success, error, info } = useAdminToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    host: 'localhost',
    port: '9000',
    autoSync: true,
    syncOrders: true,
    syncCustomers: true,
    syncProducts: true
  });

  const [tallyStatus, setTallyStatus] = useState({
    connected: false,
    version: 'N/A',
    lastSync: 'N/A',
    pendingBills: 0,
    todaySales: '₹0'
  });

  const [syncHistory, setSyncHistory] = useState([]);
  const [ledgers, setLedgers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tallyStatusData = await getTallyStatus();
        if (tallyStatusData) {
          setTallyStatus({
            connected: tallyStatusData.connected || false,
            version: tallyStatusData.version || 'TallyPrime',
            lastSync: tallyStatusData.lastSyncTime || 'N/A',
            pendingBills: tallyStatusData.pendingCount || 0,
            todaySales: `₹${(tallyStatusData.todaySales || 0).toLocaleString()}`
          });
        }
        try {
          const historyData = await adminService.getActivityLogs();
          if (historyData) {
            const uniqueHistory = historyData.filter((item, index, self) =>
              index === self.findIndex(t =>
                t.type === item.type && t.ref === item.ref &&
                t.status === item.status && t.time === item.time
              )
            );
            setSyncHistory(uniqueHistory);
          }
        } catch (err) { console.log('Activity logs not available'); }
        try {
          const ledgerData = await adminService.getTallyLedgers();
          if (ledgerData) setLedgers(ledgerData);
        } catch (err) { console.log('Ledgers not available'); }
      } catch (err) {
        console.error('Failed to load Tally data:', err);
        setTallyStatus({ connected: false, version: 'N/A', lastSync: 'N/A', pendingBills: 0, todaySales: '₹0' });
      }
    };
    loadData();
  }, []);

  const handleUpdateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminService.updateTallySettings(settings);
      success('Tally integration parameters updated');
    } catch (err) { error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    info('Polling Tally ERP instance...');
    try {
      const response = await testTallyConnection();
      if (response && response.success) {
        setTallyStatus(prev => ({ ...prev, connected: true, version: response.version || 'TallyPrime' }));
        success('Handshake successful with Tally');
      } else {
        throw new Error(response?.message || 'Connection failed');
      }
    } catch (err) {
      error(err.message || 'Connection to TallyPrime instance failed');
      setTallyStatus(prev => ({ ...prev, connected: false }));
    } finally { setTesting(false); }
  };

  const handleManualSync = async () => {
    setLoading(true);
    info('Syncing all products to Tally...');
    try {
      const result = await syncAllProductsToTally();
      setTallyStatus(prev => ({ ...prev, lastSync: 'Just now', pendingBills: 0 }));
      success(`Successfully synced ${result.syncedCount || 'all'} products to Tally`);
    } catch (err) { error(err.message || 'Sync failed. Check Tally connectivity.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-7 md:py-10">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic font-black text-[#00A88F] tracking-tight truncate">
              Tally ERP Integration
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 sm:mt-1 opacity-70">
              Synchronization Interface
            </p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={loading}
            className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl shadow-lg transition-all active:scale-95 whitespace-nowrap ${loading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#00A88F] text-white hover:bg-[#008F7A] shadow-[#00A88F]/20'
              }`}
          >
            <MdSync className={`${loading ? 'animate-spin' : ''} text-base sm:text-lg md:text-xl flex-shrink-0`} />
            <span className="font-bold tracking-widest uppercase text-[9px] sm:text-[10px] md:text-xs">Sync Now</span>
          </button>
        </div>

        {/* ─── Status Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">

          {/* Status */}
          <div className="bg-white border border-slate-100 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-50 text-[#00A88F] rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdCloudDone className="text-lg sm:text-xl md:text-2xl" />
              </div>
              <span className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest ${tallyStatus.connected
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-[#FFE4E6] text-[#E11D48]'
                }`}>
                {tallyStatus.connected ? 'OK' : 'OFF'}
              </span>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">Status</p>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight truncate">{tallyStatus.version}</h3>
          </div>

          {/* Last Sync */}
          <div className="bg-white border border-slate-100 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdHistory className="text-lg sm:text-xl md:text-2xl" />
              </div>
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 bg-blue-50 text-blue-500 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">Last Sync</p>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight truncate">{tallyStatus.lastSync}</h3>
          </div>

          {/* Queue */}
          <div className="bg-white border border-slate-100 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-50 text-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdCompareArrows className="text-lg sm:text-xl md:text-2xl" />
              </div>
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${tallyStatus.pendingBills > 0 ? 'bg-orange-400 animate-pulse' : 'bg-transparent'
                }`} />
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">Queue</p>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-[#F97316] uppercase tracking-tight truncate">{tallyStatus.pendingBills} Vouchers</h3>
          </div>

          {/* Auto Engine */}
          <div className="bg-white border border-slate-100 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-8">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-50 text-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdCheckCircle className="text-lg sm:text-xl md:text-2xl" />
              </div>
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${settings.autoSync ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'
                }`} />
            </div>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">Auto Engine</p>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight">{settings.autoSync ? 'ENABLED' : 'PAUSED'}</h3>
          </div>
        </div>

        {/* ─── Main Grid: Config + Logs ─── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 items-start">

          {/* ERP Config Panel */}
          <div className="w-full lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-xl shadow-slate-200/50">

              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <div className="p-2 sm:p-2.5 md:p-3 bg-emerald-50 text-[#00A88F] rounded-xl md:rounded-2xl flex-shrink-0">
                  <MdSettings className="text-lg sm:text-xl md:text-2xl" />
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">ERP Config</h2>
              </div>

              <div className="space-y-5 sm:space-y-6 md:space-y-8">

                <div>
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 sm:mb-3 block">
                    Gateway Address
                  </label>
                  <input
                    type="text"
                    value={settings.host}
                    onChange={(e) => handleUpdateSetting('host', e.target.value)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-[#F8FAFC] border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#00A88F]/20 transition-all font-bold text-slate-700 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 sm:mb-3 block">
                    Sync Port
                  </label>
                  <input
                    type="text"
                    value={settings.port}
                    onChange={(e) => handleUpdateSetting('port', e.target.value)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-[#F8FAFC] border-none rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-[#00A88F]/20 transition-all font-black text-slate-700 text-xs sm:text-sm"
                  />
                </div>

                {/* Toggles */}
                <div className="bg-[#F8FAFC] rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6 md:space-y-8 border border-slate-50">

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight block">Auto Sync</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase italic block mt-0.5">Push real-time</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={settings.autoSync}
                        onChange={() => handleUpdateSetting('autoSync', !settings.autoSync)} className="sr-only peer" />
                      <div className="w-11 h-6 sm:w-12 sm:h-7 md:w-14 md:h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] sm:after:h-[22px] sm:after:w-[22px] md:after:h-6 md:after:w-6 md:after:top-[4px] md:after:left-[4px] after:transition-all peer-checked:bg-[#00A88F] shadow-sm" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight block">Database Master</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase italic block mt-0.5">Master Sync</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={settings.syncProducts}
                        onChange={() => handleUpdateSetting('syncProducts', !settings.syncProducts)} className="sr-only peer" />
                      <div className="w-11 h-6 sm:w-12 sm:h-7 md:w-14 md:h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] sm:after:h-[22px] sm:after:w-[22px] md:after:h-6 md:after:w-6 md:after:top-[4px] md:after:left-[4px] after:transition-all peer-checked:bg-[#00A88F] shadow-sm" />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3 pt-1">
                  <button onClick={handleSaveSettings} disabled={saving}
                    className="w-full py-3 sm:py-3.5 md:py-4 bg-[#00A88F] text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-[#00A88F]/10 hover:bg-[#008F7A] transition-all active:scale-[0.98] text-[9px] sm:text-[10px] uppercase tracking-widest disabled:opacity-60">
                    {saving ? 'Saving...' : 'SAVE CONFIG'}
                  </button>
                  <button onClick={handleTestConnection} disabled={testing}
                    className="w-full py-3 sm:py-3.5 md:py-4 bg-white text-[#00A88F] border-2 border-[#00A88F] rounded-xl md:rounded-2xl hover:bg-emerald-50 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-60">
                    <MdRefresh className={`text-base sm:text-lg md:text-xl flex-shrink-0 ${testing ? 'animate-spin' : ''}`} />
                    <span>{testing ? 'Checking...' : 'TEST HANDSHAKE'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Journal Logs Panel */}
          <div className="w-full lg:col-span-8">
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">

              <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 border-b border-slate-50 flex items-center justify-between gap-3 bg-slate-50/10">
                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MdHistory className="text-base sm:text-xl md:text-2xl" />
                  </div>
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight truncate">Cloud Journal Logs</h2>
                </div>
                <button onClick={() => navigate('/admin/notifications')}
                  className="flex-shrink-0 text-[9px] sm:text-[10px] font-black text-[#00A88F] border border-[#00A88F]/20 hover:bg-emerald-50 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl transition-all uppercase tracking-widest whitespace-nowrap">
                  Deep Audit
                </button>
              </div>

              <div className="overflow-x-auto px-3 sm:px-5 md:px-8 lg:px-10 pb-4 sm:pb-6 md:pb-8 lg:pb-10">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[400px]">
                  <thead>
                    <tr>
                      <th className="py-4 sm:py-6 md:py-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-50">Activity Class</th>
                      <th className="py-4 sm:py-6 md:py-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-50 text-center">Reference</th>
                      <th className="py-4 sm:py-6 md:py-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-50 text-center">Push Status</th>
                      <th className="py-4 sm:py-6 md:py-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-slate-50 text-right">Time Matrix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {syncHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="py-4 sm:py-6 md:py-8 lg:py-10">
                          <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tight block mb-0.5 whitespace-nowrap">{item.type}</span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60 italic">Journal Log</span>
                        </td>
                        <td className="py-4 sm:py-6 md:py-8 lg:py-10 text-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-100 mx-auto" />
                        </td>
                        <td className="py-4 sm:py-6 md:py-8 lg:py-10">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${item.status === 'Synced' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${item.status === 'Synced' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {item.status === 'Synced' ? 'SUCCESSFUL' : 'PUSH ERROR'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 sm:py-6 md:py-8 lg:py-10 text-right">
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest italic whitespace-nowrap">{item.time || '--:--'}</span>
                        </td>
                      </tr>
                    ))}
                    {syncHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-16 sm:py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] sm:text-xs opacity-50">
                          No records in sync journal
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 text-center bg-slate-50/30 border-t border-slate-50">
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
                  <span className="font-black text-[#00A88F] mr-1.5 sm:mr-2 underline decoration-2 underline-offset-4">Intelligence:</span>
                  Auto re-queued flagged vouchers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mapped Ledgers ─── */}
        <div className="mt-5 sm:mt-7 md:mt-10 lg:mt-12 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">

          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 border-b border-slate-50 flex items-center justify-between gap-3 bg-slate-50/10">
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-50 text-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdList className="text-base sm:text-xl md:text-2xl" />
              </div>
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight truncate">Mapped Ledgers</h2>
            </div>
            <button
              onClick={async () => {
                try {
                  const data = await adminService.getTallyLedgers();
                  setLedgers(data || []);
                  success('Ledgers refreshed');
                } catch (err) { error('Failed to fetch ledgers'); }
              }}
              className="flex-shrink-0 text-[9px] sm:text-[10px] font-black text-purple-600 border border-purple-100 hover:bg-purple-50 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl transition-all uppercase tracking-widest whitespace-nowrap"
            >
              Refresh Map
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {ledgers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {ledgers.map((l, i) => (
                  <div key={i} className="p-4 sm:p-5 md:p-6 border border-slate-50 rounded-2xl md:rounded-[2rem] bg-slate-50/20 flex items-center justify-between gap-3 group hover:border-purple-200 transition-all">
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-xs sm:text-sm text-slate-700 uppercase tracking-tight block truncate">{l.name}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase opacity-60 mt-0.5 italic block">{l.parent || 'Primary'}</span>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all text-slate-300 flex-shrink-0">
                      <MdCheckCircle className="text-base sm:text-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 sm:py-16 md:py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                No Ledgers Found / Not Synced
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTally;