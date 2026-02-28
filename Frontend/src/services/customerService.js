import apiCall from './api';

// ============================================
// PRODUCT & CATALOG SERVICES
// ============================================

export const getProducts = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(queryParams ? `/products?${queryParams}` : '/products');
};

export const getProductById = async (id) => {
    return await apiCall(`/products/${id}`);
};

export const getFeaturedProducts = async () => {
    return await apiCall('/products/featured');
};

export const getCategories = async () => {
    return await apiCall('/categories');
};

export const getBrands = async () => {
    return await apiCall('/brands');
};

export const getCategoryById = (id) => apiCall(`/categories/${id}`);
export const getBrandById = (id) => apiCall(`/brands/${id}`);

export const searchProducts = (query) => {
    return apiCall(`/search?q=${encodeURIComponent(query)}`);
};

export const getProductsByCategory = (categoryId) => apiCall(`/products/category/${categoryId}`);
export const getProductsByBrand = (brandId) => apiCall(`/products/brand/${brandId}`);

// ============================================
// WISH-LIST & CART SERVICES
// ============================================

export const getCart = async () => {
    return await apiCall('/cart');
};

export const addToCart = async (productId, quantity = 1) => {
    return await apiCall('/cart', {
        method: 'POST',
        body: { productId, quantity }
    });
};

export const updateCartItem = async (itemId, quantity) => {
    return await apiCall(`/cart/${itemId}`, {
        method: 'PUT',
        body: { quantity }
    });
};

export const removeFromCart = async (itemId) => {
    return await apiCall(`/cart/${itemId}`, {
        method: 'DELETE'
    });
};

export const clearCart = () => apiCall('/cart', { method: 'DELETE' });

export const getWishlist = () => apiCall('/customer/wishlist');
export const addToWishlist = (productId) => apiCall('/customer/wishlist', {
    method: 'POST',
    body: { productId }
});
export const removeFromWishlist = (productId) => apiCall(`/customer/wishlist/${productId}`, {
    method: 'DELETE'
});
export const clearWishlist = () => apiCall('/customer/wishlist', {
    method: 'DELETE'
});

// ============================================
// ORDERS & REVIEWS SERVICES
// ============================================

export const getMyOrders = async () => {
    return await apiCall('/orders');
};

export const getOrders = getMyOrders; // Alias for backward compatibility

export const getOrderById = (id) => apiCall(`/orders/${id}`);

export const createOrder = async (orderData) => {
    return await apiCall('/orders', {
        method: 'POST',
        body: orderData
    });
};

export const cancelOrder = (id) => apiCall(`/orders/${id}/cancel`, { method: 'PUT' });

export const getOrderTimeline = async (orderId) => {
    return await apiCall(`/orders/${orderId}/timeline`);
};

export const getReviewsByProduct = (productId) => apiCall(`/reviews/product/${productId}`);
export const getMyReviews = () => apiCall('/reviews/my');

export const postReview = async (reviewData) => {
    return await apiCall('/reviews', {
        method: 'POST',
        body: reviewData
    });
};

export const updateReview = (id, data) => apiCall(`/reviews/${id}`, { method: 'PUT', body: data });
export const deleteReview = (id) => apiCall(`/reviews/${id}`, { method: 'DELETE' });

// ============================================
// ADDRESS SERVICES
// ============================================

export const getAddresses = async () => {
    return await apiCall('/customer/addresses');
};

export const createAddress = async (addressData) => {
    return await apiCall('/customer/addresses', {
        method: 'POST',
        body: addressData
    });
};

export const updateAddress = (id, data) => apiCall(`/customer/addresses/${id}`, {
    method: 'PUT',
    body: data
});

export const deleteAddress = (id) => apiCall(`/customer/addresses/${id}`, {
    method: 'DELETE'
});

export const setDefaultAddress = (id) => apiCall(`/customer/addresses/${id}/default`, {
    method: 'PUT'
});

export const getPageBySlug = (slug) => apiCall(`/content/pages/${slug}`);

// ============================================
// MISC SERVICES (Testimonials, Contact, Payment)
// ============================================

export const getTestimonials = () => apiCall('/testimonials');

export const getBanners = () => apiCall('/banners');

export const createContactInquiry = (data) => apiCall('/contact', {
    method: 'POST',
    body: data
});

export const initiatePayment = (data) => apiCall('/payment/initiate', { method: 'POST', body: data });
export const verifyPayment = (data) => apiCall('/payment/verify', { method: 'POST', body: data });
export const getPaymentHistory = () => apiCall('/payment/history');

// ============================================
// LEGACY / COMPATIBILITY EXPORTS
// ============================================

export const getProfile = async () => apiCall('/customer/profile');
export const updateProfile = async (data) => apiCall('/customer/profile', { method: 'PUT', body: data });
export const changePassword = (data) => apiCall('/customer/change-password', { method: 'PUT', body: data });
export const getPreferences = () => apiCall('/customer/preferences');
export const updatePreferences = (data) => apiCall('/customer/preferences', { method: 'PUT', body: data });
export const getActivityLogs = () => apiCall('/customer/activity-logs');

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async () => {
    return await apiCall('/notifications');
};

export const markNotificationAsRead = async (id) => {
    return await apiCall(`/notifications/${id}/read`, {
        method: 'POST'
    });
};

export default {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    getBrands,
    getCategoryById,
    getBrandById,
    searchProducts,
    getProductsByCategory,
    getProductsByBrand,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getMyOrders,
    getOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    getOrderTimeline,
    getReviewsByProduct,
    getMyReviews,
    postReview,
    updateReview,
    deleteReview,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getTestimonials,
    getBanners,
    createContactInquiry,
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    getProfile,
    updateProfile,
    changePassword,
    getPreferences,
    updatePreferences,
    getPageBySlug,
    getNotifications,
    markNotificationAsRead,
    getActivityLogs
};
