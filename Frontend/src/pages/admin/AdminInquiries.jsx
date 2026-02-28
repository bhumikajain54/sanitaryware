import { useState, useCallback, useMemo } from 'react';
import { 
  MdDelete, 
  MdSearch, 
  MdRefresh, 
  MdChat,
  MdEmail,
  MdPerson,
  MdCalendarToday,
  MdCheckCircle,
  MdOutlineMarkEmailRead,
  MdClose,
  MdReply,
  MdSend
} from 'react-icons/md';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminConfirm,
  useAdminModal
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import { MdFilterList } from 'react-icons/md';
import adminService from '../../services/adminService';

const AdminInquiries = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();
  
  // Data fetching
  const fetchInquiries = useCallback(() => adminService.getInquiries(), []);
  const { data: initialInquiries, loading, refetch } = useAdminFetch(
    fetchInquiries,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['name', 'email', 'subject', 'message'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedInquiries } = useAdminSearch(
    initialInquiries || [],
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
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' }
        ]
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredInquiries,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedInquiries, filterConfig);

  // Pagination
  const { 
    currentItems: inquiries, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(filteredInquiries, 10);

  const handleDeleteInquiry = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Inquiry',
      message: 'Are you sure you want to remove this message from history?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteInquiry(id);
        success('Inquiry removed');
        refetch();
      } catch (err) {
        error('Failed to delete');
      }
    }
  };

  const handleViewInquiry = async (inquiry) => {
    openModal(inquiry);
    if (inquiry.status?.toLowerCase() === 'unread') {
      try {
        await adminService.markInquiryAsRead(inquiry.id);
        refetch();
      } catch (err) {
        console.error('Failed to mark as read');
      }
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Customer Inquiries</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Manage messages and queries from the contact form.</p>
          </div>

        </div>

        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-[200px] sm:max-w-md group">
            <MdSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-sm font-medium"
            />
          </div>
          
          <button 
            onClick={toggleFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest relative whitespace-nowrap"
          >
            <MdFilterList className="text-xs sm:text-lg" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AdminFilterPanel
          showFilters={showFilters}
          filters={filters}
          filterConfig={filterConfig}
          activeFilterCount={activeFilterCount}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Inquiries Table Container */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Customer Info</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Subject & Message</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Date</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Status</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-2 py-3 sm:px-6 sm:py-6">
                        <div className="h-4 sm:h-10 bg-[var(--admin-bg-primary)] animate-pulse rounded-md sm:rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : inquiries.length > 0 ? (
                  inquiries.map((iq) => (
                    <tr key={iq.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${iq.status?.toLowerCase() === 'unread' ? 'bg-teal-50/10 dark:bg-teal-900/5' : ''}`}>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                            <span className="font-black text-[var(--admin-text-primary)] uppercase tracking-tight text-[11px] sm:text-sm flex items-center gap-1 sm:gap-2">
                                <MdPerson className="text-teal-500 text-[10px] sm:text-lg" /> {iq.name}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] font-bold tracking-widest flex items-center gap-1 sm:gap-2">
                                <MdEmail className="text-slate-400 text-[9px] sm:text-sm" /> {iq.email}
                            </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 max-w-[100px] sm:max-w-md">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                            <span className="font-black text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs uppercase tracking-tight truncate">{iq.subject}</span>
                            <p className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] line-clamp-1 sm:line-clamp-2 italic font-medium leading-relaxed">{iq.message}</p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <span className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2">
                            <MdCalendarToday className="text-teal-500/50 text-[9px] sm:text-sm" /> {iq.date}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none ${
                          iq.status?.toLowerCase() === 'unread' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        }`}>
                          {iq.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button
                            onClick={() => handleViewInquiry(iq)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md sm:rounded-xl transition-all"
                            title="Reply / View"
                          >
                            <MdChat className="text-[10px] sm:text-xl" />
                          </button>
                          {iq.phone && (
                            <button
                              onClick={() => window.open(`https://wa.me/${iq.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                              className="p-1 sm:p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md sm:rounded-xl transition-all"
                              title="WhatsApp Message"
                            >
                              <MdSend className="text-[10px] sm:text-xl" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInquiry(iq.id)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md sm:rounded-xl transition-all"
                            title="Delete inquiry"
                          >
                            <MdDelete className="text-[10px] sm:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 sm:p-16 text-center text-slate-300">
                      <MdOutlineMarkEmailRead className="mx-auto text-4xl sm:text-7xl mb-3 sm:mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs sm:text-lg text-slate-400">Inbox is empty</p>
                      <p className="text-[8px] sm:text-xs mt-1 sm:mt-2 font-bold opacity-60 italic">Great job! All customer queries have been addressed.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && filteredInquiries.length > 0 && (
            <div className="px-2 sm:px-6 py-2 sm:py-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                <span className="text-teal-600">{inquiries.length}</span> of <span className="text-teal-600">{filteredInquiries.length}</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Prev
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <InquiryModal inquiry={modalData} onClose={closeModal} />
      )}

      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-8 max-w-[280px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg shadow-red-500/10">
                <MdDelete className="text-2xl sm:text-4xl" />
              </div>
              <h1 className="text-[12px] sm:text-xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight">{confirmData.title}</h1>
              <p className="text-[8px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-8 leading-relaxed italic">{confirmData.message}</p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-2 sm:py-3.5 px-3 sm:px-6 border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[7px] sm:text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  className="flex-1 py-2 sm:py-3.5 px-3 sm:px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg sm:rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 uppercase tracking-widest text-[7px] sm:text-[10px]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InquiryModal = ({ inquiry, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[90vw] max-w-[320px] overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between p-2 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
                    <div>
                        <h2 className="text-[14px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">Inquiry Audit</h2>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic flex items-center gap-1">
                            <MdCalendarToday /> Received: {inquiry.date}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                      <MdClose className="text-sm" />
                    </button>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Customer Identity */}
                    <div className="flex items-center gap-3 p-2 bg-[var(--admin-bg-primary)] rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
                            <MdPerson className="text-xl" />
                        </div>
                        <div>
                            <h4 className="text-[12px] font-black text-[var(--admin-text-primary)] uppercase tracking-tight">{inquiry.name}</h4>
                            <p className="text-[9px] text-[var(--admin-text-secondary)] font-bold">{inquiry.email}</p>
                            {inquiry.phone && <p className="text-[9px] text-[var(--admin-text-secondary)] font-bold italic">{inquiry.phone}</p>}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Subject Header</label>
                        <div className="px-3 py-2 bg-[var(--admin-bg-primary)] border-2 border-slate-100 dark:border-slate-700 rounded-lg text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                            {inquiry.subject}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Communication Body</label>
                        <div className="px-3 py-2 bg-[var(--admin-bg-primary)] border-2 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-medium text-slate-600 dark:text-slate-300 italic min-h-[80px] leading-relaxed">
                            "{inquiry.message}"
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-2 flex gap-2">
                        <button 
                          onClick={() => window.location.href = `mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
                          className="flex-1 py-1.5 bg-slate-900 text-white font-black rounded-lg hover:bg-teal-700 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                        >
                          <MdEmail /> Email
                        </button>
                        {inquiry.phone && (
                          <button 
                            onClick={() => window.open(`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                            className="flex-1 py-1.5 bg-green-600 text-white font-black rounded-lg hover:bg-green-700 transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                          >
                             <MdSend /> WhatsApp
                          </button>
                        )}
                        <button 
                           onClick={onClose}
                           className="px-4 py-1.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-lg hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] uppercase tracking-widest"
                        >
                           Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInquiries;
