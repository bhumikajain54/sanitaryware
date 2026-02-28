import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdSettings, 
  MdNotificationsActive, 
  MdTranslate, 
  MdVisibility,
  MdCheckCircle 
} from 'react-icons/md';
import { Card } from '../../components/common/DashboardUI';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import customerService from '../../services/customerService';

const Preferences = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotif: true,
    orderUpdates: true,
    promotions: false,
    language: 'English (US)',
    currency: 'INR (₹)'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await customerService.getPreferences();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load preferences');
      }
    };
    loadPreferences();
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await customerService.updatePreferences(settings);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      toast.success('Preferences updated');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Choose what updates you want to receive.',
      icon: MdNotificationsActive,
      items: [
        { id: 'emailNotif', label: 'Email Notifications', sub: 'Receive daily account activity summary' },
        { id: 'orderUpdates', label: 'Order Updates', sub: 'Get notified about shipping and delivery status' },
        { id: 'promotions', label: 'Marketing Promotions', sub: 'Offers, discounts and product announcements' },
      ]
    },
    // Removed Appearance section - Dark Mode toggle is already in header dropdown
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1200px] mx-auto min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-serif font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
          <MdSettings className="text-teal-600 animate-spin-slow" />
          Settings & Preferences
        </h1>
        <p className="text-slate-500 font-bold text-sm">Manage your account experience and personalization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column - Regional Settings (full width on mobile, 4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          {/* Removed security message card - not needed */}

          <Card className="p-5 md:p-8 space-y-5 md:space-y-6">
             <h4 className="text-[10px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3 md:pb-4">Regional Settings</h4>
             <div className="space-y-5 md:space-y-6">
                {/* Language */}
                <div className="space-y-2 md:space-y-0 md:flex md:items-center md:justify-between group">
                  <div className="flex items-center gap-2 md:gap-3 text-[var(--text-muted)] mb-2 md:mb-0">
                    <MdTranslate className="text-lg md:text-xl group-hover:text-teal-600 transition-colors flex-shrink-0" />
                    <span className="text-sm md:text-sm font-bold text-[var(--text-main)]">Language</span>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <select 
                      value={settings.language}
                      onChange={(e) => handleSelectChange('language', e.target.value)}
                      className="w-full md:w-auto appearance-none bg-white dark:bg-slate-800 md:bg-transparent border-2 md:border-none border-teal-500/30 md:border-0 pl-3.5 pr-10 py-3 md:px-0 md:py-0 rounded-xl md:rounded-none text-sm md:text-sm font-semibold text-slate-900 dark:text-white md:text-teal-600 outline-none cursor-pointer focus:ring-2 focus:ring-teal-500 md:focus:ring-0 focus:border-teal-500 md:focus:border-0 transition-all [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-slate-900 [&>option]:dark:text-white"
                    >
                      <option>English (US)</option>
                      <option>Hindi (HI)</option>
                      <option>Gujarati (GU)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none md:hidden">
                      <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Currency */}
                <div className="space-y-2 md:space-y-0 md:flex md:items-center md:justify-between group">
                  <div className="flex items-center gap-2 md:gap-3 text-[var(--text-muted)] mb-2 md:mb-0">
                    <MdVisibility className="text-lg md:text-xl group-hover:text-teal-600 transition-colors flex-shrink-0" />
                    <span className="text-sm md:text-sm font-bold text-[var(--text-main)]">Currency</span>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <select 
                      value={settings.currency}
                      onChange={(e) => handleSelectChange('currency', e.target.value)}
                      className="w-full md:w-auto appearance-none bg-white dark:bg-slate-800 md:bg-transparent border-2 md:border-none border-teal-500/30 md:border-0 pl-3.5 pr-10 py-3 md:px-0 md:py-0 rounded-xl md:rounded-none text-sm md:text-sm font-semibold text-slate-900 dark:text-white md:text-teal-600 outline-none cursor-pointer focus:ring-2 focus:ring-teal-500 md:focus:ring-0 focus:border-teal-500 md:focus:border-0 transition-all [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-slate-900 [&>option]:dark:text-white"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none md:hidden">
                      <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column - Main Settings (full width on mobile, 8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4 px-1 md:px-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-500/10 text-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                  <section.icon size={18} className="md:hidden" />
                  <section.icon size={22} className="hidden md:block" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-[var(--text-main)] text-sm md:text-lg leading-tight">{section.title}</h3>
                  <p className="text-[9px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{section.description}</p>
                </div>
              </div>

              <Card noPadding className="divide-y divide-[var(--border-subtle)] overflow-hidden border-[var(--border-main)] shadow-sm">
                {section.items.map((item) => {
                  const isActive = item.id === 'darkMode' ? theme === 'dark' : settings[item.id];
                  const onToggle = item.id === 'darkMode' ? toggleTheme : () => toggleSetting(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      onClick={onToggle}
                      className="p-4 md:p-6 lg:p-8 flex items-center justify-between hover:bg-[var(--bg-app)] transition-all duration-300 group cursor-pointer"
                    >
                      <div className="space-y-0.5 md:space-y-1 flex-1 min-w-0 pr-2">
                        <p className="text-xs md:text-[15px] font-black text-[var(--text-main)] tracking-tight group-hover:text-teal-600 transition-colors uppercase leading-tight">{item.label}</p>
                        <p className="text-[9px] md:text-[12px] text-[var(--text-muted)] font-medium leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">{item.sub}</p>
                      </div>
                      
                      <div 
                        className={`relative inline-flex h-6 w-10 md:h-7 md:w-12 items-center rounded-full transition-all duration-500 p-0.5 md:p-1 flex-shrink-0 ${
                          isActive ? 'bg-teal-600' : 'bg-[var(--border-main)]'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 md:h-5 md:w-5 transform rounded-full bg-white shadow-lg transition-transform duration-500 ease-in-out ${
                            isActive ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}

          {/* Save Button & Feedback */}
          <div className="pt-2 md:pt-4 flex items-center justify-end gap-3 md:gap-6">
             <AnimatePresence>
               {showFeedback && (
                 <motion.p 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="text-teal-600 font-black text-[8px] md:text-xs uppercase tracking-widest flex items-center gap-1 md:gap-2 bg-teal-500/10 px-2 md:px-4 py-1 md:py-2 rounded-lg"
                 >
                   <MdCheckCircle size={12} className="md:hidden" />
                   <MdCheckCircle size={16} className="hidden md:block" />
                   <span className="hidden md:inline">All changes preserved!</span>
                   <span className="md:hidden">Saved!</span>
                 </motion.p>
               )}
             </AnimatePresence>

             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleSave}
               disabled={isSaving}
               className={`px-4 md:px-10 py-2 md:py-4 bg-[#0D9488] text-white rounded-xl md:rounded-2xl font-black shadow-2xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex items-center gap-1.5 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] md:text-base ${isSaving ? 'animate-pulse' : ''}`}
             >
               {isSaving ? 'Processing...' : 'Save Changes'}
               {!isSaving && <MdCheckCircle className="text-sm md:text-xl" />}
             </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
