import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import customerService from '../../services/customerService';
import adminService from '../../services/adminService';
import {
  MdPerson, MdEmail, MdPhone, MdEdit, MdSave, MdClose,
  MdCheckCircle, MdCameraAlt, MdHistory, MdSecurity,
  MdKeyboardArrowRight, MdLock, MdVisibility, MdVisibilityOff, MdShield
} from 'react-icons/md';

/* ─── Input field with icon ─── */
const InputField = ({ label, value, icon: Icon, type = 'text', disabled, onChange, suffix }) => (
  <div className="space-y-1 sm:space-y-1.5 md:space-y-2 group">
    <label className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-0.5">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-600 transition-colors text-sm sm:text-base md:text-xl flex-shrink-0" />
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="w-full pl-9 sm:pl-11 md:pl-14 pr-10 sm:pr-12 md:pr-14 py-2.5 sm:py-3 md:py-4 lg:py-5 bg-[var(--bg-app)] border border-transparent rounded-xl md:rounded-2xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-[10px] sm:text-xs md:text-sm lg:text-base text-[var(--text-main)] disabled:opacity-70 shadow-sm"
      />
      {suffix && (
        <div className="absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const Profile = () => {
  const { user, isAdmin, updateProfile: updateAuthProfile, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    getProfile();
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const prefs = await customerService.getPreferences();
      if (prefs) setIs2FAEnabled(prefs.twoFactorEnabled);
    } catch (err) { console.error('Failed to fetch preferences'); }
  };
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || user.username || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const fetchActivityLogs = async () => {
    setFetchingLogs(true);
    try {
      const data = isAdmin ? await adminService.getActivityLogs() : await customerService.getActivityLogs();
      let logs = [];
      if (Array.isArray(data)) { logs = data; }
      else if (data && typeof data === 'object') {
        logs = data.content || data.data || data.items || data.list || data.body ||
          data.logs || data.activities || data._embedded?.activityLogs || [];
      }
      setActivityLogs(logs);
    } catch (err) {
      if (err.status !== 404) toast.error('Failed to load activity logs');
      else setActivityLogs([]);
    } finally { setFetchingLogs(false); }
  };

  const handleShowLogs = () => { setShowLoginActivity(true); fetchActivityLogs(); };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateAuthProfile(profileData);
      if (result.success) { toast.success('Profile updated successfully'); setIsEditingProfile(false); }
      else toast.error(result.message || 'Failed to update profile');
    } catch (err) { toast.error(err.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.changePassword({ oldPassword: passwordData.current, newPassword: passwordData.new });
      toast.success('Password changed successfully');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image size should be less than 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: MdPerson, desc: 'Personal details & contacts' },
    { id: 'security', label: 'Security', icon: MdSecurity, desc: 'Passwords & account safety' }
  ];

  const calculateCompletion = () => {
    let c = 0;
    if (profileData.firstName) c += 20;
    if (profileData.lastName) c += 20;
    if (profileData.email) c += 30;
    if (profileData.phone) c += 30;
    return c;
  };

  const displayName = (() => {
    const fn = profileData.firstName || user?.firstName || '';
    const ln = profileData.lastName || user?.lastName || '';
    if (fn || ln) return `${fn} ${ln}`.trim();
    if (user?.name) return user.name;
    const em = profileData.email || user?.email || '';
    return em ? em.split('@')[0] : 'User Profile';
  })();

  const avatarLetter = (() => {
    const fn = profileData.firstName || user?.firstName || '';
    const nm = user?.name || user?.fullName || '';
    const em = profileData.email || user?.email || '';
    if (fn) return fn.charAt(0).toUpperCase();
    if (nm) return nm.charAt(0).toUpperCase();
    if (em) return em.charAt(0).toUpperCase();
    return 'U';
  })();

  const completionPercent = calculateCompletion();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-6 md:py-10 lg:py-16 px-3 sm:px-5 md:px-6 lg:px-8 font-inter overflow-x-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 flex items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-[var(--text-main)] mb-0.5 sm:mb-1 md:mb-3 tracking-tighter truncate"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              My Account
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-lg text-[var(--text-muted)] font-medium">
              Manage profile & security settings.
            </p>
          </div>
          <div className="flex-shrink-0 bg-[var(--bg-card)] px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-xl md:rounded-2xl shadow-sm border border-[var(--border-main)]">
            <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
              Silver Member
            </p>
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start">

          {/* ── Sidebar ── */}
          <div className="sm:col-span-4 md:col-span-4 w-full">
            <div className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] overflow-hidden relative transition-colors duration-300">
              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 md:h-28 lg:h-32 bg-gradient-to-br from-teal-600/10 to-cyan-600/5 -z-0" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-[var(--bg-card)] rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/10 border-2 md:border-4 border-[var(--bg-card)] overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-black">{avatarLetter}</span>
                      )}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-teal-600 text-white rounded-lg md:rounded-2xl shadow-lg flex items-center justify-center border-2 md:border-4 border-[var(--bg-card)] hover:bg-teal-700 transition-all hover:scale-110"
                  >
                    <MdCameraAlt className="text-[10px] sm:text-xs md:text-sm lg:text-lg" />
                  </button>
                </div>

                {/* Name + status */}
                <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-10 min-w-0 w-full px-2">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-2xl font-black text-[var(--text-main)] leading-tight truncate"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    {displayName}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-0.5 sm:mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Verified Account</p>
                  </div>
                </div>

                {/* Tab buttons */}
                <div className="w-full space-y-1.5 sm:space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl transition-all group ${activeTab === tab.id
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                        }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--border-subtle)] group-hover:bg-[var(--bg-card)] shadow-sm'
                          }`}>
                          <tab.icon className="text-sm sm:text-base md:text-lg lg:text-xl" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none">{tab.label}</p>
                          <p className={`hidden sm:block text-[9px] sm:text-[10px] font-medium leading-none mt-0.5 truncate ${activeTab === tab.id ? 'text-teal-50' : 'text-[var(--text-muted)]'}`}>
                            {tab.desc}
                          </p>
                        </div>
                      </div>
                      <MdKeyboardArrowRight className={`text-lg sm:text-xl transition-transform flex-shrink-0 ${activeTab === tab.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="sm:col-span-8 md:col-span-8 w-full">
            <AnimatePresence mode="wait">

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2.5rem] p-4 sm:p-5 md:p-8 lg:p-12 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] transition-colors duration-300"
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8 lg:mb-12">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-1 sm:w-1.5 h-5 sm:h-6 md:h-8 lg:h-10 bg-teal-600 rounded-full flex-shrink-0" />
                      <h2 className="text-sm sm:text-base md:text-xl lg:text-3xl font-black text-[var(--text-main)] leading-none"
                        style={{ fontFamily: 'Playfair Display, serif' }}>
                        Personal Details
                      </h2>
                    </div>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-teal-500/10 text-teal-600 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-teal-500/20 transition-all active:scale-95"
                      >
                        <MdEdit className="text-sm sm:text-base md:text-lg flex-shrink-0" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex-shrink-0 flex gap-2 sm:gap-2.5 md:gap-3">
                        <button onClick={() => setIsEditingProfile(false)}
                          className="px-2.5 sm:px-3 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[var(--text-muted)] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-[var(--text-main)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button onClick={handleSaveProfile}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-teal-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                        >
                          <MdSave className="text-sm sm:text-base md:text-lg flex-shrink-0" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    {[
                      { label: 'First Name', key: 'firstName', icon: MdPerson },
                      { label: 'Last Name', key: 'lastName', icon: MdPerson },
                      { label: 'Email Address', key: 'email', icon: MdEmail, type: 'email' },
                      { label: 'Phone Number', key: 'phone', icon: MdPhone, type: 'tel' }
                    ].map(field => (
                      <InputField
                        key={field.key}
                        label={field.label}
                        icon={field.icon}
                        type={field.type || 'text'}
                        value={profileData[field.key]}
                        disabled={!isEditingProfile}
                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                      />
                    ))}
                  </div>

                  {/* Completion banner */}
                  <div className="mt-5 sm:mt-6 md:mt-8 lg:mt-12 p-3 sm:p-4 md:p-5 lg:p-8 bg-teal-500/5 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-between gap-3 sm:gap-4 border border-teal-500/10">
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-[var(--bg-card)] rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-teal-600 shadow-sm flex-shrink-0">
                        <MdCheckCircle className="text-base sm:text-xl md:text-2xl lg:text-3xl" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs md:text-sm font-black text-teal-600 mb-0.5 leading-none truncate">
                          Profile {completionPercent}% Complete
                        </p>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] font-medium truncate">
                          Keep your profile updated for better service.
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-teal-600">{completionPercent}%</span>
                      <div className="w-16 md:w-20 h-1.5 bg-teal-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8"
                >
                  {/* Security header */}
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="w-1 sm:w-1.5 h-5 sm:h-6 md:h-8 lg:h-10 bg-teal-600 rounded-full flex-shrink-0" />
                    <h2 className="text-sm sm:text-base md:text-xl lg:text-3xl font-black text-[var(--text-main)] leading-none truncate"
                      style={{ fontFamily: 'Playfair Display, serif' }}>
                      Security Settings
                    </h2>
                  </div>

                  {/* Change Password */}
                  <div className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2.5rem] p-4 sm:p-5 md:p-8 lg:p-12 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] transition-colors duration-300">
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-7 lg:mb-10">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-teal-500/10 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0">
                        <MdLock className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-[var(--text-main)] leading-tight">Change Password</h3>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] font-medium">Update your password to keep secure</p>
                      </div>
                    </div>

                    <form className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-xl" onSubmit={handlePasswordUpdate}>
                      {/* Current password */}
                      <InputField
                        label="Current Password"
                        icon={MdLock}
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        suffix={
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-teal-600 transition-colors">
                            {showPassword
                              ? <MdVisibilityOff className="text-sm sm:text-base md:text-xl" />
                              : <MdVisibility className="text-sm sm:text-base md:text-xl" />}
                          </button>
                        }
                      />

                      {/* New + Confirm */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        <InputField label="New Password" icon={MdLock} type={showPassword ? 'text' : 'password'} value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} />
                        <InputField label="Confirm Password" icon={MdLock} type={showPassword ? 'text' : 'password'} value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                      </div>

                      <div className="pt-1 sm:pt-2 md:pt-3 lg:pt-4 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
                        <button type="submit"
                          className="flex-shrink-0 px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
                        >
                          Update
                        </button>
                        <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight leading-tight">
                          Strong passwords prevent unauthorized access.
                        </p>
                      </div>
                    </form>
                  </div>

                  {/* 2FA + Activity cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {/* 2FA */}
                    <div className="bg-[var(--bg-card)] p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-[var(--border-main)] shadow-sm hover:border-teal-500/30 transition-all">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-blue-500/10 text-blue-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <MdShield className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                        </div>
                        <div
                          onClick={async () => {
                            const newValue = !is2FAEnabled;
                            setIs2FAEnabled(newValue);
                            try {
                              await customerService.updatePreferences({ twoFactorEnabled: newValue });
                              toast.success(`2FA ${newValue ? 'Enabled' : 'Disabled'}`);
                            } catch (err) {
                              setIs2FAEnabled(!newValue); // rollback
                              toast.error('Failed to update 2FA setting');
                            }
                          }}
                          className={`w-9 h-5 sm:w-10 sm:h-5.5 md:w-11 md:h-6 lg:w-12 lg:h-6 rounded-full relative cursor-pointer transition-all duration-300 ${is2FAEnabled ? 'bg-teal-600' : 'bg-[var(--border-main)]'}`}
                        >
                          <motion.div
                            animate={{ x: is2FAEnabled ? 20 : 2 }}
                            className="absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </div>
                      <h4 className="text-[10px] sm:text-xs md:text-sm lg:text-lg font-black text-[var(--text-main)] mb-0.5 sm:mb-1">2FA Secure</h4>
                      <p className="text-[8px] sm:text-[9px] md:text-xs text-[var(--text-muted)] font-medium leading-tight">Add extra layer of security.</p>
                    </div>

                    {/* Activity */}
                    <div className="bg-[var(--bg-card)] p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-[var(--border-main)] shadow-sm hover:border-teal-500/30 transition-all">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-orange-500/10 text-orange-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <MdHistory className="text-base sm:text-lg md:text-xl lg:text-2xl" />
                        </div>
                        <button onClick={handleShowLogs}
                          className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline whitespace-nowrap"
                        >
                          VIEW ALL
                        </button>
                      </div>
                      <h4 className="text-[10px] sm:text-xs md:text-sm lg:text-lg font-black text-[var(--text-main)] mb-0.5 sm:mb-1">Activity</h4>
                      <p className="text-[8px] sm:text-[9px] md:text-xs text-[var(--text-muted)] font-medium leading-tight">Check login locations.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Activity Modal ─── */}
      <AnimatePresence>
        {showLoginActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLoginActivity(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-main)]"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 md:py-8 text-white">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-0.5 sm:mb-1 truncate">Login Activity</h2>
                    <p className="text-orange-100 text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-[0.2em]">
                      {activityLogs.length} Recent Sessions
                    </p>
                  </div>
                  <button onClick={() => setShowLoginActivity(false)}
                    className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <MdClose className="text-base sm:text-lg md:text-xl" />
                  </button>
                </div>
              </div>

              {/* Log list */}
              <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
                {fetchingLogs ? (
                  <div className="flex flex-col items-center justify-center py-10 sm:py-12 gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Fetching logs...</p>
                  </div>
                ) : activityLogs.length > 0 ? (
                  activityLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-[var(--bg-app)] transition-colors border border-transparent hover:border-[var(--border-main)] gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                        <div className="text-xl sm:text-2xl w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[var(--bg-card)] rounded-lg sm:rounded-xl shadow-sm border border-[var(--border-main)] flex items-center justify-center flex-shrink-0">
                          {log.device?.toLowerCase().includes('iphone') || log.device?.toLowerCase().includes('android') ? '📱' : '💻'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-main)] truncate">{log.device || log.userAgent || 'Unknown Device'}</p>
                          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest truncate">{log.location || log.ipAddress || 'Unknown Location'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                          {idx === 0 ? 'Current' : (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Recent')}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-[var(--text-muted)] font-medium">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 sm:py-12">
                    <MdHistory className="text-4xl sm:text-5xl text-gray-200 mx-auto mb-3 sm:mb-4" />
                    <p className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">No recent activity logs found</p>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-[var(--bg-app)] border-t border-[var(--border-main)]">
                <button onClick={() => setShowLoginActivity(false)}
                  className="w-full bg-[var(--bg-card)] text-[var(--text-main)] py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-sm hover:shadow-md border border-[var(--border-main)] transition-all active:scale-[0.98]"
                >
                  Close Activity Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;