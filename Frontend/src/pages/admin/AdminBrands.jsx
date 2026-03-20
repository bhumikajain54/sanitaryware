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
import SafeImage from '../../components/common/SafeImage';
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

  const fetchBrands = useCallback(() => adminService.getBrands(), []);
  const { data: initialBrands, loading, refetch } = useAdminFetch(fetchBrands, []);

  const searchKeys = useMemo(() => ['name', 'description', 'website'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedBrands } = useAdminSearch(initialBrands || [], searchKeys);

  const filterConfig = useMemo(() => ({
    status: {
      label: 'Status', field: 'status', type: 'exact', placeholder: 'All Status',
      options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
    }
  }), []);

  const { showFilters, toggleFilters, filters, filteredItems: filteredBrands,
    handleFilterChange, clearFilters, activeFilterCount, activeFilters } = useAdminFilter(searchedBrands, filterConfig);

  const { currentItems: brands, currentPage, totalPages, goToPage, nextPage, prevPage,
    hasNextPage, hasPrevPage } = useAdminPagination(filteredBrands, 10);

  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleDeleteBrand = async (brandId) => {
    const confirmed = await confirm({
      title: 'Delete Brand',
      message: 'Delete this brand? Associated products will remain but without brand association.',
      confirmText: 'Delete',
      type: 'danger'
    });
    if (confirmed) {
      try { await adminService.deleteBrand(brandId); success('Brand deleted successfully'); refetch(); }
      catch (err) { error('Failed to delete brand'); }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try { await adminService.importBrands(formData); success('Brands imported successfully'); refetch(); }
    catch (err) { error(err.message || 'Import failed'); }
    finally { e.target.value = ''; }
  };

  const handleSaveBrand = async (brandData) => {
    try {
      if (modalData) {
        // UPDATE — pass brandData as clean JSON (Base64 logo handled by backend)
        await adminService.updateBrand(modalData.id, brandData);
        success('Brand updated successfully');
      } else {
        // CREATE — pass brandData as clean JSON (Base64 logo handled by backend)
        await adminService.createBrand(brandData);
        success('Brand created successfully');
      }
      refetch();
      closeModal();
    } catch (err) {
      console.error('Brand save error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save brand';
      error(msg);
    }
  };

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight truncate">
              Brand Management
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight">
              Partner Brands & Details
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 flex-shrink-0">
            <input type="file" id="import-brands" className="hidden" accept=".csv,.xlsx,.pdf" onChange={handleImport} />
            <label htmlFor="import-brands"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <MdFileUpload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Import</span>
            </label>
            <button
              onClick={() => handleExportDownload(adminService.exportBrands(), 'Brands', 'csv', { success, error })}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <MdFileDownload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Export</span>
            </button>
            <button
              onClick={() => openModal()}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <MdAdd className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Add Brand</span>
            </button>
          </div>
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl outline-none transition-all dark:text-white text-xs sm:text-sm font-medium placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleFilters}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-subtle)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest flex-1 sm:flex-none relative"
            >
              <MdFilterList className="text-base sm:text-lg" />
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
          showFilters={showFilters} filters={filters} filterConfig={filterConfig}
          activeFilterCount={activeFilterCount} activeFilters={activeFilters}
          onFilterChange={handleFilterChange} onClearFilters={clearFilters}
        />

        {/* ─── Brands Table ─── */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[480px]">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  <th className="px-3 sm:px-5 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Brand</th>
                  <th className="hidden sm:table-cell px-3 sm:px-5 md:px-6 py-3 sm:py-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Description</th>
                  <th className="px-3 sm:px-5 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Website</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="h-10 sm:h-12 bg-[var(--admin-bg-primary)] animate-pulse rounded-2xl" />
                      </td>
                    </tr>
                  ))
                ) : brands.length > 0 ? (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">

                      {/* Brand name + logo */}
                      <td className="px-3 sm:px-5 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center p-1 sm:p-1.5 md:p-2 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0 overflow-hidden">
                            <SafeImage 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[var(--admin-text-primary)] uppercase tracking-tight text-[10px] sm:text-xs md:text-sm truncate max-w-[80px] sm:max-w-[130px] md:max-w-[180px]">
                              {brand.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MdVerified className="text-[9px] sm:text-xs text-teal-500 flex-shrink-0" />
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">Partner</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description — hidden on mobile */}
                      <td className="hidden sm:table-cell px-3 sm:px-5 md:px-6 py-3 sm:py-4">
                        <p className="text-[var(--admin-text-secondary)] text-[9px] sm:text-[10px] md:text-xs font-medium max-w-[120px] sm:max-w-[180px] md:max-w-sm line-clamp-2 italic leading-relaxed">
                          {brand.description || '—'}
                        </p>
                      </td>

                      {/* Website */}
                      <td className="px-3 sm:px-5 md:px-6 py-3 sm:py-4">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all max-w-[100px] sm:max-w-[140px] md:max-w-none truncate"
                          >
                            <MdLanguage className="text-xs sm:text-sm flex-shrink-0" />
                            <span className="truncate">
                              {brand.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]}
                            </span>
                          </a>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button
                            onClick={() => openModal(brand)}
                            className="p-1.5 sm:p-2 md:p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Edit Brand"
                          >
                            <MdEdit className="text-sm sm:text-base md:text-xl" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="p-1.5 sm:p-2 md:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Delete Brand"
                          >
                            <MdDelete className="text-sm sm:text-base md:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 sm:p-14 md:p-16 text-center text-slate-300">
                      <MdBusiness className="mx-auto text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 md:mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-sm sm:text-base md:text-lg text-slate-400">No brands found</p>
                      <p className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold opacity-60">
                        Try a different search term or add a new brand partner.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ─── */}
          {!loading && totalPages > 1 && (
            <div className="px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 border-t border-[var(--border-subtle)] flex flex-col xs:flex-row items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest">
                Page <span className="text-teal-600">{currentPage}</span> of <span className="text-teal-600">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <button onClick={prevPage} disabled={!hasPrevPage}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'
                    }`}
                >
                  Previous
                </button>
                <button onClick={nextPage} disabled={!hasNextPage}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Brand CRUD Modal ─── */}
      {isOpen && (
        <BrandModal
          brand={modalData}
          onClose={closeModal}
          onSave={handleSaveBrand}
        />
      )}

      {/* ─── Confirm Dialog ─── */}
      {isConfirming && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[var(--admin-bg-secondary)] rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-[var(--border-main)] animate-fadeIn">
            <div className="text-center">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center ${confirmData.type === 'danger'
                ? 'bg-red-50 text-red-500 shadow-lg shadow-red-500/10'
                : 'bg-teal-50 text-teal-500 shadow-lg shadow-teal-500/10'
                }`}>
                {confirmData.type === 'danger'
                  ? <MdDelete className="text-3xl sm:text-4xl" />
                  : <MdCheckCircle className="text-3xl sm:text-4xl" />
                }
              </div>
              <h3 className="text-base sm:text-xl font-black text-[var(--admin-text-primary)] mb-1.5 sm:mb-2 leading-tight tracking-tight">
                {confirmData.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--admin-text-secondary)] mb-5 sm:mb-8 leading-relaxed italic">
                {confirmData.message}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={handleCancel}
                  className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 border-2 border-[var(--border-subtle)] text-slate-500 font-bold rounded-xl sm:rounded-2xl hover:bg-[var(--admin-bg-primary)] transition-all uppercase tracking-widest text-[9px] sm:text-[10px]"
                >
                  Cancel
                </button>
                <button onClick={handleConfirm}
                  className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-6 font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg uppercase tracking-widest text-[9px] sm:text-[10px] text-white ${confirmData.type === 'danger'
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