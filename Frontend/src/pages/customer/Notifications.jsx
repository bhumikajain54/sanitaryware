import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdNotifications,
  MdLocalOffer,
  MdLocalShipping,
  MdError,
  MdCheckCircle,
  MdMessage,
  MdDelete,
  MdDoneAll,
  MdMoreVert,
  MdFilterList
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';

const iconMap = {
  MdLocalShipping,
  MdLocalOffer,
  MdMessage,
  MdError,
  MdCheckCircle
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'offer', label: 'Offers' },
  { id: 'support', label: 'Support' }
];

const Notifications = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchNotifications();
    } else {
      setLoading(false);
      setNotifications([]);
    }
  }, [isAuthenticated, isAdmin]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await customerService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => customerService.markNotificationAsRead(n.id))
      );
      fetchNotifications();
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await customerService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const markAsRead = async (id) => {
    try {
      await customerService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAsUnread = () => toast.info('Feature coming soon');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.isRead;
    return notif.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-4 sm:py-6 md:py-10 lg:py-16 px-3 sm:px-5 md:px-6 lg:px-8 font-inter">
      <div className="max-w-4xl mx-auto">

        {/* ─── Header ─── */}
        <div className="mb-5 sm:mb-7 md:mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="min-w-0">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[var(--text-main)] mb-1 sm:mb-1.5 md:mb-2 tracking-tighter"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Notifications
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-lg text-[var(--text-muted)] font-medium tracking-tight">
              Stay updated with your orders, offers and account activity.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white border border-gray-100 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm w-fit"
          >
            <MdDoneAll className="text-base sm:text-lg md:text-xl flex-shrink-0" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* ─── Filter Pills ─── */}
        <div className="mb-4 sm:mb-5 md:mb-7 lg:mb-8 bg-[var(--bg-card)] p-1 sm:p-1.5 md:p-2 rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-sm border border-[var(--border-main)] flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-max">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl md:rounded-2xl text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/10'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-teal-600'
                  }`}
              >
                {filter.label}
                {filter.id === 'unread' && unreadCount > 0 && (
                  <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black ${activeFilter === filter.id ? 'bg-white text-teal-600' : 'bg-rose-500 text-white'
                    }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="hidden md:flex p-1.5 sm:p-2 text-[var(--text-muted)] flex-shrink-0">
            <MdFilterList className="text-lg sm:text-xl" />
          </div>
        </div>

        {/* ─── Notification Cards ─── */}
        <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 md:p-8 border border-[var(--border-main)] animate-pulse">
                <div className="flex gap-3 sm:gap-4 md:gap-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[var(--bg-app)] rounded-xl md:rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-app)] rounded w-2/3" />
                    <div className="h-3 bg-[var(--bg-app)] rounded w-full" />
                    <div className="h-3 bg-[var(--bg-app)] rounded w-4/5" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => {
                const IconComponent = iconMap[notif.iconName] || MdNotifications;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative group bg-[var(--bg-card)] rounded-xl sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-7 lg:p-8 border-2 transition-all duration-300 ${!notif.isRead
                      ? 'border-teal-500 shadow-xl shadow-teal-500/5'
                      : 'border-[var(--border-main)] shadow-sm hover:shadow-md hover:border-teal-500/30'
                      }`}
                  >
                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-200" />
                      </div>
                    )}

                    <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start">
                      {/* Icon */}
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-16 lg:h-16 ${notif.bg} ${notif.color} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="text-lg sm:text-xl md:text-2xl lg:text-3xl" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Time */}
                        <div className="flex flex-col xs:flex-row xs:items-start justify-between mb-1 sm:mb-1.5 md:mb-2 gap-0.5 xs:gap-2 sm:gap-3 md:gap-4">
                          <h3 className={`text-xs sm:text-sm md:text-base lg:text-xl font-black tracking-tight leading-tight ${notif.isRead ? 'text-[var(--text-main)]' : 'text-teal-600'
                            } pr-6 xs:pr-0`}>
                            {notif.title}
                          </h3>
                          <span className="text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                            {notif.time}
                          </span>
                        </div>

                        {/* Message */}
                        <p className={`text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed mb-2.5 sm:mb-3 md:mb-5 lg:mb-6 ${notif.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)] font-medium'
                          }`}>
                          {notif.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 pt-2 sm:pt-2.5 border-t border-gray-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {!notif.isRead ? (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800 whitespace-nowrap"
                            >
                              Mark as read
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notif.id)}
                              className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800 whitespace-nowrap"
                            >
                              Mark as unread
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 flex items-center gap-1 whitespace-nowrap"
                          >
                            <MdDelete className="text-xs sm:text-sm flex-shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 sm:py-14 md:py-16 lg:py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-100"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-[var(--bg-app)] rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-inner border border-[var(--border-main)]">
                <MdNotifications className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-muted)]" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black text-[var(--text-main)] mb-1.5 sm:mb-2">
                No notifications found
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] font-medium">
                All caught up! We'll notify you when something happens.
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-teal-600 font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>

        {/* ─── Footer CTA ─── */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 p-4 sm:p-5 md:p-6 lg:p-8 bg-slate-900 rounded-2xl md:rounded-[1.5rem] lg:rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h4 className="text-white font-black text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 sm:mb-1">
                Notification Settings
              </h4>
              <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm font-medium">
                Customize how you want to receive alerts.
              </p>
            </div>
            <Link
              to="/customer/preferences"
              className="flex-shrink-0 text-center px-4 sm:px-5 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs hover:bg-teal-700 transition-all active:scale-95 shadow-xl shadow-teal-900/40 whitespace-nowrap w-full sm:w-auto"
            >
              Manage Preferences
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;