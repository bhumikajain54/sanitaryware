import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdHome, 
  MdInventory, 
  MdDashboard,
  MdReceipt,
  MdPerson,
  MdFavorite,
  MdLogout,
  MdClose,
  MdLocationOn,
  MdNotifications,
  MdHelpOutline,
  MdSettings
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const CustomerSidebar = ({ isMobileOpen, onMobileClose, onMobileToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileOpen) onMobileClose();
  }, [location.pathname]);

  const prefetchRoute = (path) => {
    const routes = {
      '/customer/dashboard': () => import('../../pages/customer/Dashboard'),
      '/products': () => import('../../pages/customer/Products'),
      '/customer/orders': () => import('../../pages/customer/Orders'),
      '/customer/wishlist': () => import('../../pages/customer/Wishlist'),
      '/customer/notifications': () => import('../../pages/customer/Notifications'),
      '/customer/addresses': () => import('../../pages/customer/Addresses'),
      '/customer/profile': () => import('../../pages/customer/Profile'),
      '/customer/preferences': () => import('../../pages/customer/Preferences'),
      '/customer/contact': () => import('../../pages/customer/Support'),
    };
    
    if (routes[path]) {
      routes[path](); // Start loading the chunk
    }
  };

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/customer/dashboard', icon: MdDashboard },
        { name: 'Shop Now', path: '/products', icon: MdInventory },
      ]
    },
    {
      title: 'My Workspace',
      items: [
        { name: 'Orders', path: '/customer/orders', icon: MdReceipt },
        { name: 'Wishlist', path: '/customer/wishlist', icon: MdFavorite },
        { name: 'Notifications', path: '/customer/notifications', icon: MdNotifications },
        { name: 'Addresses', path: '/customer/addresses', icon: MdLocationOn },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'My Profile', path: '/customer/profile', icon: MdPerson },
        { name: 'Preferences', path: '/customer/preferences', icon: MdSettings },
        { name: 'Support', path: '/customer/contact', icon: MdHelpOutline },
      ]
    }
  ];

  const SidebarContent = ({ isExpanded = false }) => (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-app)] transition-colors duration-300">
      {/* Branding Section */}
      <div className={`py-6 flex items-center justify-between ${isExpanded ? 'px-6' : 'px-0 justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 md:w-10 md:h-10 bg-slate-950 rounded md:rounded-lg p-0.5 md:p-1 flex-shrink-0">
                <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
              </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-sm font-bold text-[var(--text-main)] whitespace-nowrap">Singhai Traders</h1>
              <span className="text-[10px] text-teal-600 font-bold tracking-widest uppercase">Portal</span>
            </motion.div>
          )}
        </div>
        {isExpanded && !isDesktop && (
          <button onClick={onMobileClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <MdClose className="text-2xl" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-8 overflow-y-auto scrollbar-hide">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {isExpanded && (
              <h3 className="px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">
                {section.title}
              </h3>
            )}
            {!isExpanded && <div className="h-px bg-[var(--border-subtle)] mx-4 mb-3" />}
            
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/customer/dashboard'}
                onMouseEnter={() => prefetchRoute(item.path)}
                className={({ isActive }) =>
                  `flex items-center gap-4 ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-teal-600'
                  }`
                }
              >
                <item.icon className={`text-xl transition-transform ${isExpanded ? '' : 'group-hover:scale-110'}`} />
                {isExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">{item.name}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout / Bottom Action */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-3 rounded-xl text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-600 transition-all group`}
        >
          <MdLogout className="text-xl shrink-0" />
          {isExpanded && <span className="text-sm font-bold">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        onMouseEnter={() => isDesktop && setIsHovered(true)}
        onMouseLeave={() => isDesktop && setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-[var(--bg-app)] border-r border-[var(--border-main)] z-50 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'w-64' : (isDesktop ? (isHovered ? 'w-64' : 'w-20') : 'w-0 border-none overflow-hidden')
        }`}
      >
        <SidebarContent isExpanded={(isDesktop && isHovered) || isMobileOpen} />
      </aside>
    </>
  );
};

export default CustomerSidebar;
