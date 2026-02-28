import { useState, useCallback, useMemo } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdRefresh, 
  MdVerified,
  MdCheckCircle,
  MdLanguage,
  MdBusiness,
  MdFilterList,
  MdFileUpload,
  MdFileDownload
} from 'react-icons/md';
import { handleExportDownload } from '../../utils/exportUtils';
import BrandModal from '../../components/admin/BrandModal';
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

const AdminBrands = () => {
  const { success, error } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();
  
  // Data fetching
  const fetchBrands = useCallback(() => adminService.getBrands(), []);
  const { data: initialBrands, loading, refetch } = useAdminFetch(
    fetchBrands,
    []
  );

  // Search
  const searchKeys = useMemo(() => ['name', 'description', 'website'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedBrands } = useAdminSearch(
    initialBrands || [],
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
    filteredItems: filteredBrands,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedBrands, filterConfig);

  // Pagination
  const { 
    currentItems: brands, 
    currentPage, 
    totalPages, 
    goToPage, 
    nextPage, 
    prevPage,
    hasNextPage,
    hasPrevPage 
  } = useAdminPagination(filteredBrands, 10);

  // Modal State
  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleDeleteBrand = async (brandId) => {
    const confirmed = await confirm({
      title: 'Delete Brand',
      message: 'Are you sure you want to delete this brand? Products associated with this brand will remain but without brand association.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await adminService.deleteBrand(brandId);
        success('Brand deleted successfully');
        refetch();
      } catch (err) {
        error('Failed to delete brand');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await adminService.importBrands(formData);
      success('Brands imported successfully');
      refetch();
    } catch (err) {
      error(err.message || 'Import failed');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">Brand Management</h1>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-500 mt-1 uppercase tracking-tight">Partner Brands & Details</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="import-brands"
              className="hidden"
              accept=".csv,.xlsx,.pdf"
              onChange={handleImport}
            />
            <label
              htmlFor="import-brands"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[10px] sm:text-xs uppercase tracking-widest"
              title="Import from CSV/PDF"
            >
              <MdFileUpload className="text-lg sm:text-xl" />
              <span className="inline">Import</span>
            </label>
            <button
              onClick={() => handleExportDownload(adminService.exportBrands(), 'Brands', 'csv', { success, error })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest"
              title="Export Brands"
            >
              <MdFileDownload className="text-lg sm:text-xl" />
              <span>Export</span>
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-6 sm:py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <MdAdd className="text-lg sm:text-xl" />
              <span className="inline">Add Brand</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl p-2.5 sm:p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl" />
            <input
              type="text"
              placeholder="Search brands..."
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

        {/* Brands Table */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter sm:tracking-widest border-b border-[var(--border-subtle)] text-left">Brand</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter sm:tracking-widest border-b border-[var(--border-subtle)] text-left">Description</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Website</th>
                  <th className="px-1.5 sm:px-6 py-2.5 sm:py-4 text-[7px] sm:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="px-6 py-8">
                        <div className="h-12 bg-[var(--admin-bg-primary)] animate-pulse rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : brands.length > 0 ? (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center gap-1.5 sm:gap-4">
                           <div className="w-8 h-8 sm:w-14 sm:h-14 bg-slate-100 dark:bg-slate-800 rounded sm:rounded-2xl flex items-center justify-center p-0.5 sm:p-2 group-hover:scale-105 transition-transform shadow-sm">
                             {brand.logo ? (
                               <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                             ) : (
                               <MdBusiness className="text-sm sm:text-3xl text-teal-600" />
                             )}
                           </div>
                           <div className="min-w-0">
                             <p className="font-black text-[var(--admin-text-primary)] transition-colors uppercase tracking-tight text-[8px] sm:text-sm truncate max-w-[60px] sm:max-w-[150px]">{brand.name}</p>
                             <div className="flex items-center gap-0.5 sm:gap-1.5 mt-0.5">
                               <MdVerified className="text-[6px] sm:text-xs text-teal-500" />
                               <span className="text-[5px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">Partner</span>
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4">
                        <p className="text-[var(--admin-text-secondary)] text-[7px] sm:text-xs font-medium max-w-[70px] sm:max-w-sm line-clamp-2 italic leading-relaxed">
                          {brand.description}
                        </p>
                      </td>
                      <td className="px-1.5 sm:px-6 py-2 sm:py-4">
                        <a 
                          href={brand.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all whitespace-nowrap"
                        >
                           <MdLanguage className="text-[8px] sm:text-sm" />
                           {brand.website?.replace('https://', '').replace('www.', '') || 'Link'}
                        </a>
                      </td>
                      <td className="px-1 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => openModal(brand)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded transition-all"
                            title="Edit Brand"
                          >
                            <MdEdit className="text-xs sm:text-xl" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="p-1 sm:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                            title="Delete Brand"
                          >
                            <MdDelete className="text-xs sm:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-300">
                      <MdBusiness className="mx-auto text-7xl mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-lg text-slate-400">No brands found</p>
                      <p className="text-xs mt-2 font-bold opacity-60">Try a different search term or add a new brand partner.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-6 border-t border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                Page <span className="text-teal-600">{currentPage}</span> of <span className="text-teal-600">{totalPages}</span>
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`px-4 py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brand CRUD Modal */}
      {isOpen && (
        <BrandModal
          brand={modalData}
          onClose={closeModal}
          onSave={async (data) => {
            try {
              if (modalData) {
                await adminService.updateBrand(modalData.id, data);
                success('Brand updated successfully');
              } else {
                await adminService.createBrand(data);
                success('Brand created successfully');
              }
              refetch();
              closeModal();
            } catch (err) {
              error('Failed to save brand');
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-[var(--admin-bg-secondary)] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-[var(--border-main)] transform transition-all animate-fadeIn">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                confirmData.type === 'danger' ? 'bg-red-50 text-red-500 shadow-lg shadow-red-500/10' : 'bg-teal-50 text-teal-500 shadow-lg shadow-teal-500/10'
              }`}>
                {confirmData.type === 'danger' ? <MdDelete className="text-4xl" /> : <MdCheckCircle className="text-4xl" />}
              </div>
              <h3 className="text-xl font-black text-[var(--admin-text-primary)] mb-2 leading-tight tracking-tight">{confirmData.title}</h3>
              <p className="text-sm font-medium text-[var(--admin-text-secondary)] mb-8 leading-relaxed italic">{confirmData.message}</p>
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

export default AdminBrands;
