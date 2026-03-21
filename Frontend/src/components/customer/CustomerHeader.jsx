import { useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { MdShoppingCart, MdFavorite, MdNotifications, MdPerson, MdSettings, MdLogout, MdKeyboardArrowDown, MdNightlight, MdWbSunny, MdLocalShipping, MdLocalOffer, MdMessage, MdError, MdCheckCircle, MdDelete } from 'react-icons/md';
import { FiMenu, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import GlobalSearch from './GlobalSearch';
import { AnimatePresence, motion } from 'framer-motion';

const CustomerHeader = ({ onMenuClick }) => {
  const { logout, user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  // Load unread notifications count
  useEffect(() => {
    const loadUnreadCount = () => {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const notifications = JSON.parse(savedNotifications);
          const unread = notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          setNotifications(notifications);
        } catch (error) {
          console.error('Error parsing notifications:', error);
          setUnreadCount(0);
          setNotifications([]);
        }
      }
    };

    // Load initially
    loadUnreadCount();

    // Listen for storage changes (when notifications are updated)
    window.addEventListener('storage', loadUnreadCount);
    
    // Custom event for same-tab updates
    window.addEventListener('notificationsUpdated', loadUnreadCount);

    return () => {
      window.removeEventListener('storage', loadUnreadCount);
      window.removeEventListener('notificationsUpdated', loadUnreadCount);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Icon mapping for notifications
  const iconMap = {
    MdLocalShipping,
    MdLocalOffer,
    MdMessage,
    MdError,
    MdCheckCircle
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[var(--bg-app)] border-b border-[var(--border-main)] sticky top-0 z-30 shadow-sm px-3 md:px-4 h-14 md:h-20 flex items-center transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-2 md:gap-4">
        
        {/* Left: Menu & Greeting */}
        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={onMenuClick}
            className="p-1.5 md:p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] rounded-xl transition-colors md:hidden"
          >
            <FiMenu className="text-xl md:text-2xl" />
          </button>
          
          <div className="flex md:block items-center gap-1 md:gap-0 min-w-0">
            <h2 className="text-[10px] md:text-xl font-bold text-[var(--text-main)] tracking-tight whitespace-nowrap">
              {isAuthenticated ? (
                <><span className="hidden sm:inline">Good day, </span><span className="text-teal-600">{user?.name?.split(' ')[0]}</span></>
              ) : (
                'Welcome'
              )}
            </h2>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <GlobalSearch />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-4 ml-auto">
          
          <div className="flex items-center gap-1 md:gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="relative p-1.5 md:p-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-teal-600 rounded-lg md:rounded-xl transition-all group"
            >
              {theme === 'dark' ? <MdWbSunny className="text-lg md:text-2xl" /> : <MdNightlight className="text-lg md:text-2xl" />}
            </button>
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-1.5 md:p-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-teal-600 rounded-lg md:rounded-xl transition-all group"
              >
                <MdNotifications className={`text-lg md:text-2xl ${unreadCount > 0 ? 'text-teal-600' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 bg-teal-600 text-white text-[8px] md:text-[10px] font-bold rounded-full min-w-[14px] md:min-w-[18px] h-[14px] md:h-[18px] flex items-center justify-center px-0.5 md:px-1 shadow-md border md:border-2 border-[var(--bg-card)]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute -right-36 xs:-right-24 md:right-0 mt-3 w-[85vw] xs:w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-[400px] bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-main)] overflow-hidden z-50 transition-colors duration-300"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                      <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                        <MdNotifications className="text-teal-600" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif) => {
                          const IconComponent = iconMap[notif.iconName] || MdNotifications;
                          return (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors ${
                                !notif.isRead ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-10 h-10 ${notif.bg} ${notif.color} rounded-lg flex items-center justify-center shrink-0`}>
                                  <IconComponent className="text-lg" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-teal-600' : 'text-[var(--text-main)]'}`}>
                                      {notif.title}
                                    </h4>
                                    {!notif.isRead && (
                                      <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 mt-1"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase">
                                      {notif.time}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {!notif.isRead && (
                                        <button
                                          onClick={() => markAsRead(notif.id)}
                                          className="text-[9px] font-bold text-teal-600 hover:text-teal-800 uppercase"
                                        >
                                          Mark Read
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteNotification(notif.id)}
                                        className="text-rose-500 hover:text-rose-700"
                                      >
                                        <MdDelete className="text-sm" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <MdNotifications className="text-4xl text-[var(--text-muted)] mx-auto mb-2" />
                          <p className="text-sm text-[var(--text-muted)] font-medium">No notifications yet</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]">
                        <Link
                          to="/customer/notifications"
                          onClick={() => setIsNotificationOpen(false)}
                          className="block text-center text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/customer/wishlist" className="relative p-1.5 md:p-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-rose-500 rounded-lg md:rounded-xl transition-all group">
              <MdFavorite className={`text-lg md:text-2xl ${wishlistCount > 0 ? 'text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 bg-rose-500 text-white text-[8px] md:text-[10px] font-bold rounded-full min-w-[14px] md:min-w-[18px] h-[14px] md:h-[18px] flex items-center justify-center px-0.5 md:px-1 shadow-md border md:border-2 border-[var(--bg-card)]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-1.5 md:p-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-teal-600 rounded-lg md:rounded-xl transition-all group">
              <MdShoppingCart className="text-lg md:text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 bg-teal-600 text-white text-[8px] md:text-[10px] font-bold rounded-full min-w-[14px] md:min-w-[18px] h-[14px] md:h-[18px] flex items-center justify-center px-0.5 md:px-1 shadow-md border md:border-2 border-[var(--bg-card)]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="h-6 md:h-8 w-px bg-[var(--border-main)] hidden md:block mx-1 md:mx-2" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            {isAuthenticated ? (
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 md:gap-2 p-0.5 md:p-1.5 pl-1 md:pl-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl md:rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-[var(--text-main)] line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Member</p>
                </div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xs md:text-base shadow-sm group-hover:scale-105 transition-transform">
                  {user.name.charAt(0)}
                </div>
                <MdKeyboardArrowDown className={`text-lg md:text-xl text-[var(--text-muted)] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <Link
                to="/customer/login"
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/10 hover:bg-teal-700 transition-all"
              >
                Sign In
              </Link>
            )}

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-main)] overflow-hidden py-2 z-50 transition-colors duration-300"
                >
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-main)] line-clamp-1">{user.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    {[
                      { icon: MdPerson, label: 'Account Profile', path: '/customer/profile' },
                      { icon: MdSettings, label: 'Account Settings', path: '/customer/settings' },
                    ].map((item, i) => (
                     <Link
                        key={i}
                        to={item.path}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-teal-600 rounded-xl transition-all text-sm font-semibold"
                      >
                        <item.icon className="text-xl" />
                        {item.label}
                      </Link>
                    ))}

                  </div>

                  <div className="px-2 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all text-sm font-bold"
                    >
                      <MdLogout className="text-xl" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
