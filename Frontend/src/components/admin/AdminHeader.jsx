import { useState, useEffect, useCallback } from 'react';
import { 
  FiLogOut, 
  FiMenu, 
  FiBell, 
  FiSearch,
  FiUser,
  FiSettings
} from 'react-icons/fi';
import { MdNotifications, MdNightlight, MdWbSunny } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';


import { getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/adminService';
import GlobalSearchBar from '../GlobalSearchBar';
import { AnimatePresence } from 'framer-motion';

const AdminHeader = ({ toggleSidebar }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  


  const handleLogout = () => {
    logout();
    navigate('/customer/login');
  };

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (data) setNotifications(data);
    } catch (err) {
      // Silence logs if it's a network error (backend down)
      if (err.message === 'Network Error' || err.code === 'ECONNREFUSED') {
        // Log once quietly or ignore
        return;
      }
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return; // Only poll if logged in

    loadNotifications();
    
    // Refresh every 30 seconds if tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadNotifications, user]);

  const unreadCount = notifications.filter(notif => notif.unread).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Still update UI if mock mode or optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Still update UI if mock mode or optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (notif.unread) {
      await handleMarkAsRead(notif.id);
    }
    
    // Close dropdown
    setShowNotifications(false);
    
    // Navigate based on type
    switch (notif.type) {
      case 'order':
        navigate('/admin/orders');
        break;
      case 'alert':
      case 'stock':
        navigate('/admin/products');
        break;
      case 'query':
        navigate('/admin/inquiries');
        break;
      default:
        navigate('/admin/notifications');
    }
  };

  return (
    <header className="bg-[var(--admin-bg-secondary)] sticky top-0 z-30 shadow-sm backdrop-blur-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all hover:scale-105"
            >
              <FiMenu className="text-2xl" />
            </button>

            {/* Page Title */}
            <div className="hidden sm:block">
              <h2 className="text-lg sm:text-xl font-bold admin-gradient-text leading-tight">
                Admin Dashboard
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                Manage your sanitary ware business
              </p>
            </div>

            {/* Search Bar - Desktop */}
            <div 
              className="hidden md:flex flex-1 max-w-md ml-8 cursor-pointer"
              onClick={() => setShowSearch(true)}
            >
              <div className="relative w-full group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-teal-500 transition-colors" />
                <div className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50/50 text-gray-400 flex items-center justify-between hover:border-teal-500/50 transition-all">
                  <span>Search anything...</span>
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search Icon - Mobile */}
            <button 
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
            >
              <FiSearch className="text-lg" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-slate-800 rounded-lg transition-all hover:scale-105"
            >
              {theme === 'dark' ? <MdWbSunny className="text-xl sm:text-2xl" /> : <MdNightlight className="text-xl sm:text-2xl" />}
            </button>

            {/* Notifications */}
            <div 
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all hover:scale-105"
              >
                <MdNotifications className="text-xl sm:text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg admin-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute -right-14 sm:right-0 pt-2 w-72 sm:w-96 max-w-[calc(100vw-2rem)] z-50 animate-admin-slide-up">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                      {/* Header */}
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 dark:border-slate-700 bg-[var(--admin-bg-secondary)]">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              onClick={handleMarkAllRead}
                              className="text-[10px] sm:text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5">{unreadCount} unread</p>
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, index) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer border-b border-gray-50 dark:border-slate-700/50 last:border-b-0 ${
                                notif.unread ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5 sm:gap-3">
                                {/* Indicator Dot */}
                                <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  notif.unread ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'
                                }`} />
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${
                                    notif.unread 
                                      ? 'font-bold text-gray-900 dark:text-white' 
                                      : 'font-semibold text-gray-700 dark:text-slate-300'
                                  }`}>
                                    {notif.title}
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mb-0.5 sm:mb-1">
                                    {notif.message}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                    {notif.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-10 sm:py-12 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                              <MdNotifications className="text-2xl sm:text-3xl text-gray-400 dark:text-slate-500" />
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">No notifications</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400">You're all caught up!</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
                          <button 
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/admin/notifications');
                            }}
                            className="w-full text-center text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors py-1"
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition-all hover:scale-105 group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-teal-500/20">
                  {user?.name ? user.name.charAt(0) : <FiUser className="text-base sm:text-lg" />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-[var(--admin-text-primary)] group-hover:text-black dark:group-hover:text-white transition-colors">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold group-hover:text-blue-900 dark:group-hover:text-teal-400 transition-colors">{user?.role?.replace('ROLE_', '') || 'Administrator'}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfile && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfile(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--admin-bg-secondary)] rounded-xl shadow-xl z-50 admin-glass-card">
                    <div className="p-4">
                      <p className="font-semibold text-[var(--admin-text-primary)]">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">{user?.email || 'admin@singhaitraders.com'}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setShowProfile(false);
                          navigate('/admin/profile');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--admin-text-primary)] hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-blue-900 dark:hover:text-teal-300 rounded-lg transition-colors group"
                      >
                        <FiUser className="text-base" />
                        <span>My Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfile(false);
                          navigate('/admin/settings');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--admin-text-primary)] hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-blue-900 dark:hover:text-teal-300 rounded-lg transition-colors group"
                      >
                        <FiSettings className="text-base" />
                        <span>Settings</span>
                      </button>
                      

                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        <FiLogOut className="text-base" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showSearch && (
          <GlobalSearchBar onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminHeader;
