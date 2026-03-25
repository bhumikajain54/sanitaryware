import { api } from './api';

/**
 * Tally Integration Service
 * All calls are proxied through the admin backend to interact with the Tally XML interface.
 */
const tallyService = {
  /**
   * Fetch all ledgers from Tally
   */
  fetchLedgers: async () => {
    try {
      // Points to AdminTallyController.java -> /api/admin/tally/ledgers
      return await api.get('/admin/tally/ledgers');
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      throw error;
    }
  },

  /**
   * Create a new ledger in Tally
   */
  createLedger: async (ledgerData) => {
    try {
      return await api.post('/admin/tally/ledger', ledgerData);
    } catch (error) {
      console.error('Error creating ledger:', error);
      throw error;
    }
  },

  /**
   * Create a sales voucher in Tally
   */
  createVoucher: async (voucherData) => {
    try {
      return await api.post('/admin/tally/voucher/sales', voucherData);
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  },

  /**
   * Fetch all stock items from Tally
   */
  fetchStockItems: async () => {
    try {
      return await api.get('/admin/tally/stock-items');
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  },

  /**
   * Check connection status to Tally
   */
  checkStatus: async () => {
    try {
      // Both /status and /test-connection work in AdminTallyController
      return await api.get('/admin/tally/status');
    } catch (error) {
      console.error('Error checking Tally status:', error);
      return { connected: false, message: 'Tally not connected' };
    }
  }
};

export default tallyService;
