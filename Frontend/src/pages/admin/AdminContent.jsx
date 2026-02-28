import { useState, useCallback, useMemo } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdArticle, 
  MdSearch, 
  MdRefresh, 
  MdFilterList,
  MdCheckCircle,
  MdDescription
} from 'react-icons/md';
import ContentModal from '../../components/admin/ContentModal';
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
import adminService from '../../services/adminService';

const AdminContent = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  
  // Data fetching
  const fetchContent = useCallback(() => adminService.getContentPages(), []);
  const { data: initialContent, loading, refetch } = useAdminFetch(
    fetchContent,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['title', 'slug', 'type', 'status'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedContent } = useAdminSearch(
    initialContent || [],
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
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' }
        ]
    },
    type: {
        label: 'Type',
        field: 'type',
        type: 'exact',
        placeholder: 'All Types',
        options: [
            { value: 'page', label: 'Page' },
            { value: 'blog', label: 'Blog' },
            { value: 'notice', label: 'Notice' }
        ]
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredContent,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedContent, filterConfig);

  // Pagination
  const { 
    currentItems: contentPages, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(filteredContent, 10);

  // Modal State
  const { isOpen, modalData: editingContent, openModal, closeModal } = useAdminModal();

  const handleDeleteContent = async (contentId) => {
    const confirmed = await confirm({
      title: 'Delete Content',
      message: 'Are you sure you want to delete this page? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteContentPage(contentId);
        success('Content page deleted');
        refetch();
      } catch (err) {
        error('Failed to delete content');
      }
    }
  };

  const getStatusBadge = (status) => {
    if (status?.toLowerCase() === 'published') return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
    if (status?.toLowerCase() === 'draft') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (status?.toLowerCase() === 'archived') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-[14px] sm:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Content Management</h1>
            <p className="text-[9px] sm:text-sm font-black text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-widest opacity-60">Create and manage your static pages, blog posts, and site copy.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-black rounded-lg sm:rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            <MdAdd className="text-sm sm:text-xl" />
            <span className="hidden sm:inline">Create Content</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="relative flex-1 w-full max-w-[150px] sm:max-w-md group">
            <MdSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] sm:text-xl group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-lg sm:rounded-xl outline-none transition-all dark:text-white text-[10px] sm:text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button 
              onClick={toggleFilters}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 border sm:border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-black rounded-lg sm:rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[9px] sm:text-xs uppercase tracking-widest whitespace-nowrap relative"
            >
              <MdFilterList className="text-sm sm:text-lg" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
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

        {/* Content Table Container */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Page Information</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Configuration</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Status</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left whitespace-nowrap">Last Updated</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-4 text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-2 sm:px-6 py-2 sm:py-6">
                        <div className="h-6 sm:h-10 bg-[var(--admin-bg-primary)] animate-pulse rounded-lg sm:rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : contentPages.length > 0 ? (
                  contentPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-4">
                           <div className="w-6 h-6 sm:w-12 sm:h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-md sm:rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 shadow-sm transition-transform group-hover:scale-110">
                             <MdArticle className="text-sm sm:text-2xl" />
                           </div>
                           <div>
                              <span className="font-black text-[var(--admin-text-primary)] uppercase tracking-tight text-[10px] sm:text-sm block leading-none">{page.title || page.pageName}</span>
                              <span className="text-[7px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1 block italic opacity-70">/{page.slug}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-md sm:rounded-lg border border-purple-100 dark:border-purple-800 uppercase tracking-widest w-fit">
                            {page.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest w-fit ${getStatusBadge(page.status)}`}>
                            {page.status}
                          </span>
                          <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[9px] font-black uppercase tracking-widest w-fit ${page.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {page.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-[var(--admin-text-secondary)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : page.lastUpdated}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button
                            onClick={() => openModal(page)}
                            className="p-1.5 sm:p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Edit"
                          >
                            <MdEdit className="text-sm sm:text-xl" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(page.id)}
                            className="p-1.5 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Delete"
                          >
                            <MdDelete className="text-sm sm:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 sm:p-20 text-center text-slate-300">
                      <MdArticle className="mx-auto text-4xl sm:text-7xl mb-4 sm:mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs sm:text-lg text-slate-400">No content pages</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-2 sm:px-6 py-4 sm:py-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20 rounded-b-xl">
              <p className="text-[8px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                <span className="text-teal-600">{contentPages.length}</span> of <span className="text-teal-600">{filteredContent.length}</span>
              </p>
              <div className="flex items-center gap-1.5 sm:gap-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Prev
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-2 py-1 sm:px-4 sm:py-2 border sm:border-2 border-[var(--border-main)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Modal */}
      {isOpen && (
        <ContentModal
          content={editingContent}
          onClose={closeModal}
          onSave={async (data) => {
            try {
               await adminService.saveContentPage(data);
               success('Content saved successfully');
               refetch();
               closeModal();
            } catch (err) {
               error('Failed to save content');
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl p-4 sm:p-8 max-w-[280px] sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 ${
                confirmData.type === 'danger' 
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-rose-500/10' 
                : 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 shadow-teal-500/10'
              }`}>
                {confirmData.type === 'danger' ? <MdDelete className="text-2xl sm:text-4xl" /> : <MdCheckCircle className="text-2xl sm:text-4xl" />}
              </div>
              <h1 className="text-[12px] sm:text-xl font-black text-[var(--admin-text-primary)] mb-1 sm:mb-2 uppercase tracking-tight leading-tight">{confirmData.title}</h1>
              <p className="text-[9px] sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-6 sm:mb-8 leading-relaxed italic">{confirmData.message}</p>
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-2 sm:py-3.5 px-3 sm:px-6 border sm:border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-lg sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[8px] sm:text-[10px]"
                >
                  Cancel
                </button>
                <button 
                   onClick={handleConfirm} 
                   className={`flex-1 py-2 sm:py-3.5 px-3 sm:px-6 font-bold rounded-lg sm:rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-[8px] sm:text-[10px] ${
                     confirmData.type === 'danger' 
                     ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                     : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
                   }`}
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

export default AdminContent;
