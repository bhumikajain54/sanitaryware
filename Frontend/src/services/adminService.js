import apiCall from './api';

/**
 * Dashboard & Stats
 */
/**
 * Dashboard & Stats
 */
export const getDashboardStats = () => apiCall('/admin/dashboard/stats');
export const getDashboardSummary = () => apiCall('/admin/dashboard/summary');
export const getDashboardSales = () => apiCall('/admin/dashboard/sales');
export const getDashboardOrders = () => apiCall('/admin/dashboard/orders');
export const getDashboardUsers = () => apiCall('/admin/dashboard/users');
export const getRevenueTrend = (period = '7d') => apiCall(`/admin/dashboard/revenue-trend?period=${period}`);
export const getOrdersTrend = () => apiCall('/admin/dashboard/orders-trend');

/**
 * Product Management
 */
export const getAdminProducts = () => apiCall('/admin/products');
export const getProductById = (id) => apiCall(`/admin/products/${id}`);
export const getProductsByCategory = (categoryId) => apiCall(`/admin/products/by-category/${categoryId}`);
export const getProductsByBrand = (brandId) => apiCall(`/admin/products/by-brand/${brandId}`);

export const createProduct = (productData) => apiCall('/admin/products', {
    method: 'POST',
    body: productData,
});

export const updateProduct = (id, productData) => apiCall(`/admin/products/${id}`, {
    method: 'PUT',
    body: productData,
});

export const updateStock = (id, quantity) => apiCall(`/admin/products/${id}/stock`, {
    method: 'PUT',
    params: { quantity }
});

export const deleteProduct = (id) => apiCall(`/admin/products/${id}`, {
    method: 'DELETE',
});

export const importProducts = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/admin/products/import', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': undefined }
    });
};

export const exportProducts = () => apiCall('/admin/products/export/csv', { responseType: 'blob' });
export const exportProductsPdf = () => apiCall('/admin/products/export/pdf', { responseType: 'blob' });

export const toggleProductStatus = (id, active) => apiCall(`/admin/products/${id}/status`, {
    method: 'PATCH',
    params: { active }
});

export const bulkStockUpdate = (quantity) => apiCall('/admin/products/bulk/stock-update', {
    method: 'POST',
    params: { quantity }
});

export const bulkDeleteProducts = (ids) => apiCall('/admin/products/bulk-delete', {
    method: 'DELETE',
    body: { ids }
});

/**
 * Brand Management
 */
export const getAdminBrands = () => apiCall('/admin/brands');
export const getBrandById = (id) => apiCall(`/admin/brands/${id}`);

export const createBrand = (brandData) => apiCall('/admin/brands', {
    method: 'POST',
    body: brandData,
});

export const updateBrand = (id, brandData) => apiCall(`/admin/brands/${id}`, {
    method: 'PUT',
    body: brandData,
});

export const deleteBrand = (id) => apiCall(`/admin/brands/${id}`, {
    method: 'DELETE',
});

export const importBrands = (formData) => apiCall('/admin/brands/import', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined }
});

export const exportBrands = () => apiCall('/admin/brands/export', { responseType: 'blob' });
export const exportBrandsPdf = () => apiCall('/admin/brands/export/pdf', { responseType: 'blob' });

/**
 * Category Management
 */
export const getAdminCategories = () => apiCall('/admin/categories');
export const getCategoryById = (id) => apiCall(`/admin/categories/${id}`);

export const createCategory = (categoryData) => apiCall('/admin/categories', {
    method: 'POST',
    body: categoryData,
});

export const updateCategory = (id, categoryData) => apiCall(`/admin/categories/${id}`, {
    method: 'PUT',
    body: categoryData,
});

export const deleteCategory = (id) => apiCall(`/admin/categories/${id}`, {
    method: 'DELETE',
});

export const importCategories = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/admin/categories/import', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': undefined }
    });
};

export const exportCategories = () => apiCall('/admin/categories/export', { responseType: 'blob' });
export const exportCategoriesPdf = () => apiCall('/admin/categories/export/pdf', { responseType: 'blob' });

/**
 * Order Management
 */
export const getAdminOrders = () => apiCall('/admin/orders');
export const getOrderById = (id) => apiCall(`/admin/orders/${id}`);

export const updateOrderStatus = (id, status) => apiCall(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: { status },
});

export const deleteOrder = (id) => apiCall(`/admin/orders/${id}`, {
    method: 'DELETE',
});

export const exportOrders = () => apiCall('/admin/orders/export', { responseType: 'blob' });
export const exportOrdersPdf = () => apiCall('/admin/orders/export/pdf', { responseType: 'blob' });

/**
 * Customer Management
 */
export const getAdminCustomers = () => apiCall('/admin/users');
export const getCustomerById = (id) => apiCall(`/admin/users/${id}`);
export const updateCustomerStatus = (id, status) => apiCall(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: { status }
});
export const updateCustomer = (id, data) => apiCall(`/admin/users/${id}`, {
    method: 'PUT',
    body: data
});
export const deleteCustomer = (id) => apiCall(`/admin/users/${id}`, {
    method: 'DELETE'
});

export const importCustomers = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/admin/users/import', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': undefined }
    });
};

export const exportCustomers = () => apiCall('/admin/users/export', { responseType: 'blob' });
export const exportCustomersPdf = () => apiCall('/admin/users/export/pdf', { responseType: 'blob' });

/**
 * Activity Logs & Payments
 */
export const getActivityLogs = () => apiCall('/admin/logs');

export const getAdminPayments = () => apiCall('/admin/payments');
export const getPaymentById = (id) => apiCall(`/admin/payments/${id}`);
export const getPaymentReport = () => apiCall('/admin/payments/report', { responseType: 'blob' });
export const getAdminHealth = () => apiCall('/admin/health');
export const checkDebug = () => apiCall('/debug/check');

/**
 * Reviews
 */
export const getAdminReviews = () => apiCall('/admin/reviews');
export const deleteReview = (id) => apiCall(`/admin/reviews/${id}`, { method: 'DELETE' });
export const approveReview = (id) => apiCall(`/reviews/admin/${id}/approve`, { method: 'POST' });

/**
 * Inquiries
 */
export const getInquiries = () => apiCall('/contact/admin/contact-messages');
export const markInquiryAsRead = (id) => apiCall(`/contact/admin/contact-messages/${id}/read`, { method: 'PUT' });
export const deleteInquiry = (id) => apiCall(`/contact/admin/contact-messages/${id}`, { method: 'DELETE' });

export const getMediaFiles = () => apiCall('/media');
export const uploadMedia = (formData) => apiCall('/media/upload', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined }
});

export const uploadMultipleMedia = (formData) => apiCall('/media/upload-multiple', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined }
});

export const deleteMedia = (id) => apiCall(`/media/${id}`, { method: 'DELETE' });

/**
 * Content Management (Pages & Blogs)
 */
export const getContentPages = () => apiCall('/admin/content/pages');
export const saveContentPage = (data) => {
    const id = data.id;
    return apiCall(id ? `/admin/content/pages/${id}` : '/admin/content/pages', {
        method: id ? 'PUT' : 'POST',
        body: data
    });
};
export const deleteContentPage = (id) => apiCall(`/admin/content/pages/${id}`, { method: 'DELETE' });

/**
 * Testimonials
 */
export const getAdminTestimonials = () => apiCall('/testimonials'); // Shared endpoint but different logic in components
export const createTestimonial = (data) => apiCall('/testimonials/admin', {
    method: 'POST',
    body: data
});
export const updateTestimonial = (id, data) => apiCall(`/testimonials/admin/${id}`, {
    method: 'PUT',
    body: data
});
export const deleteTestimonial = (id) => apiCall(`/testimonials/admin/${id}`, {
    method: 'DELETE'
});
export const saveTestimonial = (data) => {
    if (data.id) return updateTestimonial(data.id, data);
    return createTestimonial(data);
};

export const importTestimonials = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/testimonials/admin/import', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': undefined }
    });
};

/**
 * Banner Management
 */
export const getBanners = () => apiCall('/banners/admin');
export const createBanner = (data) => apiCall('/banners/admin', {
    method: 'POST',
    body: data
});
export const updateBanner = (id, data) => apiCall(`/banners/admin/${id}`, {
    method: 'PUT',
    body: data
});
export const deleteBanner = (id) => apiCall(`/banners/admin/${id}`, {
    method: 'DELETE'
});
export const saveBanner = (data) => {
    if (data.id) return updateBanner(data.id, data);
    return createBanner(data);
};

export const importBanners = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/banners/admin/import', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': undefined }
    });
};

/**
 * Notification Management
 */
export const getNotifications = () => apiCall('/notifications/admin');
export const markNotificationAsRead = (id) => apiCall(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsAsRead = () => apiCall('/notifications/mark-all-read', { method: 'POST' });

/**
 * Billing & Invoices
 */
export const generateInvoice = (orderId) => apiCall(`/admin/billing/generate/${orderId}`, { method: 'POST' });
export const getInvoices = () => apiCall('/admin/billing/invoices');
export const getInvoiceById = (id) => apiCall(`/admin/billing/invoices/${id}`);
export const getInvoiceByOrder = (orderId) => apiCall(`/admin/billing/invoices/order/${orderId}`);
export const getUnsyncedInvoices = () => apiCall('/admin/billing/invoices/unsynced');
export const syncInvoiceToTally = (id) => apiCall(`/admin/billing/invoices/${id}/sync-tally`, { method: 'POST' });
export const syncAllInvoicesToTally = () => apiCall('/admin/billing/invoices/sync-all', { method: 'POST' });

/**
 * Tally Integration
 */
export const getTallyProducts = () => apiCall('/admin/billing/tally/products');
export const testTallyConnection = () => apiCall('/admin/billing/tally/test-connection');
export const checkTallyConnection = () => apiCall('/admin/tally/test-connection'); // Redundant check based on API list
export const syncOrderToTally = (orderId) => apiCall(`/admin/billing/orders/${orderId}/sync-tally`, { method: 'POST' });

export const syncProductToTally = (productId) => apiCall(`/admin/tally/sync-product/${productId}`, { method: 'POST' });
export const syncCustomerToTally = (customerId) => apiCall(`/admin/tally/sync-customer/${customerId}`, { method: 'POST' });
export const syncAllProductsToTally = () => apiCall('/admin/tally/sync-all-products', { method: 'POST' });
export const getTallyStatus = () => apiCall('/admin/tally/status');
export const getTallyLedgers = () => apiCall('/admin/tally/ledgers');
export const createPurchaseVoucher = (data) => apiCall('/admin/tally/purchase-voucher', {
    method: 'POST',
    body: data
});
export const syncStockFromTally = (data) => apiCall('/admin/tally/sync-stock', {
    method: 'POST',
    body: data
});
export const getTallyVoucherTypes = () => apiCall('/admin/tally/voucher-types');



/**
 * Stock Alerts
 */
export const sendStockAlert = (data) => apiCall('/admin/products/stock-alert', {
    method: 'POST',
    body: data
});

// Quotations
export const getAdminQuotations = () => apiCall('/admin/quotations');
export const getQuotationById = (id) => apiCall(`/admin/quotations/${id}`);
export const createQuotation = (data) => apiCall('/admin/quotations', { method: 'POST', body: data });
export const updateQuotation = (id, data) => apiCall(`/admin/quotations/${id}`, { method: 'PUT', body: data });
export const updateQuotationImport = (id, formData) => apiCall(`/admin/quotations/${id}/import`, { method: 'PUT', body: formData });
export const sendQuotationWhatsApp = (id) => apiCall(`/admin/quotations/${id}/send-whatsapp`, { method: 'POST' });
export const importQuotation = (formData) => apiCall('/admin/quotations/import', { method: 'POST', body: formData });

// Order Drafts (Digital Notepad)
export const getAdminOrderDrafts = () => apiCall('/admin/order-drafts');
export const getOrderDraftById = (id) => apiCall(`/admin/order-drafts/${id}`);
export const createOrderDraft = (data) => apiCall('/admin/order-drafts', { method: 'POST', body: data });
export const updateOrderDraft = (id, data) => apiCall(`/admin/order-drafts/${id}`, { method: 'PUT', body: data });
export const confirmOrderDraft = (id) => apiCall(`/admin/order-drafts/${id}/confirm`, { method: 'POST' });
export const deleteOrderDraft = (id) => apiCall(`/admin/order-drafts/${id}`, { method: 'DELETE' });

// WhatsApp Notifications (General)
export const sendOrderWhatsApp = (id) => apiCall(`/admin/orders/${id}/send-whatsapp`, { method: 'POST' });
export const sendInvoiceWhatsApp = (id) => apiCall(`/admin/billing/invoices/${id}/send-whatsapp`, { method: 'POST' });

export default {
    getDashboardStats,
    getDashboardSummary,
    getDashboardSales,
    getDashboardOrders,
    getDashboardUsers,
    getRevenueTrend,
    getOrdersTrend,
    getAdminProducts,
    getProductById,
    getProductsByCategory,
    getProductsByBrand,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    importProducts,
    exportProducts,
    exportProductsPdf,
    toggleProductStatus,
    bulkDeleteProducts,
    bulkStockUpdate,
    getAdminBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    importBrands,
    exportBrands,
    exportBrandsPdf,
    getAdminCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    importCategories,
    exportCategories,
    exportCategoriesPdf,
    getAdminOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    exportOrders,
    exportOrdersPdf,
    getAdminCustomers,
    getCustomerById,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
    importCustomers,
    getActivityLogs,
    getAdminPayments,
    getPaymentById,
    getPaymentReport,
    getAdminReviews,
    deleteReview,
    approveReview,
    getInquiries,
    markInquiryAsRead,
    deleteInquiry,
    uploadMedia,
    uploadMultipleMedia,
    getMediaFiles,
    deleteMedia,
    getAdminTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    importTestimonials,
    importBanners,
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    saveBanner,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendStockAlert,
    getAdminHealth,
    checkDebug,
    getContentPages,
    saveContentPage,
    deleteContentPage,
    saveTestimonial,
    // Billing & Tally
    generateInvoice,
    getInvoices,
    getInvoiceById,
    getInvoiceByOrder,
    getUnsyncedInvoices,
    syncInvoiceToTally,
    syncAllInvoicesToTally,
    getTallyProducts,
    testTallyConnection,
    checkTallyConnection,
    syncOrderToTally,
    syncProductToTally,
    syncCustomerToTally,
    syncAllProductsToTally,
    getTallyStatus,
    getTallyLedgers,
    createPurchaseVoucher,
    syncStockFromTally,
    getTallyVoucherTypes,
    // Quotations
    getAdminQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    updateQuotationImport,
    importQuotation,
    sendQuotationWhatsApp,
    sendOrderWhatsApp,
    sendInvoiceWhatsApp,

    // Order Drafts
    getAdminOrderDrafts,
    getOrderDraftById,
    createOrderDraft,
    updateOrderDraft,
    confirmOrderDraft,
    deleteOrderDraft,
    // Compatibility Aliases
    getTestimonials: getAdminTestimonials,
    getProducts: getAdminProducts,
    getBrands: getAdminBrands,
    getCategories: getAdminCategories,
    getOrders: getAdminOrders,
    getCustomers: getAdminCustomers,
    getInvoices: getAdminPayments, // Note: This might overlap with the new getInvoices but keeping for now
    getBillingStats: getDashboardStats
};
