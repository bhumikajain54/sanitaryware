import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdReceipt, 
  MdDownload, 
  MdSync, 
  MdCheckCircle, 
  MdError,
  MdRefresh,
  MdSearch,
  MdFilterList
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import {
  getAllInvoices,
  getInvoiceByOrderId,
  generateInvoice,
  syncInvoiceToTally,
  syncAllInvoicesToTally,
  getUnsyncedInvoices
} from '../../services/additionalServices';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, synced, unsynced

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getAllInvoices();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      toast.loading('Generating invoice...', { id: 'generate' });
      const invoice = await generateInvoice(orderId);
      toast.success('Invoice generated successfully!', { id: 'generate' });
      fetchInvoices(); // Refresh list
      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Failed to generate invoice', { id: 'generate' });
    }
  };

  const handleSyncToTally = async (invoiceId) => {
    try {
      toast.loading('Syncing to Tally...', { id: `sync-${invoiceId}` });
      await syncInvoiceToTally(invoiceId);
      toast.success('Synced to Tally successfully!', { id: `sync-${invoiceId}` });
      fetchInvoices(); // Refresh to show updated sync status
    } catch (error) {
      console.error('Error syncing to Tally:', error);
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
      console.error('Error syncing all invoices:', error);
      toast.error(error.message || 'Failed to sync invoices', { id: 'sync-all' });
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadInvoice = (invoice) => {
    // Implement PDF download logic here
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ? true :
                         filterStatus === 'synced' ? invoice.tallySynced :
                         !invoice.tallySynced;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] mb-2">
            Invoice Management
          </h1>
          <p className="text-[var(--text-muted)] font-medium">
            Manage and sync invoices with Tally
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 md:p-6 mb-6 border border-[var(--border-main)]">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xl" />
              <input
                type="text"
                placeholder="Search by order number, invoice number, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] focus:border-teal-500 outline-none transition-all"
              />
            </div>

            {/* Filter & Actions */}
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 md:flex-initial px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] font-bold focus:border-teal-500 outline-none"
              >
                <option value="all">All Invoices</option>
                <option value="synced">Synced to Tally</option>
                <option value="unsynced">Not Synced</option>
              </select>

              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSync className={syncing ? 'animate-spin' : ''} />
                Sync All
              </button>

              <button
                onClick={fetchInvoices}
                className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl hover:bg-[var(--bg-card)] transition-all"
              >
                <MdRefresh className="text-xl text-[var(--text-main)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Total Invoices
                </p>
                <p className="text-3xl font-black text-[var(--text-main)]">
                  {invoices.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
                <MdReceipt className="text-2xl text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Synced to Tally
                </p>
                <p className="text-3xl font-black text-green-600">
                  {invoices.filter(inv => inv.tallySynced).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <MdCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Pending Sync
                </p>
                <p className="text-3xl font-black text-orange-600">
                  {invoices.filter(inv => !inv.tallySynced).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MdError className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-app)] border-b border-[var(--border-main)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Tally Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-[var(--text-muted)] font-medium">
                        No invoices found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--bg-app)] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-[var(--text-main)]">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[var(--text-muted)]">
                          {invoice.orderNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[var(--text-main)]">
                          {invoice.customerName || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-teal-600">
                          ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[var(--text-muted)]">
                          {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.tallySynced ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">
                            <MdCheckCircle /> Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-bold">
                            <MdError /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                            title="Download Invoice"
                          >
                            <MdDownload className="text-lg text-[var(--text-main)]" />
                          </button>
                          {!invoice.tallySynced && (
                            <button
                              onClick={() => handleSyncToTally(invoice.id)}
                              className="p-2 hover:bg-teal-500/10 rounded-lg transition-colors"
                              title="Sync to Tally"
                            >
                              <MdSync className="text-lg text-teal-600" />
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
