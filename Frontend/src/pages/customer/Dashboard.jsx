import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import customerService from '../../services/customerService';
import {
  MdShoppingBag, MdFavorite, MdLocalShipping, MdPayment,
  MdReceipt, MdArrowForward, MdOutlineExplore, MdOutlineHistory,
  MdOutlineAccountBalanceWallet, MdPerson, MdOutlineWorkspacePremium,
  MdClose, MdLocationOn, MdPayment as MdPaymentIcon
} from 'react-icons/md';
import { StatCard, Card, Badge, Skeleton } from '../../components/common/DashboardUI';
import SafeImage from '../../components/common/SafeImage';
import { formatMediaUrl } from '../../utils/mediaUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersData, brandsData] = await Promise.all([
          customerService.getMyOrders(),
          customerService.getBrands()
        ]);
        setOrders(ordersData || []);
        setBrands(brandsData || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalSpent = orders.reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0);
  const pendingOrders = orders.filter(o =>
    !o.status?.toLowerCase().includes('deliver') &&
    !o.status?.toLowerCase().includes('cancel')
  ).length;

  const stats = [
    { label: 'Orders Placed', value: orders.length.toString(), icon: MdShoppingBag, trend: 'this month', trendValue: '+2', trendColor: 'success', color: 'primary', onClick: () => navigate('/customer/orders') },
    { label: 'Wishlist Items', value: wishlistItems.length.toString(), icon: MdFavorite, trend: 'saved for later', trendValue: 'Active', trendColor: 'success', color: 'indigo', onClick: () => navigate('/customer/wishlist') },
    { label: 'Total Investment', value: `₹${(totalSpent || 0).toLocaleString()}`, icon: MdOutlineAccountBalanceWallet, trend: 'lifetime value', trendValue: 'Premium', trendColor: 'success', color: 'blue' },
    { label: 'Pending Deliveries', value: pendingOrders.toString(), icon: MdLocalShipping, trend: 'in progress', trendValue: 'Active', trendColor: 'success', color: 'amber', onClick: () => navigate('/customer/deliveries') },

  ];

  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'success';
    if (s.includes('ship') || s.includes('transit')) return 'info';
    if (s.includes('process') || s.includes('confirm')) return 'warning';
    if (s.includes('cancel')) return 'error';
    return 'neutral';
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 max-w-[1600px] mx-auto">

      {/* ─── Header Greeting ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight leading-tight">
            Welcome back,{' '}
            <span className="text-teal-600 font-serif italic">
              {user?.name || 'Customer'}!
            </span>
          </h1>
          <p className="text-[var(--text-muted)] font-bold mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm">
            Here's what's happening with your account today.
          </p>
        </div>
        <Link to="/products"
          className="flex items-center gap-2 sm:gap-3 bg-[var(--text-main)] border border-[var(--border-main)] text-[var(--bg-card)] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs md:text-sm shadow-2xl shadow-teal-500/5 hover:opacity-90 transition-all w-fit group flex-shrink-0"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[var(--bg-card)]/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 flex-shrink-0">
            <MdOutlineExplore className="text-sm sm:text-base md:text-xl" />
          </div>
          Browse Collection
        </Link>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 sm:h-24 md:h-28 lg:h-32" />)
          : stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StatCard {...stat} />
            </motion.div>
          ))
        }
      </div>

      {/* ─── Main + Sidebar ─── */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 lg:gap-8">

        {/* ── Left: Main Content ── */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 md:space-y-8">

          {/* Recent Activities */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-main)] flex items-center gap-1.5 sm:gap-2">
                <MdOutlineHistory className="text-base sm:text-lg md:text-xl lg:text-2xl text-teal-600 flex-shrink-0" />
                Recent Activities
              </h2>
              <Link to="/customer/orders"
                className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-teal-600 hover:text-teal-700 whitespace-nowrap flex-shrink-0"
              >
                View All Orders
              </Link>
            </div>

            <Card noPadding className="overflow-hidden min-h-[180px] sm:min-h-[220px] md:min-h-[260px] flex flex-col">
              {isLoading ? (
                <div className="p-4 sm:p-5 md:p-6 space-y-3">
                  <Skeleton className="h-8 sm:h-9 md:h-10 w-full" />
                  <Skeleton className="h-8 sm:h-9 md:h-10 w-full" />
                  <Skeleton className="h-8 sm:h-9 md:h-10 w-full" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[460px] sm:min-w-[520px]">
                    <thead>
                      <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-main)]">
                        <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Order Details</th>
                        <th className="hidden sm:table-cell px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</th>
                        <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount</th>
                        <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 text-left text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                        <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-4 text-right text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {recentOrders.map((order) => {
                        const firstItem = order.items?.[0];
                        const product = firstItem?.product || firstItem;
                        const orderDate = new Date(order.createdAt || order.date);
                        return (
                          <tr key={order.id} className="hover:bg-[var(--bg-app)] transition-colors">

                            {/* Order detail */}
                            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4">
                              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg overflow-hidden border border-[var(--border-main)] flex-shrink-0 bg-slate-50 flex items-center justify-center">
                                  {product?.mainImage || product?.image ? (
                                    <SafeImage 
                                      src={product.mainImage || product.image} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <MdShoppingBag className="text-slate-300 text-xs sm:text-sm md:text-base" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-[var(--text-main)] line-clamp-1 max-w-[70px] sm:max-w-[100px] md:max-w-[130px] lg:max-w-none">
                                    {product?.name || 'Premium Product'}
                                  </p>
                                  <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                                    {order.orderNumber || `#${String(order.id || '').slice(-8)}`}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Date — hidden on mobile */}
                            <td className="hidden sm:table-cell px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4">
                              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-[var(--text-muted)] whitespace-nowrap">
                                {isNaN(orderDate.getTime()) ? 'N/A' : orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </td>

                            {/* Amount */}
                            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4">
                              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-[var(--text-main)] whitespace-nowrap">
                                ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4">
                              <Badge variant={getStatusVariant(order.status)} className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] whitespace-nowrap px-1.5 sm:px-2 py-0.5">
                                {(order.status || 'PENDING').replace('_', ' ')}
                              </Badge>
                            </td>

                            {/* Action */}
                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-4 text-right">
                              <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-teal-600 hover:bg-teal-500/10 rounded-lg transition-all"
                              >
                                <MdArrowForward className="text-sm sm:text-base md:text-lg lg:text-xl" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Empty state */
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[var(--border-subtle)] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <MdShoppingBag className="text-xl sm:text-2xl md:text-3xl text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-main)] font-bold text-sm sm:text-base md:text-lg">No orders yet</p>
                  <p className="text-[var(--text-muted)] font-medium text-[10px] sm:text-xs md:text-sm max-w-xs mx-auto mt-1">
                    Start exploring our premium collection to build your dream space.
                  </p>
                  <Link to="/products"
                    className="mt-4 sm:mt-5 md:mt-6 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-teal-600 text-white rounded-xl font-bold text-[10px] sm:text-xs md:text-sm shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Discover Brands */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-main)] flex items-center gap-1.5 sm:gap-2">
              <MdOutlineWorkspacePremium className="text-base sm:text-lg md:text-xl lg:text-2xl text-teal-600 flex-shrink-0" />
              Discover Brands
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
              {brands.map((brand, i) => (
                <Link key={i} to={`/products?brand=${brand.name}`}
                  className="bg-[var(--bg-app)] border border-[var(--border-main)] p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] lg:rounded-[2rem] hover:shadow-xl hover:bg-[var(--bg-card)] hover:border-teal-500/20 transition-all group flex flex-col items-center justify-center text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-white dark:bg-slate-200 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 shadow-sm group-hover:scale-110 transition-transform overflow-hidden p-1 sm:p-1.5 md:p-2">
                    <img
                      src={formatMediaUrl(brand.logo || brand.image)} alt={brand.name}
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=' + (brand.name ? brand.name[0] : 'B'); }}
                    />
                  </div>
                  <h3 className="text-[var(--text-main)] font-black text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] uppercase tracking-widest group-hover:text-teal-600 transition-colors truncate w-full text-center">
                    {brand.name}
                  </h3>
                  <div className="mt-1 sm:mt-1.5 md:mt-2 h-0.5 w-0 group-hover:w-5 sm:group-hover:w-6 md:group-hover:w-8 bg-teal-600 transition-all duration-300 rounded-full" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">

          {/* Project Specialist CTA */}
          <Card className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white border-none shadow-xl shadow-teal-500/10 p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black mb-1.5 sm:mb-2 leading-tight relative z-10">Project Specialist</h3>
            <p className="text-teal-50/80 text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed font-medium relative z-10">
              Planning a renovation? Get expert advice on your project from our certified architects.
            </p>
            <Link to="/customer/contact"
              className="block relative z-10 text-center py-2.5 sm:py-3 md:py-3.5 lg:py-4 bg-white text-teal-700 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg hover:shadow-2xl hover:bg-teal-50 transition-all active:scale-95"
            >
              Consult Now
            </Link>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-3.5 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            <h3 className="text-[var(--text-main)] font-black text-xs sm:text-sm md:text-base mb-3 sm:mb-3.5 md:mb-4 tracking-tight">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
              {[
                { label: 'Track Order', path: '/customer/deliveries', icon: MdLocalShipping },

                { label: 'Favorites', path: '/customer/wishlist', icon: MdFavorite },
                { label: 'My Invoices', path: '/customer/orders', icon: MdReceipt },
                { label: 'Profile', path: '/customer/profile', icon: MdPerson },
              ].map((item, i) => (
                <Link key={i} to={item.path}
                  className="p-2.5 sm:p-3 md:p-3.5 lg:p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] hover:shadow-xl hover:border-teal-100 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] border border-[var(--border-main)] group transition-all"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-[var(--bg-card)] rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-2.5 md:mb-3 shadow-sm border border-[var(--border-main)] group-hover:bg-teal-500/10 group-hover:border-teal-200 transition-all">
                    <item.icon className="text-sm sm:text-base md:text-lg lg:text-xl text-[var(--text-muted)] group-hover:text-teal-600 transition-colors" />
                  </div>
                  <p className="text-[7px] sm:text-[8px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-teal-600 transition-colors leading-tight">
                    {item.label}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Order Detail Modal ─── */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 text-left">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 md:p-6 border-b border-[var(--border-main)] flex items-center justify-between bg-gradient-to-r from-teal-500/5 to-transparent flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-serif font-black text-[var(--text-main)] truncate">Order Details</h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] mt-0.5">
                    #{selectedOrder.orderNumber || selectedOrder.id}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-colors"
                >
                  <MdClose className="text-xl sm:text-2xl" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">

                {/* Status + Date */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-1.5">Status</p>
                    <Badge variant={getStatusVariant(selectedOrder.status)} className="text-[8px] sm:text-[9px] md:text-[10px]">
                      {selectedOrder.status || 'Pending'}
                    </Badge>
                  </div>
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-1.5">Order Date</p>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)]">
                      {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {selectedOrder.items?.map((item, idx) => {
                      const product = item.product || item;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)] hover:border-teal-500/20 transition-all">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-white p-0.5 sm:p-1 border border-[var(--border-main)] overflow-hidden flex-shrink-0">
                            <SafeImage src={product.image || product.mainImage} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)] truncate">{product.name || 'Premium Product'}</p>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[var(--text-muted)] font-medium">
                              Qty: {item.quantity || 1} × <span className="text-teal-600 font-bold">₹{(item.price || product.price || 0).toLocaleString()}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-black text-[var(--text-main)] whitespace-nowrap">
                              ₹{((item.price || product.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping + Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <MdLocationOn className="text-teal-500 text-sm sm:text-base flex-shrink-0" />
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Shipping Address</p>
                    </div>
                    {selectedOrder.shippingAddress ? (
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-main)] font-medium space-y-0.5 sm:space-y-1 opacity-80 leading-relaxed">
                        <p className="font-black text-[9px] sm:text-[10px] uppercase text-teal-600">{selectedOrder.shippingAddress.name || 'Default Recipient'}</p>
                        <p>{selectedOrder.shippingAddress.streetAddress || selectedOrder.shippingAddress.addressLine1}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    ) : (
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-[var(--text-muted)] italic">No address details found.</p>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 bg-[var(--bg-app)]/50 rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <MdPaymentIcon className="text-teal-500 text-sm sm:text-base flex-shrink-0" />
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Payment Info</p>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--text-main)] uppercase tracking-tighter opacity-80">
                        {selectedOrder.paymentMethod || 'Online Payment'}
                      </p>
                      <Badge
                        variant={selectedOrder.paymentStatus?.toLowerCase() === 'paid' ? 'success' : 'warning'}
                        className="text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-widest"
                      >
                        {selectedOrder.paymentStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer — total */}
              <div className="p-4 sm:p-5 md:p-6 bg-[var(--bg-app)] border-t border-[var(--border-main)] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-black text-[var(--text-muted)] uppercase tracking-tighter">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-serif font-black text-teal-600 italic">
                    ₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;