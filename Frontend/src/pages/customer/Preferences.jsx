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

/* ─── Toggle Switch component ─── */
const Toggle = ({ isActive, onToggle }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-10 md:h-7 md:w-12 items-center rounded-full transition-all duration-500 p-0.5 sm:p-0.5 md:p-1 flex-shrink-0 cursor-pointer ${isActive ? 'bg-teal-600' : 'bg-[var(--border-main)]'
      }`}
  >
    <span className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-lg transition-transform duration-500 ease-in-out ${isActive ? 'translate-x-4 sm:translate-x-4 md:translate-x-5' : 'translate-x-0'
      }`} />
  </div>
);

/* ─── Select with custom chevron ─── */
const SelectField = ({ icon: Icon, label, value, onChange, options }) => (
  <div className="flex items-center justify-between gap-3 group">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <Icon className="text-base sm:text-lg md:text-xl text-[var(--text-muted)] group-hover:text-teal-600 transition-colors flex-shrink-0" />
      <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">{label}</span>
    </div>
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-teal-500 pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold text-[var(--text-main)] outline-none cursor-pointer focus:ring-2 focus:ring-teal-500/20 transition-all"
      >
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
);

const Preferences = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true, orderUpdates: true, promotionalEmails: false,
    smsNotifications: false, newsletter: false, twoFactorEnabled: false,
    language: 'English (US)', currency: 'INR (\u20B9)'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await customerService.getPreferences();
        if (data) setSettings(data);
      } catch (err) { console.error('Failed to load preferences'); }
    };
    loadPreferences();
  }, []);

  const toggleSetting = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSelectChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

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
        { id: 'emailNotifications', label: 'Email Notifications', sub: 'Receive daily account activity summary' },
        { id: 'orderUpdates', label: 'Order Updates', sub: 'Get notified about shipping and delivery status' },
        { id: 'promotionalEmails', label: 'Marketing Promotions', sub: 'Offers, discounts and product announcements' }
      ]
    }
  ];

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1200px] mx-auto min-h-screen">

      {/* ─── Header ─── */}
      <div className="space-y-1 sm:space-y-1.5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[var(--text-main)] tracking-tight flex items-center gap-2 sm:gap-3">
          <MdSettings className="text-teal-600 animate-spin-slow text-2xl sm:text-3xl md:text-4xl flex-shrink-0" />
          <span className="truncate">Settings & Preferences</span>
        </h1>
        <p className="text-[var(--text-muted)] font-bold text-xs sm:text-sm">
          Manage your account experience and personalization.
        </p>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-7 lg:gap-8">

        {/* ── Left: Regional Settings ── */}
        <div className="lg:col-span-4">
          <Card className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            <h4 className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2.5 sm:pb-3 md:pb-4">
              Regional Settings
            </h4>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <SelectField
                icon={MdTranslate}
                label="Language"
                value={settings.language}
                onChange={(v) => handleSelectChange('language', v)}
                options={['English (US)', 'Hindi (HI)', 'Gujarati (GU)']}
              />
              <SelectField
                icon={MdVisibility}
                label="Currency"
                value={settings.currency}
                onChange={(v) => handleSelectChange('currency', v)}
                options={['INR (₹)', 'USD ($)', 'EUR (€)']}
              />
            </div>
          </Card>
        </div>

        {/* ── Right: Notification Settings ── */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6 md:space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2.5 sm:space-y-3 md:space-y-4">

              {/* Section header */}
              <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 px-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-teal-500/10 text-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <section.icon className="text-base sm:text-lg md:text-[22px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-black text-[var(--text-main)] text-sm sm:text-base md:text-lg leading-tight">
                    {section.title}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Toggle rows */}
              <Card noPadding className="divide-y divide-[var(--border-subtle)] overflow-hidden border-[var(--border-main)] shadow-sm">
                {section.items.map((item) => {
                  const isActive = item.id === 'darkMode' ? theme === 'dark' : settings[item.id];
                  const onToggle = item.id === 'darkMode' ? toggleTheme : () => toggleSetting(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={onToggle}
                      className="p-3.5 sm:p-4 md:p-6 lg:p-8 flex items-center justify-between hover:bg-[var(--bg-app)] transition-all duration-300 group cursor-pointer gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                        <p className="text-[10px] sm:text-xs md:text-[15px] font-black text-[var(--text-main)] tracking-tight group-hover:text-teal-600 transition-colors uppercase leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[8px] sm:text-[9px] md:text-[12px] text-[var(--text-muted)] font-medium leading-snug line-clamp-2 md:line-clamp-none">
                          {item.sub}
                        </p>
                      </div>
                      <Toggle isActive={isActive} onToggle={onToggle} />
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}

          {/* ─── Save + Feedback ─── */}
          <div className="pt-1 sm:pt-2 md:pt-4 flex items-center justify-end gap-2.5 sm:gap-3 md:gap-6">

            {/* Feedback toast */}
            <AnimatePresence>
              {showFeedback && (
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-teal-600 font-black text-[8px] sm:text-[9px] md:text-xs uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-teal-500/10 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg whitespace-nowrap"
                >
                  <MdCheckCircle className="text-xs sm:text-sm md:text-base flex-shrink-0" />
                  <span className="hidden sm:inline">All changes preserved!</span>
                  <span className="sm:hidden">Saved!</span>
                </motion.p>
              )}
            </AnimatePresence>

            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3.5 lg:py-4 bg-[#0D9488] text-white rounded-xl md:rounded-2xl font-black shadow-2xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[9px] sm:text-[10px] md:text-sm lg:text-base uppercase tracking-widest ${isSaving ? 'animate-pulse' : ''}`}
            >
              {isSaving ? 'Processing...' : 'Save Changes'}
              {!isSaving && <MdCheckCircle className="text-sm sm:text-base md:text-lg lg:text-xl flex-shrink-0" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;