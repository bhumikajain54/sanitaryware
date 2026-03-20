import { useState, useCallback, useMemo } from 'react';
import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdFilterList,
  MdFileDownload,
  MdFileUpload,
  MdMoreVert,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdInventory,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight
} from 'react-icons/md';
import ProductModal from '../../components/admin/ProductModal';
import {
  useAdminFetch,
  useAdminSearch,
  useAdminPagination,
  useAdminToast,
  useAdminSelection,
  useAdminModal,
  useAdminConfirm
} from '../../hooks/useAdmin';
import { handleExportDownload } from '../../utils/exportUtils';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import { generateProductListPDF } from '../../utils/pdfGenerator';
import adminService from '../../services/adminService';

const AdminProducts = () => {
  const { success, error, info } = useAdminToast();
  const { confirm, isConfirming, confirmData, handleConfirm, handleCancel } = useAdminConfirm();

  const fetchProducts = useCallback(() => adminService.getProducts(), []);
  const fetchBrands = useCallback(() => adminService.getBrands(), []);
  const fetchCategories = useCallback(() => adminService.getCategories(), []);

  const { data: initialProducts, loading, refetch } = useAdminFetch(fetchProducts, []);
  const { data: brandsList } = useAdminFetch(fetchBrands, []);
  const { data: categoriesList } = useAdminFetch(fetchCategories, []);

  const memoProducts = useMemo(() => {
    if (!initialProducts) return [];
    let list = [];
    if (Array.isArray(initialProducts)) {
      list = initialProducts;
    } else if (initialProducts && typeof initialProducts === 'object') {
      list = initialProducts.products || initialProducts.items || initialProducts.content ||
        initialProducts.data || initialProducts.list || initialProducts.productList ||
        initialProducts.body || (initialProducts._embedded?.products) || [];
      if (list.length === 0) {
        const possibleList = Object.values(initialProducts).find(val => Array.isArray(val));
        if (possibleList) list = possibleList;
      }
    }
    const normalizedList = list.map(item => {
      const stockValue = item.stockQuantity !== undefined ? item.stockQuantity :
        (item.stock !== undefined ? item.stock : (item.quantity !== undefined ? item.quantity : 0));
      return {
        ...item,
        id: item.id,
        name: item.name || 'Untitled Product',
        image: item.mainImage || item.image || '/Logo2.png',
        mainImage: item.mainImage || item.image || '/Logo2.png',
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')),
        stock: Math.max(0, parseInt(stockValue)),
        stockQuantity: Math.max(0, parseInt(stockValue)),
        category: typeof item.category === 'object' ? item.category : { name: String(item.category || 'General') },
        brand: typeof item.brand === 'object' ? item.brand : { name: String(item.brand || 'Generic') },
        active: item.active !== undefined ? item.active : true,
        status: item.active === false ? 'inactive' : 'active'
      };
    });
    const sorted = normalizedList.sort((a, b) => (parseInt(b.id) - parseInt(a.id)) || 0);
    const uniqueList = [];
    const seenIds = new Set();
    sorted.forEach(item => {
      if (item.id && !seenIds.has(item.id)) { seenIds.add(item.id); uniqueList.push(item); }
    });
    return uniqueList;
  }, [initialProducts]);

  const memoBrands = useMemo(() => {
    if (!brandsList) return [];
    const rawList = Array.isArray(brandsList) ? brandsList : (brandsList.brands || brandsList.data || []);
    const uniqueNames = new Set();
    return rawList.filter(b => { if (!b.name || uniqueNames.has(b.name)) return false; uniqueNames.add(b.name); return true; });
  }, [brandsList]);

  const memoCategories = useMemo(() => {
    if (!categoriesList) return [];
    let list = Array.isArray(categoriesList) ? categoriesList :
      (categoriesList.categories || categoriesList.content || categoriesList.data || []);
    const uniqueNames = new Set();
    return list.filter(c => {
      const str = String(c.name || c || '').trim();
      if (!str || uniqueNames.has(str) || ['000'].includes(str.toUpperCase())) return false;
      uniqueNames.add(str); return true;
    });
  }, [categoriesList]);

  const searchKeys = useMemo(() => ['name', 'sku', 'brand.name', 'category.name', 'id', 'price', 'stockQuantity'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedProducts } = useAdminSearch(memoProducts, searchKeys);

  const filterConfig = useMemo(() => ({
    brand: { label: 'Brand', field: 'brand.name', type: 'exact', placeholder: 'All Brands', options: memoBrands.map(b => ({ value: b.name, label: b.name })) },
    category: { label: 'Category', field: 'category.name', type: 'exact', placeholder: 'All Categories', options: memoCategories.map(c => ({ value: c.name, label: c.name })) },
    status: { label: 'Status', field: 'status', type: 'exact', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
    stockLevel: {
      label: 'Stock Level', field: 'stock', type: 'range', placeholder: 'All Stock Levels',
      options: [{ value: 'in-stock', label: 'In Stock (>10)' }, { value: 'low-stock', label: 'Low Stock (1-10)' }, { value: 'out-of-stock', label: 'Out of Stock (0)' }],
      ranges: { 'in-stock': { min: 11 }, 'low-stock': { min: 1, max: 10 }, 'out-of-stock': { min: 0, max: 0 } }
    }
  }), [memoBrands, memoCategories]);

  const { showFilters, toggleFilters, filters, filteredItems: filteredProducts,
    handleFilterChange, clearFilters, activeFilterCount, activeFilters } = useAdminFilter(searchedProducts, filterConfig);

  const { currentItems: products, currentPage, totalPages, goToPage, nextPage, prevPage,
    resetPagination, hasNextPage, hasPrevPage } = useAdminPagination(filteredProducts, 10);

  const { toggleSelection, toggleAll, selectedIds, isSelected, isAllSelected, isSomeSelected, clearSelection } = useAdminSelection(products);

  const { isOpen, modalData, openModal, closeModal } = useAdminModal();

  const handleToggleStatus = async (productId, currentActive) => {
    try {
      await adminService.toggleProductStatus(productId, !currentActive);
      success(`Product ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (err) { error('Failed to update status'); }
  };

  const handleBulkStockUpdate = async () => {
    const quantityStr = prompt('Enter the new stock quantity for ALL products:');
    if (quantityStr === null) return;
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity)) { error('Please enter a valid number'); return; }
    const confirmed = await confirm({ title: 'Global Stock Update', message: `Set stock of ALL products to ${quantity}?`, confirmText: 'Update All', type: 'danger' });
    if (confirmed) {
      try { const r = await adminService.bulkStockUpdate(quantity); success(r || `Stock updated to ${quantity}`); refetch(); }
      catch (err) { error(err.message || 'Bulk stock update failed'); }
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = await confirm({ title: 'Delete Product', message: 'Delete this product? This cannot be undone.', confirmText: 'Delete', type: 'danger' });
    if (confirmed) {
      try { await adminService.deleteProduct(productId); success('Product deleted'); refetch(); }
      catch (err) { error('Failed to delete product'); }
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({ title: 'Bulk Delete', message: `Delete ${selectedIds.length} products?`, confirmText: 'Delete All', type: 'danger' });
    if (confirmed) {
      try { await adminService.bulkDeleteProducts(selectedIds); success(`${selectedIds.length} products deleted`); clearSelection(); refetch(); }
      catch (err) { error('Bulk delete failed'); }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { await adminService.importProducts(file); success('Products imported'); await refetch(); resetPagination(); }
    catch (err) { error(err.message || 'Import failed'); }
    finally { e.target.value = ''; }
  };

  const handleExport = () => handleExportDownload(adminService.exportProducts('csv'), 'Products', 'csv', { success, error });
  const handleExportPDF = () => handleExportDownload(adminService.exportProductsPdf(), 'Products', 'pdf', { success, error });

  return (
    <div className="bg-[var(--admin-bg-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight truncate">
              Product Management
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight">
              Inventory, Prices & Status
            </p>
          </div>

          {/* Action Buttons — scrollable row on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 flex-shrink-0">
            <input type="file" id="import-products" className="hidden" accept=".csv,.xlsx,.pdf" onChange={handleImport} />
            <label htmlFor="import-products"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all cursor-pointer text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
            >
              <MdFileUpload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Import</span>
            </label>
            <button onClick={handleExport}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
            >
              <MdFileDownload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>CSV</span>
            </button>
            <button onClick={handleExportPDF}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
            >
              <MdFileDownload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>PDF</span>
            </button>
            <button onClick={handleBulkStockUpdate}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] font-bold rounded-xl hover:bg-[var(--admin-bg-primary)] transition-all text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
            >
              <MdInventory className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Stock</span>
            </button>
            <button onClick={() => openModal()}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <MdAdd className="text-base sm:text-lg md:text-xl flex-shrink-0" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full group">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl md:text-2xl group-focus-within:text-teal-500 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-xs sm:text-sm font-semibold placeholder:text-slate-400 placeholder:font-medium shadow-inner"
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
          showFilters={showFilters}
          filters={filters}
          filterConfig={filterConfig}
          activeFilterCount={activeFilterCount}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          resultsCount={filteredProducts.length}
        />

        {/* ─── Bulk Actions Bar ─── */}
        {selectedIds.length > 0 && (
          <div className="bg-teal-600 text-white rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3 sm:gap-6">
              <span className="font-black uppercase tracking-widest text-[10px] bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
                {selectedIds.length} selected
              </span>
              <button onClick={clearSelection} className="text-[10px] font-black uppercase tracking-widest underline hover:text-teal-100 whitespace-nowrap">
                Clear
              </button>
            </div>
            <button onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg whitespace-nowrap flex-shrink-0"
            >
              <MdDelete className="text-sm sm:text-base" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        {/* ─── Products Table ─── */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[560px]">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)]/50">
                  {/* Checkbox */}
                  <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[var(--border-subtle)] w-8 sm:w-10">
                    <input type="checkbox"
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      checked={isAllSelected} onChange={toggleAll}
                    />
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Product</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Brand</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Category</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Price</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Stock</th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="8" className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="h-10 sm:h-12 bg-[var(--admin-bg-primary)] animate-pulse rounded-2xl" />
                      </td>
                    </tr>
                  ))
                ) : Array.isArray(products) && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isSelected(product.id) ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-2 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <input type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={isSelected(product.id)}
                          onChange={() => toggleSelection(product.id)}
                        />
                      </td>

                      {/* Product */}
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center p-0.5 sm:p-1 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0">
                            <img
                              src={product.image || product.mainImage || '/Logo2.png'}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--admin-text-primary)] truncate max-w-[90px] sm:max-w-[140px] md:max-w-[200px] tracking-tight text-[10px] sm:text-xs md:text-sm">
                              {product.name}
                            </p>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 line-clamp-1 max-w-[90px] sm:max-w-[150px] italic font-medium">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand — hidden on mobile */}
                      <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-full border border-cyan-100 dark:border-cyan-800/50 uppercase tracking-widest whitespace-nowrap">
                          {typeof product.brand === 'object' && product.brand ? product.brand.name : (product.brand || 'No Brand')}
                        </span>
                      </td>

                      {/* Category — hidden on mobile */}
                      <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest whitespace-nowrap">
                          {typeof product.category === 'object' && product.category ? product.category.name : (product.category || 'No Category')}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-4 font-black text-teal-600 dark:text-teal-400 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                        ₹{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                      </td>

                      {/* Stock */}
                      <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <span className={`inline-flex px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${product.stock === 0 ? 'bg-red-100   text-red-700' :
                          product.stock < 10 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Status — hidden on mobile */}
                      <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2.5 sm:py-4">
                        <button
                          onClick={() => handleToggleStatus(product.id, product.active)}
                          className={`flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${product.active ? 'text-green-500' : 'text-slate-400'
                            }`}
                        >
                          {product.active
                            ? <MdCheckCircle className="text-sm sm:text-base md:text-lg flex-shrink-0" />
                            : <MdCancel className="text-sm sm:text-base md:text-lg flex-shrink-0" />
                          }
                          <span>{product.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-2 sm:px-3 md:px-6 py-2.5 sm:py-4">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => openModal(product)}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Edit Product"
                          >
                            <MdEdit className="text-sm sm:text-base md:text-xl" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg sm:rounded-xl transition-all"
                            title="Delete Product"
                          >
                            <MdDelete className="text-sm sm:text-base md:text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-10 sm:p-12 text-center text-slate-300">
                      <MdInventory className="mx-auto text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs sm:text-sm">No products found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ─── */}
          {!loading && totalPages > 1 && (
            <div className="px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 border-t border-[var(--border-subtle)] flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4 bg-slate-50/30 dark:bg-slate-800/20">
              <p className="text-[9px] sm:text-[10px] text-[var(--admin-text-secondary)] font-black uppercase tracking-widest text-center xs:text-left whitespace-nowrap">
                Showing <span className="text-teal-600 font-black">{products.length}</span> of{' '}
                <span className="text-teal-600 font-black">{filteredProducts.length}</span> products
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                {/* Prev */}
                <button onClick={prevPage} disabled={!hasPrevPage}
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-auto md:h-auto md:px-4 md:py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasPrevPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'
                    }`}
                >
                  <MdKeyboardArrowLeft className="text-lg md:hidden" />
                  <span className="hidden md:inline">Previous</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 sm:gap-1.5 font-bold">
                  {(() => {
                    const range = [];
                    const overflow = 2;
                    for (let i = 1; i <= totalPages; i++) {
                      if (i === 1 || i === totalPages || (i >= currentPage - overflow && i <= currentPage + overflow)) {
                        range.push(i);
                      } else if (
                        (i === currentPage - overflow - 1 && currentPage > overflow + 2) ||
                        (i === currentPage + overflow + 1 && currentPage < totalPages - overflow - 1)
                      ) { range.push('...'); }
                    }
                    const uniqueRange = [...new Set(range)].filter((val, idx, arr) => !(val === '...' && arr[idx - 1] === '...'));
                    return uniqueRange.map((page, index) => (
                      <button key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] md:text-xs font-black transition-all ${page === currentPage ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20 scale-110' :
                          page === '...' ? 'text-slate-300 cursor-default' :
                            'text-slate-400 hover:bg-[var(--admin-bg-primary)] hover:text-teal-600'
                          }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>

                {/* Next */}
                <button onClick={nextPage} disabled={!hasNextPage}
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-auto md:h-auto md:px-4 md:py-2 border-2 border-[var(--border-main)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!hasNextPage ? 'opacity-30 cursor-not-allowed' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)]'
                    }`}
                >
                  <MdKeyboardArrowRight className="text-lg md:hidden" />
                  <span className="hidden md:inline">Next</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Product CRUD Modal ─── */}
      {isOpen && (
        <ProductModal
          product={modalData}
          brands={memoBrands}
          categories={memoCategories}
          onClose={closeModal}
          onSave={async (data) => {
            try {
              const stockValue = parseInt(data.stock.toString().replace(/[^0-9]/g, '')) || 0;
              const sanitizedData = {
                ...modalData, ...data,
                price: parseFloat(data.price.toString().replace(/[^0-9.]/g, '')) || 0,
                stock: stockValue, stockQuantity: stockValue, quantity: stockValue, qty: stockValue, inventory: stockValue
              };
              if (modalData?.id) {
                await adminService.updateProduct(modalData.id, sanitizedData);
                success('Product updated successfully');
              } else {
                await adminService.createProduct(sanitizedData);
                success('Product created successfully');
              }
              if (sanitizedData.stock === 0) {
                try {
                  await adminService.sendStockAlert({ id: modalData?.id || 'NEW', name: sanitizedData.name, stock: 0 });
                  info(`Stock Alert sent for ${sanitizedData.name}`);
                } catch (alertErr) { console.warn('Failed to send stock alert:', alertErr); }
              }
              refetch(); closeModal();
            } catch (err) { error('Failed to save product changes'); }
          }}
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

export default AdminProducts;