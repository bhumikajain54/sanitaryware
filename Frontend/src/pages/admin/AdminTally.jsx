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
import { 
  useAdminToast 
} from '../../hooks/useAdmin';
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

  // Load existing settings and history
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use real Tally API
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
        
        // Load activity logs
        try {
          const historyData = await adminService.getActivityLogs();
          if (historyData) setSyncHistory(historyData);
        } catch (err) {
          console.log('Activity logs not available');
        }

        // Load ledgers
        try {
           const ledgerData = await adminService.getTallyLedgers();
           if (ledgerData) setLedgers(ledgerData);
        } catch (err) { console.log('Ledgers not available'); }
      } catch (err) {
        console.error('Failed to load Tally data:', err);
        setTallyStatus({
          connected: false,
          version: 'N/A',
          lastSync: 'N/A',
          pendingBills: 0,
          todaySales: '₹0'
        });
      }
    };
    loadData();
  }, []);

  const handleUpdateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminService.updateTallySettings(settings);
      success('Tally integration parameters updated');
    } catch (err) {
      error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    info('Polling Tally ERP instance...');
    try {
      const response = await testTallyConnection();
      if (response && response.success) {
        setTallyStatus(prev => ({ 
          ...prev, 
          connected: true, 
          version: response.version || 'TallyPrime' 
        }));
        success('Handshake successful with Tally');
      } else {
        throw new Error(response?.message || 'Connection failed');
      }
    } catch (err) {
      error(err.message || 'Connection to TallyPrime instance failed');
      setTallyStatus(prev => ({ ...prev, connected: false }));
    } finally {
      setTesting(false);
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    info('Syncing all products to Tally...');
    try {
      const result = await syncAllProductsToTally();
      setTallyStatus(prev => ({ 
        ...prev, 
        lastSync: 'Just now', 
        pendingBills: 0 
      }));
      success(`Successfully synced ${result.syncedCount || 'all'} products to Tally`);
    } catch (err) {
      error(err.message || 'Sync failed. Check Tally connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="text-[12px] sm:text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent italic tracking-tight">Tally ERP Integration</h1>
            <p className="text-[6px] sm:text-sm font-black text-[var(--admin-text-secondary)] mt-0.5 sm:mt-2 font-black uppercase tracking-widest opacity-60">Synchronization Interface</p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={loading}
            className={`flex items-center gap-1 sm:gap-3 px-3 py-1.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-2xl shadow-xl transition-all active:scale-95 group whitespace-nowrap ${
              loading 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20'
            }`}
          >
            <MdSync className={`${loading ? 'animate-spin' : ''} text-sm sm:text-2xl`} />
            <span className="font-black tracking-widest uppercase text-[7px] sm:text-[10px]">Sync Now</span>
          </button>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] p-2 sm:p-8 rounded-xl sm:rounded-[2.5rem] shadow-xl shadow-teal-500/5 group">
            <div className="flex items-center justify-between mb-2 sm:mb-8">
              <div className="w-8 h-8 sm:w-14 sm:h-14 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                <MdCloudDone className="text-lg sm:text-3xl" />
              </div>
              <span className={`px-1.5 py-0.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest ${
                tallyStatus.connected 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
              }`}>
                {tallyStatus.connected ? 'OK' : 'OFF'}
              </span>
            </div>
            <p className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-none">Status</p>
            <h3 className="text-[8px] sm:text-xl font-black text-[var(--admin-text-primary)] mt-0.5 sm:mt-1 uppercase tracking-tight truncate">{tallyStatus.version}</h3>
          </div>

          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] p-2 sm:p-8 rounded-xl sm:rounded-[2.5rem] shadow-xl shadow-blue-500/5 group">
            <div className="flex items-center justify-between mb-2 sm:mb-8">
              <div className="w-8 h-8 sm:w-14 sm:h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                <MdHistory className="text-lg sm:text-3xl" />
              </div>
              <span className="px-1.5 py-0.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-none">Last Sync</p>
            <h3 className="text-[8px] sm:text-xl font-black text-[var(--admin-text-primary)] mt-0.5 sm:mt-1 uppercase tracking-tight">{tallyStatus.lastSync}</h3>
          </div>

          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] p-2 sm:p-8 rounded-xl sm:rounded-[2.5rem] shadow-xl shadow-orange-500/5 group">
            <div className="flex items-center justify-between mb-2 sm:mb-8">
              <div className="w-8 h-8 sm:w-14 sm:h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                <MdCompareArrows className="text-lg sm:text-3xl" />
              </div>
              <div className={`w-1 sm:w-2 h-1 sm:h-2 rounded-full ${tallyStatus.pendingBills > 0 ? 'bg-orange-500 animate-pulse' : ''}`}></div>
            </div>
            <p className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-none">Queue</p>
            <h3 className="text-[8px] sm:text-xl font-black text-orange-600 mt-0.5 sm:mt-1 uppercase tracking-tight truncate">{tallyStatus.pendingBills} Vouchers</h3>
          </div>

          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] p-2 sm:p-8 rounded-xl sm:rounded-[2.5rem] shadow-xl shadow-purple-500/5 group">
            <div className="flex items-center justify-between mb-2 sm:mb-8">
              <div className="w-8 h-8 sm:w-14 sm:h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                <MdCheckCircle className="text-lg sm:text-3xl" />
              </div>
              <div className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full ${settings.autoSync ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
            <p className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-none">Auto Engine</p>
            <h3 className="text-[8px] sm:text-xl font-black text-[var(--admin-text-primary)] mt-0.5 sm:mt-1 uppercase tracking-tight">{settings.autoSync ? 'ENABLED' : 'PAUSED'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 sm:gap-8 items-start">
          {/* Settings Section */}
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[2.5rem] p-3 sm:p-10 shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-10">
                <div className="p-1.5 sm:p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg sm:rounded-2xl">
                    <MdSettings className="text-sm sm:text-3xl" />
                </div>
                <h2 className="text-[10px] sm:text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">ERP Config</h2>
              </div>

              <div className="space-y-3 sm:space-y-8">
                <div className="group">
                  <label className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5 sm:ml-1 mb-1 sm:mb-3 block">
                    Gateway Address
                  </label>
                  <input 
                    type="text" 
                    value={settings.host}
                    onChange={(e) => handleUpdateSetting('host', e.target.value)}
                    className="w-full px-2 sm:px-6 py-1.5 sm:py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-2xl outline-none transition-all dark:text-white text-[8px] sm:text-sm font-bold"
                  />
                </div>

                <div className="group">
                  <label className="text-[5px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5 sm:ml-1 mb-1 sm:mb-3 block">
                    Sync Port
                  </label>
                  <input 
                    type="text" 
                    value={settings.port}
                    onChange={(e) => handleUpdateSetting('port', e.target.value)}
                    className="w-full px-2 sm:px-6 py-1.5 sm:py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-2xl outline-none transition-all dark:text-white text-[8px] sm:text-sm font-black"
                  />
                </div>

                <div className="bg-[var(--admin-bg-primary)]/50 rounded-xl sm:rounded-3xl p-2 sm:p-8 space-y-4 sm:space-y-8 border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Auto Sync</span>
                        <span className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 italic leading-tight">Push real-time</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-50 sm:scale-100">
                      <input 
                        type="checkbox" 
                        checked={settings.autoSync} 
                        onChange={() => handleUpdateSetting('autoSync', !settings.autoSync)}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600 shadow-lg"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Database Master</span>
                        <span className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 italic leading-tight">Master Sync</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-50 sm:scale-100">
                      <input 
                        type="checkbox" 
                        checked={settings.syncProducts}
                        onChange={() => handleUpdateSetting('syncProducts', !settings.syncProducts)} 
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600 shadow-lg"></div>
                    </label>
                  </div>
                </div>

                  <div className="flex flex-col gap-2 pt-2 sm:pt-4">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="w-full py-1.5 sm:py-4 bg-teal-600 text-white font-black rounded-lg sm:rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all active:scale-[0.98] text-[6px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
                    >
                      <span className="uppercase">{saving ? '...' : 'SAVE CONFIG'}</span>
                    </button>
                    <button 
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="w-full py-1.5 sm:py-4 bg-[var(--admin-bg-secondary)] text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-500/30 rounded-lg sm:rounded-2xl hover:bg-teal-50 transition-all font-black text-[6px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
                    >
                      <MdRefresh className={`text-[8px] sm:text-xl ${testing ? 'animate-spin' : ''}`} />
                      <span>{testing ? '...' : 'TEST HANDSHAKE'}</span>
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sync History Section */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl h-full">
              <div className="p-3 sm:p-10 border-b border-slate-50 dark:border-slate-600 flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
                <div className="flex items-center gap-1.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                    <MdHistory className="text-xl sm:text-3xl" />
                  </div>
                  <h2 className="text-[10px] sm:text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight leading-tight">CLOUD JOURNAL LOGS</h2>
                </div>
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="text-[6px] sm:text-[10px] font-black text-teal-600 dark:text-teal-400 hover:bg-teal-50 px-2.5 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all uppercase tracking-widest border border-teal-500/20 whitespace-nowrap"
                >
                  Deep Audit
                </button>
              </div>

              <div className="overflow-x-auto px-2 sm:px-6 pb-4 sm:pb-10">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-6 py-3 sm:py-8 text-[6px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-600">Activity Class</th>
                      <th className="px-2 sm:px-6 py-3 sm:py-8 text-[6px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-600 text-center">Reference</th>
                      <th className="px-2 sm:px-6 py-3 sm:py-8 text-[6px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-600 text-center">Push Status</th>
                      <th className="px-2 sm:px-6 py-3 sm:py-8 text-[6px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-600 text-right">Time Matrix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {syncHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                        <td className="px-2 sm:px-6 py-4 sm:py-10">
                          <span className="text-[8px] sm:text-sm font-black text-slate-800 dark:text-slate-200 block mb-0.5 sm:mb-1 uppercase tracking-tight whitespace-nowrap">{item.type}</span>
                          <span className="text-[5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">Engine Trace</span>
                        </td>
                        <td className="px-2 sm:px-6 py-4 sm:py-10 text-center">
                          <span className="text-[7px] sm:text-[10px] text-slate-600 dark:text-slate-300 font-black tracking-widest uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl group-hover:bg-teal-50 transition-colors whitespace-nowrap">{item.ref}</span>
                        </td>
                        <td className="px-2 sm:px-6 py-4 sm:py-10">
                          <div className="flex items-center justify-center gap-1 sm:gap-3">
                            {item.status === 'Synced' ? (
                              <>
                                <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></div>
                                <span className="text-[6px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">SUCCESSFUL</span>
                              </>
                            ) : (
                              <>
                                <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20"></div>
                                <span className="text-[6px] sm:text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest whitespace-nowrap">PUSH ERROR</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-4 sm:py-10 text-right">
                          <span className="text-[7px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase italic">{item.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-3 sm:p-10 text-center bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-600">
                <div className="max-w-lg mx-auto">
                    <p className="text-[6px] sm:text-[11px] text-[var(--admin-text-secondary)] font-bold leading-relaxed uppercase tracking-wide">
                    <span className="font-black text-teal-600 dark:text-teal-400 mr-1 sm:mr-2 underline decoration-2 underline-offset-4">Intelligence: </span> 
                    Auto re-queued flagged vouchers.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Tally Ledgers Section */}
        <div className="mt-8 sm:mt-12 bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl">
             <div className="p-3 sm:p-10 border-b border-slate-50 dark:border-slate-600 flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
                <div className="flex items-center gap-1.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg sm:rounded-2xl flex items-center justify-center">
                    <MdList className="text-xl sm:text-3xl" />
                  </div>
                  <h2 className="text-[10px] sm:text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight leading-tight">MAPPED LEDGERS</h2>
                </div>
                <button 
                  onClick={async () => {
                     try {
                        const data = await adminService.getTallyLedgers();
                        setLedgers(data || []);
                        success('Ledgers refreshed from Tally');
                     } catch(err) { error('Failed to fetch ledgers'); }
                  }}
                  className="text-[6px] sm:text-[10px] font-black text-purple-600 dark:text-purple-400 hover:bg-purple-50 px-2.5 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all uppercase tracking-widest border border-purple-500/20 whitespace-nowrap"
                >
                  Refresh Map
                </button>
              </div>
              <div className="p-4 sm:p-10">
                 {ledgers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {ledgers.map((l, i) => (
                          <div key={i} className="p-4 border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
                             <span className="font-bold text-[var(--admin-text-primary)]">{l.name}</span>
                             <span className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase">{l.parent || 'Primary'}</span>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-10 text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest">
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
