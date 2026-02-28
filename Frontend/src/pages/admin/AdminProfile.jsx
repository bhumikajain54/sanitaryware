import { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCamera, 
  FiEdit2, 
  FiSave, 
  FiLock,
  FiX,
  FiShield,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAdminToast, useAdminModal } from '../../hooks/useAdmin';

const AdminProfile = () => {
  const { user } = useAuth();
  const { success, warning } = useAdminToast();
  const { isOpen: isPassModalOpen, openModal: openPassModal, closeModal: closePassModal } = useAdminModal();
  
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@singhaitraders.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    location: 'Indore, Madhya Pradesh',
    joinDate: 'January 2024'
  });

  const [passForm, setPassForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSave = () => {
    setIsEditing(false);
    success('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
        warning('Passwords do not match!');
        return;
    }
    success('Password updated successfully!');
    closePassModal();
    setPassForm({ current: '', new: '', confirm: '' });
  };

  const handle2FAToggle = () => {
    if (!is2FAActive) {
        success('Two-factor authentication activated!');
        setIs2FAActive(true);
    } else {
        warning('2FA has been deactivated.');
        setIs2FAActive(false);
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">System Administrator</h1>
            <p className="text-sm font-bold text-[var(--admin-text-secondary)] mt-2 uppercase tracking-tight italic">Manage your personal presence and security protocols.</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 group ${
              isEditing 
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700' 
                : 'bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)] border-2 border-[var(--border-subtle)] hover:border-teal-500 dark:hover:border-teal-500'
            }`}
          >
            {isEditing ? <FiSave className="text-xl" /> : <FiEdit2 className="text-xl" />}
            {isEditing ? 'Commit Profile' : 'Modify Bio'}
          </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Summary */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500"></div>
            
            <div className="relative inline-block mb-8">
              <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl relative z-10 mx-auto transform group-hover:rotate-6 transition-transform">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute -bottom-4 -right-4 w-12 h-12 bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl flex items-center justify-center text-teal-600 border-2 border-slate-50 dark:border-slate-700 hover:border-teal-500 transition-all z-20 group-hover:scale-110 active:scale-90">
                <FiCamera className="text-xl" />
              </button>
            </div>

            <h2 className="text-2xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter leading-tight">{profile.name}</h2>
            <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-5 py-2 rounded-xl inline-block mt-3 mb-8 tracking-widest uppercase italic">
              Level: {profile.role}
            </p>

            <div className="space-y-5 text-left border-t border-slate-50 dark:border-slate-600 pt-8">
              <div className="flex items-center gap-4 text-xs font-bold text-[var(--admin-text-secondary)] group/item">
                <div className="p-2 bg-[var(--admin-bg-primary)] rounded-lg group-hover/item:text-teal-500 transition-colors">
                  <FiMail className="shrink-0 text-lg" />
                </div>
                <span className="truncate uppercase tracking-tight">{profile.email}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-[var(--admin-text-secondary)] group/item">
                <div className="p-2 bg-[var(--admin-bg-primary)] rounded-lg group-hover/item:text-teal-500 transition-colors">
                  <FiPhone className="shrink-0 text-lg" />
                </div>
                <span className="uppercase tracking-tight">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-[var(--admin-text-secondary)] group/item">
                <div className="p-2 bg-[var(--admin-bg-primary)] rounded-lg group-hover/item:text-teal-500 transition-colors">
                  <FiMapPin className="shrink-0 text-lg" />
                </div>
                <span className="uppercase tracking-tight">{profile.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] shadow-xl">
             <h3 className="text-[10px] font-black text-[var(--admin-text-primary)] mb-6 flex items-center gap-3 uppercase tracking-widest">
               <FiShield className="text-teal-500 text-lg" /> Security Vault
             </h3>
             <button 
               onClick={() => openPassModal()}
               className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all mb-4 active:scale-95"
             >
               Internal Password Reset
             </button>
             <button 
               onClick={handle2FAToggle}
               className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                 is2FAActive 
                    ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' 
                    : 'border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10'
               }`}
             >
               {is2FAActive ? 'MFA Engine: Active' : 'Setup Biometric 2FA'}
             </button>
          </div>
        </div>

        {/* Right Column - Detailed Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-subtle)] p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-black text-[var(--admin-text-primary)] mb-10 border-b-2 border-slate-50 dark:border-slate-600 pb-6 uppercase tracking-tight">
              Identity Matrix
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Ambassador Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black uppercase tracking-tight disabled:opacity-50"
                  placeholder="e.g. AR. VIKRAM SINGH"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Secure Communication (E-Z)
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-bold italic disabled:opacity-50"
                  placeholder="admin@singhaitraders.com"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Hotline Link
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black disabled:opacity-50"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Geo-Tag Position
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-bold uppercase tracking-tight disabled:opacity-50"
                  placeholder="Indore HQ"
                />
              </div>
            </div>

            <div className="mt-12 pt-10 border-t-2 border-slate-50 dark:border-slate-600">
              <h3 className="text-[10px] font-black text-[var(--admin-text-primary)] mb-6 uppercase tracking-widest">
                Executive Professional Narrative
              </h3>
              <textarea
                disabled={!isEditing}
                rows="4"
                className="w-full px-8 py-6 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-[2.5rem] outline-none transition-all dark:text-white text-sm font-bold resize-none leading-relaxed italic scrollbar-hide disabled:opacity-50"
                placeholder="Deep insights into administrative roles and vision..."
              ></textarea>
            </div>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all" 
            onClick={closePassModal}
          />
          <div className="bg-[var(--admin-bg-secondary)] w-full max-w-md rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-[var(--border-main)] relative z-10 overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
                        <FiLock className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight leading-tight">MFA Reset</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1 italic leading-tight">Update security protocols</p>
                    </div>
                </div>
                <button 
                    onClick={closePassModal}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                >
                    <FiX className="text-2xl" />
                </button>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="p-10 space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                        Current Private Key
                    </label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black tracking-[0.2em]"
                        value={passForm.current}
                        onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                        Genesis Password (New)
                    </label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black tracking-[0.2em]"
                        value={passForm.new}
                        onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                        Verify New Sequence
                    </label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm font-black tracking-[0.2em]"
                        value={passForm.confirm}
                        onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                    />
                </div>

                <div className="pt-6 flex gap-4">
                    <button 
                        type="button" 
                        onClick={closePassModal}
                        className="flex-1 py-4 rounded-[1.5rem] font-black text-slate-400 text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 transition-all border-2 border-transparent"
                    >
                        Abort
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 py-4 bg-teal-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-teal-500/30 hover:bg-teal-700 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        Commit Reset
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminProfile;
