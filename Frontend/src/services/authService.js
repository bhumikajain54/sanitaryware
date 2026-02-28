import apiCall from './api';

export const login = async (credentials) => {
    const response = await apiCall('/auth/login', {
        method: 'POST',
        body: credentials,
    });

    // Save token and user info if login successful
    if (response.token || response.userId) {
        const userData = {
            id: response.userId,
            token: response.token,
            email: credentials.email,
            role: response.role || 'customer'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userId', response.userId);

        if (userData.role?.toLowerCase() === 'admin' || userData.role === 'ROLE_ADMIN') {
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

export default {
    login,
    logout,
    register,
    getProfile,
    updateProfile,
    changePassword,
};
