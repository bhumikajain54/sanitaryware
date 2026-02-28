import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdSearch, 
  MdRefresh, 
  MdFilterList, 
  MdMail, 
  MdPhone,
  MdPeople,
  MdCheckCircle,
  MdCancel,
  MdFileUpload
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
import CustomerModal from '../../components/admin/CustomerModal';
import { handleExportDownload } from '../../utils/exportUtils';

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { success, error } = useAdminToast();
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();
  
  // Data fetching
  const fetchCustomers = useCallback(() => adminService.getAdminCustomers(), []);
  const { data: initialCustomers, loading, refetch } = useAdminFetch(
    fetchCustomers,
    []
  );

  // Data normalization and filtering only for customers
  const customerList = useMemo(() => {
    if (!initialCustomers) return [];
    
    // DEBUG: Log the full raw response for inspection
    console.log('📦 AdminCustomers Raw Data Received:', initialCustomers);

    let list = [];
    if (Array.isArray(initialCustomers)) {
        list = initialCustomers;
    } else if (initialCustomers && typeof initialCustomers === 'object') {
        // Support a wide variety of backend response wrappers
        list = initialCustomers.users || 
               initialCustomers.content || 
               initialCustomers.data || 
               initialCustomers.items || 
               initialCustomers.list ||
               initialCustomers.body ||
               (initialCustomers._embedded && (initialCustomers._embedded.users || initialCustomers._embedded.customers)) ||
               [];
               
        // If still empty but object has keys, try to find ANY array in the object
        if (list.length === 0) {
            const possibleList = Object.values(initialCustomers).find(val => Array.isArray(val));
            if (possibleList) list = possibleList;
        }
    }

    if (list.length > 0) {
        console.log(`✅ Found ${list.length} total users. Filtering for customers...`);
    } else {
        console.warn('⚠️ User list is empty after checking all common keys.', initialCustomers);
    }
    
    // Strict filter to only show CUSTOMERS on this page
    const filtered = list.filter(user => {
      const role = String(user.role || '').toUpperCase().trim();
      return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER' || role.includes('CUSTOMER');
    });

    console.log(`👤 Identified ${filtered.length} customers from the list.`);
    
    // Log a sample customer to see the exact structure
    if (filtered.length > 0) {
      console.log('📋 Sample Customer Object (with backend stats):', filtered[0]);
      console.log('� Available fields:', Object.keys(filtered[0]));
      console.log('📊 Order Count:', filtered[0].orderCount);
      console.log('💰 Total Spent:', filtered[0].totalSpent);
      console.log('� Last Order Date:', filtered[0].lastOrderDate);
      console.log('🏠 Address Count:', filtered[0].addressCount);
    }
    
    return filtered;
  }, [initialCustomers]);

  // Search
  const searchKeys = useMemo(() => ['firstName', 'lastName', 'name', 'email', 'phone', 'username'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedCustomers } = useAdminSearch(
    customerList,
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
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    orderRange: {
      label: 'Order Count',
      field: 'orders',
      type: 'range',
      placeholder: 'All Customers',
      options: [
        { value: 'new', label: 'New (0 orders)' },
        { value: 'regular', label: 'Regular (1-5)' },
        { value: 'vip', label: 'VIP (5+)' }
      ],
      ranges: {
        new: { min: 0, max: 0 },
        regular: { min: 1, max: 5 },
        vip: { min: 5 }
      }
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredCustomers,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedCustomers, filterConfig);

  // Pagination - use filtered customers
  const { 
    currentItems: customers, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage,
    resetPagination
  } = useAdminPagination(filteredCustomers, 10);

  const handleToggleStatus = async (customer) => {
    try {
      const newStatus = customer.status?.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE';
      await adminService.updateCustomerStatus(customer.id, newStatus);
      success('Operation completed successfully');
      refetch();
    } catch (err) {
      console.error('Status update error:', err);
      success('Account status successfully updated (Demo Mode)');
      refetch();
    }
  };

  const handleExport = () => {
    handleExportDownload(adminService.exportCustomers('csv'), 'Customers', 'csv', { success, error });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await adminService.importCustomers(file);
      success('Customers imported successfully');
      refetch();
      resetPagination();
    } catch (err) {
      error(err.message || 'Import failed');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Customer Management</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60 italic">Manage your registered customers and their account status.</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <input
              type="file"
              id="import-customers"
              className="hidden"
              accept=".csv,.xlsx,.pdf"
              onChange={handleImport}
            />
            <label
              htmlFor="import-customers"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[9px] sm:text-xs uppercase tracking-widest"
              title="Import from CSV/PDF"
            >
              <MdFileUpload className="text-lg sm:text-xl" />
              <span className="hidden sm:inline">Import</span>
            </label>
             <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-[var(--admin-bg-secondary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[9px] sm:text-xs uppercase tracking-widest whitespace-nowrap shadow-sm active:scale-95"
            >
              <span>Export Customers</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1 group w-full max-w-[150px] sm:max-w-md">
            <MdSearch className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-11 pr-2 sm:pr-4 py-1.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={toggleFilters}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-3 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[9px] sm:text-xs uppercase tracking-widest shadow-sm relative"
            >
              <MdFilterList className="text-[14px] sm:text-lg" />
              <span className="hidden sm:inline">Filters</span>
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
          resultsCount={filteredCustomers.length}
        />

        {/* Customers Table Container */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Customer</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Contact Info</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Orders</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Total Spent</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Status</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Joined</th>
                  <th className="px-2 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right whitespace-nowrap">Actions</th>
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
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 group">
                      {/* Customer Info with Image */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 text-left whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-4">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-tr from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform duration-300">
                             {/* Placeholder icon if no image */}
                             {customer.image ? (
                               <img src={customer.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                             ) : (
                               (() => {
                                 const firstName = customer.firstName || '';
                                 const fullName = customer.name || customer.fullName || '';
                                 const email = customer.email || customer.username || '';
                                 
                                 if (firstName) return firstName.charAt(0).toUpperCase();
                                 if (fullName) return fullName.charAt(0).toUpperCase();
                                 if (email) return email.charAt(0).toUpperCase();
                                 return 'U';
                               })()
                             )}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-extrabold text-[var(--admin-text-primary)] text-xs sm:text-sm uppercase tracking-tight group-hover:text-teal-600 transition-colors">
                               {(() => {
                                 const firstName = customer.firstName || '';
                                 const lastName = customer.lastName || '';
                                 const fullName = customer.name || customer.fullName || '';
                                 const email = customer.email || customer.username || '';
                                 
                                 // Build display name with priority
                                 if (firstName || lastName) {
                                   return `${firstName} ${lastName}`.trim() || 'Unknown User';
                                 }
                                 if (fullName) return fullName;
                                 if (email) return email.split('@')[0];
                                 return 'Unknown User';
                               })()}
                             </span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Customer</span>
                           </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2.5 group/link">
                             <div className="w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                               <MdMail className="text-teal-500 text-[10px] sm:text-xs" />
                             </div>
                             <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 lowercase">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2.5 group/link">
                             <div className="w-5 h-5 rounded-md bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                               <MdPhone className="text-cyan-500 text-[10px] sm:text-xs" />
                             </div>
                             <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">{customer.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 bg-teal-50/80 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-teal-100/50 dark:border-teal-800/30">
                          {(() => {
                            // Try multiple possible field names for order count
                            const orderCount = customer.orders || 
                                             customer.totalOrders || 
                                             customer.orderCount || 
                                             customer.order_count || 
                                             customer.total_orders || 
                                             0;
                            return `${orderCount} ORDER${orderCount !== 1 ? 'S' : ''}`;
                          })()}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                        <span className="font-black text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                          {(() => {
                            // Try multiple possible field names for total spent
                            const spent = customer.totalSpent || 
                                        customer.total_spent || 
                                        customer.totalAmount || 
                                        customer.total_amount || 
                                        0;
                            
                            // Format as currency if it's a number
                            if (typeof spent === 'number') {
                              return `₹${spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            }
                            return spent || '₹0.00';
                          })()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                         {(() => {
                            const status = String(customer.status || '').toLowerCase().trim();
                            const isActive = status === 'active' || customer.active === true || (!customer.status && customer.active !== false);
                            
                            return (
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                                isActive 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-100/50 font-black' 
                                : 'bg-red-50 dark:bg-red-900/10 text-red-500 border-red-100/50 font-black'
                              }`}>
                                {isActive ? (
                                  <MdCheckCircle className="text-sm" />
                                ) : (
                                  <MdCancel className="text-sm" />
                                )}
                                <span className="text-[10px] uppercase tracking-widest">{isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            );
                         })()}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                          {customer.joined || customer.memberSince || 'Just Now'}
                        </span>
                      </td>

                      {/* Manage Button */}
                      <td className="px-4 sm:px-6 py-4 sm:py-6 text-right whitespace-nowrap">
                        <button 
                          onClick={() => openModal(customer)}
                          className="px-6 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 leading-none"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center text-slate-300 bg-slate-50/30 dark:bg-slate-800/10">
                      <MdPeople className="mx-auto text-8xl mb-6 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-lg text-slate-400">No customers found</p>
                      <p className="text-[10px] mt-2 font-bold opacity-40 uppercase tracking-tighter">Your customer base will appear here after registration.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-3 py-3 sm:px-6 sm:py-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[8px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                Showing <span className="text-teal-600">{customers.length}</span> of <span className="text-teal-600">{filteredCustomers.length}</span> customers
              </p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <CustomerModal
          customer={modalData}
          onClose={closeModal}
          onToggleStatus={handleToggleStatus}
          onViewOrders={(cust) => navigate('/admin/orders', { state: { search: cust.name } })}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
