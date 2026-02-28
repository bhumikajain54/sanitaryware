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

// Default notifications data
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    MdLocalShipping,
    MdLocalOffer,
    MdMessage,
    MdError,
    MdCheckCircle
  };

  const { isAuthenticated, isAdmin } = useAuth();

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
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const markAsRead = async (id) => {
    try {
      await customerService.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
        toast.error('Failed to mark as read');
    }
  };

  const markAsUnread = async (id) => {
    toast.info('Feature coming soon');
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'order', label: 'Orders' },
    { id: 'offer', label: 'Offers' },
    { id: 'support', label: 'Support' }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.isRead;
    return notif.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-8 md:py-16 px-4 md:px-8 font-inter">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--text-main)] mb-2 tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>
              Notifications
            </h1>
            <p className="text-sm md:text-lg text-[var(--text-muted)] font-medium tracking-tight">Stay updated with your orders, offers and account activity.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border border-gray-100 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-xs text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm"
             >
                <MdDoneAll className="text-lg md:text-xl" />
                <span>Mark all as read</span>
             </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="mb-6 md:mb-8 flex items-center justify-between bg-[var(--bg-card)] p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] shadow-sm border border-[var(--border-main)] overflow-x-auto">
           <div className="flex items-center gap-1 md:gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-5 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeFilter === filter.id 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/10' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-teal-600'
                  }`}
                >
                  {filter.label}
                  {filter.id === 'unread' && notifications.filter(n => !n.isRead).length > 0 && (
                     <span className={`ml-1.5 md:ml-2 px-1.5 py-0.5 rounded-full text-[8px] ${activeFilter === filter.id ? 'bg-white text-teal-600' : 'bg-rose-500 text-white'}`}>
                        {notifications.filter(n => !n.isRead).length}
                     </span>
                  )}
                </button>
              ))}
           </div>
           <div className="hidden md:flex p-2 text-[var(--text-muted)]">
              <MdFilterList size={20} />
           </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 md:space-y-4">
          {filteredNotifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative group bg-[var(--bg-card)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 border-2 transition-all duration-300 ${
                    !notif.isRead 
                    ? 'border-teal-500 shadow-xl shadow-teal-500/5' 
                    : 'border-[var(--border-main)] shadow-sm hover:shadow-md hover:border-teal-500/30'
                  }`}
                >
                  {!notif.isRead && (
                    <div className="absolute top-5 right-5 md:top-8 md:right-8">
                      <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-200" />
                    </div>
                  )}

                  <div className="flex gap-3 md:gap-8 items-start">
                    <div className={`w-10 h-10 md:w-16 md:h-16 ${notif.bg} ${notif.color} rounded-xl md:rounded-2xl flex items-center justify-center shrink-0`}>
                       {(() => {
                         const IconComponent = iconMap[notif.iconName];
                         return IconComponent ? <IconComponent className="text-xl md:text-3xl" /> : <MdNotifications className="text-xl md:text-3xl" />;
                       })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1.5 md:mb-2 gap-1 md:gap-4">
                        <h3 className={`text-sm md:text-xl font-black tracking-tight leading-tight ${notif.isRead ? 'text-[var(--text-main)]' : 'text-teal-600'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[9px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className={`text-xs md:text-base leading-relaxed mb-3 md:mb-6 ${notif.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)] font-medium'}`}>
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 md:gap-6 pt-2 border-t border-gray-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                         {!notif.isRead ? (
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800"
                            >
                              Mark as read
                            </button>
                         ) : (
                            <button 
                              onClick={() => markAsUnread(notif.id)}
                              className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800"
                            >
                              Mark as unread
                            </button>
                         )}
                         <button 
                           onClick={() => deleteNotification(notif.id)}
                           className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 flex items-center gap-1"
                         >
                            <MdDelete className="text-sm" />
                            <span>Delete</span>
                         </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-16 md:py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-gray-100"
             >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[var(--bg-app)] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[var(--border-main)]">
                   <MdNotifications className="text-5xl md:text-6xl text-[var(--text-muted)]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-[var(--text-main)] mb-2">No notifications found</h3>
                <p className="text-sm md:text-base text-[var(--text-muted)] font-medium">All caught up! We'll notify you when something happens.</p>
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-6 md:mt-8 text-teal-600 font-black text-xs md:text-sm uppercase tracking-widest hover:underline"
                >
                   Clear all filters
                </button>
             </motion.div>
          )}
        </div>

        {/* Action Panel Footer */}
        <div className="mt-8 md:mt-12 p-4 md:p-8 bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                 <h4 className="text-white font-black text-base md:text-xl mb-1">Notification Settings</h4>
                 <p className="text-slate-400 text-xs md:text-sm font-medium">Customize how you want to receive alerts.</p>
              </div>
            <Link 
                   to="/customer/preferences"
                   className="w-full md:w-auto text-center px-4 md:px-8 py-3 md:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-xs hover:bg-teal-700 transition-all active:scale-95 shadow-xl shadow-teal-900/40 whitespace-nowrap"
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
