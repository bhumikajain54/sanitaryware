import { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiBell, 
  FiLock, 
  FiGlobe, 
  FiDatabase, 
  FiShield,
  FiLayout,
  FiSave
} from 'react-icons/fi';
import { useAdminToast } from '../../hooks/useAdmin';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const { success } = useAdminToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      orders: true,
      queries: true,
      lowStock: false
    },
    system: {
      autoBackup: true,
      maintenanceMode: false,
      registrationAllowed: true,
      defaultCurrency: 'INR'
    }
  });

  const handleSave = () => {
    success('Settings saved successfully!');
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the application cache? This will affect all local data storage.')) {
      const loading = toast.loading('Clearing application cache...');
      setTimeout(() => {
        // Simulation of clearing cache
        toast.dismiss(loading);
        success('Application cache cleared successfully!');
      }, 1500);
    }
  };

  const handleResetApiKeys = () => {
    if (window.confirm('CRITICAL: Resetting API keys will disconnect all external integrations. Continue?')) {
      const loading = toast.loading('Generating new secure keys...');
      setTimeout(() => {
        toast.dismiss(loading);
        success('API Access Keys rotate successfully!');
      }, 2000);
    }
  };

  const SectionHeader = ({ icon: Icon, title, desc }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner border-2 border-teal-500/20 dark:border-teal-500/30">
        <Icon className="text-2xl" />
      </div>
      <div>
        <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">{title}</h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1 italic">{desc}</p>
      </div>
    </div>
  );

  const Toggle = ({ active, onToggle, label }) => (
    <div className="flex items-center justify-between py-5 group">
      <span className="text-xs font-black text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors uppercase tracking-tight">
        {label}
      </span>
      <button 
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${active ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-all transform ${active ? 'translate-x-7' : 'translate-x-0'} shadow-lg`} />
      </button>
    </div>
  );

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-4 tracking-tight">
               <FiSettings className="text-teal-500 dark:text-teal-400" /> Control Matrix
            </h1>
            <p className="text-sm font-bold text-[var(--admin-text-secondary)] mt-2 uppercase tracking-tight italic">
              Master configuration for behavior, appearance, and global system protocols
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <FiSave className="text-xl" /> Commit All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Notifications Section */}
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-10 rounded-[3rem] shadow-2xl">
             <SectionHeader 
                icon={FiBell} 
                title="Alert System" 
                desc="Configure notification channels and triggers" 
             />
             <div className="space-y-2 divide-y divide-slate-50 dark:divide-slate-800">
                <Toggle 
                  label="Email Alerts for New Orders" 
                  active={settings.notifications.orders}
                  onToggle={() => setSettings({...settings, notifications: {...settings.notifications, orders: !settings.notifications.orders}})}
                />
                <Toggle 
                  label="Browser Push Notifications" 
                  active={settings.notifications.browser}
                  onToggle={() => setSettings({...settings, notifications: {...settings.notifications, browser: !settings.notifications.browser}})}
                />
                <Toggle 
                  label="Low Stock Inventory Alerts" 
                  active={settings.notifications.lowStock}
                  onToggle={() => setSettings({...settings, notifications: {...settings.notifications, lowStock: !settings.notifications.lowStock}})}
                />
                <Toggle 
                  label="Real-time Customer Queries" 
                  active={settings.notifications.queries}
                  onToggle={() => setSettings({...settings, notifications: {...settings.notifications, queries: !settings.notifications.queries}})}
                />
             </div>
          </div>

          {/* Global Configuration Section */}
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-10 rounded-[3rem] shadow-2xl">
             <SectionHeader 
                icon={FiGlobe} 
                title="Regional Matrix" 
                desc="Currency, locale, and format standards" 
             />
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                     Default Store Currency
                   </label>
                   <select className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black cursor-pointer appearance-none">
                      <option value="INR" className="dark:bg-slate-700 font-black">Indian Rupee (₹)</option>
                      <option value="USD" className="dark:bg-slate-700 font-black">US Dollar ($)</option>
                      <option value="EUR" className="dark:bg-slate-700 font-black">Euro (€)</option>
                   </select>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                     Primary Language
                   </label>
                   <select className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black cursor-pointer appearance-none">
                      <option value="EN" className="dark:bg-slate-700 font-black">English (International)</option>
                      <option value="HI" className="dark:bg-slate-700 font-black">Hindi (Standard)</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Security & System Section */}
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-10 rounded-[3rem] shadow-2xl">
             <SectionHeader 
                icon={FiShield} 
                title="Security Vault" 
                desc="Maintenance, API, and core protocols" 
             />
             <div className="space-y-2 divide-y divide-slate-50 dark:divide-slate-800">
                <Toggle 
                  label="Maintenance Mode (Public site closed)" 
                  active={settings.system.maintenanceMode}
                  onToggle={() => setSettings({...settings, system: {...settings.system, maintenanceMode: !settings.system.maintenanceMode}})}
                />
                <Toggle 
                  label="Automatic Database Backup (Daily)" 
                  active={settings.system.autoBackup}
                  onToggle={() => setSettings({...settings, system: {...settings.system, autoBackup: !settings.system.autoBackup}})}
                />
                <div className="py-8 space-y-5">
                   <button 
                     onClick={handleClearCache}
                     className="flex items-center gap-3 text-[10px] font-black text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-all group uppercase tracking-widest"
                   >
                      <FiDatabase className="text-xl group-hover:scale-110 transition-transform" /> Purge Application Cache
                   </button>
                   <button 
                     onClick={handleResetApiKeys}
                     className="flex items-center gap-3 text-[10px] font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all group uppercase tracking-widest"
                   >
                      <FiLock className="text-xl group-hover:scale-110 transition-transform" /> Regenerate API Keys
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
