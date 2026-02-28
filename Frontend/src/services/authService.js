import apiCall from './api';

export const login = async (credentials) => {
    const response = await apiCall('/auth/login', {
        method: 'POST',
        body: credentials,
    });

    // Save token and user info if login successful
    if (response.token || response.userId || response.user) {
        const user = response.user || {};
        const role = response.role || user.role || (response.roles && response.roles[0]) || 'customer';

        const userData = {
            id: response.userId || user.id || response.id,
            token: response.token,
            email: credentials.email || response.email || user.email,
            role: role
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userId', userData.id);

        const normalizedRole = String(role).toUpperCase();
        if (normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'BRAND_ORGANIZER') {
            localStorage.setItem('adminToken', response.token);
        }
    }

    return response;
};

export const logout = async () => {
    try {
        await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.warn('Backend logout failed', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminToken');
};

export const register = async (userData) => {
    return await apiCall('/auth/register', {
        method: 'POST',
        body: userData,
    });
};

export const registerAdmin = async (userData) => {
    return await apiCall('/auth/admin/register', {
        method: 'POST',
        body: {
            ...userData,
            role: 'ADMIN',
            active: true,
        },
    });
};

export const checkAdminExists = async () => {
    return await apiCall('/auth/admin/exists');
};

export const getProfile = async () => {
    return await apiCall('/auth/profile');
};

export const updateProfile = async (profileData) => {
    return await apiCall('/auth/update-profile', {
        method: 'PUT',
        body: profileData,
    });
};

export const changePassword = async (passwordData) => {
    return await apiCall('/auth/change-password', {
        method: 'PUT',
        body: passwordData,
    });
};

export const socialLogin = async (provider, token) => {
    const response = await apiCall('/auth/social-login', {
        method: 'POST',
        body: { provider, token },
    });
    return processAuthResponse(response);
};

const processAuthResponse = (response) => {
    if (response.token || response.userId || response.user) {
        const user = response.user || {};
        const role = response.role || user.role || (response.roles && response.roles[0]) || 'customer';

        const userData = {
            id: response.userId || user.id || response.id,
            token: response.token,
            email: response.email || user.email,
            role: role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userId', userData.id);

        const normalizedRole = String(role).toUpperCase();
        if (normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'BRAND_ORGANIZER') {
            localStorage.setItem('adminToken', response.token);
        }
    }
    return response;
};

export default {
    login,
    logout,
    register,
    getProfile,
    updateProfile,
    changePassword,
    socialLogin,
};
