import { useState, useCallback, useMemo } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdRefresh, 
  MdStar,
  MdCheckCircle,
  MdSentimentSatisfied,
  MdClose,
  MdCancel,
  MdSave,
  MdFileUpload
} from 'react-icons/md';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminPagination, 
  useAdminToast,
  useAdminModal,
  useAdminConfirm
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import { MdFilterList } from 'react-icons/md';
import adminService from '../../services/adminService';

const AdminTestimonials = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  
  // Data fetching
  const fetchTestimonials = useCallback(() => adminService.getTestimonials(), []);
  const { data: initialTestimonials, loading, refetch } = useAdminFetch(
    fetchTestimonials,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['name', 'comment', 'role'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedTestimonials } = useAdminSearch(
    initialTestimonials || [],
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
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' }
        ]
    },
    rating: {
        label: 'Rating',
        field: 'rating',
        type: 'exact',
        placeholder: 'All Ratings',
        options: [
            { value: '5', label: '5 Stars' },
            { value: '4', label: '4 Stars' },
            { value: '3', label: '3 Stars' },
            { value: '2', label: '2 Stars' },
            { value: '1', label: '1 Star' }
        ]
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredTestimonials,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedTestimonials, filterConfig);

  // Pagination
  const { 
    currentItems: testimonials, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(filteredTestimonials, 10);

  // Modal State
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleDeleteTestimonial = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this customer feedback?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteTestimonial(id);
        success('Testimonial removed');
        refetch();
      } catch (err) {
        error('Failed to delete');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await adminService.importTestimonials(file);
      success('Testimonials imported successfully');
      refetch();
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
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Customer Testimonials</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60 italic">Manage feedback displayed on the home page.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <input
              type="file"
              id="import-testimonials"
              className="hidden"
              accept=".csv,.xlsx,.pdf"
              onChange={handleImport}
            />
            <label
              htmlFor="import-testimonials"
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[9px] sm:text-[10px] uppercase tracking-widest"
              title="Import from CSV/PDF"
            >
              <MdFileUpload className="text-sm sm:text-xl" />
              <span className="hidden sm:inline">Import</span>
            </label>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
            >
              <MdAdd className="text-sm sm:text-xl" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-8 flex items-center justify-between gap-2 sm:gap-4">
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
          
          <button 
            onClick={toggleFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-3 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest relative whitespace-nowrap"
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

        {/* Table/List Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-48 bg-[var(--admin-bg-primary)] animate-pulse rounded-xl sm:rounded-[2.5rem]"></div>
            ))
          ) : testimonials.length > 0 ? (
            testimonials.map((t) => (
              <div key={t.id} className="bg-[var(--admin-bg-secondary)] p-2 sm:p-8 rounded-xl sm:rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col relative group shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-2 sm:mb-6">
                    <div className="flex items-center gap-1.5 sm:gap-4">
                        <div className="w-6 h-6 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-md sm:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[10px] sm:text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {t.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-black text-[var(--admin-text-primary)] uppercase tracking-tight text-[10px] sm:text-base truncate max-w-[60px] sm:max-w-none">{t.name}</h3>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mt-0.5 italic leading-tight truncate">{t.role}</p>
                        </div>
                    </div>
                    <div className="flex gap-0.5 sm:gap-1.5 p-0.5 sm:p-2 bg-[var(--admin-bg-primary)]/50 rounded-md sm:rounded-xl">
                        {[...Array(t.rating)].map((_, i) => (
                            <MdStar key={i} className="text-yellow-400 text-[9px] sm:text-lg shadow-yellow-400/20" />
                        ))}
                    </div>
                </div>
                
                <p className="text-[var(--admin-text-secondary)] text-[9px] sm:text-sm italic font-medium leading-relaxed mb-3 sm:mb-8 relative px-2 sm:px-4 line-clamp-3 sm:line-clamp-none">
                    <span className="absolute left-0 top-0 text-[10px] sm:text-3xl opacity-20 text-teal-500">"</span>
                    {t.comment}
                    <span className="absolute -bottom-2 right-0 text-[10px] sm:text-3xl opacity-20 text-teal-500">"</span>
                </p>

                <div className="mt-auto flex items-center justify-between pt-2 sm:pt-6 border-t border-[var(--border-subtle)]/50">
                    <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
                      t.status?.toLowerCase() === 'approved' 
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                        {t.status}
                    </span>
                    <div className="flex items-center gap-0.5 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 sm:translate-x-4 group-hover:translate-x-0">
                        <button 
                            onClick={() => openModal(t)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md sm:rounded-xl transition-all"
                            title="Edit"
                        >
                            <MdEdit className="text-sm sm:text-xl" />
                        </button>
                        <button 
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md sm:rounded-xl transition-all"
                            title="Delete"
                        >
                            <MdDelete className="text-sm sm:text-xl" />
                        </button>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 sm:p-24 text-center text-slate-300 bg-[var(--admin-bg-secondary)] rounded-2xl sm:rounded-[3rem] border-2 sm:border-4 border-dashed border-[var(--border-subtle)] shadow-inner">
               <MdSentimentSatisfied className="mx-auto text-4xl sm:text-9xl mb-3 sm:mb-6 opacity-20" />
               <h3 className="font-black text-sm sm:text-2xl uppercase tracking-tighter text-slate-400">Pure silence...</h3>
               <p className="text-[10px] sm:text-sm font-bold text-slate-500 mt-1 sm:mt-2 italic leading-relaxed uppercase tracking-wide">No customer voices recorded yet in the audit log.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
            <div className="mt-6 sm:mt-12 flex justify-center">
                 <div className="bg-[var(--admin-bg-secondary)] px-3 py-2 sm:px-8 sm:py-5 rounded-lg sm:rounded-[2rem] border border-[var(--border-subtle)] shadow-xl flex items-center gap-3 sm:gap-6">
                    <button 
                      onClick={prevPage} 
                      disabled={!hasPrevPage} 
                      className="px-3 py-1 sm:px-6 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all disabled:opacity-30 hover:bg-[var(--admin-bg-primary)]"
                    >
                      Prev
                    </button>
                    <span className="text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Page <span className="text-teal-600 dark:text-teal-400">{currentPage}</span> of {totalPages}</span>
                    <button 
                      onClick={nextPage} 
                      disabled={!hasNextPage} 
                      className="px-3 py-1 sm:px-6 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md sm:rounded-xl transition-all disabled:opacity-30 hover:bg-[var(--admin-bg-primary)]"
                    >
                      Next
                    </button>
                 </div>
            </div>
        )}
      </div>

      {isOpen && (
        <TestimonialModal
          testimonial={modalData}
          onClose={closeModal}
          onSave={async (data) => {
            try {
               await adminService.saveTestimonial(data);
               success('Testimonial saved');
               refetch();
               closeModal();
            } catch (err) {
               error('Failed to save');
            }
          }}
        />
      )}

      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-10 max-w-[280px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn text-center">
            <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 mx-auto mb-4 sm:mb-8 flex items-center justify-center shadow-lg shadow-rose-500/10 active:scale-95 transition-transform">
              <MdDelete className="text-2xl sm:text-5xl" />
            </div>
            <h3 className="text-base sm:text-2xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight">{confirmData.title}</h3>
            <p className="text-[10px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-10 leading-relaxed italic">{confirmData.message}</p>
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={handleCancel}
                className="flex-1 py-2 sm:py-4 border-2 border-[var(--border-subtle)] text-slate-500 font-black rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[9px] sm:text-[10px]"
              >
                Discard
              </button>
              <button 
                  onClick={handleConfirm} 
                  className="flex-1 py-2 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg sm:rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-95 uppercase tracking-widest text-[9px] sm:text-[10px]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestimonialModal = ({ testimonial, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: testimonial?.name || '',
        role: testimonial?.role || '',
        comment: testimonial?.comment || '',
        rating: testimonial?.rating || 5,
        status: testimonial?.status || 'approved'
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-[var(--admin-bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-main)] w-[90vw] max-w-[320px] overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
                    <div>
                        <h2 className="text-[14px] font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                            {testimonial ? 'Audit Review' : 'New Feedback'}
                        </h2>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">Voice of the customer</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                      <MdClose className="text-base" />
                    </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">Ambassador Name</label>
                        <input 
                          className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-black uppercase tracking-tight placeholder:text-slate-300" 
                          value={formData.name} 
                          onChange={e => setFormData({ ...formData, name: e.target.value })} 
                          required 
                          placeholder="e.g. AR. VIKRAM SINGH" 
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">Designation Matrix</label>
                        <input 
                          className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-bold placeholder:text-slate-300" 
                          value={formData.role} 
                          onChange={e => setFormData({ ...formData, role: e.target.value })} 
                          placeholder="e.g. SENIOR ARCHITECT" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">Trust Score</label>
                            <select 
                              className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-black cursor-pointer appearance-none" 
                              value={formData.rating} 
                              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                            >
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n} className="dark:bg-slate-700 font-black text-[10px]">{n} Stars Selection</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">Approval Stage</label>
                            <select 
                              className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg outline-none transition-all dark:text-white text-[10px] font-black cursor-pointer appearance-none" 
                              value={formData.status} 
                              onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="approved" className="dark:bg-slate-700 font-black text-[10px]">Live Production</option>
                                <option value="pending" className="dark:bg-slate-700 font-black text-[10px]">Sandbox Waiting</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-0.5">Customer Narrative</label>
                        <textarea 
                          className="w-full px-3 py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[10px] font-bold resize-none min-h-[80px] leading-relaxed scrollbar-hide italic" 
                          value={formData.comment} 
                          onChange={e => setFormData({ ...formData, comment: e.target.value })} 
                          required 
                          placeholder="Feedback content..." 
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                          type="button" 
                          onClick={onClose} 
                          className="flex-1 py-2 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-lg hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-1"
                        >
                          <MdCancel className="text-base" />
                          <span>Discard</span>
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 py-2 bg-teal-600 text-white font-black rounded-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/30 active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
                        >
                          <MdSave className="text-base" />
                          <span>Commit</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminTestimonials;
