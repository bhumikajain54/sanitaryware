import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdReceipt, MdDownload, MdSync, MdCheckCircle,
  MdError, MdRefresh, MdSearch, MdFilterList
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import {
  getAllInvoices, getInvoiceByOrderId, generateInvoice,
  syncInvoiceToTally, syncAllInvoicesToTally, getUnsyncedInvoices
} from '../../services/additionalServices';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getAllInvoices();
      setInvoices(data || []);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally { setLoading(false); }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      toast.loading('Generating invoice...', { id: 'generate' });
      await generateInvoice(orderId);
      toast.success('Invoice generated successfully!', { id: 'generate' });
      fetchInvoices();
    } catch (error) {
      toast.error(error.message || 'Failed to generate invoice', { id: 'generate' });
    }
  };

  const handleSyncToTally = async (invoiceId) => {
    try {
      toast.loading('Syncing to Tally...', { id: `sync-${invoiceId}` });
      await syncInvoiceToTally(invoiceId);
      toast.success('Synced to Tally successfully!', { id: `sync-${invoiceId}` });
      fetchInvoices();
    } catch (error) {
      toast.error(error.message || 'Failed to sync to Tally', { id: `sync-${invoiceId}` });
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      toast.loading('Syncing all invoices to Tally...', { id: 'sync-all' });
      const result = await syncAllInvoicesToTally();
      toast.success(`Successfully synced ${result.syncedCount || 'all'} invoices!`, { id: 'sync-all' });
      fetchInvoices();
    } catch (error) {
      toast.error(error.message || 'Failed to sync invoices', { id: 'sync-all' });
    } finally { setSyncing(false); }
  };

  const handleDownloadInvoice = (invoice) => {
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ? true :
        filterStatus === 'synced' ? invoice.tallySynced :
          !invoice.tallySynced;
    return matchesSearch && matchesFilter;
  });

  const syncedCount = invoices.filter(inv => inv.tallySynced).length;
  const pendingCount = invoices.filter(inv => !inv.tallySynced).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-app)]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 md:space-y-8">

        {/* ─── Header ─── */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] mb-1 sm:mb-2 tracking-tight">
            Invoice Management
          </h1>
          <p className="text-[10px] sm:text-sm md:text-base text-[var(--text-muted)] font-medium">
            Manage and sync invoices with Tally
          </p>
        </div>

        {/* ─── Actions Bar ─── */}
        <div className="bg-[var(--bg-card)] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-[var(--border-main)]">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">

            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <MdSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg sm:text-xl" />
              <input type="text"
                placeholder="Search by order, invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[10px] sm:text-sm md:text-base text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
              />
            </div>

            {/* Filter + Sync All + Refresh */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-2.5 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[10px] sm:text-sm text-[var(--text-main)] font-bold focus:border-teal-500 outline-none"
              >
                <option value="all">All Invoices</option>
                <option value="synced">Synced</option>
                <option value="unsynced">Not Synced</option>
              </select>

              <button onClick={handleSyncAll} disabled={syncing}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-xl font-bold text-[10px] sm:text-xs md:text-sm hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
              >
                <MdSync className={`text-sm sm:text-base flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline sm:inline">Sync All</span>
              </button>

              <button onClick={fetchInvoices}
                className="p-2.5 sm:p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl hover:bg-[var(--bg-card)] transition-all flex-shrink-0"
              >
                <MdRefresh className="text-lg sm:text-xl text-[var(--text-main)]" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
          {[
            { label: 'Total Invoices', value: invoices.length, icon: MdReceipt, color: 'text-teal-600', bg: 'bg-teal-500/10' },
            { label: 'Synced to Tally', value: syncedCount, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
            { label: 'Pending Sync', value: pendingCount, icon: MdError, color: 'text-orange-600', bg: 'bg-orange-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[var(--bg-card)] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-[var(--border-main)]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 sm:mb-1 truncate hidden sm:block">{label}</p>
                  <p className="text-[8px] sm:hidden font-bold text-[var(--text-muted)] uppercase truncate">{label.split(' ')[0]}</p>
                  <p className={`text-xl sm:text-2xl md:text-3xl font-black ${color}`}>{value}</p>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${bg} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`text-base sm:text-lg md:text-2xl ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Invoices Table (layout preserved, spacing responsive) ─── */}
        <div className="bg-[var(--bg-card)] rounded-xl sm:rounded-2xl border border-[var(--border-main)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[var(--bg-app)] border-b border-[var(--border-main)]">
                <tr>
                  {['Invoice #', 'Order #', 'Customer', 'Amount', 'Date', 'Tally Status', 'Actions'].map((th, i) => (
                    <th key={th}
                      className={`px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 text-[9px] sm:text-[10px] md:text-xs font-black text-[var(--text-muted)] uppercase tracking-wider ${i === 6 ? 'text-right' : 'text-left'}`}
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 sm:px-6 py-10 sm:py-12 md:py-16 text-center">
                      <MdReceipt className="mx-auto text-4xl sm:text-5xl text-[var(--text-muted)] opacity-20 mb-3" />
                      <p className="text-[10px] sm:text-xs md:text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest">
                        No invoices found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <motion.tr key={invoice.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-[var(--bg-app)] transition-colors"
                    >
                      {/* Invoice # */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[var(--text-main)]">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </span>
                      </td>
                      {/* Order # */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[var(--text-muted)]">
                          {invoice.orderNumber || 'N/A'}
                        </span>
                      </td>
                      {/* Customer */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[var(--text-main)] max-w-[120px] sm:max-w-none truncate block">
                          {invoice.customerName || 'Unknown'}
                        </span>
                      </td>
                      {/* Amount */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-teal-600">
                          ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        <span className="text-[10px] sm:text-xs md:text-sm text-[var(--text-muted)]">
                          {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>
                      {/* Tally Status */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap">
                        {invoice.tallySynced ? (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/10 text-green-600 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold">
                            <MdCheckCircle className="flex-shrink-0" /> Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500/10 text-orange-600 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold">
                            <MdError className="flex-shrink-0" /> Pending
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2">
                          <button onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                            className="p-1.5 sm:p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                          >
                            <MdDownload className="text-base sm:text-lg md:text-xl text-[var(--text-main)]" />
                          </button>
                          {!invoice.tallySynced && (
                            <button onClick={() => handleSyncToTally(invoice.id)}
                              title="Sync to Tally"
                              className="p-1.5 sm:p-2 hover:bg-teal-500/10 rounded-lg transition-colors"
                            >
                              <MdSync className="text-base sm:text-lg md:text-xl text-teal-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminInvoices;