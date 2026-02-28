import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(
          userData.role?.toLowerCase() === 'admin' || 
          userData.role === 'ROLE_ADMIN' ||
          userData.role === 'BRAND_ORGANIZER'
        );
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      const userData = {
        id: response.userId || response.id,
        token: response.token,
        email: email || response.email,
        name: response.name || response.fullName || 
              (response.firstName && response.lastName ? `${response.firstName} ${response.lastName}` : (response.firstName || response.lastName)) || 
              (response.role === 'admin' ? 'Admin' : 'Customer'),
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        phone: response.phone || response.phoneNumber || '',
        role: response.role
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(
        userData.role?.toLowerCase() === 'admin' || 
        userData.role === 'ROLE_ADMIN' ||
        userData.role === 'BRAND_ORGANIZER'
      );
      
      // authService already saves to localStorage, but we ensure it matches our context state
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.message || 'Invalid credentials' };
    }
  };

  const register = async (firstName, lastName, email, password, phone) => {
    try {
      // Use the specified data format for registration
      await authService.register({ 
        firstName, 
        lastName, 
        email, 
        password, 
        phone,
        role: "USER", // Default role as specified
        active: true  // Default active status as specified
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authService.changePassword({ oldPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Password change failed' };
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await authService.getProfile();
      console.log('🔍 Raw Profile Response from Backend:', data);
      
      if (data) {
        const updatedUser = {
          ...user,
          id: data.id || user?.id,
          firstName: data.firstName || user?.firstName || '',
          lastName: data.lastName || user?.lastName || '',
          email: data.email || user?.email || '',
          username: data.username || data.email || user?.username || '',
          phone: data.phone || data.phoneNumber || user?.phone || '',
          role: data.role || user?.role,
          active: data.active !== undefined ? data.active : user?.active,
          name: data.name || data.fullName || 
                (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : (data.firstName || data.lastName)) || 
                user?.name,
          // Ensure we don't lose the token
          token: user?.token || localStorage.getItem('userToken')
        };
        
        console.log('✅ Updated User Context:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser };
      }
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      return { success: false, message: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      // Refresh user state with fresh data from server
      await fetchUserProfile();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateProfile: updateUserProfile,
    getProfile: fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
