import { useNavigate, Link } from 'react-router-dom';
import { useAdminFetch } from '../../hooks/useAdmin';
import adminService from '../../services/adminService';
import { useMemo } from 'react';
import {
  MdShoppingCart,
  MdAttachMoney,
  MdPeople,
  MdWarning,
  MdLayers,
  MdChevronRight
} from 'react-icons/md';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: summary, loading: summaryLoading } = useAdminFetch(() => adminService.getDashboardSummary(), []);
  const { data: ordersListData, loading: ordersLoading } = useAdminFetch(() => adminService.getDashboardOrders(), []);

  const stats = {
    totalProducts: summary?.totalProducts || summary?.productsCount || 0,
    totalOrders: summary?.totalOrders || summary?.ordersCount || 0,
    totalCustomers: summary?.totalCustomers || summary?.customersCount || summary?.usersCount || 0,
    revenue: summary?.totalRevenue || summary?.revenue || 0,
    pendingOrders: summary?.pendingOrders || 0,
  };

  const recentOrders = useMemo(() => {
    if (!ordersListData) return [];
    let raw = [];
    if (Array.isArray(ordersListData)) {
      raw = ordersListData;
    } else if (typeof ordersListData === 'object') {
      raw = ordersListData.recentOrders ||
        ordersListData.content ||
        ordersListData.data ||
        ordersListData.items ||
        ordersListData.list || [];
    }
    if (raw.length === 0 && ordersListData && typeof ordersListData === 'object') {
      const foundArray = Object.values(ordersListData).find(val => Array.isArray(val));
      if (foundArray) raw = foundArray;
    }
    return raw.slice(0, 5).map(order => ({
      ...order,
      orderNumber: order.orderNumber || (order.id ? `#${order.id}` : '#---'),
      customer: order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
        : (order.customer || order.customerName || 'Walk-in Customer'),
      total: order.totalAmount || order.total || order.payableAmount || 0,
      status: String(order.status || 'pending').toLowerCase(),
      date: order.createdAt || order.date || order.orderDate || new Date().toISOString()
    }));
  }, [ordersListData]);

  const loading = summaryLoading || ordersLoading;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-10">

        {/* ─── Header ─── */}
        <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1 sm:mb-2 truncate">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-widest italic opacity-70">
              Welcome back! Here's what's happening.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex-shrink-0 p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-teal-600"
          >
            <MdLayers className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">

          {/* Inventory */}
          <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-100 group">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 mb-1 sm:mb-2 uppercase tracking-widest">Inventory</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-0.5 sm:mb-1 leading-none">{stats.totalProducts}</h3>
                <p className="text-[9px] sm:text-xs font-bold text-slate-400 truncate">Products in catalog</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                <MdLayers className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-100 group">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 mb-1 sm:mb-2 uppercase tracking-widest">Orders</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-0.5 sm:mb-1 leading-none">{stats.totalOrders}</h3>
                <p className="text-[9px] sm:text-xs font-bold text-teal-500 truncate">{stats.pendingOrders} pending</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                <MdShoppingCart className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-100 group">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 mb-1 sm:mb-2 uppercase tracking-widest">Customers</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-0.5 sm:mb-1 leading-none">{stats.totalCustomers}</h3>
                <p className="text-[9px] sm:text-xs font-bold text-slate-400 truncate">Registered users</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform flex-shrink-0">
                <MdPeople className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-100 group">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 mb-1 sm:mb-2 uppercase tracking-widest">Revenue</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1 leading-none truncate">₹{stats.revenue.toLocaleString()}</h3>
                <p className="text-[9px] sm:text-xs font-bold text-cyan-500">Gross sales</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                <MdAttachMoney className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">

          {/* Add Product */}
          <Link
            to="/admin/products/add"
            className="group bg-white rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 md:p-8 border border-gray-100 hover:border-teal-200"
          >
            <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 sm:text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 sm:mb-1 md:mb-2 group-hover:text-teal-600 transition-colors truncate">
                  Add Product
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 hidden sm:block">
                  Add new products to catalog
                </p>
              </div>
            </div>
          </Link>

          {/* Manage Products */}
          <Link
            to="/admin/products"
            className="group bg-white rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 md:p-8 border border-gray-100 hover:border-cyan-200"
          >
            <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 sm:text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 sm:mb-1 md:mb-2 group-hover:text-cyan-600 transition-colors truncate">
                  Manage Products
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 hidden sm:block">
                  View and edit products
                </p>
              </div>
            </div>
          </Link>

          {/* View Orders */}
          <Link
            to="/admin/orders"
            className="group bg-white rounded-2xl md:rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 md:p-8 border border-gray-100 hover:border-green-200"
          >
            <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 sm:text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 sm:mb-1 md:mb-2 group-hover:text-green-600 transition-colors truncate">
                  View Orders
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 hidden sm:block">
                  Manage customer orders
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* ─── Recent Orders ─── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

          {/* Table Header */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-slate-50 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 truncate">Recent Orders</h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Latest customer transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              View All
              <MdChevronRight className="text-base sm:text-lg" />
            </Link>
          </div>

          {/* Scrollable table on small screens */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-4 sm:px-6 md:px-8 py-3 sm:py-4">
                        <div className="h-8 sm:h-10 bg-slate-50 animate-pulse rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 sm:py-5 px-4 sm:px-6 md:px-8 font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 sm:py-5 px-4 sm:px-6 md:px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-xs sm:text-sm whitespace-nowrap">{order.customer}</span>
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 lowercase">{order.user?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-4 sm:px-6 md:px-8 font-black text-teal-600 text-xs sm:text-sm whitespace-nowrap">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="py-4 sm:py-5 px-4 sm:px-6 md:px-8">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${order.status === 'delivered'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : order.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 sm:py-5 px-4 sm:px-6 md:px-8 text-right font-bold text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 sm:py-20 text-center">
                      <MdShoppingCart className="mx-auto text-5xl sm:text-6xl text-slate-100 mb-3 sm:mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs sm:text-sm">No recent orders</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;