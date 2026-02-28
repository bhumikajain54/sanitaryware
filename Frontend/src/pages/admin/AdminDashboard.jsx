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
  
  // Data fetching
  const { data: summary, loading: summaryLoading } = useAdminFetch(() => adminService.getDashboardSummary(), []);
  const { data: ordersListData, loading: ordersLoading } = useAdminFetch(() => adminService.getDashboardOrders(), []);

  // DEBUG: Log dashboard data for troubleshooting
  console.log('📊 Dashboard Summary Data:', summary);
  console.log('📦 Dashboard Orders Data:', ordersListData);

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
            ordersListData.list || 
            [];
    }
    
    if (raw.length === 0 && ordersListData && typeof ordersListData === 'object') {
       // Deep scan for any array if no common keys found
       const foundArray = Object.values(ordersListData).find(val => Array.isArray(val));
       if (foundArray) raw = foundArray;
    }

    console.log(`✅ Normalized ${raw.length} recent orders for display.`);

    return raw.slice(0, 5).map(order => ({
      ...order,
      orderNumber: order.orderNumber || (order.id ? `#${order.id}` : '#---'),
      customer: order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : (order.customer || order.customerName || 'Walk-in Customer'),
      total: order.totalAmount || order.total || order.payableAmount || 0,
      status: String(order.status || 'pending').toLowerCase(),
      date: order.createdAt || order.date || order.orderDate || new Date().toISOString()
    }));
  }, [ordersListData]);

  const loading = summaryLoading || ordersLoading;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest italic opacity-70">
              Welcome back! Here's what's happening.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-teal-600"
          >
            <MdLayers className="text-xl" />
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Products Card */}
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-slate-100 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Inventory</p>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{stats.totalProducts}</h3>
                <p className="text-xs font-bold text-slate-400">Products in catalog</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <MdLayers className="text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-slate-100 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Orders</p>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{stats.totalOrders}</h3>
                <p className="text-xs font-bold text-teal-500">{stats.pendingOrders} pending</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                <MdShoppingCart className="text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Customers Card - MATCHING IMAGE */}
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-slate-100 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Customers</p>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{stats.totalCustomers}</h3>
                <p className="text-xs font-bold text-slate-400">Registered users</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform">
                <MdPeople className="text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-slate-100 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Revenue</p>
                <h3 className="text-3xl font-black text-slate-900 mb-1">₹{stats.revenue.toLocaleString()}</h3>
                <p className="text-xs font-bold text-cyan-500">Gross sales</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                <MdAttachMoney className="text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Add Product */}
          <Link
            to="/admin/products/add"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-teal-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                Add Product
              </h3>
              <p className="text-sm text-gray-600">
                Add new products to catalog
              </p>
            </div>
          </Link>

          {/* Manage Products */}
          <Link
            to="/admin/products"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-cyan-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                Manage Products
              </h3>
              <p className="text-sm text-gray-600">
                View and edit products
              </p>
            </div>
          </Link>

          {/* View Orders */}
          <Link
            to="/admin/orders"
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                View Orders
              </h3>
              <p className="text-sm text-gray-600">
                Manage customer orders
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent Orders
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest customer transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
            >
              View All
              <MdChevronRight className="text-lg" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</th>
                  <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-8 py-4">
                        <div className="h-10 bg-slate-50 animate-pulse rounded-xl"></div>
                      </td>
                    </tr>
                  ))
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 px-8 font-black text-slate-900 text-sm">
                        {order.orderNumber}
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{order.customer}</span>
                          <span className="text-[10px] font-medium text-slate-400 lowercase">{order.user?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 font-black text-teal-600 text-sm">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="py-5 px-8">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            order.status === 'delivered'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : order.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right font-bold text-slate-400 text-xs text-nowrap">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <MdShoppingCart className="mx-auto text-6xl text-slate-100 mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No recent orders</p>
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
