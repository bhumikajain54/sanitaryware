import { useState, useCallback, useMemo } from 'react';
import {
  MdSearch,
  MdVisibility,
  MdFilterList,
  MdRefresh,
  MdSend,
  MdClose,
  MdDescription,
  MdAdd,
  MdInventory,
  MdFileUpload,
  MdAttachFile,
  MdEdit,
  MdPeople
} from 'react-icons/md';
import {
  useAdminFetch,
  useAdminSearch,
  useAdminToast,
  useAdminModal,
  useAdminPagination
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import adminService from '../../services/adminService';

const AdminQuotations = () => {
  const { success, error, info } = useAdminToast();
  const { isOpen, modalData: selectedQuotation, openModal, closeModal } = useAdminModal();
  const [viewMode, setViewMode] = useState('list');
  const [sending, setSending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importCustomerName, setImportCustomerName] = useState('');
  const [importCustomerPhone, setImportCustomerPhone] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quotationItems, setQuotationItems] = useState([
    { id: 1, name: '', qty: 1, rate: 0 }
  ]);

  const fetchQuotations = useCallback(async () => {
    try {
      const data = await adminService.getAdminQuotations();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to load quotations:', err);
      return [];
    }
  }, []);

  const { data: rawQuotations, loading, refetch } = useAdminFetch(fetchQuotations, []);

  const formattedQuotations = useMemo(() => {
    return (rawQuotations || []).map(q => ({
      ...q,
      date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A',
      customerName: q.customer?.name || q.customerName || 'Guest',
      total: (q.totalAmount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    }));
  }, [rawQuotations]);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: searchedQuotations
  } = useAdminSearch(formattedQuotations, ['id', 'customerName']);

  const filterConfig = useMemo(() => ({
    status: {
      label: 'Status',
      field: 'status',
      type: 'select',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'SENT', label: 'Sent' },
        { value: 'EXPIRED', label: 'Expired' }
      ]
    }
  }), []);

  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredQuotations,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedQuotations, filterConfig);

  const { currentItems: quotations } = useAdminPagination(filteredQuotations, 50);

  const handleSendWhatsApp = async (id) => {
    setSending(id);
    info('Sending quotation via WhatsApp...');
    try {
      await adminService.sendQuotationWhatsApp(id);
      success('Quotation sent successfully');
    } catch (err) {
      error('Failed to send WhatsApp message');
    } finally {
      setSending(null);
    }
  };

  const addItem = () => {
    setQuotationItems([...quotationItems, { id: Date.now(), name: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (id) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setQuotationItems(quotationItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = quotationItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);

  const handleCreateQuotation = async () => {
    if (!customerName) {
      error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        items: quotationItems,
        totalAmount: subtotal
      };

      if (editId) {
        await adminService.updateQuotation(editId, payload);
        success('Quotation updated successfully');
      } else {
        await adminService.createQuotation(payload);
        success('Quotation created successfully');
      }

      setViewMode('list');
      setEditId(null);
      setCustomerName('');
      setCustomerPhone('');
      setQuotationItems([{ id: 1, name: '', qty: 1, rate: 0 }]);
      refetch();
    } catch (err) {
      error(editId ? 'Failed to update quotation' : 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuotation = (q) => {
    setEditId(q.id);
    setCustomerName(q.customerName);
    setCustomerPhone(q.customerPhone || '');
    setQuotationItems(q.items?.length > 0 ? q.items.map((item, idx) => ({
      ...item,
      id: item.id || `existing-${idx}`
    })) : [{ id: 1, name: '', qty: 1, rate: 0 }]);
    setViewMode('create');
  };

  const handleImportQuotation = async () => {
    if (!importFile || (!editId && !importCustomerName)) {
      error('File and Customer Name are required');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      if (editId) {
        await adminService.updateQuotationImport(editId, formData);
        success('Quotation updated via import');
      } else {
        formData.append('customerName', importCustomerName);
        if (importCustomerPhone) {
          formData.append('customerPhone', importCustomerPhone);
        }
        await adminService.importQuotation(formData);
        success('Quotation imported successfully');
      }

      setShowImportModal(false);
      setImportFile(null);
      setImportCustomerName('');
      setImportCustomerPhone('');
      setEditId(null);
      refetch();
    } catch (err) {
      error(err.message || 'Failed to process import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">

      {/* ─── CREATE / EDIT FULLSCREEN MODAL ─── */}
      {viewMode === 'create' && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="relative w-full max-w-[1400px] bg-[var(--admin-bg-primary)] min-h-screen md:min-h-0 md:my-6 md:rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[var(--admin-bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 md:px-12 py-4 sm:py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight truncate">
                  {editId ? 'Edit Quotation' : 'Create Quotation'}
                </h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-purple-600 rounded-full hidden sm:block"></span>
                  {editId ? `Updating Quote #${editId}` : 'New Cost Estimate'}
                </p>
              </div>
              <button
                onClick={() => { setViewMode('list'); setEditId(null); }}
                className="flex-shrink-0 p-2.5 sm:p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <MdClose className="text-xl sm:text-2xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-10 lg:p-12 pb-28 sm:pb-20 md:pb-12">
              <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 md:gap-8">

                {/* ── Left: Form ── */}
                <div className="xl:col-span-8 space-y-6 md:space-y-8">

                  {/* Customer Info Card */}
                  <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-10 shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 pb-5 border-b border-[var(--border-subtle)]">
                      <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <MdPeople className="text-lg sm:text-2xl md:text-3xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-lg md:text-2xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight leading-none">Customer Details</h3>
                        <p className="text-[8px] sm:text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] mt-1">Party Identification</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.3em] ml-1">Customer Name</label>
                        <input
                          type="text"
                          className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 md:px-7 bg-[var(--admin-bg-primary)] border border-transparent focus:border-purple-500 rounded-xl md:rounded-2xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] transition-all outline-none"
                          placeholder="Enter party name..."
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.3em] ml-1">Contact Number</label>
                        <input
                          type="text"
                          className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 md:px-7 bg-[var(--admin-bg-primary)] border border-transparent focus:border-purple-500 rounded-xl md:rounded-2xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] transition-all outline-none"
                          placeholder="+91..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items Card */}
                  <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-12 shadow-md overflow-hidden">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6 md:mb-10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-purple-600 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          <MdInventory className="text-lg sm:text-2xl md:text-3xl text-white" />
                        </div>
                        <h3 className="text-base sm:text-xl md:text-3xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">Order Items</h3>
                      </div>
                      <button
                        onClick={addItem}
                        className="w-full xs:w-auto px-6 py-3 md:px-8 md:py-3 bg-purple-600 text-white rounded-xl md:rounded-full text-[10px] md:text-[11px] font-black hover:bg-purple-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20 active:scale-95 flex-shrink-0"
                      >
                        + Add Item
                      </button>
                    </div>

                    {/* Desktop column headers */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-3 mb-3">
                      <div className="col-span-6 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">Item / Description</div>
                      <div className="col-span-1 text-center text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">Qty</div>
                      <div className="col-span-2 text-center text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">Rate</div>
                      <div className="col-span-3 text-right text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.2em] pr-10">Total</div>
                    </div>

                    {/* Item Rows */}
                    <div className="space-y-3 sm:space-y-4">
                      {quotationItems.map((item) => (
                        <div
                          key={item.id}
                          className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[var(--admin-bg-primary)] rounded-xl sm:rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
                        >
                          {/* Mobile / Tablet layout */}
                          <div className="lg:hidden p-4 sm:p-5 space-y-3">
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Item</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <MdClose className="text-base sm:text-lg" />
                              </button>
                            </div>
                            <input
                              type="text"
                              className="w-full h-10 sm:h-11 px-4 bg-[var(--admin-bg-secondary)] border border-transparent focus:border-purple-500 rounded-xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] transition-all outline-none"
                              placeholder="Describe product details..."
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            />
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-center block">Qty</label>
                                <input
                                  type="number"
                                  className="w-full h-9 sm:h-10 bg-[var(--admin-bg-secondary)] border border-transparent focus:border-purple-500 rounded-xl text-xs sm:text-sm font-black text-[var(--admin-text-primary)] text-center outline-none"
                                  value={item.qty}
                                  onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-center block">Rate ₹</label>
                                <input
                                  type="number"
                                  className="w-full h-9 sm:h-10 bg-[var(--admin-bg-secondary)] border border-transparent focus:border-purple-500 rounded-xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] text-center outline-none"
                                  value={item.rate}
                                  onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-center block">Total</label>
                                <div className="h-9 sm:h-10 flex items-center justify-center">
                                  <span className="text-sm sm:text-base font-black text-purple-600">₹{(item.qty * item.rate).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop layout */}
                          <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-2 group">
                            <div className="col-span-6">
                              <input
                                type="text"
                                className="w-full h-14 px-6 bg-transparent border border-transparent focus:border-purple-500 focus:bg-[var(--admin-bg-secondary)] rounded-2xl text-sm font-bold text-[var(--admin-text-primary)] transition-all outline-none"
                                placeholder="Describe product details..."
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                className="w-full h-14 bg-transparent border border-transparent focus:border-purple-500 focus:bg-[var(--admin-bg-secondary)] rounded-2xl text-base font-black text-[var(--admin-text-primary)] text-center transition-all outline-none"
                                value={item.qty}
                                onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full h-14 bg-transparent border border-transparent focus:border-purple-500 focus:bg-[var(--admin-bg-secondary)] rounded-2xl text-sm font-bold text-[var(--admin-text-primary)] text-center transition-all outline-none"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-2 pr-2">
                              <span className="text-xl font-black text-purple-600 flex-1 text-right">₹{(item.qty * item.rate).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl opacity-0 group-hover:opacity-100"
                              >
                                <MdClose className="text-xl" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right: Summary ── */}
                <div className="xl:col-span-4 xl:sticky xl:top-24 h-fit space-y-6">
                  <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-10 shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 border-b border-[var(--border-subtle)]">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <MdDescription className="text-lg sm:text-xl text-white" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-black text-[var(--admin-text-primary)] uppercase tracking-widest">Summary</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Line Items</span>
                        <span className="text-sm sm:text-base font-bold text-[var(--admin-text-primary)]">{quotationItems.length}</span>
                      </div>
                      <div className="pt-5 border-t border-[var(--border-subtle)] flex flex-col items-end">
                        <span className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-1">Total Estimate</span>
                        <p className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tighter">₹{subtotal.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8 space-y-3">
                      <button
                        onClick={handleCreateQuotation}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 sm:py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-purple-500/20 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><MdDescription className="text-lg sm:text-xl" /><span>Save Quotation</span></>
                        )}
                      </button>
                      <button
                        onClick={() => { setViewMode('list'); setEditId(null); }}
                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--border-main)] text-[var(--admin-text-secondary)] py-3.5 sm:py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all hover:text-[var(--admin-text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl md:rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800 italic text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs font-medium leading-relaxed">
                    Tip: Quoted prices are valid for 7 days. You can sync these to Tally once the customer confirms.
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN LIST VIEW ─── */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-5 sm:py-8 md:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight mb-1 sm:mb-2">
              Quotations
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-[var(--admin-text-secondary)] font-semibold uppercase tracking-wider">
              Manage Requests & Estimates
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-xl md:rounded-2xl shadow-sm hover:bg-purple-50 transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              <MdFileUpload className="text-lg sm:text-xl md:text-2xl flex-shrink-0" />
              <span className="uppercase tracking-wider">Import</span>
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl md:rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              <MdAdd className="text-lg sm:text-xl md:text-2xl flex-shrink-0" />
              <span className="uppercase tracking-wider">New Quotation</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 flex items-center gap-4 mb-6 sm:mb-8 md:mb-12 shadow-md">
          <div className="relative flex-1">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 text-xl sm:text-2xl" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Quotations..."
              className="w-full bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-purple-500 rounded-xl md:rounded-2xl h-11 sm:h-12 md:h-14 lg:h-16 pl-12 sm:pl-14 pr-4 text-sm md:text-base text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-secondary)] transition-all outline-none font-medium"
            />
          </div>
        </div>

        {/* Quotation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {quotations.length > 0 ? quotations.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-[var(--admin-bg-secondary)] border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 group relative shadow-lg shadow-slate-200/50 dark:shadow-none"
            >
              <div className="p-5 sm:p-6 md:p-8 lg:p-10">
                {/* Card Top */}
                <div className="flex items-start justify-between mb-5 sm:mb-6 md:mb-8 gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <MdInventory className="text-sm flex-shrink-0" /> QUOTE #{q.id}
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight group-hover:text-purple-600 transition-colors truncate">{q.customerName}</h3>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{q.customerPhone || 'No Contact'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">{q.date}</p>
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="flex items-center justify-between pt-4 sm:pt-5 md:pt-6 border-t border-slate-50 dark:border-slate-800 gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-0.5">Est. Value</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-purple-600 truncate">{q.total}</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleSendWhatsApp(q.id)}
                      disabled={sending === q.id}
                      className="p-2 sm:p-2.5 md:p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg sm:rounded-xl md:rounded-2xl transition-all shadow-sm"
                      title="Send via WhatsApp"
                    >
                      <MdSend className={`text-base sm:text-lg md:text-xl ${sending === q.id ? 'animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleEditQuotation(q)}
                      className="p-2 sm:p-2.5 md:p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg sm:rounded-xl md:rounded-2xl transition-all shadow-sm"
                      title="Edit Quotation"
                    >
                      <MdEdit className="text-base sm:text-lg md:text-xl" />
                    </button>
                    <button
                      onClick={() => openModal(q)}
                      className="p-2 sm:p-2.5 md:p-3 bg-slate-50 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg sm:rounded-xl md:rounded-2xl transition-all"
                      title="View Details"
                    >
                      <MdVisibility className="text-base sm:text-lg md:text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 sm:py-28 md:py-32 flex flex-col items-center justify-center text-center opacity-40">
              <MdDescription className="text-6xl sm:text-7xl md:text-9xl mb-3 sm:mb-4 text-purple-600" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-widest mb-1">No Quotations Found</h2>
              <button
                onClick={() => setViewMode('create')}
                className="mt-6 sm:mt-8 px-6 sm:px-8 py-3.5 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20"
              >
                Create First Quote
              </button>
            </div>
          )}
        </div>

        {/* ─── DETAIL MODAL ─── */}
        {isOpen && selectedQuotation && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-[var(--admin-bg-secondary)] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-10 border border-[var(--border-main)] animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300 max-h-[92vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-[var(--admin-text-secondary)] hover:text-red-500 rounded-full transition-all z-10"
              >
                <MdClose className="text-lg sm:text-xl" />
              </button>

              <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-5 sm:mb-7 text-[var(--admin-text-primary)] uppercase tracking-tight pr-8">Quotation #{selectedQuotation.id}</h2>

              <div className="space-y-5 sm:space-y-6 md:space-y-8">
                {/* Customer + Total */}
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-4 bg-[var(--admin-bg-primary)] p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl border border-[var(--border-subtle)]">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Customer / Party</p>
                    <p className="text-sm sm:text-base md:text-xl font-black text-[var(--admin-text-primary)] truncate">{selectedQuotation.customerName}</p>
                    {selectedQuotation.customerPhone && (
                      <p className="text-[10px] sm:text-xs font-bold text-purple-600 mt-0.5 uppercase tracking-widest">{selectedQuotation.customerPhone}</p>
                    )}
                  </div>
                  <div className="xs:text-right border-t xs:border-t-0 border-[var(--border-subtle)] pt-3 xs:pt-0 flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Quote Total</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-600 tracking-tighter">{selectedQuotation.total}</p>
                  </div>
                </div>

                {/* Items breakdown */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Breakdown of Estimate</p>
                  <div className="bg-[var(--admin-bg-primary)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
                    <div className="max-h-[280px] sm:max-h-[350px] overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-subtle)] sticky top-0">
                          <tr>
                            <th className="px-4 sm:px-5 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name</th>
                            <th className="hidden sm:table-cell px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                            <th className="hidden sm:table-cell px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Rate</th>
                            <th className="px-4 sm:px-5 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {(selectedQuotation.items || []).map((item, idx) => (
                            <tr key={idx} className="text-xs hover:bg-purple-50/10 transition-colors">
                              <td className="px-4 sm:px-5 py-3 sm:py-5">
                                <span className="font-bold text-[var(--admin-text-primary)] block leading-tight">{item.name}</span>
                                <span className="sm:hidden text-[9px] font-bold text-slate-400 uppercase mt-0.5 block">{item.qty} × ₹{item.rate?.toLocaleString()}</span>
                              </td>
                              <td className="hidden sm:table-cell px-5 py-5 text-center font-bold">×{item.qty}</td>
                              <td className="hidden sm:table-cell px-5 py-5 text-right font-bold text-slate-600">₹{item.rate?.toLocaleString()}</td>
                              <td className="px-4 sm:px-5 py-3 sm:py-5 text-right font-black text-purple-600">₹{(item.qty * item.rate).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row gap-3">
                <button
                  onClick={closeModal}
                  className="w-full xs:flex-1 py-3.5 sm:py-4 md:py-5 border-2 border-[var(--border-subtle)] rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)] hover:text-[var(--admin-text-primary)] transition-all order-2 xs:order-1"
                >
                  Close
                </button>
                <button
                  onClick={() => { handleSendWhatsApp(selectedQuotation.id); closeModal(); }}
                  className="w-full xs:flex-1 py-3.5 sm:py-4 md:py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 sm:gap-3 order-1 xs:order-2"
                >
                  <MdSend className="text-base sm:text-lg" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── IMPORT MODAL ─── */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--admin-bg-secondary)] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-10 w-full sm:max-w-lg border border-[var(--border-main)] animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">
                  {editId ? 'Update via File' : 'Import Quote'}
                </h3>
                <button
                  onClick={() => { setShowImportModal(false); if (viewMode !== 'create') setEditId(null); }}
                  className="p-2 sm:p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                  <MdClose className="text-lg sm:text-xl" />
                </button>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[var(--admin-text-secondary)] leading-relaxed mb-5 sm:mb-7">
                {editId
                  ? `Update the items for Quotation #${editId} by uploading a new file. Customer details will remain the same.`
                  : 'Upload an estimate file and provide customer details to generate a new system quotation.'}
              </p>

              <div className="space-y-5 sm:space-y-6">
                {!editId && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Customer Name</label>
                      <input
                        type="text"
                        className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border border-[var(--border-main)] focus:border-purple-500 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] outline-none transition-all"
                        placeholder="E.g. John Doe"
                        value={importCustomerName}
                        onChange={(e) => setImportCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Phone Number</label>
                      <input
                        type="text"
                        className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border border-[var(--border-main)] focus:border-purple-500 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[var(--admin-text-primary)] outline-none transition-all"
                        placeholder="+91..."
                        value={importCustomerPhone}
                        onChange={(e) => setImportCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Estimate File Selection</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="quotation-file"
                      className="hidden"
                      onChange={(e) => setImportFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="quotation-file"
                      className={`w-full min-h-[100px] sm:min-h-[120px] border-2 border-dashed rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-5 sm:p-6 cursor-pointer transition-all ${importFile
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                        : 'border-[var(--border-main)] hover:border-purple-500 hover:bg-[var(--admin-bg-primary)]'}`}
                    >
                      {importFile ? (
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <MdAttachFile className="text-2xl sm:text-3xl text-purple-600 animate-bounce" />
                          <span className="text-xs sm:text-sm font-black text-purple-600 text-center break-all px-4">{importFile.name}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to change file</span>
                        </div>
                      ) : (
                        <>
                          <MdFileUpload className="text-3xl sm:text-4xl text-slate-300 mb-2 sm:mb-3" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tap to upload estimate</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-7 sm:mt-10 flex flex-col xs:flex-row gap-3">
                <button
                  onClick={() => { setShowImportModal(false); if (viewMode !== 'create') setEditId(null); }}
                  className="w-full xs:flex-1 py-3.5 sm:py-4 md:py-5 bg-[var(--admin-bg-primary)] border border-[var(--border-main)] text-[var(--admin-text-secondary)] rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:text-[var(--admin-text-primary)] transition-all order-2 xs:order-1"
                >
                  Close
                </button>
                <button
                  onClick={handleImportQuotation}
                  disabled={importing || !importFile || (!editId && !importCustomerName)}
                  className="w-full xs:flex-1 py-3.5 sm:py-4 md:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed order-1 xs:order-2"
                >
                  {importing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><MdFileUpload className="text-lg sm:text-xl" /><span>Process Import</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminQuotations;