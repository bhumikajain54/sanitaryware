import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  MdSearch,
  MdVisibility,
  MdRefresh,
  MdAdd,
  MdClose,
  MdCheckCircle,
  MdDelete,
  MdEditNote,
  MdLocationOn,
  MdPeople,
  MdDescription,
  MdInventory,
  MdSave
} from 'react-icons/md';
import {
  useAdminFetch,
  useAdminSearch,
  useAdminToast,
  useAdminModal,
  useAdminPagination
} from '../../hooks/useAdmin';
import adminService from '../../services/adminService';

const AdminOrderDrafts = () => {
  const { success, error, info } = useAdminToast();
  const { isOpen, modalData: selectedDraft, openModal, closeModal } = useAdminModal();
  const [viewMode, setViewMode] = useState('list');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [editId, setEditId] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [draftItems, setDraftItems] = useState([{ id: 1, name: '', qty: '', rate: '' }]);

  const fetchDrafts = useCallback(async () => {
    try {
      const data = await adminService.getAdminOrderDrafts();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to load order drafts:', err);
      return [];
    }
  }, []);

  const { data: drafts, loading, refetch } = useAdminFetch(fetchDrafts, []);

  const formattedDrafts = useMemo(() => {
    return (drafts || []).map(d => ({
      ...d,
      date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A',
      location: d.tourLocation || 'N/A',
      totalValue: d.totalAmount || (d.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0)
    }));
  }, [drafts]);

  const searchKeys = useMemo(() => ['customerName', 'location', 'customerPhone'], []);
  const { searchTerm, setSearchTerm, filteredItems: searchedDrafts } = useAdminSearch(formattedDrafts, searchKeys);
  const { currentItems: pagedDrafts } = useAdminPagination(searchedDrafts, 50);

  const handleCreateNew = () => {
    setEditId(null);
    setCustomerName('');
    setCustomerPhone('');
    setLocation('');
    setNotes('');
    setDraftItems([{ id: 1, name: '', qty: '', rate: '' }]);
    setViewMode('edit');
  };

  const handleEditDraft = (draft) => {
    setEditId(draft.id);
    setCustomerName(draft.customerName || '');
    setCustomerPhone(draft.customerPhone || '');
    setLocation(draft.tourLocation || '');
    setNotes(draft.internalNotes || '');
    setDraftItems(draft.items?.length > 0 ? draft.items.map((item, idx) => ({
      ...item,
      id: item.id || `item-${idx}`,
      qty: item.quantity,
      rate: item.price
    })) : [{ id: 1, name: '', qty: '', rate: '' }]);
    setViewMode('edit');
  };

  const removeItem = (id) => {
    if (draftItems.length > 1) setDraftItems(draftItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setDraftItems(draftItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = draftItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
  const inputRefs = useRef({});

  const addItem = () => {
    const newId = Date.now();
    setDraftItems(prev => [...prev, { id: newId, name: '', qty: '', rate: '' }]);
    setTimeout(() => { if (inputRefs.current[newId]) inputRefs.current[newId].focus(); }, 50);
  };

  const handleKeyDown = (e, id, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const index = draftItems.findIndex(item => item.id === id);
      if (index === draftItems.length - 1) {
        addItem();
      } else {
        const nextId = draftItems[index + 1].id;
        if (inputRefs.current[nextId]) inputRefs.current[nextId].focus();
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!customerName) { error('Customer name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        customerName, customerPhone, tourLocation: location, internalNotes: notes,
        items: draftItems.map(item => ({
          name: item.name,
          quantity: parseInt(item.qty) || 0,
          rate: parseFloat(item.rate) || 0
        }))
      };
      if (editId) {
        await adminService.updateOrderDraft(editId, payload);
        success('Draft updated successfully');
      } else {
        await adminService.createOrderDraft(payload);
        success('Order draft saved to notepad');
      }
      setViewMode('list');
      refetch();
    } catch (err) {
      error(editId ? 'Failed to update draft' : 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async (id) => {
    if (window.confirm('Are you sure you want to delete this order note?')) {
      try {
        await adminService.deleteOrderDraft(id);
        success('Draft deleted');
        refetch();
      } catch (err) {
        error('Failed to delete draft');
      }
    }
  };

  const handleConfirmDraft = async (id) => {
    setConfirming(id);
    try {
      await adminService.confirmOrderDraft(id);
      success('Order confirmed & imported to system!');
      refetch();
    } catch (err) {
      error(err.message || 'Failed to confirm order');
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">

      {/* ─── CREATE / EDIT FULLSCREEN MODAL ─── */}
      {viewMode === 'edit' && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="relative w-full max-w-[1400px] bg-[var(--admin-bg-primary)] min-h-screen md:min-h-0 md:my-6 md:rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden border border-white/10">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[var(--admin-bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 md:px-12 py-4 sm:py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter truncate">
                  {editId ? 'Edit Order Note' : 'New Order Note'}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-widest mt-0.5">Digital Notepad • Tour Entry</p>
              </div>
              <button
                onClick={() => setViewMode('list')}
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

                  {/* Customer Details Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-10 shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 pb-5 border-b border-slate-50">
                      <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-teal-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-xl shadow-teal-500/30">
                        <MdPeople className="text-lg sm:text-2xl md:text-3xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-lg md:text-2xl font-black text-slate-800 uppercase tracking-tighter">Customer Details</h3>
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Tour & Party Identification</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                        <input
                          type="text"
                          className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border-none focus:ring-2 focus:ring-teal-500/20 rounded-xl md:rounded-2xl text-xs sm:text-sm font-bold text-slate-700 transition-all outline-none"
                          placeholder="Party name..."
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                        <input
                          type="text"
                          className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border-none focus:ring-2 focus:ring-teal-500/20 rounded-xl md:rounded-2xl text-xs sm:text-sm font-bold text-slate-700 transition-all outline-none"
                          placeholder="e.g Mumbai"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact</label>
                        <input
                          type="text"
                          className="w-full h-11 sm:h-12 md:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border-none focus:ring-2 focus:ring-teal-500/20 rounded-xl md:rounded-2xl text-xs sm:text-sm font-bold text-slate-700 transition-all outline-none"
                          placeholder="+91..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items Card */}
                  <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 sm:p-7 md:p-12 shadow-md">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-6 md:mb-10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-teal-600 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-xl shadow-teal-500/20">
                          <MdInventory className="text-lg sm:text-2xl md:text-3xl text-white" />
                        </div>
                        <h3 className="text-base sm:text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">Items List</h3>
                      </div>
                      <button
                        onClick={addItem}
                        className="w-full xs:w-auto px-6 py-3 bg-teal-600 text-white rounded-xl md:rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest active:scale-95 flex-shrink-0"
                      >
                        + Add Item
                      </button>
                    </div>

                    {/* Desktop column headers */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-3 mb-3">
                      <div className="col-span-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</div>
                      <div className="col-span-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</div>
                      <div className="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</div>
                      <div className="col-span-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pr-10">Total</div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {draftItems.map((item) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                          {/* Mobile / Tablet card */}
                          <div className="lg:hidden bg-slate-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Item</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <MdDelete className="text-base sm:text-lg" />
                              </button>
                            </div>
                            <input
                              ref={el => inputRefs.current[item.id] = el}
                              type="text"
                              className="w-full h-10 sm:h-11 px-4 bg-white border-none rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none"
                              placeholder="Product name..."
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.id, 'name')}
                            />
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Qty</label>
                                <input
                                  type="number"
                                  className="w-full h-9 sm:h-10 bg-white border-none rounded-xl text-xs sm:text-sm font-black text-slate-700 text-center outline-none"
                                  value={item.qty}
                                  onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, item.id, 'qty')}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Rate ₹</label>
                                <input
                                  type="number"
                                  className="w-full h-9 sm:h-10 bg-white border-none rounded-xl text-xs sm:text-sm font-bold text-slate-700 text-center outline-none"
                                  value={item.rate}
                                  onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, item.id, 'rate')}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center block">Total</label>
                                <div className="h-9 sm:h-10 flex items-center justify-center">
                                  <span className="text-sm font-black text-teal-600">₹{((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop row */}
                          <div className="hidden lg:grid grid-cols-12 gap-4 items-center bg-slate-50 rounded-2xl overflow-hidden group">
                            <div className="col-span-6">
                              <input
                                ref={el => inputRefs.current[item.id] = el}
                                type="text"
                                className="w-full h-14 px-6 bg-transparent border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all"
                                placeholder="Product name..."
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'name')}
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                className="w-full h-14 bg-transparent border-none rounded-2xl text-sm font-black text-slate-700 text-center outline-none focus:bg-white transition-all"
                                value={item.qty}
                                onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'qty')}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full h-14 bg-transparent border-none rounded-2xl text-sm font-bold text-slate-700 text-center outline-none focus:bg-white transition-all"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'rate')}
                              />
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-2 pr-3">
                              <span className="text-lg font-black text-teal-600 flex-1 text-right">₹{((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <MdDelete className="text-xl" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right: Sidebar ── */}
                <div className="xl:col-span-4 xl:sticky xl:top-24 h-fit space-y-6">

                  {/* Notes */}
                  <div className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-10 shadow-md">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-widest mb-4 sm:mb-5">Internal Notes</h3>
                    <textarea
                      className="w-full h-28 sm:h-32 p-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-700 outline-none resize-none"
                      placeholder="Special requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Total & Save */}
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1.5">Total Amount</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-8 tracking-tighter">₹{subtotal.toLocaleString()}</h2>
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="w-full py-4 sm:py-5 bg-white text-teal-700 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {saving
                        ? <div className="w-5 h-5 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                        : <><MdSave className="text-lg sm:text-2xl" /> Save Note</>
                      }
                    </button>
                    <p className="text-[10px] text-white/50 text-center mt-4 sm:mt-6 uppercase font-bold italic">Drafts do not deduct stock.</p>
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
          <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
            <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-600 flex items-center justify-center rounded-xl sm:rounded-2xl shadow-xl shadow-teal-500/20 flex-shrink-0">
              <MdEditNote className="text-2xl sm:text-3xl md:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tighter uppercase">
                Order <span className="text-teal-600">Notepad</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mt-0.5">
                <span className="hidden sm:block w-4 md:w-6 h-[2px] bg-teal-600" />
                Pro Field Tour Entry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => refetch()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-white text-slate-600 font-bold rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
            >
              <MdRefresh className="text-lg sm:text-xl md:text-2xl text-teal-600 flex-shrink-0" />
              <span className="uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">Sync</span>
            </button>
            <button
              onClick={handleCreateNew}
              className="flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-teal-600 text-white font-black rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl shadow-teal-500/30 hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap"
            >
              <MdAdd className="text-xl sm:text-2xl flex-shrink-0" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Write Note</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] p-4 sm:p-5 mb-8 sm:mb-12 md:mb-16 shadow-xl shadow-slate-200/50 max-w-4xl">
          <div className="relative">
            <MdSearch className="absolute left-4 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 text-teal-600 text-xl sm:text-2xl md:text-3xl" />
            <input
              type="text"
              className="w-full h-11 sm:h-13 md:h-16 pl-12 sm:pl-14 md:pl-16 pr-5 sm:pr-8 bg-slate-50 rounded-xl sm:rounded-2xl text-sm md:text-base font-bold text-slate-700 outline-none border-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-300 placeholder:font-medium"
              placeholder="Search by customer, location or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {pagedDrafts.length > 0 ? pagedDrafts.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group relative shadow-lg shadow-slate-200/50"
            >
              <div className="p-5 sm:p-7 md:p-10">

                {/* Card Top */}
                <div className="flex items-start justify-between mb-5 sm:mb-6 md:mb-8 gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <MdLocationOn className="text-sm flex-shrink-0" />
                      <span className="truncate">{d.location || 'No Location'}</span>
                    </span>
                    <h3 className="text-base sm:text-lg md:text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight truncate">{d.customerName}</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 mt-1 truncate">{d.customerPhone || 'No Phone'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-[10px] sm:text-xs font-black text-slate-700 whitespace-nowrap">{d.date}</p>
                  </div>
                </div>

                {/* Item Tags */}
                <div className="space-y-3 mb-5 sm:mb-6 md:mb-8">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {d.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="px-2.5 sm:px-3 py-1 bg-[var(--admin-bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[9px] sm:text-[10px] font-bold text-[var(--admin-text-secondary)]">
                        {item.qty || item.quantity}× {item.name}
                      </span>
                    ))}
                    {d.items?.length > 3 && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 self-center">+{d.items.length - 3} more</span>
                    )}
                  </div>
                  {d.notes && (
                    <p className="text-[10px] sm:text-xs font-medium text-[var(--admin-text-secondary)] line-clamp-2 italic">"{d.notes}"</p>
                  )}
                </div>

                {/* Card Bottom */}
                <div className="flex items-center justify-between pt-4 sm:pt-5 md:pt-8 border-t border-slate-50 gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Est. Value</p>
                    <p className="text-xl sm:text-2xl font-black text-teal-600 truncate">₹{d.totalValue?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleEditDraft(d)}
                      className="p-2.5 sm:p-3 md:p-4 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl sm:rounded-2xl transition-all"
                      title="Open Note"
                    >
                      <MdEditNote className="text-xl sm:text-2xl md:text-3xl" />
                    </button>
                    <button
                      onClick={() => handleConfirmDraft(d.id)}
                      disabled={confirming === d.id}
                      className="p-2.5 sm:p-3 md:p-4 bg-teal-600 text-white hover:bg-teal-700 rounded-xl sm:rounded-2xl shadow-xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
                      title="Confirm Draft"
                    >
                      {confirming === d.id
                        ? <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <MdCheckCircle className="text-xl sm:text-2xl md:text-3xl" />
                      }
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(d.id)}
                      className="p-2.5 sm:p-3 md:p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl sm:rounded-2xl transition-all"
                    >
                      <MdDelete className="text-lg sm:text-xl md:text-2xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 sm:py-28 md:py-32 flex flex-col items-center justify-center text-center opacity-40">
              <MdEditNote className="text-6xl sm:text-7xl md:text-9xl mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-widest">Your notepad is empty</h2>
              <p className="text-xs sm:text-sm font-bold mt-1.5 sm:mt-2">Start writing down orders as you receive them on tour.</p>
              <button
                onClick={handleCreateNew}
                className="mt-6 sm:mt-8 px-6 sm:px-8 py-3.5 sm:py-4 bg-teal-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-500/20"
              >
                Write First Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDrafts;