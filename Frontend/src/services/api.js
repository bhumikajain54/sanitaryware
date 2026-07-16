import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Axios instance for API calls
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    // Note: Do not set a global Content-Type here to allow Axios to handle FormData automatically
});

// ─── Global Query Cache Wrapper ──────────────────────────────────────────────
const apiCache = new Map();

// Verify sessionStorage accessibility
const isSessionStorageAvailable = () => {
    try {
        const testKey = '__storage_test__';
        sessionStorage.setItem(testKey, testKey);
        sessionStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};
const hasSessionStorage = isSessionStorageAvailable();

// Determine cache TTL (Time To Live) based on API URL
const getCacheTTL = (url) => {
    if (!url) return 30000;
    const cleanUrl = url.toLowerCase();
    
    // 1. Highly volatile user-specific data (5 seconds TTL)
    if (
        cleanUrl.includes('/cart') || 
        cleanUrl.includes('/wishlist') || 
        cleanUrl.includes('/orders') || 
        cleanUrl.includes('/notifications') || 
        cleanUrl.includes('/profile') ||
        cleanUrl.includes('/addresses') ||
        cleanUrl.includes('/activity-logs') ||
        cleanUrl.includes('/wallet') ||
        cleanUrl.includes('/payment-methods')
    ) {
        return 5000; 
    }
    
    // 2. Product details and reviews (5 minutes TTL)
    if (cleanUrl.includes('/products/') || cleanUrl.includes('/reviews/product/')) {
        return 300000;
    }
    
    // 3. Static metadata and catalog listings (10 minutes TTL)
    if (
        cleanUrl.endsWith('/products') || 
        cleanUrl.includes('/categories') || 
        cleanUrl.includes('/brands') || 
        cleanUrl.includes('/content/') || 
        cleanUrl.includes('/banners') || 
        cleanUrl.includes('/testimonials') || 
        cleanUrl.includes('/landing') ||
        cleanUrl.includes('/featured') ||
        cleanUrl.includes('/search')
    ) {
        return 600000;
    }
    
    // Default TTL: 30 seconds
    return 30000;
};

// Clear both in-memory and sessionStorage caches on mutating operations
const clearAllCache = () => {
    apiCache.clear();
    if (hasSessionStorage) {
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('api_cache_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch (e) {
            console.error('Failed to clear sessionStorage cache:', e);
        }
    }
};

// Save the original request method
const originalRequest = api.request.bind(api);

// Override request to inject cache layer
api.request = async (config) => {
    const isGet = (config.method || 'get').toLowerCase() === 'get';

    if (!isGet) {
        clearAllCache();
        return originalRequest(config);
    }

    // Build a unique cache key based on URL and params
    const cacheKey = `api_cache_${config.url}?${new URLSearchParams(config.params || {}).toString()}`;
    const now = Date.now();
    const ttl = getCacheTTL(config.url);

    // 1. Check active in-memory cache (for collapsing concurrent requests / fast navigation)
    const inMemoryEntry = apiCache.get(cacheKey);
    if (inMemoryEntry && (now - inMemoryEntry.timestamp < ttl)) {
        return inMemoryEntry.promise;
    }

    // 2. Check persistent sessionStorage cache to survive page refreshes
    if (hasSessionStorage) {
        try {
            const sessionCached = sessionStorage.getItem(cacheKey);
            if (sessionCached) {
                const parsed = JSON.parse(sessionCached);
                if (parsed && (now - parsed.timestamp < ttl)) {
                    const resolvedPromise = Promise.resolve(parsed.data);
                    apiCache.set(cacheKey, {
                        timestamp: now,
                        promise: resolvedPromise
                    });
                    return resolvedPromise;
                }
            }
        } catch (e) {
            console.warn('Session cache read error:', e);
        }
    }

    // 3. Cache miss: execute request and cache the promise (collapsing concurrent requests)
    const promise = originalRequest(config);

    apiCache.set(cacheKey, {
        timestamp: now,
        promise: promise
    });

    // Save to sessionStorage upon successful completion
    promise.then((resolvedData) => {
        if (hasSessionStorage) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: resolvedData
                }));
            } catch (e) {
                console.warn('Session cache write error:', e);
            }
        }
    }).catch(() => {
        // Invalidate cache if the request fails
        apiCache.delete(cacheKey);
        if (hasSessionStorage) {
            try {
                sessionStorage.removeItem(cacheKey);
            } catch (e) {}
        }
    });

    return promise;
};


/**
 * Request Interceptor: Attach JWT Token and Headers
 */
api.interceptors.request.use(
    (config) => {
        // 1. Get tokens from all possible storage locations
        const storedUser = localStorage.getItem('user');
        let token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        let userId = localStorage.getItem('userId');

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                token = token || userData?.token;
                userId = userId || userData?.id;
            } catch (error) {
                console.error('API Interceptor: Error parsing user data', error);
            }
        }

        // 2. Attach Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 3. Attach User ID header if required by backend
        if (userId) {
            config.headers['X-User-Id'] = userId;
        }

        // 4. Handle Content-Type precisely for FormData
        if (config.data instanceof FormData) {
            // Explicitly remove Content-Type to let Axios manage boundary
            // We ensure no charset=UTF-8 is added which breaks some backends
            if (config.headers) {
                delete config.headers['Content-Type'];
                delete config.headers['content-type'];
            }
        } else if (config.data && typeof config.data === 'object' && Object.keys(config.data).length > 0) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Flatten response and handle common errors
 */
api.interceptors.response.use(
    (response) => {
        // Return only the data payload for convenience
        return response.data;
    },
    (error) => {
        const { response, config } = error;
        const endpoint = config?.url;

        if (response) {
            // 401 Unauthorized: Session expired
            if (response.status === 401) {
                console.warn(`[401] Session expired at ${endpoint}.`);
            }

            // 403 Forbidden: Missing roles
            if (response.status === 403) {
                console.error(`[403] Access denied to ${endpoint}.`);
            }

            const errorMessage = response.data?.message || response.data?.error || `HTTP ${response.status}`;
            return Promise.reject(new Error(errorMessage));
        }

        return Promise.reject(new Error(error.message || 'Network Error'));
    }
);

/**
 * Backward compatibility helper
 */
const apiCall = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers, ...rest } = options;

    // Ensure endpoint doesn't start with a slash to avoid replacing the baseURL's path
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    return api({
        url: cleanEndpoint,
        method,
        data: body,
        headers,
        ...rest
    });
};

export default apiCall;
export { api };
