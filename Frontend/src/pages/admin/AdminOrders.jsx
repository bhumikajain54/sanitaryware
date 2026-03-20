import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MdVisibility, 
  MdRefresh, 
  MdSearch, 
  MdFilterList, 
  MdFileDownload,
  MdShoppingCart,
  MdPayment,
  MdSend,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight
} from 'react-icons/md';
import OrderViewModal from '../../components/admin/OrderViewModal';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import adminService from '../../services/adminService';
import additionalServices from '../../services/additionalServices';
import { Badge } from '../../components/common/DashboardUI';

const AdminOrders = () => {
  const location = useLocation();
  const { success, error, info } = useAdminToast();
  const [sendingId, setSendingId] = useState(null);
  
  // Data fetching
  const fetchOrders = useCallback(async () => {
    const rawOrders = await adminService.getOrders();
    const data = Array.isArray(rawOrders) ? rawOrders : (rawOrders?.content || rawOrders?.data || []);
    
    // Normalize order data for frontend consistency
    return data.map(order => ({
      ...order,
      id: order.id,
      orderNumber: order.orderNumber || `ORD-${order.id}`,
      customer: order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : (order.customer || 'Unknown'),
      customerInfo: {
        email: order.user?.email || order.customerInfo?.email || 'N/A',
        phone: order.user?.phone || order.customerInfo?.phone || 'N/A'
      },
      total: order.totalAmount || order.total || 0,
      status: (order.status || 'pending').toLowerCase(),
      paymentStatus: (order.paymentStatus || (['confirmed', 'shipped', 'delivered'].includes((order.status || '').toLowerCase()) ? 'paid' : 'pending')).toLowerCase(),
      paymentMethod: order.paymentMethod || 'N/A',
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || 'N/A'),
      items: (order.items || []).map(item => ({
        ...item,
        name: item.product?.name || item.name || 'Product',
        image: item.product?.mainImage || item.image || '/Logo2.png',
        price: item.price || item.product?.price || 0
      }))
    }));
  }, []);

  const { data: initialOrders, loading, refetch } = useAdminFetch(
    fetchOrders,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['id', 'orderNumber', 'customer', 'customerInfo.email', 'status'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedOrders } = useAdminSearch(
    initialOrders || [],
    searchKeys
  );

  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state, setSearchTerm]);

  // Filter configuration
  const filterConfig = useMemo(() => ({
    status: {
      label: 'Status',
      field: 'status',
      type: 'exact',
      placeholder: 'All Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    totalRange: {
      label: 'Order Value',
      field: 'total',
      type: 'range',
      placeholder: 'All Values',
      options: [
        { value: 'low', label: 'Under ₹1000' },
        { value: 'medium', label: '₹1000 - ₹5000' },
        { value: 'high', label: 'Above ₹5000' }
      ],
      ranges: {
        low: { min: 0, max: 1000 },
        medium: { min: 1000, max: 5000 },
        high: { min: 5000 }
      }
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredOrders,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedOrders, filterConfig);

  // Pagination - use filtered orders
  const { 
    currentItems: orders, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage,
    resetPagination
  } = useAdminPagination(filteredOrders, 10);

  // Modal State
  const { isOpen, modalData: viewingOrder, openModal, closeModal } = useAdminModal();

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus.toUpperCase());
      success(`Order marked as ${newStatus}`);
      refetch();
    } catch (err) {
      error('Failed to update order status');
    }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
      // 1. Update Lifecycle Status to CONFIRMED
      await adminService.updateOrderStatus(orderId, 'CONFIRMED');
      
      // 2. Update Payment Status to SUCCESS (marks as PAID in DB via endpoint)
      const txnId = `MANUAL_CONFIRM_${orderId}_${Date.now()}`;
      await additionalServices.updatePaymentStatus(orderId, txnId, 'SUCCESS');

      success('Payment confirmed and verified successfully');
      refetch();
    } catch (err) {
      console.error('Confirm error:', err);
      error('Failed to update payment status');
    }
  };

  const handleSendWhatsApp = async (orderId) => {
    setSendingId(orderId);
    info('Sending order update via WhatsApp...');
    try {
      await adminService.sendOrderWhatsApp(orderId);
      success('WhatsApp notification sent');
    } catch (err) {
      error('Failed to send WhatsApp message');
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      confirmed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return badges[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const handleExport = async () => {
    handleExportDownload(adminService.exportOrders(), 'Orders', 'csv', { success, error });
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Order Management</h1>
            <p className="text-[6px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Track and manage customer orders and fulfillment.</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
             <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[6px] sm:text-xs uppercase tracking-widest whitespace-nowrap shadow-sm active:scale-95"
            >
              <MdFileDownload className="text-[10px] sm:text-xl" />
              <span>Export Orders</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1">
            <MdSearch className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl" />
            <input
              type="text"
              placeholder="Search Orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-11 pr-2 sm:pr-4 py-1.5 sm:py-3 bg-[var(--admin-bg-primary)] border-none sm:border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[8px] sm:text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={toggleFilters}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-3 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[7px] sm:text-xs uppercase tracking-widest shadow-sm relative"
            >
              <MdFilterList className="text-[10px] sm:text-lg" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Filter Panel */}
        <AdminFilterPanel
          showFilters={showFilters}
          filters={filters}
          filterConfig={filterConfig}
          activeFilterCount={activeFilterCount}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Orders Table Container */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Order No</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Customer</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Products</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Total</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Status</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Payment</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Date</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7" className="px-6 py-6">
                        <div className="h-10 bg-[var(--admin-bg-primary)] animate-pulse rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6 text-left">
                        <span className="font-black text-[var(--admin-text-primary)] text-[8px] sm:text-xs uppercase tracking-tight whitespace-nowrap">#{String(order.orderNumber || order.id || '').toUpperCase()}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div>
                          <p className="font-black text-[var(--admin-text-primary)] text-[8px] sm:text-sm uppercase tracking-tight whitespace-nowrap truncate max-w-[50px] sm:max-w-none">{String(order.customer || '').toUpperCase()}</p>
                          <p className="hidden sm:block text-[10px] text-[var(--admin-text-secondary)] font-bold tracking-widest">{order.customerInfo?.email}</p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div className="flex -space-x-1 sm:-space-x-3 overflow-hidden">
                          {order.items?.slice(0, 1).map((item, i) => (
                            <img 
                              key={i} 
                              src={item.image} 
                              className="inline-block h-5 w-5 sm:h-12 sm:w-12 rounded-md sm:rounded-xl ring-1 ring-white dark:ring-slate-900 object-cover shadow-sm bg-slate-50" 
                              alt="" 
                            />
                          ))}
                          {order.items?.length > 1 && (
                            <div className="flex items-center justify-center h-5 w-5 sm:h-10 sm:w-10 rounded-md sm:rounded-xl bg-teal-600 text-[5px] sm:text-[10px] font-black text-white ring-1 sm:ring-2 ring-white dark:ring-slate-900 shadow-sm">
                              +{order.items.length - 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <span className="font-black text-teal-600 dark:text-teal-400 text-[8px] sm:text-base whitespace-nowrap">₹{(order.total || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none px-1.5 py-0.5 sm:px-4 sm:py-2.5 rounded-md sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest border-none outline-none transition-all cursor-pointer shadow-sm ${getStatusBadge(order.status)}`}
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 2px center', backgroundSize: '6px' }}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <span className="text-[6px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.paymentMethod || 'UPI'}</span>
                          <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-[5px] sm:text-[8px] px-1 sm:px-2 py-0">
                            {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <span className="text-[7px] sm:text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest whitespace-nowrap">{order.date}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmPayment(order.id)}
                              className="p-1 sm:p-2.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md sm:rounded-xl transition-all"
                              title="Confirm Payment Received"
                            >
                              <MdPayment className="text-[10px] sm:text-2xl" />
                            </button>
                          )}
                          <button
                             onClick={() => handleSendWhatsApp(order.id)}
                             disabled={sendingId === order.id}
                             className="p-1 sm:p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md sm:rounded-xl transition-all"
                             title="Send via WhatsApp"
                          >
                             <MdSend className={`text-[10px] sm:text-2xl ${sendingId === order.id ? 'animate-pulse' : ''}`} />
                          </button>
                          <button
                            onClick={() => openModal(order)}
                            className="p-1 sm:p-2.5 text-slate-300 hover:text-teal-600 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 rounded-md sm:rounded-xl transition-all"
                            title="View order details"
                          >
                            <MdVisibility className="text-[10px] sm:text-2xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-16 text-center text-slate-300">
                      <MdShoppingCart className="mx-auto text-7xl mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-lg text-slate-400">No orders found</p>
                      <p className="text-xs mt-2 font-bold opacity-60">Customer orders will appear here once they are placed.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-4 py-4 sm:px-6 sm:py-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest text-center sm:text-left">
                Showing <span className="text-teal-600 font-black">{orders.length}</span> of <span className="text-teal-600 font-black">{filteredOrders.length}</span> orders
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`flex items-center justify-center w-10 sm:w-auto sm:px-4 h-10 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  <MdKeyboardArrowLeft className="text-xl sm:hidden" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`flex items-center justify-center w-10 sm:w-auto sm:px-4 h-10 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <MdKeyboardArrowRight className="text-xl sm:hidden" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isOpen && (
        <OrderViewModal
          order={viewingOrder}
          onClose={closeModal}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};

export default AdminOrders;
