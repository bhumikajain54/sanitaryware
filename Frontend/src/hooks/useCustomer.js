/**
 * Custom Hooks for Customer Frontend
 * Isolated from admin hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';

// ============================================
// useCustomerToast - Toast notifications for customers
// ============================================

export const useCustomerToast = () => {
    const success = useCallback((message) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-center',
            style: {
                background: '#0d9488', // Teal-600
                color: '#fff',
                fontWeight: '600',
                borderRadius: '1rem',
            },
        });
    }, []);

    const error = useCallback((message) => {
        toast.error(message, {
            duration: 4000,
            position: 'top-center',
            style: {
                background: '#e11d48', // Rose-600
                color: '#fff',
                fontWeight: '600',
                borderRadius: '1rem',
            },
        });
    }, []);

    const info = useCallback((message) => {
        toast(message, {
            duration: 3000,
            position: 'top-center',
            style: {
                background: '#0284c7', // Sky-600
                color: '#fff',
                fontWeight: '600',
                borderRadius: '1rem',
            },
        });
    }, []);

    return { success, error, info };
};

// ============================================
// useCustomerFetch - Data fetching with loading states
// ============================================

export const useCustomerFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData, JSON.stringify(dependencies)]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};

// ============================================
// useCustomerPagination - Pagination logic
// ============================================

export const useCustomerPagination = (items = [], itemsPerPage = 12) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
};

// ============================================
// useCustomerSearch - Search and filter logic
// ============================================

export const useCustomerSearch = (items = [], searchKeys = []) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);

    useEffect(() => {
        const lowercasedTerm = searchTerm.trim().toLowerCase();

        if (!lowercasedTerm) {
            if (filteredItems.length === 0 && items.length === 0) return;
            if (filteredItems !== items) setFilteredItems(items);
            return;
        }

        const filtered = items.filter((item) => {
            return searchKeys.some((key) => {
                const value = key.split('.').reduce((obj, k) => obj?.[k], item);
                return value?.toString().toLowerCase().includes(lowercasedTerm);
            });
        });

        if (filtered.length === 0 && filteredItems.length === 0) return;

        if (filtered.length === filteredItems.length && JSON.stringify(filtered) === JSON.stringify(filteredItems)) {
            return;
        }

        setFilteredItems(filtered);
    }, [searchTerm, items, JSON.stringify(searchKeys)]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
        resultCount: filteredItems.length,
    };
};

// ============================================
// useCustomerModal - Modal state management
// ============================================

export const useCustomerModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [modalData, setModalData] = useState(null);

    const openModal = useCallback((data = null) => {
        setModalData(data);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setModalData(null), 300);
    }, []);

    return {
        isOpen,
        modalData,
        openModal,
        closeModal,
    };
};

// ============================================
// usePayment - Payment processing hook
// ============================================

export const usePayment = () => {
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const { success, error: showError } = useCustomerToast();

    const processPayment = useCallback(async (paymentData, paymentService) => {
        setProcessing(true);
        setPaymentError(null);
        setPaymentSuccess(false);

        try {
            const result = await paymentService(paymentData);
            setPaymentSuccess(true);
            success('Payment processed successfully!');
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Payment failed. Please try again.';
            setPaymentError(errorMessage);
            showError(errorMessage);
            throw err;
        } finally {
            setProcessing(false);
        }
    }, [success, showError]);

    const resetPayment = useCallback(() => {
        setProcessing(false);
        setPaymentError(null);
        setPaymentSuccess(false);
    }, []);

    return {
        processing,
        paymentError,
        paymentSuccess,
        processPayment,
        resetPayment,
    };
};

// ============================================
// usePaymentStatus - Track payment status
// ============================================

export const usePaymentStatus = (orderId, checkStatusFunction) => {
    const [status, setStatus] = useState('pending');
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);

    const checkStatus = useCallback(async () => {
        if (!orderId || !checkStatusFunction) return;

        setLoading(true);
        try {
            const result = await checkStatusFunction(orderId);
            setStatus(result.status);

            // Stop polling if payment is completed or failed
            if (result.status === 'success' || result.status === 'failed') {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
        } finally {
            setLoading(false);
        }
    }, [orderId, checkStatusFunction]);

    const startPolling = useCallback((interval = 3000) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        checkStatus(); // Check immediately
        intervalRef.current = setInterval(checkStatus, interval);
    }, [checkStatus]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        status,
        loading,
        checkStatus,
        startPolling,
        stopPolling,
    };
};

// ============================================
// usePaymentMethods - Manage payment methods
// ============================================

export const usePaymentMethods = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [savedMethods, setSavedMethods] = useState([]);

    const availableMethods = useMemo(() => [
        { id: 'upi', name: 'UPI', icon: '📱', enabled: true },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦', enabled: true },
        { id: 'wallet', name: 'Wallet', icon: '👛', enabled: true },
        { id: 'cod', name: 'Cash on Delivery', icon: '💵', enabled: true },
    ], []);

    const selectMethod = useCallback((methodId) => {
        const method = availableMethods.find(m => m.id === methodId);
        if (method && method.enabled) {
            setSelectedMethod(method);
        }
    }, [availableMethods]);

    const addSavedMethod = useCallback((method) => {
        setSavedMethods(prev => [...prev, { ...method, id: Date.now() }]);
    }, []);

    const removeSavedMethod = useCallback((methodId) => {
        setSavedMethods(prev => prev.filter(m => m.id !== methodId));
    }, []);

    return {
        availableMethods,
        selectedMethod,
        selectMethod,
        savedMethods,
        addSavedMethod,
        removeSavedMethod,
    };
};

export default {
    useCustomerToast,
    useCustomerFetch,
    useCustomerPagination,
    useCustomerSearch,
    useCustomerModal,
    usePayment,
    usePaymentStatus,
    usePaymentMethods,
};
