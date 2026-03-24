import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/tally';

const tallyService = {
  /**
   * Fetch all ledgers from Tally
   */
  fetchLedgers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ledgers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new ledger in Tally
   */
  createLedger: async (ledgerData) => {
    try {
      const response = await axios.post(`${BASE_URL}/ledger`, ledgerData);
      return response.data;
    } catch (error) {
      console.error('Error creating ledger:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a sales voucher in Tally
   */
  createVoucher: async (voucherData) => {
    try {
      const response = await axios.post(`${BASE_URL}/voucher/sales`, voucherData);
      return response.data;
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Fetch all stock items from Tally
   */
  fetchStockItems: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/stock-items`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Check connection status to Tally
   */
  checkStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking Tally status:', error);
      return { connected: false, message: 'Tally not connected' };
    }
  }
};

export default tallyService;
