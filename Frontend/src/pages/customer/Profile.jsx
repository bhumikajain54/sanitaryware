import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import customerService from '../../services/customerService';
import adminService from '../../services/adminService';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdEdit, 
  MdSave, 
  MdClose, 
  MdCheckCircle,
  MdCameraAlt,
  MdHistory,
  MdSecurity,
  MdKeyboardArrowRight,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdShield
} from 'react-icons/md';

const Profile = () => {
  const { user, isAdmin, updateProfile: updateAuthProfile, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
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

  const fetchActivityLogs = async () => {
    setFetchingLogs(true);
    try {
      console.log('🔄 Fetching activity logs for role:', user?.role, 'isAdmin:', isAdmin);
      
      let data;
      if (isAdmin) {
        data = await adminService.getActivityLogs();
      } else {
        data = await customerService.getActivityLogs();
      }
      
      console.log('🔍 Raw Activity Logs Response:', data);
      
      // Handle various backend response formats
      let logs = [];
      
      if (Array.isArray(data)) {
        logs = data;
      } else if (data && typeof data === 'object') {
        // Try common Spring Boot response structures
        logs = data.content || 
               data.data || 
               data.items || 
               data.list || 
               data.body ||
               data.logs ||
               data.activities ||
               data._embedded?.activityLogs ||
               data._embedded?.loginActivities ||
               data._embedded?.logs ||
               [];
      }
      
      console.log('✅ Normalized Activity Logs:', logs);
      console.log('📊 Total logs found:', logs.length);
      
      setActivityLogs(logs);
    } catch (err) {
      console.error('❌ Failed to fetch activity logs:', err);
      // Only show error if it's not a 404 (which might mean no logs yet)
      if (err.status !== 404) {
        toast.error('Failed to load activity logs');
      } else {
        setActivityLogs([]);
      }
    } finally {
      setFetchingLogs(false);
    }
  };

  const handleShowLogs = () => {
    setShowLoginActivity(true);
    fetchActivityLogs();
  };

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    console.log('🔄 User Context Updated:', user);
    
    if (user) {
      const newProfileData = {
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || user.username || '',
        phone: user.phone || ''
      };
      
      console.log('📝 Setting Profile Data:', newProfileData);
      setProfileData(newProfileData);
    } else {
      console.warn('⚠️ No user data available in context');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateAuthProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
        toast.error('Passwords do not match');
        return;
    }
    setLoading(true);
    try {
        await authService.changePassword({
            oldPassword: passwordData.current,
            newPassword: passwordData.new
        });
        toast.success('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
        toast.error(err.message || 'Failed to change password');
    } finally {
        setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: MdPerson, desc: 'Personal details & contacts' },
    { id: 'security', label: 'Security', icon: MdSecurity, desc: 'Passwords & account safety' },
  ];

  const calculateCompletion = () => {
    let completion = 0;
    if (profileData.firstName) completion += 20;
    if (profileData.lastName) completion += 20;
    if (profileData.email) completion += 30;
    if (profileData.phone) completion += 30;
    return completion;
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 md:py-16 px-2 md:px-8 font-inter overflow-x-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 md:mb-10 flex flex-row items-end justify-between gap-3 md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-5xl font-black text-[var(--text-main)] mb-0.5 md:mb-3 tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>
              My Account
            </h1>
            <p className="text-[9px] md:text-lg text-[var(--text-muted)] font-medium leading-none">Manage profile & security settings.</p>
          </div>
          <div className="flex items-center gap-1 md:gap-4 bg-[var(--bg-card)] p-1 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-[var(--border-main)] flex-shrink-0 transition-colors duration-300">
             <p className="text-[7px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-tight md:tracking-widest px-1">Silver Member</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1.5 md:gap-8 items-start">
          
          {/* Enhanced Sidebar */}
          <div className="col-span-4 md:col-span-4 space-y-2 md:space-y-6">
            <div className="bg-[var(--bg-card)] rounded-lg md:rounded-[2rem] p-1 md:p-8 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] overflow-hidden relative transition-colors duration-300">
               <div className="absolute top-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-br from-teal-600/10 to-cyan-600/5 -z-0" />
               
               <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-2 md:mb-6">
                     <div className="w-12 h-12 md:w-32 md:h-32 bg-[var(--bg-card)] rounded-lg md:rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/10 border md:border-4 border-[var(--bg-card)] overflow-hidden p-0.5 md:p-1">
                       <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 rounded-md md:rounded-2xl flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                            <span className="text-lg md:text-5xl text-white font-black">
                              {(() => {
                                // Try multiple sources for the name
                                const firstName = profileData.firstName || user?.firstName || '';
                                const lastName = profileData.lastName || user?.lastName || '';
                                const fullName = user?.name || user?.fullName || '';
                                const email = profileData.email || user?.email || '';
                                
                                console.log('👤 User Data for Avatar:', { firstName, lastName, fullName, email, user, profileData });
                                
                                // Priority: firstName > fullName > email
                                if (firstName) return firstName.charAt(0).toUpperCase();
                                if (fullName) return fullName.charAt(0).toUpperCase();
                                if (email) return email.charAt(0).toUpperCase();
                                return 'U';
                              })()}
                            </span>
                          )}
                       </div>
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                     />
                     <button 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -bottom-1 -right-1 w-5 h-5 md:w-10 md:h-10 bg-teal-600 text-white rounded-md md:rounded-2xl shadow-lg flex items-center justify-center border md:border-4 border-[var(--bg-card)] hover:bg-teal-700 transition-all hover:scale-110"
                      >
                        <MdCameraAlt className="text-[8px] md:text-lg" />
                     </button>
                  </div>
                  
                  <div className="text-center mb-2 md:mb-10 min-w-0">
                    <h3 className="text-[7px] md:text-2xl font-black text-[var(--text-main)] leading-tight truncate px-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {(() => {
                        const firstName = profileData.firstName || user?.firstName || '';
                        const lastName = profileData.lastName || user?.lastName || '';
                        const fullName = user?.name || user?.fullName || '';
                        const email = profileData.email || user?.email || '';
                        
                        console.log('👤 User Data for Name Display:', { firstName, lastName, fullName, email });
                        
                        // Build display name with priority
                        if (firstName || lastName) {
                          return `${firstName} ${lastName}`.trim() || 'User';
                        }
                        if (fullName) return fullName;
                        if (email) return email.split('@')[0];
                        return 'User Profile';
                      })()}
                    </h3>
                    <div className="flex items-center justify-center gap-0.5">
                       <span className="w-0.5 h-0.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                       <p className="text-[5px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">Verified Account</p>
                    </div>
                  </div>

                  <div className="w-full space-y-1.5 md:space-y-2">
                    {tabs.map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between p-2 md:p-4 rounded-xl md:rounded-2xl transition-all group ${
                          activeTab === tab.id 
                          ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' 
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
                        }`}
                      >
                        <div className="flex flex-row items-center gap-1 md:gap-4 min-w-0 flex-1">
                           <div className={`w-4 h-4 md:w-10 md:h-10 rounded-sm md:rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                              activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--border-subtle)] group-hover:bg-[var(--bg-card)] shadow-sm'
                           }`}>
                              <tab.icon className="text-[8px] md:text-xl" />
                           </div>
                           <div className="text-left min-w-0">
                              <p className="text-[5px] md:text-xs font-bold uppercase tracking-tighter md:tracking-widest leading-none truncate">{tab.label}</p>
                              <p className={`hidden md:block text-[6px] md:text-[9px] font-medium leading-none truncate ${activeTab === tab.id ? 'text-teal-50' : 'text-[var(--text-muted)]'}`}>{tab.desc}</p>
                           </div>
                        </div>
                        <MdKeyboardArrowRight className={`hidden sm:block text-sm md:text-xl transition-transform ${activeTab === tab.id ? 'translate-x-1' : 'opacity-0'}`} />
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-8 md:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[var(--bg-card)] rounded-lg md:rounded-[2.5rem] p-1.5 md:p-12 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] transition-colors duration-300"
                >
                  <div className="flex flex-row items-center justify-between gap-1 md:gap-6 mb-3 md:mb-12">
                     <div className="flex items-center gap-1 md:gap-4 min-w-0">
                       <div className="w-1 md:w-1.5 h-4 md:h-10 bg-teal-600 rounded-full flex-shrink-0" />
                       <h2 className="text-[9px] md:text-3xl font-black text-[var(--text-main)] leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Personal Details</h2>
                    </div>
                    {!isEditingProfile ? (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center justify-center gap-1 md:gap-2 px-1.5 md:px-6 py-1 md:py-3 bg-teal-500/10 text-teal-600 rounded md:rounded-2xl font-black uppercase tracking-tight md:tracking-widest text-[6px] md:text-[10px] hover:bg-teal-500/20 transition-all active:scale-95 flex-shrink-0"
                      >
                        <MdEdit className="text-[8px] md:text-lg" /> <span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">EDIT</span>
                      </button>
                    ) : (
                       <div className="flex gap-1 md:gap-3 flex-shrink-0">
                        <button 
                          onClick={() => setIsEditingProfile(false)}
                          className="px-0.5 md:px-6 py-1 md:py-3 text-[var(--text-muted)] font-black uppercase tracking-widest text-[6px] md:text-[10px] hover:text-[var(--text-main)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          className="flex items-center gap-1 md:gap-2 px-1.5 md:px-8 py-1 md:py-3 bg-teal-600 text-white rounded md:rounded-2xl font-black uppercase tracking-widest text-[6px] md:text-[10px] hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                        >
                          <MdSave className="text-[8px] md:text-lg" /> Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 md:gap-8">
                    {[
                      { label: 'First Name', value: profileData.firstName, icon: MdPerson, key: 'firstName' },
                      { label: 'Last Name', value: profileData.lastName, icon: MdPerson, key: 'lastName' },
                      { label: 'Email Address', value: profileData.email, icon: MdEmail, key: 'email', type: 'email' },
                      { label: 'Phone Number', value: profileData.phone, icon: MdPhone, key: 'phone', type: 'tel' },
                    ].map((field) => (
                      <div key={field.key} className={`space-y-0.5 md:space-y-2 group col-span-2 md:col-span-1`}>
                        <label className="text-[6px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter md:tracking-widest pl-0.5">{field.label}</label>
                        <div className="relative">
                           <field.icon className="absolute left-1.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-600 transition-colors text-[7px] md:text-xl" />
                           <input 
                              type={field.type || 'text'} 
                              value={field.value}
                              disabled={!isEditingProfile}
                              onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                              className="w-full pl-4 md:pl-14 pr-0.5 md:pr-6 py-1.5 md:py-5 bg-[var(--bg-app)] border border-transparent rounded md:rounded-2xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-[7px] md:text-lg text-[var(--text-main)] disabled:opacity-70 shadow-sm"
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                   <div className="mt-8 md:mt-12 p-3 md:p-8 bg-teal-500/5 rounded-2xl md:rounded-3xl flex flex-row items-center justify-between border border-teal-500/10">
                     <div className="flex items-center gap-2 md:gap-5">
                        <div className="w-8 h-8 md:w-14 md:h-14 bg-[var(--bg-card)] rounded-lg md:rounded-2xl flex items-center justify-center text-teal-600 shadow-sm relative overflow-hidden flex-shrink-0">
                           <MdCheckCircle className="text-sm md:text-3xl relative z-10" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-[7px] md:text-sm font-black text-teal-600 mb-0.5 leading-none truncate">Profile {completionPercent}% Complete</p>
                           <p className="text-[5px] md:text-xs text-[var(--text-muted)] font-medium truncate">Keep your profile updated for better service.</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-row items-center gap-2 md:gap-4 mb-4 md:mb-8">
                     <div className="w-1 md:w-1.5 h-4 md:h-10 bg-teal-600 rounded-full flex-shrink-0" />
                     <h2 className="text-[11px] md:text-3xl font-black text-[var(--text-main)] leading-none truncate" style={{ fontFamily: 'Playfair Display, serif' }}>Security Settings</h2>
                  </div>

                  {/* Change Password Section */}
                  <div className="bg-[var(--bg-card)] rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-xl shadow-teal-500/5 border border-[var(--border-main)] transition-colors duration-300">
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                       <div className="w-8 h-8 md:w-12 md:h-12 bg-teal-500/10 rounded-lg md:rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0">
                          <MdLock className="text-lg md:text-2xl" />
                       </div>
                       <div>
                          <h3 className="text-xs md:text-xl font-black text-[var(--text-main)] leading-tight">Change Password</h3>
                          <p className="text-[8px] md:text-xs text-[var(--text-muted)] font-medium line-clamp-1">Update your password to keep secure</p>
                       </div>
                    </div>

                    <form className="space-y-6 max-w-xl" onSubmit={handlePasswordUpdate}>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-[7px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-0.5 md:pl-1">Current Password</label>
                        <div className="relative">
                          <MdLock className="absolute left-2.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] md:text-xl" />
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full pl-8 md:pl-14 pr-8 md:pr-14 py-2.5 md:py-5 bg-[var(--bg-app)] border border-transparent rounded-lg md:rounded-2xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-[9px] md:text-lg text-[var(--text-main)] shadow-sm placeholder:text-[var(--text-muted)]"
                            placeholder="••••••••"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                          >
                            {showPassword ? <MdVisibilityOff className="text-[10px] md:text-xl" /> : <MdVisibility className="text-[10px] md:text-xl" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-6">
                        <div className="space-y-1 md:space-y-2 col-span-2 md:col-span-1">
                          <label className="text-[7px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-0.5 md:pl-1">New Password</label>
                          <div className="relative">
                            <MdLock className="absolute left-2.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] md:text-xl" />
                            <input 
                              type={showPassword ? "text" : "password"}
                              value={passwordData.new}
                              onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                              className="w-full pl-8 md:pl-14 pr-2 md:pr-6 py-2.5 md:py-5 bg-[var(--bg-app)] border border-transparent rounded-lg md:rounded-2xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-[9px] md:text-lg text-[var(--text-main)] shadow-sm placeholder:text-[var(--text-muted)]"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 md:space-y-2 col-span-2 md:col-span-1">
                          <label className="text-[7px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-0.5 md:pl-1">Confirm Password</label>
                          <div className="relative">
                            <MdLock className="absolute left-2.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] md:text-xl" />
                            <input 
                              type={showPassword ? "text" : "password"}
                              value={passwordData.confirm}
                              onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                              className="w-full pl-8 md:pl-14 pr-2 md:pr-6 py-2.5 md:py-5 bg-[var(--bg-app)] border border-transparent rounded-lg md:rounded-2xl focus:bg-[var(--bg-card)] focus:border-teal-500 outline-none transition-all font-bold text-[9px] md:text-lg text-[var(--text-main)] shadow-sm placeholder:text-[var(--text-muted)]"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                       <div className="pt-2 md:pt-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                        <button 
                          type="submit"
                          className="px-6 md:px-10 py-2.5 md:py-4 bg-teal-600 text-white rounded-lg md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
                        >
                          Update
                        </button>
                        <p className="text-[7px] md:text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight leading-tight">
                          Strong passwords prevent unauthorized access.
                        </p>
                      </div>
                    </form>
                  </div>

                   {/* Secondary Security Options */}
                   <div className="grid grid-cols-2 gap-2 md:gap-6">
                     <div className="bg-[var(--bg-card)] p-3 md:p-8 rounded-xl md:rounded-[2rem] border border-[var(--border-main)] shadow-sm group hover:border-teal-500/30 transition-all">
                       <div className="flex justify-between items-start mb-2 md:mb-6">
                          <div className="w-6 h-6 md:w-12 md:h-12 bg-blue-500/10 text-blue-500 rounded-lg md:rounded-2xl flex items-center justify-center">
                             <MdShield className="text-sm md:text-2xl" />
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                             <div 
                                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                className={`w-8 h-4 md:w-12 md:h-6 rounded-full relative cursor-pointer transition-all duration-300 ${is2FAEnabled ? 'bg-teal-600' : 'bg-[var(--border-main)]'}`}
                             >
                                <motion.div 
                                   animate={{ x: is2FAEnabled ? (window.innerWidth < 768 ? 16 : 24) : 2 }}
                                   className="absolute top-0.5 md:top-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-sm"
                                />
                             </div>
                          </div>
                       </div>
                       <h4 className="text-[10px] md:text-lg font-black text-[var(--text-main)] mb-0.5 md:mb-1">2FA Secure</h4>
                       <p className="text-[6px] md:text-xs text-[var(--text-muted)] font-medium leading-tight">Add extra layer of security.</p>
                    </div>

                     <div className="bg-[var(--bg-card)] p-3 md:p-8 rounded-xl md:rounded-[2rem] border border-[var(--border-main)] shadow-sm group hover:border-teal-500/30 transition-all">
                       <div className="flex justify-between items-start mb-2 md:mb-6">
                          <div className="w-6 h-6 md:w-12 md:h-12 bg-orange-500/10 text-orange-500 rounded-lg md:rounded-2xl flex items-center justify-center">
                             <MdHistory className="text-sm md:text-2xl" />
                          </div>
                          <button 
                            onClick={handleShowLogs}
                            className="text-[5px] md:text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline"
                          >
                            VIEW ALL
                          </button>
                       </div>
                       <h4 className="text-[10px] md:text-lg font-black text-[var(--text-main)] mb-0.5 md:mb-1">Activity</h4>
                       <p className="text-[6px] md:text-xs text-[var(--text-muted)] font-medium leading-tight">Check login locations.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Login Activity Modal */}
      <AnimatePresence>
        {showLoginActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginActivity(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-card)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-main)]"
            >
              <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-8 text-white">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-black mb-1">Login Activity</h2>
                       <p className="text-orange-100 text-xs font-medium uppercase tracking-[0.2em]">{activityLogs.length} Recent Sessions</p>
                    </div>
                    <button 
                      onClick={() => setShowLoginActivity(false)}
                      className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <MdClose size={20} />
                    </button>
                 </div>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                 {fetchingLogs ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Fetching logs...</p>
                    </div>
                 ) : activityLogs.length > 0 ? (
                    activityLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-app)] transition-colors border border-transparent hover:border-[var(--border-main)]">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl w-12 h-12 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-main)] flex items-center justify-center">
                            {log.device?.toLowerCase().includes('iphone') || log.device?.toLowerCase().includes('android') ? '📱' : '💻'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--text-main)]">{log.device || log.userAgent || 'Unknown Device'}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest">{log.location || log.ipAddress || 'Unknown Location'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
                              {idx === 0 ? 'Current Session' : (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Recent')}
                           </p>
                           <p className="text-[8px] text-[var(--text-muted)] font-medium">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                           </p>
                        </div>
                    </div>
                    ))
                 ) : (
                    <div className="text-center py-12">
                        <MdHistory className="text-5xl text-gray-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">No recent activity logs found</p>
                    </div>
                 )}
              </div>

              <div className="p-8 bg-[var(--bg-app)] border-t border-[var(--border-main)]">
                 <button 
                   onClick={() => setShowLoginActivity(false)}
                   className="w-full bg-[var(--bg-card)] text-[var(--text-main)] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-md border border-[var(--border-main)] transition-all active:scale-[0.98]"
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
