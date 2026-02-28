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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [editId, setEditId] = useState(null);

  // Form State
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
  const { searchTerm, setSearchTerm, filteredItems: searchedDrafts } = useAdminSearch(
    formattedDrafts,
    searchKeys
  );

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
    if (draftItems.length > 1) {
      setDraftItems(draftItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setDraftItems(draftItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = draftItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
  const inputRefs = useRef({});

  const addItem = () => {
    const newId = Date.now();
    setDraftItems([...draftItems, { id: newId, name: '', qty: '', rate: '' }]);
    // Use timeout to allow React to render the new row before focusing
    setTimeout(() => {
      if (inputRefs.current[newId]) {
        inputRefs.current[newId].focus();
      }
    }, 50);
  };

  const handleKeyDown = (e, id, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If we're on the last item, add a new one
      const index = draftItems.findIndex(item => item.id === id);
      if (index === draftItems.length - 1) {
        addItem();
      } else {
        // Otherwise move to the next item's name field
        const nextId = draftItems[index + 1].id;
        if (inputRefs.current[nextId]) {
          inputRefs.current[nextId].focus();
        }
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!customerName) {
      error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        tourLocation: location,
        internalNotes: notes,
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

  if (viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-[var(--admin-bg-primary)] p-4 sm:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100/50 shadow-sm">
                <MdEditNote className="text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
                  {editId ? 'Edit Order Note' : 'New Order Note'}
                </h1>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Digital Notepad • Tour Entry</p>
              </div>
            </div>
            <button 
              onClick={() => setViewMode('list')}
              className="p-3 bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl hover:text-red-500 transition-all shadow-sm"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Side */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-5 mb-12 pb-8 border-b border-slate-50">
                  <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/30">
                    <MdPeople className="text-3xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Customer Details</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Tour & Party Identification</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Customer Full Name</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-7 bg-white border border-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none shadow-sm"
                      placeholder="Enter party name..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Location / Trip Name</label>
                    <div className="relative">
                      <MdLocationOn className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-600 text-xl" />
                      <input 
                        type="text"
                        className="w-full h-14 pl-14 pr-7 bg-white border border-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none shadow-sm"
                        placeholder="e.g. Mumbai Tour 2024"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-3">Contact Number</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-7 bg-white border border-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-50/50 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none shadow-sm"
                      placeholder="+91..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3.5rem] p-10 sm:p-14 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.06)]">
                 <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20">
                        <MdInventory className="text-3xl text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Order Items</h3>
                    </div>
                    <button 
                      onClick={addItem}
                      className="px-8 py-3 bg-teal-600 text-white rounded-full text-[11px] font-black hover:bg-teal-700 transition-all uppercase tracking-[0.15em] shadow-lg shadow-teal-500/10 active:scale-95"
                    >
                      + Add Item
                    </button>
                 </div>

                 <div className="space-y-8">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-6 px-4">
                       <div className="col-span-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item / Description</div>
                       <div className="col-span-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</div>
                       <div className="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rate</div>
                       <div className="col-span-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-10">Total</div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-4">
                      {draftItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center group animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <div className="col-span-6">
                              <input 
                                ref={el => inputRefs.current[item.id] = el}
                                type="text"
                                className="w-full h-16 px-8 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 rounded-2xl text-base font-bold text-slate-700 transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                                placeholder="Product name... (Press Enter for next line)"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'name')}
                              />
                           </div>
                           <div className="col-span-1">
                              <input 
                                type="number"
                                className="w-full h-16 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 rounded-2xl text-base font-black text-slate-700 text-center transition-all outline-none"
                                value={item.qty}
                                onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'qty')}
                              />
                           </div>
                           <div className="col-span-2">
                              <input 
                                type="number"
                                className="w-full h-16 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 rounded-2xl text-base font-bold text-slate-700 text-center transition-all outline-none"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id, 'rate')}
                              />
                           </div>
                           <div className="col-span-3 flex items-center justify-end gap-3">
                              <div className="text-right flex-1 pr-2">
                                <span className="text-xl font-black text-teal-600">₹{((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toLocaleString()}</span>
                              </div>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="p-3 text-slate-200 hover:text-red-500 transition-all"
                              >
                                <MdDelete className="text-2xl" />
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Note & Summary Side */}
            <div className="space-y-8">
               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                      <MdDescription className="text-2xl text-white" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Internal Notes</h3>
                  </div>
                  <textarea 
                    className="w-full h-48 p-6 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none resize-none"
                    placeholder="Write special requirements or tour mentions here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
               </div>

                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-500/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-3 ml-1">Proposed Total Estimate</p>
                  <h2 className="text-5xl font-black mb-12 tracking-tighter">₹{subtotal.toLocaleString()}</h2>
                  <div className="space-y-4">
                     <button 
                       onClick={handleSaveDraft}
                       disabled={saving}
                       className="w-full py-5 bg-white text-teal-700 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-teal-50 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-black/5"
                     >
                       {saving ? <div className="w-6 h-6 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" /> : <><MdSave className="text-2xl" /> Save Note to App</>}
                     </button>
                     <p className="text-[10px] font-bold text-white/50 text-center uppercase tracking-[0.15em] px-4 leading-relaxed italic">Drafts are saved locally & do not deduct stock until you confirm them from the list view.</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-12 py-6 sm:py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-5 sm:gap-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-600 flex items-center justify-center rounded-2xl shadow-xl shadow-teal-500/20">
              <MdEditNote className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight tracking-tighter mb-1">
                Order <span className="text-teal-600">Notepad</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-[2px] bg-teal-600"></span> Pro Field Tour Edition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => refetch()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-4 px-8 py-5 bg-white text-slate-600 font-bold rounded-3xl shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all active:scale-95 border border-slate-100"
            >
              <MdRefresh className="text-2xl text-teal-600" />
              <span className="hidden sm:inline uppercase tracking-[0.2em] text-[10px]">Sync Notepad</span>
            </button>
            <button
              onClick={handleCreateNew}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-4 px-10 py-5 bg-teal-600 text-white font-black rounded-3xl shadow-2xl shadow-teal-500/30 hover:bg-teal-700 transition-all active:scale-95"
            >
              <MdAdd className="text-2xl" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Write Note</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 mb-16 shadow-xl shadow-slate-200/50 max-w-4xl">
          <div className="relative">
            <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-600 text-3xl" />
            <input 
              type="text" 
              className="w-full h-16 pl-16 pr-8 bg-slate-50 rounded-2xl text-base font-bold text-slate-700 outline-none border-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-300 placeholder:font-medium"
              placeholder="Search by customer, location or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Draft List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {pagedDrafts.length > 0 ? pagedDrafts.map((d) => (
             <div key={d.id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group relative shadow-xl shadow-slate-200/50">
                <div className="p-10">
                  <div className="flex items-start justify-between mb-8">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                           <MdLocationOn className="text-base" /> {d.location || 'No Location'}
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">{d.customerName}</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">{d.customerPhone || 'No Phone'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Entry Date</p>
                        <p className="text-xs font-black text-slate-700">{d.date}</p>
                     </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                       {d.items?.slice(0, 3).map((item, idx) => (
                         <span key={idx} className="px-3 py-1 bg-[var(--admin-bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-bold text-[var(--admin-text-secondary)]">
                            {item.qty}x {item.name}
                         </span>
                       ))}
                       {d.items?.length > 3 && <span className="text-[10px] font-bold text-amber-500">+{d.items.length - 3} more</span>}
                    </div>
                    {d.notes && <p className="text-xs font-medium text-[var(--admin-text-secondary)] line-clamp-2 italic">"{d.notes}"</p>}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Est. Value</p>
                        <p className="text-2xl font-black text-teal-600">₹{d.totalValue?.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEditDraft(d)}
                          className="p-4 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-all"
                          title="Open Note"
                        >
                          <MdEditNote className="text-3xl" />
                        </button>
                        <button 
                          onClick={() => handleConfirmDraft(d.id)}
                          disabled={confirming === d.id}
                          className="p-4 bg-teal-600 text-white hover:bg-teal-700 rounded-2xl shadow-xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
                          title="Confirm Draft"
                        >
                          {confirming === d.id ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdCheckCircle className="text-3xl" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteDraft(d.id)}
                          className="p-4 text-slate-200 hover:text-red-500 rounded-2xl transition-all"
                        >
                          <MdDelete className="text-2xl" />
                        </button>
                     </div>
                  </div>
                </div>
             </div>
           )) : (
             <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40">
                <MdEditNote className="text-9xl mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-widest">Your notepad is empty</h2>
                <p className="text-sm font-bold mt-2">Start writing down orders as you receive them on tour.</p>
                <button 
                  onClick={handleCreateNew}
                  className="mt-8 px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-500/20"
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
