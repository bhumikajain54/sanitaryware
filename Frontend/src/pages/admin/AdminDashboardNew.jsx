import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdShoppingCart, 
  MdAttachMoney, 
  MdPeople, 
  MdWarning,
  MdTrendingUp,
  MdTrendingDown,
  MdRefresh,
  MdInventory
} from 'react-icons/md';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { useAdminFetch } from '../../hooks/useAdmin';
import adminService from '../../services/adminService';

// Loading Skeleton Component
const StatCardSkeleton = () => (
  <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-6 shadow-md border border-[var(--border-main)]">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[var(--admin-bg-primary)] rounded animate-pulse w-24"></div>
        <div className="h-8 bg-[var(--admin-bg-primary)] rounded animate-pulse w-32"></div>
        <div className="h-3 bg-[var(--admin-bg-primary)] rounded animate-pulse w-20"></div>
      </div>
      <div className="w-12 h-12 bg-[var(--admin-bg-primary)] rounded-xl animate-pulse"></div>
    </div>
  </div>
);

const AdminDashboardNew = () => {
  const [period, setPeriod] = useState('7d');

  // Primary dashboard data
  const fetchSummary = useCallback(() => adminService.getDashboardSummary(), []);
  const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useAdminFetch(fetchSummary, []);

  const fetchStats = useCallback(() => adminService.getDashboardStats(), []);
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useAdminFetch(fetchStats, []);

  // Dedicated Trend Endpoints
  const fetchRevenueTrend = useCallback(() => adminService.getRevenueTrend(period), [period]);
  const { data: revenueTrendData, loading: revLoading, refetch: refetchRev } = useAdminFetch(fetchRevenueTrend, [period]);

  const fetchOrdersTrend = useCallback(() => adminService.getOrdersTrend(), []);
  const { data: ordersTrendData, loading: ordLoading, refetch: refetchOrd } = useAdminFetch(fetchOrdersTrend, []);

  // Dashboard-specific lists
  // Dashboard-specific lists
  const fetchBanners = useCallback(() => adminService.getBanners(), []);
  const { data: initialBanners, loading: bannersLoading } = useAdminFetch(fetchBanners, []);

  const fetchOrders = useCallback(() => adminService.getDashboardOrders(), []);
  const { data: ordersListData, loading: ordersListLoading, refetch: refetchOrdersList } = useAdminFetch(fetchOrders, []);

  const fetchUsers = useCallback(() => adminService.getDashboardUsers(), []);
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useAdminFetch(fetchUsers, []);

  // Robust Fallback: Fetch ALL orders to synthesize stats if dashboard ones fail
  const fetchAllOrders = useCallback(() => adminService.getAdminOrders(), []);
  const { data: allOrdersData, loading: allOrdersLoading } = useAdminFetch(fetchAllOrders, []);

  const loading = summaryLoading || statsLoading || ordersListLoading || usersLoading || revLoading || ordLoading || bannersLoading;

  // Recent Orders normalization with multiple fallbacks
  const orders = useMemo(() => {
    let raw = [];
    
    // 1. Try dedicated dashboard recent orders
    if (ordersListData) {
        if (Array.isArray(ordersListData)) raw = ordersListData;
        else if (typeof ordersListData === 'object') {
            raw = ordersListData.recentOrders || ordersListData.content || ordersListData.data || ordersListData.items || ordersListData.list || [];
        }
    }

    // 2. If empty, try synthesized data from statsData
    if (raw.length === 0 && statsData?.recentOrders) {
        raw = statsData.recentOrders;
    }

    // 3. Last fallback: use the general orders list sorted by date
    if (raw.length === 0 && allOrdersData) {
        const allList = Array.isArray(allOrdersData) ? allOrdersData : (allOrdersData.content || allOrdersData.data || []);
        raw = [...allList].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    }

    console.log(`📊 DashboardNew: Identified ${raw.length} orders for display.`);

    return raw.map(order => ({
      ...order,
      id: order.id,
      orderNumber: order.orderNumber || (order.id ? `ORD-${order.id}` : 'ORD-???'),
      customer: order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : (order.customer || order.customerName || 'Walk-in'),
      total: order.totalAmount || order.total || order.payableAmount || 0,
      status: String(order.status || 'pending').toLowerCase(),
      date: order.createdAt || order.date || order.orderDate || new Date().toISOString()
    }));
  }, [ordersListData, statsData, allOrdersData]);
  
  // Stats calculation with fallbacks
  const stats = useMemo(() => {
    const totalOrdersCount = summaryData?.totalOrders || statsData?.totalOrders || orders.length || 0;
    const totalRevenueSum = summaryData?.totalRevenue || statsData?.totalRevenue || orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalCustomersCount = usersData?.totalCustomers || summaryData?.totalCustomers || statsData?.totalCustomers || 0;

    return [
      {
        title: 'Total Orders',
        value: totalOrdersCount.toString(),
        subtitle: `${summaryData?.pendingOrders || statsData?.pendingOrders || 0} pending`,
        isBadge: true,
        badgeVariant: 'warning',
        icon: MdShoppingCart,
        iconBg: 'bg-gradient-to-br from-teal-400 to-teal-500',
        iconColor: 'text-white',
        trend: summaryData?.orderTrend || statsData?.orderTrend || 0,
        trendUp: (summaryData?.orderTrend || statsData?.orderTrend || 0) >= 0
      },
      {
        title: 'Total Revenue',
        value: `₹${totalRevenueSum.toLocaleString()}`,
        subtitle: 'All time earnings',
        icon: MdAttachMoney,
        iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
        iconColor: 'text-white',
        trend: summaryData?.revenueTrend || statsData?.revenueTrend || 0,
        trendUp: (summaryData?.revenueTrend || statsData?.revenueTrend || 0) >= 0
      },
      {
        title: 'CUSTOMERS',
        value: totalCustomersCount.toString(),
        subtitle: 'Registered users',
        icon: MdPeople,
        iconBg: 'bg-gradient-to-br from-teal-600 to-cyan-600',
        iconColor: 'text-white',
        trend: usersData?.customerTrend || summaryData?.customerTrend || 0,
        trendUp: (usersData?.customerTrend || summaryData?.customerTrend || 0) >= 0
      },
      {
        title: 'Total Products',
        value: (statsData?.totalProducts || summaryData?.totalProducts || 0).toString(),
        subtitle: (statsData?.lowStockProducts || summaryData?.lowStockProducts) > 0 
          ? `${statsData?.lowStockProducts || summaryData?.lowStockProducts} Low Stock` 
          : 'Stock Healthy',
        isBadge: (statsData?.lowStockProducts || summaryData?.lowStockProducts) > 0,
        badgeVariant: (statsData?.lowStockProducts || summaryData?.lowStockProducts) > 0 ? 'error' : 'success',
        icon: MdInventory,
        iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
        iconColor: 'text-white',
        trend: 0,
        trendUp: true
      },
    ];
  }, [summaryData, statsData, usersData, orders]);

  // Chart data normalization with comprehensive logging and transformation
  const revenueData = useMemo(() => {
    console.log('📊 Raw Revenue Trend Data:', revenueTrendData);
    
    let list = [];
    
    if (Array.isArray(revenueTrendData)) {
      list = revenueTrendData;
    } else if (revenueTrendData && typeof revenueTrendData === 'object') {
      // Try common Spring Boot response structures
      list = revenueTrendData.content || 
             revenueTrendData.data || 
             revenueTrendData.trend || 
             revenueTrendData.items ||
             revenueTrendData.list ||
             revenueTrendData.body ||
             revenueTrendData._embedded?.revenueTrend ||
             [];
    }
    
    console.log('✅ Normalized Revenue Data:', list);
    console.log('📈 Revenue data points:', list.length);
    
    // Transform backend format {date, value} to chart format {name, revenue}
    if (list.length > 0) {
      const transformed = list.map(item => {
        // Handle both formats: {date, value} and {name, revenue}
        if (item.date && item.value !== undefined) {
          // Backend format - transform it
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            name: dayName,
            revenue: item.value,
            fullDate: item.date
          };
        }
        // Already in correct format
        return item;
      });
      
      console.log('🔄 Transformed Revenue Data:', transformed);
      return transformed;
    }

    // Last resort fallback: Sample trend data if everything is empty
    console.warn('⚠️ No revenue data found, using sample data');
    return [
      { name: 'Mon', revenue: 0 },
      { name: 'Tue', revenue: 0 },
      { name: 'Wed', revenue: 0 },
      { name: 'Thu', revenue: 0 },
      { name: 'Fri', revenue: 0 },
      { name: 'Sat', revenue: 0 },
      { name: 'Sun', revenue: 0 }
    ];
  }, [revenueTrendData]);

  const ordersData = useMemo(() => {
    console.log('📊 Raw Orders Trend Data:', ordersTrendData);
    
    let list = [];
    
    if (Array.isArray(ordersTrendData)) {
      list = ordersTrendData;
    } else if (ordersTrendData && typeof ordersTrendData === 'object') {
      // Try common Spring Boot response structures
      list = ordersTrendData.content || 
             ordersTrendData.data || 
             ordersTrendData.trend || 
             ordersTrendData.items ||
             ordersTrendData.list ||
             ordersTrendData.body ||
             ordersTrendData._embedded?.ordersTrend ||
             [];
    }
    
    console.log('✅ Normalized Orders Data:', list);
    console.log('📈 Orders data points:', list.length);
    
    // Transform backend format {date, value} to chart format {name, orders}
    if (list.length > 0) {
      const transformed = list.map(item => {
        // Handle both formats: {date, value} and {name, orders}
        if (item.date && item.value !== undefined) {
          // Backend format - transform it
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            name: dayName,
            orders: item.value,
            fullDate: item.date
          };
        }
        // Already in correct format
        return item;
      });
      
      console.log('🔄 Transformed Orders Data:', transformed);
      return transformed;
    }

    // Fallback to sample data
    console.warn('⚠️ No orders data found, using sample data');
    return [
      { name: 'Mon', orders: 0 },
      { name: 'Tue', orders: 0 },
      { name: 'Wed', orders: 0 },
      { name: 'Thu', orders: 0 },
      { name: 'Fri', orders: 0 },
      { name: 'Sat', orders: 0 },
      { name: 'Sun', orders: 0 }
    ];
  }, [ordersTrendData]);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const getStatusBadge = (status) => {
    const raw = String(status).toLowerCase();
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      confirmed: 'bg-orange-100 text-orange-700 border border-orange-200',
      processing: 'bg-blue-100 text-blue-700 border border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border border-purple-200',
      delivered: 'bg-green-100 text-green-700 border border-green-200',
      cancelled: 'bg-red-100 text-red-700 border border-red-200'
    };
    return styles[raw] || styles.pending;
  };

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-2 sm:mb-4 md:mb-6">
        <div>
          <h1 className="text-sm sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-[9px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mt-0.5 sm:mt-1 hidden sm:block">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-lg sm:rounded-2xl p-1.5 sm:p-4 md:p-6 hover:shadow-lg transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-0.5 sm:mb-3 md:mb-4">
                <div className="flex-1">
                  <p className="text-[7px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mb-0.5 sm:mb-1 font-medium tracking-tight uppercase">{stat.title}</p>
                  <h3 className="text-xs sm:text-2xl md:text-3xl font-bold text-[var(--admin-text-primary)]">{stat.value}</h3>
                  <div className="flex items-center gap-0.5 sm:gap-2 mt-0.5 sm:mt-2">
                     {stat.isBadge ? (
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                          stat.badgeVariant === 'warning' ? 'bg-amber-100 text-amber-700' : 
                          stat.badgeVariant === 'error' ? 'bg-rose-100 text-rose-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {stat.subtitle}
                        </span>
                     ) : (
                        <p className="text-[7px] sm:text-xs text-[var(--admin-text-secondary)]">{stat.subtitle}</p>
                     )}
                    {stat.trend !== 0 && (
                      <span className={`flex items-center text-[7px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-md ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.trendUp ? <MdTrendingUp className="mr-0.5 text-[8px] sm:text-xs" /> : <MdTrendingDown className="mr-0.5 text-[8px] sm:text-xs" />}
                        {stat.trend}%
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 ${stat.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <stat.icon className={`text-xs sm:text-lg md:text-xl ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Preview Section - The "Above Image Thing" */}
      <div className="mb-6 sm:mb-8 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
         {/* <div className="absolute top-4 left-6 z-30">
            <span className="px-3 py-1.5 bg-teal-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
               Live Storefront Preview
            </span>
         </div> */}
         
         <div className="h-[200px] sm:h-[400px] pointer-events-none opacity-90 scale-100 sm:scale-105 origin-top">
            {initialBanners && initialBanners.length > 0 ? (
              <div className="relative h-full w-full">
                 <img 
                  src={initialBanners[0]?.imageUrl} 
                  className="w-full h-full object-cover brightness-[0.6]" 
                  alt="Live Banner"
                 />
                 {/* <div className="absolute inset-0 flex items-center px-12">
                    <div className="max-w-xl">
                       <h2 className="text-white text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                          {initialBanners[0]?.title}
                       </h2>
                       <p className="text-slate-300 text-xs sm:text-lg italic font-medium line-clamp-2 border-l-2 border-teal-500 pl-4">
                          {initialBanners[0]?.description}
                       </p>
                    </div>
                 </div> */}
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-xs">
                 No Active Banners
              </div>
            )}
         </div>
         
         <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-between">
            <p className="text-slate-400 text-[10px] sm:text-xs font-medium uppercase tracking-widest">Showing current hero section on Singhai Traders</p>
            <Link to="/admin/banners" className="text-teal-400 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-all">Manage Sliders →</Link>
         </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Revenue Chart */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-lg sm:rounded-2xl p-2 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-1.5 sm:mb-3 md:mb-4">
            <div>
              <h3 className="text-[10px] sm:text-base md:text-lg font-bold text-[var(--admin-text-primary)]">Revenue Trend</h3>
              <p className="text-[8px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)]">Last {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}</p>
            </div>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="px-1 sm:px-2 md:px-3 py-0.5 sm:py-1.5 text-[8px] sm:text-xs md:text-sm border border-[var(--border-main)] rounded-lg bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0d9488" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-lg sm:rounded-2xl p-2 sm:p-4 md:p-6">
          <div className="mb-1.5 sm:mb-3 md:mb-4">
            <h3 className="text-[10px] sm:text-base md:text-lg font-bold text-[var(--admin-text-primary)]">Orders Overview</h3>
            <p className="text-[8px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)]">Daily order count</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-lg sm:rounded-2xl overflow-hidden">
        <div className="px-2 sm:px-4 md:px-6 py-1.5 sm:py-3 md:py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-[var(--admin-text-primary)]">Recent Orders</h2>
          <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-[var(--admin-text-secondary)] mt-0.5 sm:mt-1">Latest customer orders</p>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[600px] text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-[var(--admin-bg-primary)]/50">
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider sm:tracking-widest border-b border-[var(--border-subtle)] w-[20%]">Order #</th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider sm:tracking-widest border-b border-[var(--border-subtle)] w-[25%]">Customer</th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider sm:tracking-widest border-b border-[var(--border-subtle)] w-[20%]">Amount</th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider sm:tracking-widest border-b border-[var(--border-subtle)] w-[15%]">Status</th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[8px] sm:text-[9px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider sm:tracking-widest border-b border-[var(--border-subtle)] text-right w-[20%]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[var(--admin-bg-primary)]/50 transition-colors group">
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold text-[var(--admin-text-primary)]">
                     #{String(order.orderNumber || order.id).toUpperCase()}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] font-medium">
                    {order.customer}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold text-teal-600">
                    ₹{(order.total || 0).toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <span className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-wider sm:tracking-widest ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold text-[var(--admin-text-secondary)] text-right">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-20 text-center">
            <MdShoppingCart className="mx-auto text-6xl text-slate-300 mb-4 opacity-50" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No orders found</p>
            <p className="text-slate-400 text-xs mt-2 italic font-medium">Orders will appear here once customers start placing them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardNew;
