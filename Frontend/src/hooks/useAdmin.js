/**
 * Custom Hooks for Admin Panel
 * Isolated from customer hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';

// ============================================
// useAdminToast - Toast notifications for admin
// ============================================

export const useAdminToast = () => {
    const success = useCallback((message) => {
        toast.success(message, {
            duration: 3000,
            position: 'bottom-right',
            style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: '600',
            },
            icon: '✓',
        });
    }, []);

    const error = useCallback((message) => {
        toast.error(message, {
            duration: 4000,
            position: 'bottom-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: '600',
            },
            icon: '✕',
        });
    }, []);

    const info = useCallback((message) => {
        toast(message, {
            duration: 3000,
            position: 'bottom-right',
            style: {
                background: '#3b82f6',
                color: '#fff',
                fontWeight: '600',
            },
            icon: 'ℹ',
        });
    }, []);

    const warning = useCallback((message) => {
        toast(message, {
            duration: 3500,
            position: 'bottom-right',
            style: {
                background: '#f59e0b',
                color: '#fff',
                fontWeight: '600',
            },
            icon: '⚠',
        });
    }, []);

    return { success, error, info, warning };
};

// ============================================
// useAdminFetch - Data fetching with loading states
// ============================================

export const useAdminFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction();
            console.log('useAdminFetch raw data:', result); // DEBUG LOG
            setData(result);
        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    // Use a ref to store the stringified dependencies to avoid infinite loops from unmemoized arrays
    const dependenciesRef = useRef(JSON.stringify(dependencies));

    useEffect(() => {
        const currentDeps = JSON.stringify(dependencies);
        if (currentDeps !== dependenciesRef.current) {
            dependenciesRef.current = currentDeps;
        }
        fetchData();
    }, [fetchData, JSON.stringify(dependencies)]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};

// ============================================
// useAdminPagination - Pagination logic
// ============================================

export const useAdminPagination = (items = [], itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Defensive check: ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];

    const totalPages = Math.ceil(safeItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = safeItems.slice(startIndex, endIndex);

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

    const resetPagination = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        resetPagination,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
};

// ============================================
// useAdminSearch - Search and filter logic
// ============================================

export const useAdminSearch = (items = [], searchKeys = []) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Normalize items to an array (handle Spring Page objects, wrapped results, or nulls)
    const normalizedItems = useMemo(() => {
        if (Array.isArray(items)) return items;
        if (!items || typeof items !== 'object') return [];

        // Handle common backend wrappers
        if (Array.isArray(items.content)) return items.content;
        if (Array.isArray(items.data)) return items.data;
        if (Array.isArray(items.products)) return items.products;
        if (Array.isArray(items.brands)) return items.brands;
        if (Array.isArray(items.categories)) return items.categories;
        if (Array.isArray(items.items)) return items.items;
        if (Array.isArray(items.list)) return items.list;
        if (items._embedded && Array.isArray(items._embedded.products)) return items._embedded.products;
        if (items._embedded && Array.isArray(items._embedded.brands)) return items._embedded.brands;
        if (items._embedded && Array.isArray(items._embedded.categories)) return items._embedded.categories;

        return [];
    }, [items]);

    // Reactive search results
    const filteredItems = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return normalizedItems;

        return normalizedItems.filter((item) => {
            return searchKeys.some((key) => {
                try {
                    // Handle nested keys like 'brand.name'
                    const value = key.split('.').reduce((obj, k) => obj?.[k], item);
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(term);
                } catch (e) {
                    console.warn(`Search error on key "${key}":`, e);
                    return false;
                }
            });
        });
    }, [normalizedItems, searchTerm, JSON.stringify(searchKeys)]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
        resultCount: filteredItems.length,
    };
};

// ============================================
// useAdminSort - Sorting logic
// ============================================

export const useAdminSort = (items = [], defaultSortKey = '', defaultOrder = 'asc') => {
    const [sortKey, setSortKey] = useState(defaultSortKey);
    const [sortOrder, setSortOrder] = useState(defaultOrder);

    const sortedItems = [...items].sort((a, b) => {
        if (!sortKey) return 0;

        const aValue = sortKey.split('.').reduce((obj, k) => obj?.[k], a);
        const bValue = sortKey.split('.').reduce((obj, k) => obj?.[k], b);

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const toggleSort = useCallback((key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }, [sortKey, sortOrder]);

    return {
        sortedItems,
        sortKey,
        sortOrder,
        toggleSort,
    };
};

// ============================================
// useAdminSelection - Multi-select logic
// ============================================

export const useAdminSelection = (items = [], idKey = 'id') => {
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Defensive check
    const safeItems = Array.isArray(items) ? items : [];

    const toggleSelection = useCallback((id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (selectedIds.size === safeItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(safeItems.map((item) => item[idKey])));
        }
    }, [safeItems, selectedIds.size, idKey]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isSelected = useCallback((id) => {
        return selectedIds.has(id);
    }, [selectedIds]);

    const isAllSelected = safeItems.length > 0 && selectedIds.size === safeItems.length;
    const isSomeSelected = selectedIds.size > 0 && selectedIds.size < safeItems.length;

    return {
        selectedIds: Array.from(selectedIds),
        selectedCount: selectedIds.size,
        toggleSelection,
        toggleAll,
        clearSelection,
        isSelected,
        isAllSelected,
        isSomeSelected,
    };
};

// ============================================
// useAdminModal - Modal state management
// ============================================

export const useAdminModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [modalData, setModalData] = useState(null);

    const openModal = useCallback((data = null) => {
        setModalData(data);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setModalData(null), 300); // Delay to allow animation
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return {
        isOpen,
        modalData,
        openModal,
        closeModal,
        toggleModal,
    };
};

// ============================================
// useAdminDebounce - Debounce values
// ============================================

export const useAdminDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// ============================================
// useAdminLocalStorage - Persist state in localStorage
// ============================================

export const useAdminLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(`admin_${key}`);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(`admin_${key}`, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

// ============================================
// useAdminConfirm - Confirmation dialog
// ============================================

export const useAdminConfirm = () => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmData, setConfirmData] = useState(null);
    const [resolvePromise, setResolvePromise] = useState(null);

    const confirm = useCallback((data = {}) => {
        setConfirmData(data);
        setIsConfirming(true);

        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(true);
        }
        setIsConfirming(false);
        setConfirmData(null);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(false);
        }
        setIsConfirming(false);
        setConfirmData(null);
    }, [resolvePromise]);

    return {
        isConfirming,
        confirmData,
        confirm,
        handleConfirm,
        handleCancel,
    };
};

export default {
    useAdminToast,
    useAdminFetch,
    useAdminPagination,
    useAdminSearch,
    useAdminSort,
    useAdminSelection,
    useAdminModal,
    useAdminDebounce,
    useAdminLocalStorage,
    useAdminConfirm,
};
