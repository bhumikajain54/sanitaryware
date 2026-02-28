import { useState, useCallback, useMemo } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdFileDownload,
  MdPayment,
  MdCheckCircle,
  MdError,
  MdAccessTime,
  MdVisibility
} from 'react-icons/md';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import adminService from '../../services/adminService';
import { Badge } from '../../components/common/DashboardUI';
import { handleExportDownload } from '../../utils/exportUtils';

const AdminPayments = () => {
  const { success, error, info } = useAdminToast();
  const { isOpen, modalData: selectedPayment, openModal, closeModal } = useAdminModal();

  // Data fetching
  const fetchPayments = useCallback(async () => {
    try {
      const rawData = await adminService.getAdminPayments();
      const data = Array.isArray(rawData) ? rawData : (rawData?.content || rawData?.data || []);
      
      const processedData = data.map(payment => ({
        ...payment,
        id: payment.id,
        transactionId: payment.transactionId || `TXN-${payment.id}`,
        orderNumber: payment.order?.orderNumber || payment.orderNumber || 'N/A',
        customer: payment.user ? `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() : (payment.customerName || 'Walk-in'),
        amount: payment.amount || 0,
        status: (payment.status || 'pending').toLowerCase(),
        method: payment.paymentMethod || payment.method || 'UPI',
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN') : (payment.date || 'N/A'),
        timestamp: payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
        originalDate: payment.createdAt || 0
      }));

      // Group by orderNumber to solve "so many things" issue
      const groupedMap = new Map();
      processedData.forEach(payment => {
          const key = payment.orderNumber;
          const existing = groupedMap.get(key);
          
          if (!existing) {
              groupedMap.set(key, payment);
          } else {
              // Priority: COMPLETED > Latest
              if (payment.status === 'completed' && existing.status !== 'completed') {
                  groupedMap.set(key, payment);
              } else if (new Date(payment.originalDate) > new Date(existing.originalDate)) {
                  if (existing.status !== 'completed') {
                      groupedMap.set(key, payment);
                  }
              }
          }
      });

      return Array.from(groupedMap.values()).sort((a, b) => new Date(b.originalDate) - new Date(a.originalDate));
    } catch (err) {
      console.error('Failed to load payments:', err);
      return [];
    }
  }, []);

  const { data: initialPayments, loading, refetch } = useAdminFetch(fetchPayments, []);

  // Search
  const searchKeys = useMemo(() => ['transactionId', 'orderNumber', 'customer', 'method'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedPayments } = useAdminSearch(
    initialPayments || [],
    searchKeys
  );

  // Filter configuration
  const filterConfig = useMemo(() => ({
    status: {
      label: 'Status',
      field: 'status',
      type: 'exact',
      placeholder: 'All Status',
      options: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    },
    method: {
      label: 'Method',
      field: 'method',
      type: 'exact',
      placeholder: 'All Methods',
      options: [
        { value: 'upi', label: 'UPI' },
        { value: 'card', label: 'Card' },
        { value: 'netbanking', label: 'Net Banking' },
        { value: 'cod', label: 'Cash on Delivery' }
      ]
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredPayments,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedPayments, filterConfig);

  // Pagination
  const { 
    currentItems: payments, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage
  } = useAdminPagination(filteredPayments, 10);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="text-emerald-500" />;
      case 'failed':
        return <MdError className="text-rose-500" />;
      default:
        return <MdAccessTime className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'failed':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'refunded':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const handleExport = () => {
    handleExportDownload(adminService.getPaymentReport(), 'Payments', 'csv', { success, error });
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-sm sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight uppercase">Payment Transactions</h1>
            <p className="text-[6px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Monitor and track all financial settlements.</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[6px] sm:text-xs uppercase tracking-widest whitespace-nowrap shadow-sm"
          >
            <MdFileDownload className="text-[10px] sm:text-xl" />
            <span>Export Logs</span>
          </button>
        </div>

        {/* Stats Summary (Mini) */}
        {!loading && (
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
             <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-lg sm:rounded-2xl p-2 sm:p-5 shadow-sm">
                <p className="text-[5px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Volume</p>
                <p className="text-[9px] sm:text-xl font-bold text-teal-600">₹{filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
             </div>
             <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-lg sm:rounded-2xl p-2 sm:p-5 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-[5px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Settled</p>
                <p className="text-[9px] sm:text-xl font-bold text-emerald-600">{filteredPayments.filter(p => ['success', 'captured'].includes(p.status)).length}</p>
             </div>
             <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-lg sm:rounded-2xl p-2 sm:p-5 shadow-sm border-l-4 border-l-amber-500">
                <p className="text-[5px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Awaiting</p>
                <p className="text-[9px] sm:text-xl font-bold text-amber-600">{filteredPayments.filter(p => p.status === 'pending').length}</p>
             </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1">
            <MdSearch className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Order # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-11 pr-2 sm:pr-4 py-1.5 sm:py-3 bg-[var(--admin-bg-primary)] border-none sm:border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[8px] sm:text-sm font-medium"
            />
          </div>
          
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

        {/* Transactions Table Container */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Transaction ID</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Order #</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Customer</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Amount</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Method</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Status</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Date/Time</th>
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
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <span className="font-black text-[var(--admin-text-primary)] text-[8px] sm:text-xs uppercase tracking-tight whitespace-nowrap">
                          {payment.transactionId}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <span className="font-black text-teal-600 text-[8px] sm:text-xs uppercase tracking-tight">#{payment.orderNumber}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div>
                          <p className="font-black text-[var(--admin-text-primary)] text-[8px] sm:text-sm uppercase tracking-tight truncate max-w-[80px] sm:max-w-none">{payment.customer}</p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <span className="font-black text-[var(--admin-text-primary)] text-[9px] sm:text-base whitespace-nowrap">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6 text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
                         {payment.method}
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6">
                        <div className="flex items-center gap-1 sm:gap-2">
                           {getStatusIcon(payment.status)}
                           <span className={`px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[6px] sm:text-[9px] font-black uppercase tracking-widest ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                           </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2.5 sm:py-6 text-right whitespace-nowrap">
                        <p className="text-[7px] sm:text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest leading-none mb-0.5 sm:mb-1">{payment.date}</p>
                        <p className="text-[6px] sm:text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">{payment.timestamp}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-16 text-center text-slate-300">
                      <MdPayment className="mx-auto text-7xl mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-lg text-slate-400">No transactions found</p>
                      <p className="text-xs mt-2 font-bold opacity-60">Complete payments will be logged here automatically.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <p className="text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasPrevPage ? 'opacity-30' : 'hover:bg-slate-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasNextPage ? 'opacity-30' : 'hover:bg-slate-50'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
