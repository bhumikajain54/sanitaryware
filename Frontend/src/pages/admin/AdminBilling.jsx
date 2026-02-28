import { useState, useCallback, useMemo } from 'react';
import { 
  MdSearch, 
  MdAdd, 
  MdReceipt, 
  MdFileDownload, 
  MdSync, 
  MdVisibility,
  MdFilterList,
  MdRefresh,
  MdPrint,
  MdClose,
  MdCheckCircle,
  MdInfo,
  MdSend
} from 'react-icons/md';
import { 
  useAdminFetch, 
  useAdminSearch, 
  useAdminToast,
  useAdminModal,
  useAdminPagination
} from '../../hooks/useAdmin';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import AdminFilterPanel from '../../components/admin/AdminFilterPanel';
import adminService from '../../services/adminService';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import {
  getAllInvoices,
  generateInvoice,
  syncInvoiceToTally,
  syncAllInvoicesToTally,
  getUnsyncedInvoices
} from '../../services/additionalServices';

const AdminBilling = () => {
  const { success, error, info } = useAdminToast();
  const { isOpen, modalData: selectedInvoice, openModal, closeModal } = useAdminModal();
  const [viewMode, setViewMode] = useState('list');
  const [refreshing, setRefreshing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [localSyncedInvoices, setLocalSyncedInvoices] = useState(new Set());
  const [generateOrderId, setGenerateOrderId] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Invoice Form States
  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, name: '', qty: 1, rate: 0, tax: 18 }
  ]);

  // Data for Invoices - Use real API
  const fetchInvoices = useCallback(async () => {
    try {
      const data = await getAllInvoices();
      const list = Array.isArray(data) ? data : [];
      return list.map(inv => ({
          ...inv,
          synced: localSyncedInvoices.has(inv.id) || inv.tallySynced || inv.synced,
          invoiceNo: inv.invoiceNumber || inv.invoiceNo,
          customer: inv.customerName || inv.customer,
          // Robust Money Formatting
          totalValue: inv.totalAmount || inv.total || 0,
          total: (inv.totalAmount || inv.total || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
          taxValue: inv.taxTotal || inv.gst || 0,
          tax: (inv.taxTotal || inv.gst || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
          date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : inv.date
      }));
    } catch (err) {
      console.error('Failed to load invoices:', err);
      return [];
    }
  }, [localSyncedInvoices]);

  const { data: rawInvoices, loading, refetch } = useAdminFetch(fetchInvoices, [localSyncedInvoices]);

  // Fetch Billing Stats
  const { data: billingStats, loading: loadingStats } = useAdminFetch(
    adminService.getBillingStats,
    []
  );

  const { 
    searchTerm, 
    setSearchTerm, 
    filteredItems: searchedInvoices 
  } = useAdminSearch(rawInvoices || [], ['invoiceNo', 'customer']);

  // Filter configuration
  const filterConfig = useMemo(() => ({
    synced: {
        label: 'Sync Status',
        field: 'synced',
        type: 'boolean',
        placeholder: 'All Status',
        options: [
            { value: 'true', label: 'Synced to Tally' },
            { value: 'false', label: 'Pending Sync' }
        ]
    }
  }), []);

  // Apply filters
  const {
    showFilters,
    toggleFilters,
    filters,
    filteredItems: filteredInvoices,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    activeFilters
  } = useAdminFilter(searchedInvoices, filterConfig);

  // Pagination if needed (though not currently used in this file's table, it's good practice)
  const { currentItems: invoices } = useAdminPagination(filteredInvoices, 100);

  const handleSyncInvoice = async (id) => {
    setSyncingId(id);
    info('Syncing invoice to Tally...');
    try {
      await syncInvoiceToTally(id);
      setLocalSyncedInvoices(prev => new Set(prev).add(id));
      success('Invoice synced to Tally successfully');
      refetch(); // Refresh the list
    } catch (err) {
      console.error('Sync error:', err);
      error(err.message || 'Failed to sync invoice to Tally');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSendWhatsApp = async (id) => {
    setSendingId(id);
    info('Sending invoice via WhatsApp...');
    try {
      await adminService.sendInvoiceWhatsApp(id);
      success('Invoice sent to customer via WhatsApp');
    } catch (err) {
      error('Failed to send WhatsApp message');
    } finally {
      setSendingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    info('Refreshing records...');
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleViewInvoice = (inv) => {
    openModal(inv);
  };

  const handleGenerateFromOrder = async () => {
    if (!generateOrderId) return;
    
    info(`Generating invoice for Order #${generateOrderId}...`);
    try {
      await adminService.generateInvoice(generateOrderId);
      success('Invoice generated successfully from Order');
      setShowGenerateModal(false);
      setGenerateOrderId('');
      refetch();
    } catch (err) {
      error(err.message || 'Failed to generate invoice. Check Order ID.');
    }
  };

  // Invoice Form Helper Functions
  const addItem = () => {
    console.log('Add Item clicked');
    setInvoiceItems([
      ...invoiceItems,
      { id: Date.now(), name: '', qty: 1, rate: 0, tax: 18 }
    ]);
  };

  const removeItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (index, field, value) => {
    const items = [...invoiceItems];
    items[index][field] = value;
    setInvoiceItems(items);
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxTotal = invoiceItems.reduce((sum, item) => sum + item.qty * item.rate * (item.tax / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const handleSaveInvoice = async () => {
    if (!customerName) {
      error('Please enter customer name');
      return;
    }

    setSaving(true);
    info('Recording transaction & preparing Tally XML...');
    
    try {
      const payload = {
        customerName,
        gstin,
        billingAddress,
        items: invoiceItems,
        subtotal,
        taxTotal,
        grandTotal,
        date: new Date().toISOString().split('T')[0]
      };

      await adminService.createInvoice(payload);
      await new Promise(resolve => setTimeout(resolve, 1500));
      success('Invoice generated and pushed to Tally ERP');
      
      // Reset form
      setCustomerName('');
      setGstin('');
      setBillingAddress('');
      setInvoiceItems([{ id: 1, name: '', qty: 1, rate: 0, tax: 18 }]);
      setViewMode('list');
      refetch();
    } catch (err) {
      error('Invoicing failed');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
   const handleDownloadPDF = (inv) => {
    info(`Generating official PDF for ${inv.invoiceNo}...`);
    try {
        generateInvoicePDF(inv, 'download');
        success('Invoice PDF saved to downloads');
    } catch (err) {
        error('PDF generation failed');
        console.error(err);
    }
  };

  const handlePrintInvoice = (inv) => {
    info(`Preparing print session for ${inv.invoiceNo}...`);
    try {
        generateInvoicePDF(inv, 'print');
        success('Print preview opened in new tab');
    } catch (err) {
        error('Print session failed');
    }
  };

  // Create Invoice View
  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-[var(--admin-bg-primary)] transition-colors duration-300">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-12 py-6 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-6 mb-8 sm:mb-12">
            <div>
              <button 
                onClick={() => setViewMode('list')} 
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-sm sm:text-base mb-2 transition-all"
              >
                <span className="text-xl">←</span>
                <span>Back to Invoices</span>
              </button>
              <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight mb-2">
                Create New Invoice
              </h1>
              <p className="text-sm sm:text-base text-[var(--admin-text-secondary)] font-semibold uppercase tracking-wider">
                Generate Tax Invoice
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column - Form */}
            <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
              
              {/* Customer Details */}
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl sm:rounded-2xl">
                    <MdReceipt className="text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--admin-text-primary)]">Customer Details</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider ml-1 mb-2 block">
                      Customer Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full h-12 sm:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-teal-500 rounded-xl sm:rounded-2xl transition-all text-sm font-bold text-[var(--admin-text-primary)] outline-none" 
                      placeholder="Customer Name" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider ml-1 mb-2 block">
                      GSTIN (Optional)
                    </label>
                    <input 
                      type="text" 
                      className="w-full h-12 sm:h-14 px-4 sm:px-5 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-teal-500 rounded-xl sm:rounded-2xl transition-all text-sm font-bold text-[var(--admin-text-primary)] uppercase outline-none" 
                      placeholder="GSTIN No." 
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider ml-1 mb-2 block">
                      Billing Address
                    </label>
                    <textarea 
                      className="w-full h-24 sm:h-24 p-4 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-teal-500 rounded-xl sm:rounded-2xl transition-all text-sm font-bold text-[var(--admin-text-primary)] resize-none outline-none" 
                      placeholder="Street, City, PIN..."
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6 bg-teal-50/30 dark:bg-teal-900/10 border-b border-teal-50 dark:border-teal-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MdAdd className="text-xl sm:text-2xl text-teal-600" />
                    <h3 className="font-bold text-teal-800 dark:text-teal-400 text-sm sm:text-base uppercase tracking-wider">Invoice Items</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={addItem} 
                    className="text-xs sm:text-sm font-black bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-teal-700 transition active:scale-95 uppercase tracking-wider"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--admin-bg-primary)]">
                      <tr>
                        <th className="px-4 py-3 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-wider text-left">Item</th>
                        <th className="px-4 py-3 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-3 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-3 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-wider text-center">GST %</th>
                        <th className="px-4 py-3 text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-wider text-right">Total</th>
                        <th className="px-2 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {invoiceItems.map((item, i) => (
                        <tr key={item.id} className="hover:bg-[var(--admin-bg-primary)] transition-colors border-t border-[var(--border-subtle)]">
                          <td className="p-4">
                            <input 
                              type="text" 
                              className="w-full bg-transparent border-b border-transparent focus:border-teal-500 rounded-none text-sm font-bold text-[var(--admin-text-primary)] p-1 outline-none transition-colors" 
                              placeholder="Item name" 
                              value={item.name}
                              onChange={(e) => updateItem(i, 'name', e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="number" 
                              className="w-16 bg-transparent border border-[var(--border-subtle)] rounded-lg text-sm font-bold text-center text-[var(--admin-text-primary)] p-1.5 outline-none focus:border-teal-500" 
                              value={item.qty} 
                              onChange={(e) => updateItem(i, 'qty', +e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-right">
                            <input 
                              type="number" 
                              className="w-24 bg-transparent border border-[var(--border-subtle)] rounded-lg text-sm font-bold text-right text-[var(--admin-text-primary)] p-1.5 outline-none focus:border-teal-500" 
                              value={item.rate} 
                              onChange={(e) => updateItem(i, 'rate', +e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <select 
                              className="bg-transparent border border-[var(--border-subtle)] rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer text-teal-700 dark:text-teal-400 p-1.5 outline-none focus:border-teal-500" 
                              value={item.tax} 
                              onChange={(e) => updateItem(i, 'tax', +e.target.value)}
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </td>
                          <td className="p-4 text-right font-black text-teal-600 text-sm">
                            ₹{(item.qty * item.rate * (1 + item.tax / 100)).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => removeItem(item.id)} 
                              className="w-8 h-8 flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all text-lg"
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
            <div className="col-span-12 lg:col-span-4 sticky top-6 sm:top-24 h-fit">
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
                <div className="pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-[var(--border-subtle)] flex items-center gap-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl sm:rounded-2xl">
                    <MdReceipt className="text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--admin-text-primary)]">Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--admin-text-secondary)]">Subtotal</span>
                    <span className="text-base font-bold text-[var(--admin-text-primary)]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--admin-text-secondary)]">GST</span>
                    <span className="text-base font-bold text-[var(--admin-text-primary)]">₹{taxTotal.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
                    <span className="text-lg font-black text-[var(--admin-text-secondary)] uppercase">Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-600">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    type="button"
                    onClick={handleSaveInvoice}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 py-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MdSync className={`text-xl ${saving ? 'animate-spin' : ''}`} />
                    <span className="font-black uppercase tracking-wider text-sm whitespace-nowrap">
                      {saving ? 'Saving...' : 'Save Invoice'}
                    </span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="w-full bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider text-xs transition-all"
                  >
                    Cancel
                  </button>
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
      {/* Standard Desktop Layout */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-12 py-6 sm:py-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight mb-2">
              Invoicing & Billing
            </h1>
            <p className="text-sm sm:text-base text-[var(--admin-text-secondary)] font-semibold uppercase tracking-wider">
              Taxation & Synchronization
            </p>
          </div>
          <div className="flex items-center gap-4">
            {billingStats?.unsyncedBills > 0 && (
              <button
                onClick={async () => {
                  info('Batch syncing all pending invoices...');
                  try {
                    await syncAllInvoicesToTally();
                    success('All invoices pushed to Tally ERP');
                    refetch();
                  } catch (err) {
                    error('Batch sync failed');
                  }
                }}
                className="hidden sm:inline-flex items-center gap-3 px-6 py-4 bg-orange-500/10 text-orange-600 border border-orange-500/20 font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-orange-500/20 transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <MdRefresh className="text-xl sm:text-2xl" />
                <span className="uppercase tracking-wider">Sync All ({billingStats.unsyncedBills})</span>
              </button>
            )}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-3 px-6 py-4 bg-white border-2 border-teal-600 text-teal-600 font-bold rounded-xl sm:rounded-2xl shadow-sm hover:bg-teal-50 transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <MdReceipt className="text-xl sm:text-2xl" />
              <span className="uppercase tracking-wider">From Order</span>
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 transition-all active:scale-95 text-sm whitespace-nowrap"
            >
              <MdAdd className="text-xl sm:text-2xl" />
              <span className="uppercase tracking-wider">Generate Invoice</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {loadingStats ? (
            <>
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg animate-pulse h-40"></div>
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg animate-pulse h-40"></div>
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg animate-pulse h-40"></div>
            </>
          ) : (
            <>
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all">
                <p className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest mb-3">
                  Total Sales (Today)
                </p>
                <h3 className="text-3xl sm:text-5xl font-black text-[var(--admin-text-primary)] tracking-tight">
                  ₹{(billingStats?.totalSalesToday || 0).toLocaleString()}
                </h3>
              </div>
              
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all">
                <p className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest mb-3">
                  Unsynced Bills
                </p>
                <h3 className={`text-3xl sm:text-5xl font-black tracking-tight ${billingStats?.unsyncedBills > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {billingStats?.unsyncedBills || 0} Pending
                </h3>
              </div>
              
              <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all">
                <p className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest mb-3">
                  Tally Handshake
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full ${billingStats?.tallyOnline ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`}></div>
                  <h3 className={`text-xl sm:text-3xl font-black uppercase tracking-widest ${billingStats?.tallyOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {billingStats?.tallyOnline ? 'Online' : 'Offline'}
                  </h3>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-8 sm:mb-12 shadow-lg">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-600 text-2xl" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice No. or Customer Name..." 
              className="w-full bg-[var(--admin-bg-primary)] border-2 border-transparent focus:border-teal-500 rounded-xl sm:rounded-2xl h-14 sm:h-16 pl-14 pr-4 text-sm sm:text-base text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-secondary)] transition-all outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={toggleFilters}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] hover:text-teal-600 hover:border-teal-500 rounded-xl sm:rounded-2xl transition-all font-bold text-sm uppercase tracking-wider whitespace-nowrap relative"
            >
              <MdFilterList className="text-xl" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-800">
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

        {/* Invoice Table - IMPROVED VISIBILITY + GST COLUMN */}
        <div className="bg-[var(--admin-bg-secondary)] border border-[var(--border-main)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--admin-bg-primary)] border-b border-[var(--border-main)]">
                  <th className="px-6 py-6 text-left text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">
                    Invoice Details
                  </th>
                  <th className="px-6 py-6 text-left text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">
                    Date
                  </th>
                  {/* NEW COLUMN: Tax */}
                  <th className="px-6 py-6 text-left text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest hidden md:table-cell">
                    GST/Tax
                  </th>
                  <th className="px-6 py-6 text-left text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">
                    Total Amount
                  </th>
                  <th className="px-6 py-6 text-left text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">
                    Sync Status
                  </th>
                  <th className="px-6 py-6 text-right text-xs sm:text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {(invoices || []).length > 0 ? invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--admin-bg-primary)] transition-colors group">
                    <td className="px-6 py-6">
                      <span className="font-black text-[var(--admin-text-primary)] block text-base sm:text-lg mb-1">
                        {inv.invoiceNo}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--admin-text-secondary)] italic">
                        {inv.customer}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs sm:text-sm text-[var(--admin-text-secondary)] font-bold tracking-wider uppercase">
                        {inv.date}
                      </span>
                    </td>
                    {/* NEW CELL: Tax */}
                    <td className="px-6 py-6 hidden md:table-cell">
                       <span className="text-xs sm:text-sm font-bold text-[var(--admin-text-secondary)]">
                          {inv.tax}
                       </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="font-black text-teal-600 text-sm sm:text-xl">
                        {inv.total}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${inv.synced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                        <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${inv.synced ? 'text-green-600' : 'text-orange-600'}`}>
                          {inv.synced ? 'Synced' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-2 sm:gap-3">
                        {!inv.synced && (
                          <button 
                            onClick={() => handleSyncInvoice(inv.id)} 
                            disabled={syncingId === inv.id}
                            className="p-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all hover:scale-110" 
                            title="Sync to Tally"
                          >
                            <MdSync className={`text-xl sm:text-2xl ${syncingId === inv.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button 
                             onClick={() => handleSendWhatsApp(inv.id)}
                             disabled={sendingId === inv.id}
                             className="p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all hover:scale-110"
                             title="Send via WhatsApp"
                          >
                             <MdSend className={`text-xl sm:text-2xl ${sendingId === inv.id ? 'animate-pulse' : ''}`} />
                          </button>
                        <button 
                          onClick={() => handleViewInvoice(inv)}
                          className="p-3 text-[var(--admin-text-secondary)] hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all hover:scale-110" 
                          title="View Details"
                        >
                          <MdVisibility className="text-xl sm:text-2xl" />
                        </button>
                        <button 
                          onClick={() => handlePrintInvoice(inv)}
                          className="p-3 text-[var(--admin-text-secondary)] hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all hover:scale-110" 
                          title="Print Invoice"
                        >
                          <MdPrint className="text-xl sm:text-2xl" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(inv)}  
                          className="p-3 text-[var(--admin-text-secondary)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110" 
                          title="Download PDF"
                        >
                          <MdFileDownload className="text-xl sm:text-2xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-[var(--admin-text-secondary)]">
                        <MdReceipt className="text-6xl sm:text-8xl opacity-20" />
                        <p className="text-sm sm:text-base font-bold uppercase tracking-widest">
                          No matching invoices found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>



      {/* Generate From Order Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-[var(--admin-bg-secondary)] rounded-3xl shadow-2xl p-8 max-w-md w-full border border-[var(--border-main)]">
              <h3 className="text-2xl font-black text-[var(--admin-text-primary)] mb-4">Generate Invoice</h3>
              <p className="text-[var(--admin-text-secondary)] mb-6 text-sm">Enter the Order ID to automatically generate a tax invoice.</p>
              
              <input 
                  type="text" 
                  autoFocus
                  placeholder="Order ID (e.g. 1001)"
                  className="w-full h-14 px-5 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] focus:border-teal-500 rounded-2xl text-lg font-bold outline-none mb-6"
                  value={generateOrderId}
                  onChange={(e) => setGenerateOrderId(e.target.value)}
              />
              
              <div className="flex gap-4">
                 <button 
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-4 bg-[var(--admin-bg-primary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] rounded-2xl font-bold uppercase tracking-wider"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={handleGenerateFromOrder}
                  disabled={!generateOrderId}
                  className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Generate
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {isOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* ... existing detail modal content ... */}
          <div className="relative w-full max-w-3xl bg-[var(--admin-bg-secondary)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-main)]">
            <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 sm:p-4 bg-teal-500/10 text-teal-600 rounded-2xl">
                  <MdReceipt className="text-2xl sm:text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--admin-text-primary)]">
                    {selectedInvoice.invoiceNo}
                  </h3>
                  <p className="text-sm font-bold text-teal-600 uppercase tracking-wider">
                    Tax Invoice Details
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-[var(--admin-bg-primary)] rounded-full transition-all text-[var(--admin-text-secondary)] hover:text-red-500"
              >
                <MdClose className="text-2xl sm:text-3xl" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                      Customer
                    </p>
                    <p className="text-lg sm:text-xl font-black text-[var(--admin-text-primary)]">
                      {selectedInvoice.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                      Date
                    </p>
                    <p className="text-base sm:text-lg font-bold text-[var(--admin-text-primary)]">
                      {selectedInvoice.date}
                    </p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-[var(--admin-text-secondary)]">
                    <span>Taxable Value (Subtotal)</span>
                    <span>₹{(selectedInvoice.totalValue - selectedInvoice.taxValue).toLocaleString()}</span>
                  </div>
                   <div className="flex justify-between items-center text-sm font-medium text-[var(--admin-text-secondary)]">
                    <span>GST (Tax)</span>
                    <span className="text-orange-600 font-bold">+ ₹{selectedInvoice.taxValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
                    <span className="text-sm font-black text-[var(--admin-text-secondary)] uppercase tracking-wider">
                      Grand Total
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-teal-600">
                      {selectedInvoice.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-[var(--admin-bg-primary)] border-t border-[var(--border-subtle)] flex gap-4">
              <button 
                onClick={closeModal} 
                className="flex-1 px-6 py-4 bg-[var(--admin-bg-secondary)] border-2 border-[var(--border-main)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] rounded-xl sm:rounded-2xl font-bold uppercase tracking-wider transition-all"
              >
                Close
              </button>
              {!selectedInvoice.synced && (
                <button 
                  onClick={() => { handleSyncInvoice(selectedInvoice.id); closeModal(); }} 
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl sm:rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <MdSync className="text-xl" />
                  <span>Sync to Tally</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;
