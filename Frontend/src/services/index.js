/**
 * Centralized Service Exports
 * 
 * This file provides a single point of import for all API services.
 * Import from here instead of individual service files for better organization.
 */

// Admin Services
export {
    // Dashboard
    getDashboardStats,
    getDashboardSummary,
    getDashboardSales,
    getDashboardOrders,
    getDashboardUsers,
    getRevenueTrend,
    getOrdersTrend,

    // Products
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

    // Brands
    getAdminBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    importBrands,
    exportBrands,
    exportBrandsPdf,

    // Categories
    getAdminCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    importCategories,
    exportCategories,
    exportCategoriesPdf,

    // Orders
    getAdminOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,

    // Customers
    getAdminCustomers,
    getCustomerById,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,

    // Payments
    getAdminPayments,
    getPaymentById,
    getPaymentReport,

    // Reviews
    getAdminReviews,
    deleteReview,
    approveReview,

    // Inquiries
    getInquiries,
    markInquiryAsRead,
    deleteInquiry,

    // Media
    uploadMedia,
    uploadMultipleMedia,
    getMediaFiles,
    deleteMedia,

    // Testimonials
    getAdminTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    saveTestimonial,

    // Banners
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    saveBanner,

    // Notifications
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Health & Logs
    getAdminHealth,
    getActivityLogs,
    checkDebug,

    // Content
    getContentPages,
    saveContentPage,
    deleteContentPage
} from './adminService';

// Customer Services
export {
    // Products (Public)
    getProducts,
    getFeaturedProducts,
    searchProducts,

    // Categories & Brands (Public)
    getCategories,
    getBrands,

    // Cart
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,

    // Wishlist
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,

    // Orders
    getMyOrders,
    getOrders,
    createOrder,
    cancelOrder,
    getOrderTimeline,

    // Reviews
    createReview,
    getProductReviews,
    getMyReviews,
    updateReview,

    // Addresses
    getAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,

    // Payment
    initiatePayment,
    verifyPayment,
    getPaymentHistory,

    // Misc
    getTestimonials,
    createContactInquiry
} from './customerService';

// Additional Services (Billing, Tally, Search, Content)
export {
    // Billing & Invoices
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

    // Payment Status
    updatePaymentStatus,

    // Global Search
    globalSearch,

    // Content Pages
    getContentPageBySlug
} from './additionalServices';

// Default export with all services organized by category
export default {
    admin: {
        dashboard: {
            getStats: getDashboardStats,
            getSummary: getDashboardSummary,
            getSales: getDashboardSales,
            getOrders: getDashboardOrders,
            getUsers: getDashboardUsers,
            getRevenueTrend: getRevenueTrend,
            getOrdersTrend: getOrdersTrend
        },
        products: {
            getAll: getAdminProducts,
            getById: getProductById,
            getByCategory: getProductsByCategory,
            getByBrand: getProductsByBrand,
            create: createProduct,
            update: updateProduct,
            updateStock: updateStock,
            delete: deleteProduct,
            import: importProducts,
            export: exportProducts,
            exportPdf: exportProductsPdf,
            toggleStatus: toggleProductStatus,
            bulkDelete: bulkDeleteProducts
        },
        brands: {
            getAll: getAdminBrands,
            getById: getBrandById,
            create: createBrand,
            update: updateBrand,
            delete: deleteBrand,
            import: importBrands,
            export: exportBrands,
            exportPdf: exportBrandsPdf
        },
        categories: {
            getAll: getAdminCategories,
            getById: getCategoryById,
            create: createCategory,
            update: updateCategory,
            delete: deleteCategory,
            import: importCategories,
            export: exportCategories,
            exportPdf: exportCategoriesPdf
        },
        orders: {
            getAll: getAdminOrders,
            getById: getOrderById,
            updateStatus: updateOrderStatus,
            delete: deleteOrder
        },
        customers: {
            getAll: getAdminCustomers,
            getById: getCustomerById,
            update: updateCustomer,
            updateStatus: updateCustomerStatus,
            delete: deleteCustomer
        },
        payments: {
            getAll: getAdminPayments,
            getById: getPaymentById,
            getReport: getPaymentReport
        },
        billing: {
            getAllInvoices,
            getInvoiceById,
            getInvoiceByOrderId,
            getUnsyncedInvoices,
            generateInvoice,
            syncInvoiceToTally,
            syncAllInvoicesToTally
        },
        tally: {
            getStatus: getTallyStatus,
            testConnection: testTallyConnection,
            syncProduct: syncProductToTally,
            syncCustomer: syncCustomerToTally,
            syncAllProducts: syncAllProductsToTally
        }
    },
    customer: {
        products: {
            getAll: getProducts,
            getFeatured: getFeaturedProducts,
            search: searchProducts
        },
        cart: {
            get: getCart,
            add: addToCart,
            update: updateCartItem,
            remove: removeFromCart,
            clear: clearCart
        },
        wishlist: {
            get: getWishlist,
            add: addToWishlist,
            remove: removeFromWishlist,
            clear: clearWishlist
        },
        orders: {
            getAll: getMyOrders,
            getById: getOrderById,
            create: createOrder,
            cancel: cancelOrder,
            getTimeline: getOrderTimeline
        },
        payment: {
            initiate: initiatePayment,
            verify: verifyPayment,
            getHistory: getPaymentHistory,
            updateStatus: updatePaymentStatus
        },
        addresses: {
            getAll: getAddresses,
            create: createAddress,
            update: updateAddress,
            setDefault: setDefaultAddress,
            delete: deleteAddress
        }
    },
    common: {
        search: globalSearch,
        getContentPage: getContentPageBySlug
    }
};
