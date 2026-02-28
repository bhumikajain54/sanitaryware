import { useState, useCallback, useMemo } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdRefresh, 
  MdCategory,
  MdCheckCircle,
  MdLayers,
  MdFileUpload,
  MdFileDownload,
  MdFilterList
} from 'react-icons/md';
import { handleExportDownload } from '../../utils/exportUtils';
import CategoryModal from '../../components/admin/CategoryModal';
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

const AdminCategories = () => {
  const { success, error, info } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  
  // Data fetching
  const fetchCategories = useCallback(() => adminService.getCategories(), []);
  const { data: initialCategories, loading, refetch } = useAdminFetch(
    fetchCategories,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['name', 'description'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedCategories } = useAdminSearch(
    initialCategories || [],
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
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredCategories,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedCategories, filterConfig);

  // Pagination
  const { 
    currentItems: categories, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    resetPagination,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(filteredCategories, 10);

  // Modal State
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? Products in this category will become unassigned.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteCategory(categoryId);
        success('Category deleted successfully');
        refetch();
      } catch (err) {
        error('Failed to delete category');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await adminService.importCategories(file);
      success('Categories imported successfully');
      await refetch();
      resetPagination();
    } catch (err) {
      error(err.message || 'Import failed');
    } finally {
      e.target.value = '';
    }
  };

  const handleExport = () => {
    handleExportDownload(adminService.exportCategories('csv'), 'Categories', 'csv', { success, error });
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Category Management</h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-1 uppercase tracking-tight font-bold">Organize your products group</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="import-categories"
              className="hidden"
              accept=".csv,.xlsx,.pdf"
              onChange={handleImport}
            />
            <label
              htmlFor="import-categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[10px] sm:text-xs uppercase tracking-widest"
              title="Import from CSV/PDF"
            >
              <MdFileUpload className="text-lg sm:text-xl" />
              <span className="inline">Import</span>
            </label>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest"
              title="Export to CSV"
            >
              <MdFileDownload className="text-lg sm:text-xl" />
              <span className="inline">Export</span>
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white font-black rounded-full hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <MdAdd className="text-lg sm:text-xl" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl p-2.5 sm:p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 dark:focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-[11px] sm:text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={toggleFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest flex-1 md:flex-none relative"
            >
              <MdFilterList />
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

        {/* Categories Table */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter sm:tracking-widest border-b border-[var(--border-subtle)] text-left">Category</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter sm:tracking-widest border-b border-[var(--border-subtle)] text-left">Description</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Status</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="px-6 py-8">
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
                      </td>
                    </tr>
                  ))
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                           <div className="w-6 h-6 sm:w-10 sm:h-10 bg-teal-50 dark:bg-teal-900/30 rounded sm:rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100 dark:border-teal-800/50">
                             <MdCategory className="text-xs sm:text-xl" />
                           </div>
                           <span className="font-bold text-[var(--admin-text-primary)] uppercase tracking-tight text-[8px] sm:text-sm truncate max-w-[60px] sm:max-w-none">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4 text-[var(--admin-text-secondary)] text-[7px] sm:text-sm font-medium line-clamp-1 sm:line-clamp-none max-w-[80px] sm:max-w-none italic leading-relaxed">
                        {category.description}
                      </td>
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4">
                        {(() => {
                          const status = String(category.status || '').toLowerCase().trim();
                          const isActive = status === 'active' || category.status === true || !category.status;
                          
                          return (
                            <span className={`px-1 py-0.5 sm:px-3 sm:py-1 rounded-full text-[6px] sm:text-[10px] font-black uppercase tracking-widest border transition-colors ${
                              isActive
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-1 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center justify-end gap-0">
                          <button
                            onClick={() => openModal(category)}
                            className="p-1 sm:p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-all"
                            title="Edit Category"
                          >
                            <MdEdit className="text-xs sm:text-xl" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                            title="Delete Category"
                          >
                            <MdDelete className="text-xs sm:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-300">
                      <MdCategory className="mx-auto text-6xl mb-4 opacity-20" />
                      <p className="font-bold text-lg uppercase tracking-widest">No categories found</p>
                      <p className="text-sm mt-1 italic">Add a category to start organizing your products.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-4 py-2 border-2 border-[var(--border-main)] text-xs font-bold rounded-xl transition-all ${!hasPrevPage ? 'opacity-40 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 border-2 border-[var(--border-main)] text-xs font-bold rounded-xl transition-all ${!hasNextPage ? 'opacity-40 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category CRUD Modal */}
      {isOpen && (
        <CategoryModal
          category={modalData}
          onClose={closeModal}
          onSave={async (data) => {
            try {
              if (modalData) {
                await adminService.updateCategory(modalData.id, data);
                success('Category updated successfully');
              } else {
                await adminService.createCategory(data);
                success('Category created successfully');
              }
              refetch();
              closeModal();
            } catch (err) {
              error('Failed to save category');
            }
          }}
        />
      )}



      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[var(--admin-bg-secondary)] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                confirmData.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-500'
              }`}>
                {confirmData.type === 'danger' ? <MdDelete className="text-4xl" /> : <MdCheckCircle className="text-4xl" />}
              </div>
              <h3 className="text-xl font-black text-[var(--admin-text-primary)] mb-2 tracking-tight">{confirmData.title}</h3>
              <p className="text-sm font-medium text-[var(--admin-text-secondary)] mb-8 leading-relaxed">{confirmData.message}</p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleCancel} 
                  className="flex-1 py-3.5 px-6 border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                   onClick={handleConfirm} 
                   className={`flex-1 py-3.5 px-6 font-bold rounded-2xl transition-all shadow-lg uppercase tracking-widest text-[10px] text-white ${
                     confirmData.type === 'danger' 
                     ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                     : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'
                   }`}
                >
                  {confirmData.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
