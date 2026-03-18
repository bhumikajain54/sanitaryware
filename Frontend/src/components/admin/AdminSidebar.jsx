import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdDashboard, 
  MdInventory, 
  MdBusiness, 
  MdCategory, 
  MdShoppingCart, 
  MdPeople,
  MdImage,
  MdArticle,
  MdSentimentSatisfied,
  MdViewCarousel,
  MdChat,
  MdChevronRight,
  MdClose,
  MdLogout,
  MdReceipt,
  MdSync,
  MdPayment,
  MdDescription,
  MdEditNote,
  MdLocationOn
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isMobileOpen, onMobileClose, onMobileToggle }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
      '/admin': () => import('../../pages/admin/AdminDashboardNew'),
      '/admin/products': () => import('../../pages/admin/AdminProducts'),
      '/admin/brands': () => import('../../pages/admin/AdminBrands'),
      '/admin/categories': () => import('../../pages/admin/AdminCategories'),
      '/admin/billing': () => import('../../pages/admin/AdminBilling'),
      '/admin/quotations': () => import('../../pages/admin/AdminQuotations'),
      '/admin/order-drafts': () => import('../../pages/admin/AdminOrderDrafts'),
      '/admin/tally': () => import('../../pages/admin/AdminTally'),
      '/admin/orders': () => import('../../pages/admin/AdminOrders'),
      '/admin/payments': () => import('../../pages/admin/AdminPayments'),
      '/admin/customers': () => import('../../pages/admin/AdminCustomers'),
      '/admin/testimonials': () => import('../../pages/admin/AdminTestimonials'),
      '/admin/banners': () => import('../../pages/admin/AdminBanners'),
      '/admin/inquiries': () => import('../../pages/admin/AdminInquiries'),
      '/admin/media': () => import('../../pages/admin/AdminMedia'),
      '/admin/content': () => import('../../pages/admin/AdminContent'),
    };
    
    if (routes[path]) {
      routes[path]();
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: MdDashboard, color: 'teal' },
    { name: 'Products', path: '/admin/products', icon: MdInventory, color: 'cyan' },
    { name: 'Brands', path: '/admin/brands', icon: MdBusiness, color: 'blue' },
    { name: 'Categories', path: '/admin/categories', icon: MdCategory, color: 'indigo' },
    { name: 'Billing', path: '/admin/billing', icon: MdReceipt, color: 'orange' },
    { name: 'Quotations', path: '/admin/quotations', icon: MdDescription, color: 'purple' },
    { name: 'Order Notepad', path: '/admin/order-drafts', icon: MdEditNote, color: 'amber' },
    { name: 'Tally Sync', path: '/admin/tally', icon: MdSync, color: 'rose' },
    { name: 'Orders', path: '/admin/orders', icon: MdShoppingCart, color: 'purple' },
    { name: 'Payments', path: '/admin/payments', icon: MdPayment, color: 'emerald' },
    { name: 'Customers', path: '/admin/customers', icon: MdPeople, color: 'pink' },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MdSentimentSatisfied, color: 'yellow' },
    { name: 'Banners', path: '/admin/banners', icon: MdViewCarousel, color: 'rose' },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MdChat, color: 'emerald' },
    { name: 'Media', path: '/admin/media', icon: MdImage, color: 'orange' },
    { name: 'Content', path: '/admin/content', icon: MdArticle, color: 'green' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isExpanded = (isDesktop && isHovered) || isMobileOpen;

  const SidebarContent = ({ isExpanded = false }) => (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--admin-bg-secondary)] transition-colors duration-300">
      {/* Logo Section */}
      <div className={`py-6 flex items-center justify-between ${isExpanded ? 'px-6' : 'px-0 justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 md:w-10 md:h-10 flex-shrink-0">
            <img src="/Logo2.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-sm font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">Singhai Traders</h1>
              <span className="text-[10px] text-[var(--admin-text-secondary)] font-bold tracking-widest uppercase">Admin Panel</span>
            </motion.div>
          )}
        </div>
        {isExpanded && !isDesktop && (
          <button onClick={onMobileClose} className="p-2 text-[var(--admin-text-secondary)] hover:text-red-500 transition-colors">
            <MdClose className="text-2xl" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onMouseEnter={() => prefetchRoute(item.path)}
            className={({ isActive }) =>
              `flex items-center gap-4 ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)] hover:text-teal-600 dark:hover:text-teal-400'
              }`
            }
          >
            <div className="relative">
              <item.icon className={`text-xl transition-transform ${isExpanded ? '' : 'group-hover:scale-110'}`} />
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex items-center justify-between"
              >
                <span className="text-sm font-bold whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                <MdChevronRight className="text-lg opacity-50" />
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--admin-bg-primary)]/30">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 ${isExpanded ? 'px-4' : 'px-0 justify-center'} py-3 rounded-xl text-[var(--admin-text-secondary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all group`}
        >
          <MdLogout className="text-xl shrink-0 group-hover:rotate-12 transition-transform" />
          {isExpanded && <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Sign Out</span>}
        </button>
        {isExpanded && (
           <div className="mt-4 text-center">
              <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest">© 2026 Singhai Traders</p>
           </div>
        )}
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
        className={`fixed left-0 top-0 h-screen bg-[var(--admin-bg-secondary)] border-r border-[var(--border-main)] z-50 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'w-64' : (isDesktop ? (isHovered ? 'w-64' : 'w-20') : 'w-0 border-none overflow-hidden')
        }`}
      >
        <SidebarContent isExpanded={isExpanded} />
      </aside>
    </>
  );
};

export default AdminSidebar;
