import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import customerService from '../../services/customerService';
import { 
  MdShoppingBag, 
  MdFavorite, 
  MdLocalShipping, 
  MdPayment, 
  MdReceipt,
  MdArrowForward,
  MdOutlineExplore,
  MdOutlineHistory,
  MdOutlineAccountBalanceWallet,
  MdPerson,
  MdOutlineWorkspacePremium
} from 'react-icons/md';
import { StatCard, Card, Badge, Skeleton } from '../../components/common/DashboardUI';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const totalSpent = orders.reduce((acc, order) => acc + (order.totalAmount || order.total || 0), 0);
  const pendingOrders = orders.filter(o => !o.status?.toLowerCase().includes('deliver') && !o.status?.toLowerCase().includes('cancel')).length;

  const stats = [
    {
      label: 'Orders Placed',
      value: orders.length.toString(),
      icon: MdShoppingBag,
      trend: 'this month',
      trendValue: '+2',
      trendColor: 'success',
      color: 'primary',
      onClick: () => navigate('/customer/orders')
    },
    {
      label: 'Wishlist Items',
      value: wishlistItems.length.toString(),
      icon: MdFavorite,
      trend: 'saved for later',
      trendValue: 'Active',
      trendColor: 'success',
      color: 'indigo',
      onClick: () => navigate('/customer/wishlist')
    },
    {
      label: 'Total Investment',
      value: `₹${(totalSpent || 0).toLocaleString()}`,
      icon: MdOutlineAccountBalanceWallet,
      trend: 'lifetime value',
      trendValue: 'Premium',
      trendColor: 'success',
      color: 'blue'
    },
    {
      label: 'Pending Deliveries',
      value: pendingOrders.toString(),
      icon: MdLocalShipping,
      trend: 'in progress',
      trendValue: 'Active',
      trendColor: 'success',
      color: 'amber',
      onClick: () => navigate('/customer/orders')
    }
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
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">
            Welcome back, <span className="text-teal-600 font-serif italic">{user?.name || 'Customer'}!</span>
          </h1>
          <p className="text-[var(--text-muted)] font-bold mt-1 text-sm">Here's what's happening with your account today.</p>
        </div>
        <Link 
          to="/products"
          className="flex items-center gap-3 bg-[var(--text-main)] border border-[var(--border-main)] text-[var(--bg-card)] px-6 py-3.5 rounded-2xl font-black text-sm shadow-2xl shadow-teal-500/5 hover:opacity-90 transition-all w-fit group"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--bg-card)]/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
            <MdOutlineExplore className="text-xl" />
          </div>
          Browse Collection
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Recent Activities & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Activities Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <MdOutlineHistory className="text-2xl text-teal-600" />
                Recent Activities
              </h2>
              <Link to="/customer/orders" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                View All Orders
              </Link>
            </div>

            <Card noPadding className="overflow-x-auto min-h-[300px] flex flex-col">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--border-subtle)] border-b border-[var(--border-main)]">
                      <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Order Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {recentOrders.map((order) => {
                      const firstItem = order.items?.[0];
                      const product = firstItem?.product || firstItem;
                      const orderDate = new Date(order.createdAt || order.date);
                      
                      return (
                        <tr key={order.id} className="hover:bg-[var(--bg-app)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border-main)] shrink-0 bg-slate-50 flex items-center justify-center">
                                {product?.mainImage || product?.image ? (
                                  <img src={product.mainImage || product.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <MdShoppingBag className="text-slate-300" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[var(--text-main)] line-clamp-1">{product?.name || 'Premium Product'}</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                                  {order.orderNumber || `#${String(order.id || '').slice(-8)}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-[var(--text-muted)] whitespace-nowrap">
                              {isNaN(orderDate.getTime()) ? 'N/A' : orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[var(--text-main)]">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusVariant(order.status)}>
                              {(order.status || 'PENDING').replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to="/customer/orders" className="p-2 text-[var(--text-muted)] hover:text-teal-600 hover:bg-teal-500/10 rounded-lg transition-all inline-block">
                              <MdArrowForward className="text-xl" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-[var(--border-subtle)] rounded-full flex items-center justify-center mb-4">
                    <MdShoppingBag className="text-3xl text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-main)] font-bold text-lg">No orders yet</p>
                  <p className="text-[var(--text-muted)] font-medium text-sm max-w-xs mx-auto mt-1">Start exploring our premium collection to build your dream space.</p>
                  <Link 
                    to="/products" 
                    className="mt-6 px-8 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Discover Brands Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <MdOutlineWorkspacePremium className="text-2xl text-teal-600" />
              Discover Brands
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {brands.map((brand, i) => (
                <Link 
                  key={i} 
                  to={`/products?brand=${brand.name}`} 
                  className={`bg-[var(--bg-app)] border border-[var(--border-main)] p-4 md:p-6 rounded-[2rem] hover:shadow-xl hover:bg-[var(--bg-card)] hover:border-teal-500/20 transition-all group flex flex-col items-center justify-center text-center`}
                >
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white dark:bg-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform overflow-hidden p-2">
                    <img 
                      src={brand.logo || brand.image} 
                      alt={brand.name} 
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/100?text=' + (brand.name ? brand.name[0] : 'B');
                      }}
                    />
                  </div>
                  <h3 className="text-[var(--text-main)] font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:text-teal-600 transition-colors">{brand.name}</h3>
                  <div className="mt-2 h-0.5 w-0 group-hover:w-8 bg-teal-600 transition-all duration-300 rounded-full" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Space */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white border-none shadow-xl shadow-teal-500/10 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <h3 className="text-xl font-black mb-2 leading-tight relative z-10">Project Specialist</h3>
            <p className="text-teal-50/80 text-sm mb-8 leading-relaxed font-medium relative z-10">
              Planning a renovation? Get expert advice on your project from our certified architects.
            </p>
            <Link 
              to="/customer/contact"
              className="block relative z-10 text-center py-4 bg-white text-teal-700 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:shadow-2xl hover:bg-teal-50 transition-all active:scale-95"
            >
              Consult Now
            </Link>
          </Card>

          <Card className="p-8">
            <h3 className="text-[var(--text-main)] font-black text-base mb-4 tracking-tight">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Track Order', path: '/customer/orders', icon: MdLocalShipping },
                { label: 'Favorites', path: '/customer/wishlist', icon: MdFavorite },
                { label: 'My Invoices', path: '/customer/orders', icon: MdReceipt },
                { label: 'Profile', path: '/customer/profile', icon: MdPerson },
              ].map((item, i) => (
                <Link 
                  key={i} 
                  to={item.path}
                  className="p-4 bg-[var(--bg-app)] hover:bg-[var(--bg-card)] hover:shadow-xl hover:border-teal-100 rounded-[1.5rem] border border-[var(--border-main)] group transition-all"
                >
                  <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center mb-3 shadow-sm border border-[var(--border-main)] group-hover:bg-teal-500/10 group-hover:border-teal-200 transition-all">
                    <item.icon className="text-xl text-[var(--text-muted)] group-hover:text-teal-600 transition-colors" />
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-teal-600 transition-colors">{item.label}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
