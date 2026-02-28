import apiCall from './api';

// ============================================
// ADMIN BILLING CONTROLLER
// ============================================

/**
 * Get all invoices
 * GET /api/admin/billing/invoices
 */
export const getAllInvoices = () => apiCall('/admin/billing/invoices');

/**
 * Get invoice by ID
 * GET /api/admin/billing/invoices/{id}
 */
export const getInvoiceById = (id) => apiCall(`/admin/billing/invoices/${id}`);

/**
 * Get invoice by order ID
 * GET /api/admin/billing/invoices/order/{orderId}
 */
export const getInvoiceByOrderId = (orderId) => apiCall(`/admin/billing/invoices/order/${orderId}`);

/**
 * Get unsynced invoices
 * GET /api/admin/billing/invoices/unsynced
 */
export const getUnsyncedInvoices = () => apiCall('/admin/billing/invoices/unsynced');

/**
 * Generate invoice for order
 * POST /api/admin/billing/generate/{orderId}
 */
export const generateInvoice = (orderId) => apiCall(`/admin/billing/generate/${orderId}`, {
    method: 'POST'
});

/**
 * Sync invoice to Tally
 * POST /api/admin/billing/invoices/{id}/sync-tally
 */
export const syncInvoiceToTally = (id) => apiCall(`/admin/billing/invoices/${id}/sync-tally`, {
    method: 'POST'
});

/**
 * Sync all invoices to Tally
 * POST /api/admin/billing/invoices/sync-all
 */
export const syncAllInvoicesToTally = () => apiCall('/admin/billing/invoices/sync-all', {
    method: 'POST'
});

// ============================================
// ADMIN TALLY CONTROLLER
// ============================================

/**
 * Get Tally connection status
 * GET /api/admin/tally/status
 */
export const getTallyStatus = () => apiCall('/admin/tally/status');

/**
 * Test Tally connection
 * GET /api/admin/tally/test-connection
 */
export const testTallyConnection = () => apiCall('/admin/tally/test-connection');

/**
 * Sync product to Tally
 * POST /api/admin/tally/sync-product/{productId}
 */
export const syncProductToTally = (productId) => apiCall(`/admin/tally/sync-product/${productId}`, {
    method: 'POST'
});

/**
 * Sync customer to Tally
 * POST /api/admin/tally/sync-customer/{customerId}
 */
export const syncCustomerToTally = (customerId) => apiCall(`/admin/tally/sync-customer/${customerId}`, {
    method: 'POST'
});

/**
 * Sync all products to Tally
 * POST /api/admin/tally/sync-all-products
 */
export const syncAllProductsToTally = () => apiCall('/admin/tally/sync-all-products', {
    method: 'POST'
});

// ============================================
// PAYMENT CONTROLLER (Customer)
// ============================================

/**
 * Update payment status (Manual/COD)
 * POST /api/payment/update-status?orderId={id}&transactionId={txn}&status={status}
 */
export const updatePaymentStatus = (orderId, transactionId, status) =>
    apiCall(`/payment/update-status?orderId=${orderId}&transactionId=${transactionId}&status=${status}`, {
        method: 'POST'
    });

/**
 * Verify Razorpay payment
 * POST /api/payment/verify-razorpay
 */
export const verifyRazorpayPayment = (data) => apiCall('/payment/verify-razorpay', {
    method: 'POST',
    body: data
});

// ============================================
// SEARCH CONTROLLER
// ============================================

/**
 * Global search endpoint
 * GET /api/search
 */
export const globalSearch = (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiCall(`/search?${params.toString()}`);
};

// ============================================
// CONTENT CONTROLLER
// ============================================

/**
 * Get content page by slug
 * GET /api/content/pages/{slug}
 */
export const getContentPageBySlug = (slug) => apiCall(`/content/pages/${slug}`);

// ============================================
// EXPORT DEFAULT WITH ALL FUNCTIONS
// ============================================

export default {
    // Billing
    getAllInvoices,
    getInvoiceById,
    getInvoiceByOrderId,
    getUnsyncedInvoices,
    generateInvoice,
    syncInvoiceToTally,
    syncAllInvoicesToTally,

    // Tally Integration
    getTallyStatus,
    testTallyConnection,
    syncProductToTally,
    syncCustomerToTally,
    syncAllProductsToTally,

    // Payment
    updatePaymentStatus,
    verifyRazorpayPayment,

    // Search
    globalSearch,

    // Content
    getContentPageBySlug
};
