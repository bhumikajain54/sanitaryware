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

/* ─── Skeleton ─── */
const StatCardSkeleton = () => (
  <div className="bg-[var(--admin-bg-secondary)] rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 shadow-md border border-[var(--border-main)]">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex-1 space-y-2">
        <div className="h-3 sm:h-4 bg-[var(--admin-bg-primary)] rounded animate-pulse w-20 sm:w-24" />
        <div className="h-6 sm:h-8 bg-[var(--admin-bg-primary)] rounded animate-pulse w-24 sm:w-32" />
        <div className="h-2.5 sm:h-3 bg-[var(--admin-bg-primary)] rounded animate-pulse w-16 sm:w-20" />
      </div>
      <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[var(--admin-bg-primary)] rounded-xl animate-pulse flex-shrink-0" />
    </div>
  </div>
);

const AdminDashboardNew = () => {
  const [period, setPeriod] = useState(7);

  const fetchSummary = useCallback(() => adminService.getDashboardSummary(period), [period]);
  const fetchStats = useCallback(() => adminService.getDashboardStats(period), [period]);
  const fetchRevenueTrend = useCallback(() => adminService.getRevenueTrend(period), [period]);
  const fetchOrdersTrend = useCallback(() => adminService.getOrdersTrend(period), [period]);
  const fetchBanners = useCallback(() => adminService.getBanners(), []);
  const fetchOrders = useCallback(() => adminService.getDashboardOrders(), []);
  const fetchUsers = useCallback(() => adminService.getDashboardUsers(period), [period]);
  const fetchAllOrders = useCallback(() => adminService.getAdminOrders(), []);

  const { data: summaryData, loading: summaryLoading } = useAdminFetch(fetchSummary, [period]);
  const { data: statsData, loading: statsLoading } = useAdminFetch(fetchStats, [period]);
  const { data: revenueTrendData, loading: revLoading } = useAdminFetch(fetchRevenueTrend, [period]);
  const { data: ordersTrendData, loading: ordLoading } = useAdminFetch(fetchOrdersTrend, [period]);
  const { data: initialBanners, loading: bannersLoading } = useAdminFetch(fetchBanners, []);
  const { data: ordersListData, loading: ordersListLoading } = useAdminFetch(fetchOrders, []);
  const { data: usersData, loading: usersLoading } = useAdminFetch(fetchUsers, [period]);
  const { data: allOrdersData } = useAdminFetch(fetchAllOrders, []);

  const loading = summaryLoading || statsLoading || ordersListLoading || usersLoading || revLoading || ordLoading || bannersLoading;

  /* ─── Orders ─── */
  const orders = useMemo(() => {
    let raw = [];
    if (ordersListData) {
      if (Array.isArray(ordersListData)) raw = ordersListData;
      else if (typeof ordersListData === 'object') {
        raw = ordersListData.recentOrders || ordersListData.content ||
          ordersListData.data || ordersListData.items || ordersListData.list || [];
      }
    }
    if (raw.length === 0 && statsData?.recentOrders) raw = statsData.recentOrders;
    if (raw.length === 0 && allOrdersData) {
      const allList = Array.isArray(allOrdersData) ? allOrdersData : (allOrdersData.content || allOrdersData.data || []);
      raw = [...allList].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    }
    return raw.map(order => ({
      ...order,
      id: order.id,
      orderNumber: order.orderNumber || (order.id ? `ORD-${order.id}` : 'ORD-???'),
      customer: order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
        : (order.customer || order.customerName || 'Walk-in'),
      total: order.totalAmount || order.total || order.payableAmount || 0,
      status: String(order.status || 'pending').toLowerCase(),
      date: order.createdAt || order.date || order.orderDate || new Date().toISOString()
    }));
  }, [ordersListData, statsData, allOrdersData]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const totalOrdersCount = summaryData?.totalOrders || statsData?.totalOrders || orders.length || 0;
    const totalRevenueSum = summaryData?.totalRevenue || statsData?.totalRevenue || orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalCustomers = usersData?.totalCustomers || summaryData?.totalCustomers || statsData?.totalCustomers || 0;
    return [
      {
        title: 'Total Orders',
        value: totalOrdersCount.toString(),
        subtitle: `${summaryData?.pendingOrders || statsData?.pendingOrders || 0} pending`,
        isBadge: true, badgeVariant: 'warning',
        icon: MdShoppingCart,
        iconBg: 'bg-gradient-to-br from-teal-400 to-teal-500',
        trend: summaryData?.orderTrend || statsData?.orderTrend || 0,
        trendUp: (summaryData?.orderTrend || statsData?.orderTrend || 0) >= 0
      },
      {
        title: 'Total Revenue',
        value: `₹${totalRevenueSum.toLocaleString()}`,
        subtitle: 'All time earnings',
        icon: MdAttachMoney,
        iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
        trend: summaryData?.revenueTrend || statsData?.revenueTrend || 0,
        trendUp: (summaryData?.revenueTrend || statsData?.revenueTrend || 0) >= 0
      },
      {
        title: 'Customers',
        value: totalCustomers.toString(),
        subtitle: 'Registered users',
        icon: MdPeople,
        iconBg: 'bg-gradient-to-br from-teal-600 to-cyan-600',
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
        trend: 0, trendUp: true
      },
    ];
  }, [summaryData, statsData, usersData, orders]);

  /* ─── Chart helpers ─── */
  const normalizeChartList = (raw, period) => {
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw && typeof raw === 'object') {
      list = raw.content || raw.data || raw.trend || raw.items || raw.list || raw.body || [];
    }
    return list;
  };

  const revenueData = useMemo(() => {
    const list = normalizeChartList(revenueTrendData, period);
    if (list.length > 0) return list.map(item => {
      if (item.date && item.value !== undefined) {
        const date = new Date(item.date);
        const label = period > 7
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { weekday: 'short' });
        return { name: label, revenue: item.value, fullDate: item.date };
      }
      return item;
    });
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(n => ({ name: n, revenue: 0 }));
  }, [revenueTrendData, period]);

  const ordersData = useMemo(() => {
    const list = normalizeChartList(ordersTrendData, period);
    if (list.length > 0) return list.map(item => {
      if (item.date && item.value !== undefined) {
        const date = new Date(item.date);
        const label = period > 7
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { weekday: 'short' });
        return { name: label, orders: item.value, fullDate: item.date };
      }
      return item;
    });
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(n => ({ name: n, orders: 0 }));
  }, [ordersTrendData, period]);

  const getStatusBadge = (status) => {
    const raw = String(status).toLowerCase();
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      confirmed: 'bg-orange-100 text-orange-700 border border-orange-200',
      processing: 'bg-blue-100   text-blue-700   border border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border border-purple-200',
      delivered: 'bg-green-100  text-green-700  border border-green-200',
      cancelled: 'bg-red-100    text-red-700    border border-red-200'
    };
    return styles[raw] || styles.pending;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
            Dashboard Overview
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mt-0.5 sm:mt-1 hidden sm:block">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        {loading ? (
          [0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:shadow-lg transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-[var(--admin-text-secondary)] mb-0.5 sm:mb-1 font-medium tracking-tight uppercase truncate">
                    {stat.title}
                  </p>
                  <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-[var(--admin-text-primary)] leading-none mb-1 sm:mb-2 truncate">
                    {stat.value}
                  </h3>
                  <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                    {stat.isBadge ? (
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${stat.badgeVariant === 'warning' ? 'bg-amber-100 text-amber-700' :
                        stat.badgeVariant === 'error' ? 'bg-rose-100 text-rose-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                        {stat.subtitle}
                      </span>
                    ) : (
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-[var(--admin-text-secondary)] truncate">{stat.subtitle}</p>
                    )}
                    {stat.trend !== 0 && (
                      <span className={`flex items-center text-[8px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-md ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {stat.trendUp
                          ? <MdTrendingUp className="mr-0.5 text-[10px] sm:text-xs" />
                          : <MdTrendingDown className="mr-0.5 text-[10px] sm:text-xs" />
                        }
                        {stat.trend}%
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 ${stat.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <stat.icon className="text-base sm:text-lg md:text-xl text-white" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Banner Preview ─── */}
      <div className="mb-5 sm:mb-6 md:mb-8 bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
        <div className="h-[150px] sm:h-[250px] md:h-[300px] lg:h-[400px] pointer-events-none opacity-90">
          {initialBanners && initialBanners.length > 0 ? (
            <div className="relative h-full w-full">
              <img
                src={initialBanners[0]?.imageUrl}
                className="w-full h-full object-cover brightness-[0.6]"
                alt="Live Banner"
              />
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              No Active Banners
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-between gap-3">
          <p className="text-slate-400 text-[9px] sm:text-xs font-medium uppercase tracking-widest truncate">
            Showing current hero section on Singhai Traders
          </p>
          <Link
            to="/admin/banners"
            className="flex-shrink-0 text-teal-400 text-[9px] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-all whitespace-nowrap"
          >
            Manage Sliders →
          </Link>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-6 md:mb-8">

        {/* Revenue Chart */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--admin-text-primary)] truncate">Revenue Trend</h3>
              <p className="text-[9px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mt-0.5">Last {period} days</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs md:text-sm border border-[var(--border-main)] rounded-lg bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                axisLine={false} tickLine={false} dy={8} />
              <YAxis stroke="#94a3b8"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                axisLine={false} tickLine={false} dx={-6} width={40} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)', border: 'none',
                borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }} />
              <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5}
                fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--admin-text-primary)]">Orders Overview</h3>
            <p className="text-[9px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mt-0.5">Daily order count</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                axisLine={false} tickLine={false} dy={8} />
              <YAxis stroke="#94a3b8"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                axisLine={false} tickLine={false} dx={-6} width={40} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)', border: 'none',
                borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }} />
              <Bar dataKey="orders" fill="#06b6d4" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Recent Orders Table ─── */}
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl overflow-hidden">

        <div className="px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[var(--admin-text-primary)]">Recent Orders</h2>
          <p className="text-[9px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] mt-0.5 sm:mt-1">Latest customer orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-[var(--admin-bg-primary)]/50">
                {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map((h, i) => (
                  <th key={h} className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] ${i === 4 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[var(--admin-bg-primary)]/50 transition-colors">
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] sm:text-xs md:text-sm font-bold text-[var(--admin-text-primary)] whitespace-nowrap">
                    #{String(order.orderNumber || order.id).toUpperCase()}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] font-medium max-w-[120px] sm:max-w-none truncate">
                    {order.customer}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] sm:text-xs md:text-sm font-bold text-teal-600 whitespace-nowrap">
                    ₹{(order.total || 0).toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                    <span className={`inline-flex px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-bold text-[var(--admin-text-secondary)] text-right whitespace-nowrap">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-12 sm:p-16 md:p-20 text-center">
            <MdShoppingCart className="mx-auto text-5xl sm:text-6xl text-slate-300 mb-3 sm:mb-4 opacity-50" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">No orders found</p>
            <p className="text-slate-400 text-[10px] sm:text-xs mt-1.5 sm:mt-2 italic font-medium">
              Orders will appear here once customers start placing them
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboardNew;