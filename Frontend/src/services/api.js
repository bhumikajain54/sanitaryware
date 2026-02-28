import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Axios instance for API calls
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    // Note: Do not set a global Content-Type here to allow Axios to handle FormData automatically
});

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

        // 4. Handle Content-Type for non-FormData objects
        if (config.data && !(config.data instanceof FormData) && typeof config.data === 'object') {
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

    return api({
        url: endpoint,
        method,
        data: body,
        headers,
        ...rest
    });
};

export default apiCall;
export { api };
