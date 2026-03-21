import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdChevronRight, MdLock, MdLocationOn, MdNotificationsActive,
  MdPayment, MdFavorite, MdStar, MdShoppingBag, MdHistory,
  MdSms, MdPrivacyTip, MdDeleteForever, MdEmail, MdLanguage,
  MdDarkMode, MdLightMode, MdCheckCircle, MdPerson, MdHelp,
  MdInfo, MdSecurity, MdBarChart, MdAccountBalanceWallet,
  MdLocalShipping, MdWarning, MdPhone, MdStore, MdClose, MdSettings,
  MdCreditCard, MdVerifiedUser, MdEdit, MdLogout
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { Card, Badge } from '../../components/common/DashboardUI';

/* ─── Toggle ─── */
const Toggle = ({ isOn, onToggle }) => (
  <div onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`relative inline-flex h-[22px] w-10 items-center rounded-full transition-all duration-300 p-0.5 cursor-pointer flex-shrink-0 ${isOn ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
  >
    <span className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-300 ${isOn ? 'translate-x-[18px]' : 'translate-x-0'}`} />
  </div>
);

/* ─── NavCard (Mobile: List, Desktop: Premium Card) ─── */
const NavCard = ({ icon: Icon, label, sublabel, to, onClick, iconBg, iconColor }) => {
  const inner = (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 px-4 py-4 bg-[var(--bg-card)] cursor-pointer group transition-all border-b border-[var(--border-subtle)] last:border-b-0 md:flex-col md:items-start md:p-6 md:gap-5 md:border md:rounded-[2rem] md:hover:border-teal-500/30 md:hover:shadow-xl md:h-full"
    >
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={`text-xl md:text-2xl ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 md:w-full">
        <p className="text-[13px] md:text-lg font-black text-[var(--text-main)] leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight md:normal-case md:tracking-normal">{label}</p>
        {sublabel && <p className="text-[11px] md:text-xs text-[var(--text-muted)] mt-1 font-bold md:font-medium opacity-70 uppercase tracking-tighter md:normal-case md:tracking-normal">{sublabel}</p>}
      </div>
      <div className="md:hidden flex items-center flex-shrink-0">
        <MdChevronRight className="text-xl text-[var(--border-main)] group-hover:text-teal-600 transition-colors" />
      </div>
      {/* Bottom link indicator for Desktop */}
      <div className="hidden md:flex mt-auto pt-4 w-full items-center justify-between border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Access now</span>
        <MdChevronRight className="text-xl text-teal-600" />
      </div>
    </motion.div>
  );
  if (to) return <Link to={to} className="block md:h-full">{inner}</Link>;
  return <div onClick={onClick} className="block md:h-full">{inner}</div>;
};

/* ─── Wide Row ─── */
const WideRow = ({ icon: Icon, label, sublabel, to, onClick, iconBg, iconColor, toggle, badge }) => {
  const inner = (
    <div className={`flex items-center gap-4 px-4 py-4 md:px-6 md:py-5 bg-[var(--bg-card)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer group border-b border-[var(--border-subtle)] last:border-b-0`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:rotate-6 transition-transform`}>
        <Icon className={`text-xl md:text-2xl ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] md:text-base font-black text-[var(--text-main)] group-hover:text-teal-600 transition-colors">{label}</p>
        {sublabel && <p className="text-[11px] md:text-sm text-[var(--text-muted)] mt-0.5 font-medium leading-snug">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {badge && <Badge variant="primary">{badge}</Badge>}
        {toggle || <MdChevronRight className="text-xl text-[var(--border-main)] group-hover:text-teal-600 transition-colors" />}
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
};

/* ─── Section wrapper ─── */
const Section = ({ title, children, isResponsiveGrid }) => (
  <div className="mb-8 md:mb-12">
    {title && (
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em] font-serif flex-shrink-0">
          {title}
        </h3>
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
      </div>
    )}
    <div className={`rounded-3xl overflow-hidden border border-[var(--border-main)] shadow-sm bg-[var(--bg-card)] ${isResponsiveGrid ? 'md:border-none md:shadow-none md:bg-transparent md:overflow-visible' : ''}`}>
      {children}
    </div>
  </div>
);

/* ─── Bottom Sheet ─── */
const BottomSheet = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full sm:max-w-md bg-[var(--bg-card)] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] z-10">
            <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">{title}</h3>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--bg-app)] flex items-center justify-center hover:rotate-90 transition-transform"><MdClose className="text-[var(--text-muted)] text-xl" /></button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ─── Danger Modal ─── */
const DangerModal = ({ isOpen, onClose, title, description, confirmText, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="relative w-full sm:max-w-sm bg-[var(--bg-card)] rounded-[2rem] shadow-2xl border border-[var(--border-main)] p-8 text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
          <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MdWarning className="text-3xl text-rose-500" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed mb-8 opacity-80">{description}</p>
          <div className="flex flex-col gap-3">
            <button onClick={onConfirm} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/20 active:scale-95">
              {confirmText}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-transparent border-2 border-[var(--border-main)] text-[var(--text-muted)] rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--bg-app)] transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const languages = ['English (India)', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Gujarati (ગુજરાતી)'];
const currencies = ['INR (₹)', 'USD ($)'];
const prefCategories = ['Bathroom Fittings', 'Kitchen Faucets', 'Showers', 'EWC / Toilets', 'Wash Basins', 'Cisterns', 'Mirrors'];

/* ══════════════════════════════════════════════════════════════════════════════════════ */

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notif, setNotif] = useState({ orderUpdates: true, smsAlerts: false, emailPromotions: false, newsletter: true });
  const [sheet, setSheet] = useState(null);
  const [dangerModal, setDangerModal] = useState(null);
  const [selectedLang, setSelectedLang] = useState('English (India)');
  const [selectedCurrency, setSelectedCurrency] = useState('INR (₹)');
  const [selectedCats, setSelectedCats] = useState(['Bathroom Fittings', 'Kitchen Faucets']);

  const toggleNotif = (key) => setNotif(prev => {
    const next = { ...prev, [key]: !prev[key] };
    toast.success(`${next[key] ? 'Enabled' : 'Disabled'}: ${key.replace(/([A-Z])/g, ' $1')}`);
    return next;
  });

  const displayName = user?.name || user?.firstName || user?.email?.split('@')[0] || 'Customer';
  const displayEmail = user?.email || 'No email set';
  const getInitial = () => displayName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24"
    >
      {/* ─── 01 Header Section ─── */}
      <header className="text-center sm:text-left mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm sm:text-base font-medium text-[var(--text-muted)] opacity-80">
          Manage your preferences, security and data
        </p>
      </header>

      {/* ─── 02 Profile Card (Top Section) ─── */}
      <motion.div whileHover={{ scale: 1.01 }} className="mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 to-emerald-700 p-6 sm:p-10 shadow-2xl shadow-teal-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-white">{getInitial()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{displayName}</h2>
                  <MdVerifiedUser className="text-teal-300 text-xl" />
                </div>
                <p className="text-sm sm:text-lg text-teal-50/80 font-medium">{displayEmail}</p>
                <div className="pt-2"><Badge className="bg-white/20 text-white border-transparent backdrop-blur-sm uppercase text-[10px] font-black tracking-widest">Verified Account</Badge></div>
              </div>
            </div>
            <Link to="/customer/profile" className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group">
              <MdEdit className="text-lg group-hover:rotate-12 transition-transform" /> Edit Profile
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─── 03 Main Grid Body ─── */}
      <div className="space-y-2 md:space-y-0">

        {/* ── ACCOUNT SECTION ── */}
        <Section title="Account" isResponsiveGrid>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <NavCard icon={MdLock} label="Login & Security" sublabel="Password & email" to="/customer/profile" iconBg="bg-blue-500/10" iconColor="text-blue-600" />
            <NavCard icon={MdLocationOn} label="Your Addresses" sublabel="Saved locations" to="/customer/addresses" iconBg="bg-teal-500/10" iconColor="text-teal-600" />
            <NavCard icon={MdCreditCard} label="Payment & Wallet" sublabel="Cards, UPI & Wallet" to="/customer/payment-wallet" iconBg="bg-indigo-500/10" iconColor="text-indigo-600" />
          </div>
        </Section>

        {/* ── ORDERS SECTION ── */}
        <Section title="Orders & Shopping" isResponsiveGrid>
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
            <NavCard icon={MdShoppingBag} label="Your Orders" sublabel="Track & return" to="/customer/orders" iconBg="bg-orange-500/10" iconColor="text-orange-600" />
            <NavCard icon={MdLocalShipping} label="Deliveries" sublabel="Live tracking" to="/customer/deliveries" iconBg="bg-sky-500/10" iconColor="text-sky-600" />
            <NavCard icon={MdFavorite} label="Wishlist" sublabel="Saved products" to="/customer/wishlist" iconBg="bg-rose-500/10" iconColor="text-rose-600" />
            <NavCard icon={MdStar} label="Reviews" sublabel="Rate purchases" to="/customer/reviews" iconBg="bg-yellow-500/10" iconColor="text-yellow-600" />
            <NavCard icon={MdStore} label="Shop" sublabel="Browse catalogue" to="/products" iconBg="bg-emerald-500/10" iconColor="text-emerald-600" />
            <NavCard icon={MdHistory} label="Recent" sublabel="Browsed items" to="/products" iconBg="bg-slate-500/10" iconColor="text-slate-500" />
          </div>
        </Section>

        {/* ── NOTIFICATIONS SECTION — Toggle List ── */}
        <Section title="Notifications">
          <WideRow icon={MdNotificationsActive} label="Order Updates" sublabel="Shipping & delivery alerts" iconBg="bg-teal-500/10" iconColor="text-teal-600" toggle={<Toggle isOn={notif.orderUpdates} onToggle={() => toggleNotif('orderUpdates')} />} />
          <WideRow icon={MdSms} label="SMS Alerts" sublabel="Updates via SMS" iconBg="bg-blue-500/10" iconColor="text-blue-600" toggle={<Toggle isOn={notif.smsAlerts} onToggle={() => toggleNotif('smsAlerts')} />} />
          <WideRow icon={MdEmail} label="Email Promotions" sublabel="Deals & offers" iconBg="bg-purple-500/10" iconColor="text-purple-600" toggle={<Toggle isOn={notif.emailPromotions} onToggle={() => toggleNotif('emailPromotions')} />} />
          <WideRow icon={MdBarChart} label="Newsletter" sublabel="New arrivals" iconBg="bg-cyan-500/10" iconColor="text-cyan-600" toggle={<Toggle isOn={notif.newsletter} onToggle={() => toggleNotif('newsletter')} />} />
        </Section>

        {/* ── PERSONALIZATION SECTION ── */}
        <Section title="Personalization" isResponsiveGrid>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 mb-0 md:mb-6">
            <NavCard icon={MdFavorite} label="Shopping Interests" sublabel={`${selectedCats.length} categories`} onClick={() => setSheet('shopping')} iconBg="bg-rose-500/10" iconColor="text-rose-600" />
            <NavCard icon={MdLanguage} label="Language & Region" sublabel={selectedLang.split(' ')[0]} onClick={() => setSheet('language')} iconBg="bg-green-500/10" iconColor="text-green-600" />
          </div>
          <div className="rounded-3xl overflow-hidden border-t md:border border-[var(--border-main)] shadow-sm">
            <WideRow
              icon={theme === 'dark' ? MdDarkMode : MdLightMode}
              label="System Appearance"
              sublabel={theme === 'dark' ? 'Dark mode activated' : 'Light mode activated'}
              iconBg={theme === 'dark' ? 'bg-slate-500/10' : 'bg-yellow-500/10'}
              iconColor={theme === 'dark' ? 'text-slate-500' : 'text-yellow-600'}
              toggle={<Toggle isOn={theme === 'dark'} onToggle={toggleTheme} />}
            />
          </div>
        </Section>

        {/* ── SUPPORT SECTION ── */}
        <Section title="Support & Help" isResponsiveGrid>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
            <NavCard icon={MdHelp} label="Help & FAQs" sublabel="Common questions" to="/help" iconBg="bg-teal-500/10" iconColor="text-teal-600" />
            <NavCard icon={MdPhone} label="Contact Support" sublabel="Chat & call" to="/contact" iconBg="bg-blue-500/10" iconColor="text-blue-600" />
          </div>
        </Section>

        {/* ── PRIVACY SECTION ── */}
        <Section title="Privacy & Security">
          <WideRow icon={MdSecurity} label="Privacy Policy" sublabel="How we use your data" to="/privacy" iconBg="bg-indigo-500/10" iconColor="text-indigo-600" />
          <WideRow icon={MdPrivacyTip} label="Data Privacy" sublabel="Request or download your data" onClick={() => setSheet('data')} iconBg="bg-purple-500/10" iconColor="text-purple-600" />
          <WideRow icon={MdInfo} label="Terms of Service" sublabel="Legal agreements" to="/terms" iconBg="bg-slate-500/10" iconColor="text-slate-500" />
        </Section>

        {/* ── DANGER ZONE ── */}
        <Section title="Danger Zone">
          <WideRow icon={MdLogout} label="Sign Out" sublabel="Securely log out" onClick={() => setDangerModal('logout')} iconBg="bg-amber-500/10" iconColor="text-amber-600" />
          <WideRow icon={MdDeleteForever} label="Close Account" sublabel="Permanently delete all data" onClick={() => setDangerModal('delete')} iconBg="bg-rose-500/10" iconColor="text-rose-600" />
        </Section>

        <p className="text-center text-[10px] md:text-sm font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 pt-10 pb-10 font-serif">
          Singhai Traders · v1.0.0 · © 2026
        </p>
      </div>

      {/* ── Language Sheet ── */}
      <BottomSheet isOpen={sheet === 'language'} onClose={() => setSheet(null)} title="Language & Region">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Preferred Language</p>
            <div className="space-y-2">
              {languages.map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${selectedLang === lang ? 'border-teal-600 bg-teal-500/5 text-teal-600' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-main)] hover:border-teal-400'}`}>
                  <span className="text-sm font-bold">{lang}</span>
                  {selectedLang === lang && <MdCheckCircle className="text-teal-600 text-xl" />}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Market Currency</p>
            <div className="flex gap-3">
              {currencies.map(cur => (
                <button key={cur} onClick={() => setSelectedCurrency(cur)}
                  className={`flex-1 flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${selectedCurrency === cur ? 'border-teal-600 bg-teal-500/5 text-teal-600' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-main)] hover:border-teal-400'}`}>
                  <span className="text-sm font-bold">{cur}</span>
                  {selectedCurrency === cur && <MdCheckCircle className="text-teal-600 text-xl" />}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { setSheet(null); toast.success('Language & region updated'); }} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-teal-500/20 active:scale-95">
            Save Preferences
          </button>
        </div>
      </BottomSheet>

      {/* ── Shopping Preferences Sheet ── */}
      <BottomSheet isOpen={sheet === 'shopping'} onClose={() => setSheet(null)} title="Shopping Interests">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)] font-medium bg-teal-50 dark:bg-teal-900/10 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/30">Select categories to receive personalized product recommendations and exclusive deals.</p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            {prefCategories.map(cat => {
              const active = selectedCats.includes(cat);
              return (
                <button key={cat} onClick={() => setSelectedCats(prev => active ? prev.filter(c => c !== cat) : [...prev, cat])}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${active ? 'border-teal-600 bg-teal-500/5' : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-teal-400'}`}>
                  <span className={`text-xs font-bold leading-tight ${active ? 'text-teal-600' : 'text-[var(--text-main)]'}`}>{cat}</span>
                  {active && <MdCheckCircle className="text-teal-600 text-lg flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          <button onClick={() => { setSheet(null); toast.success('Interests saved'); }} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-teal-500/20 active:scale-95 mt-4">
            Save ({selectedCats.length} Selected)
          </button>
        </div>
      </BottomSheet>

      {/* ── Data Preferences Sheet ── */}
      <BottomSheet isOpen={sheet === 'data'} onClose={() => setSheet(null)} title="Data Privacy Control">
        <div className="space-y-3">
          {[
            { label: 'Export Activity Logs', sub: 'Download a JSON/PDF of your store history', action: () => { setSheet(null); toast.success('Request received — link will be sent to email'); } },
            { label: 'Marketing Channels', sub: 'Manage what data we share for tailored ads', action: () => { setSheet(null); toast('Permissions updated'); } },
            { label: 'Clear Local Storage', sub: 'Reset cached product data and local themes', action: () => { setSheet(null); localStorage.clear(); toast('Cache cleared successfully'); } },
          ].map(({ label, sub, action }) => (
            <button key={label} onClick={action} className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-app)] hover:border-teal-500 hover:bg-teal-500/5 transition-all text-left group">
              <div>
                <p className="text-sm font-bold text-[var(--text-main)] transition-colors group-hover:text-teal-600">{label}</p>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-1 opacity-70">{sub}</p>
              </div>
              <MdChevronRight className="text-[var(--border-main)] group-hover:text-teal-600 text-2xl flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* ── Danger Modal ── */}
      <DangerModal
        isOpen={!!dangerModal}
        onClose={() => setDangerModal(null)}
        title={dangerModal === 'delete' ? 'Close Account?' : 'Sign Out?'}
        description={dangerModal === 'delete' ? 'This action is permanent and will delete all your orders, addresses, and saved data from Singhai Traders. This cannot be undone.' : 'Are you sure you want to exit your current session? You will need to log in again to access your account.'}
        confirmText={dangerModal === 'delete' ? 'Delete Permanently' : 'Yes, Sign Out'}
        onConfirm={dangerModal === 'delete' ? () => { setDangerModal(null); toast('Deletion request filed.', { icon: '⚠️' }); } : () => { setDangerModal(null); logout(); navigate('/customer/login'); }}
      />
    </motion.div>
  );
};

export default AccountSettings;
