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
  MdEdit
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'
  const [sending, setSending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importCustomerName, setImportCustomerName] = useState('');
  const [importCustomerPhone, setImportCustomerPhone] = useState('');

  // Creation State
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

  // Filters
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

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-12 py-6 sm:py-10">
          
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight mb-2">
                {editId ? 'Edit Quotation' : 'Create Quotation'}
              </h1>
              <p className="text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                {editId ? `Updating Quote #${editId}` : 'Generate Cost Estimate'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {editId && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-6 py-4 bg-purple-50 text-purple-600 border border-purple-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-purple-100 transition-all flex items-center gap-2"
                >
                  <MdFileUpload /> Update via File
                </button>
              )}
              <button
                onClick={() => { setViewMode('list'); setEditId(null); }}
                className="p-3 sm:p-4 bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[var(--admin-text-secondary)] hover:text-red-500 transition-all font-bold"
              >
                <MdClose className="text-2xl sm:text-3xl" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Form */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Customer Info */}
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <MdPeople className="text-2xl text-purple-600" />
                  <h3 className="text-xl font-bold">Customer Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Customer Name</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-purple-500 rounded-2xl text-sm font-bold outline-none transition-all"
                      placeholder="Enter name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Phone Number (Optional)</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-5 bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-purple-500 rounded-2xl text-sm font-bold outline-none transition-all"
                      placeholder="+91..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <MdInventory className="text-2xl text-purple-600" />
                    <h3 className="text-xl font-bold">Quotation Items</h3>
                  </div>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all uppercase tracking-wider"
                  >
                    <MdAdd /> Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-left">
                        <th className="pb-4 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Item Description</th>
                        <th className="pb-4 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest w-24">Qty</th>
                        <th className="pb-4 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest w-40">Rate (₹)</th>
                        <th className="pb-4 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest w-40 text-right">Total</th>
                        <th className="pb-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {quotationItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4 pr-4">
                            <input 
                              type="text"
                              className="w-full h-12 px-4 bg-[var(--admin-bg-primary)] rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-purple-500 placeholder:text-slate-300"
                              placeholder="Describe item..."
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            />
                          </td>
                          <td className="py-4 pr-4">
                            <input 
                              type="number"
                              className="w-full h-12 px-4 bg-[var(--admin-bg-primary)] rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-purple-500 text-center"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 pr-4">
                            <input 
                              type="number"
                              className="w-full h-12 px-4 bg-[var(--admin-bg-primary)] rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-purple-500"
                              min="0"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 text-right font-black text-purple-600">
                            ₹{(item.qty * item.rate).toLocaleString()}
                          </td>
                          <td className="py-4 pl-4">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-600 transition-colors text-xl font-bold"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="col-span-12 lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-24">
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-subtle)] pb-4">
                  <MdDescription className="text-2xl text-purple-600" />
                  <h3 className="text-xl font-bold">Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Line Items</span>
                    <span className="text-base font-bold">{quotationItems.length}</span>
                  </div>
                  <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-between items-end">
                    <span className="text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mb-1">Total Estimate</span>
                    <div className="text-right">
                      <p className="text-4xl font-black text-purple-600 tracking-tighter">₹{subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <button 
                    onClick={handleCreateQuotation}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 py-4 rounded-2xl shadow-xl shadow-purple-500/20 font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MdDescription className="text-xl" />
                        <span>Save Quotation</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => { setViewMode('list'); setEditId(null); }}
                    className="w-full bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800 italic text-purple-600 dark:text-purple-400 text-sm font-medium">
                Tip: Quoted prices are valid for 7 days. You can sync these to Tally once the customer confirms.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-12 py-6 sm:py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight mb-2">
              Quotations
            </h1>
            <p className="text-sm sm:text-base text-[var(--admin-text-secondary)] font-semibold uppercase tracking-wider">
              Manage Requests & Estimates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              className="hidden sm:inline-flex items-center gap-3 px-6 py-4 bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)] border border-[var(--border-main)] font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-[var(--card-hover)] transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <MdRefresh className="text-xl sm:text-2xl" />
              <span className="uppercase tracking-wider">Refresh</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-3 px-6 py-4 bg-white border-2 border-purple-600 text-purple-600 font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-purple-50 transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <MdFileUpload className="text-xl sm:text-2xl" />
              <span className="uppercase tracking-wider">Import</span>
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <MdAdd className="text-xl sm:text-2xl" />
              <span className="uppercase tracking-wider">New Quotation</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-8 sm:mb-12 shadow-lg">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-600 text-2xl" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Quotations..." 
              className="w-full bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-purple-500 rounded-xl sm:rounded-2xl h-14 sm:h-16 pl-14 pr-4 text-sm sm:text-base text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-secondary)] transition-all outline-none font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)] border-b border-[var(--border-main)]">
                  <th className="px-6 py-6 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">ID</th>
                  <th className="px-6 py-6 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-6 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-6 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Total</th>
                  <th className="px-6 py-6 text-right text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {quotations.length > 0 ? quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-[var(--admin-bg-primary)] transition-colors">
                    <td className="px-6 py-6 font-bold text-[var(--admin-text-primary)]">#{q.id}</td>
                    <td className="px-6 py-6 font-bold text-[var(--admin-text-primary)]">{q.customerName}</td>
                    <td className="px-6 py-6 text-[var(--admin-text-secondary)]">{q.date}</td>
                    <td className="px-6 py-6 font-black text-purple-600">{q.total}</td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleSendWhatsApp(q.id)}
                           disabled={sending === q.id}
                           className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                           title="Send via WhatsApp"
                         >
                           <MdSend className={sending === q.id ? "animate-pulse" : ""} />
                         </button>
                         <button 
                            onClick={() => handleEditQuotation(q)}
                            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Quotation"
                          >
                            <MdEdit />
                          </button>
                         <button 
                           onClick={() => openModal(q)}
                           className="p-3 text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-primary)] rounded-xl transition-all"
                           title="View Details"
                         >
                           <MdVisibility />
                         </button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest">
                      No Quotations Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isOpen && selectedQuotation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="relative w-full max-w-2xl bg-[var(--admin-bg-secondary)] rounded-3xl shadow-2xl p-8 border border-[var(--border-main)]">
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><MdClose /></button>
                <h2 className="text-2xl font-black mb-6">Quotation #{selectedQuotation.id}</h2>
                <div className="space-y-6">
                   <div className="flex justify-between items-center bg-[var(--admin-bg-primary)] p-4 rounded-xl border border-[var(--border-subtle)]">
                     <div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                       <p className="text-lg font-black">{selectedQuotation.customerName}</p>
                       {selectedQuotation.customerPhone && <p className="text-xs font-bold text-slate-500">{selectedQuotation.customerPhone}</p>}
                     </div>
                     <div className="text-right">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                       <p className="text-2xl font-black text-purple-600">{selectedQuotation.total}</p>
                     </div>
                   </div>

                   {/* Item Listing */}
                   <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estimate Breakdown</p>
                     <div className="bg-[var(--admin-bg-primary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
                       <table className="w-full text-left">
                         <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-subtle)]">
                           <tr>
                             <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Item</th>
                             <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                             <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-right">Rate</th>
                             <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[var(--border-subtle)]">
                           {(selectedQuotation.items || []).map((item, idx) => (
                             <tr key={idx} className="text-xs font-bold">
                               <td className="px-4 py-3">{item.name}</td>
                               <td className="px-4 py-3 text-center">x{item.qty}</td>
                               <td className="px-4 py-3 text-right">₹{item.rate?.toLocaleString()}</td>
                               <td className="px-4 py-3 text-right font-black text-purple-600">₹{(item.qty * item.rate).toLocaleString()}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button onClick={closeModal} className="flex-1 py-4 border-2 border-[var(--border-subtle)] rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[var(--admin-bg-primary)] transition-all">Close</button>
                  <button 
                    onClick={() => { handleSendWhatsApp(selectedQuotation.id); closeModal(); }} 
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MdSend />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--admin-bg-secondary)] rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-[var(--border-main)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[var(--admin-text-primary)]">
                    {editId ? 'Update via File' : 'Import Quotation'}
                </h3>
                <button onClick={() => { setShowImportModal(false); if (viewMode !== 'create') setEditId(null); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                  <MdClose className="text-2xl" />
                </button>
              </div>
              
              <p className="text-[var(--admin-text-secondary)] mb-8 text-sm font-medium">
                  {editId 
                    ? `Update the items for Quotation #${editId} by uploading a new file. Customer details will remain the same.`
                    : 'Upload a valid estimate file and provide customer details to import a new quotation into the system.'
                  }
              </p>
              
              <div className="space-y-6">
                {!editId && (
                  <>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Customer Name</label>
                       <input 
                         type="text"
                         className="w-full h-14 px-5 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-purple-500 rounded-2xl text-sm font-bold outline-none"
                         placeholder="E.g. John Doe"
                         value={importCustomerName}
                         onChange={(e) => setImportCustomerName(e.target.value)}
                       />
                     </div>
     
                     <div className="space-y-2">
                       <label className="text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Customer Phone (Optional)</label>
                       <input 
                         type="text"
                         className="w-full h-14 px-5 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-purple-500 rounded-2xl text-sm font-bold outline-none"
                         placeholder="+91..."
                         value={importCustomerPhone}
                         onChange={(e) => setImportCustomerPhone(e.target.value)}
                       />
                     </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest ml-1">Select File</label>
                  <div className="relative">
                    <input 
                      type="file"
                      id="quotation-file"
                      className="hidden"
                      onChange={(e) => setImportFile(e.target.files[0])}
                    />
                    <label 
                      htmlFor="quotation-file"
                      className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        importFile ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-[var(--border-main)] hover:border-purple-400'
                      }`}
                    >
                      {importFile ? (
                        <div className="flex items-center gap-3">
                          <MdAttachFile className="text-2xl text-purple-600" />
                          <span className="text-sm font-bold text-purple-600 truncate max-w-[200px]">{importFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <MdFileUpload className="text-2xl text-slate-400 mb-1" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Estimate File</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => { setShowImportModal(false); if (viewMode !== 'create') setEditId(null); }}
                  className="flex-1 py-4 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] rounded-2xl font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImportQuotation}
                  disabled={importing || !importFile || (!editId && !importCustomerName)}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {importing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MdFileUpload className="text-xl" />
                      <span>Process Import</span>
                    </>
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
