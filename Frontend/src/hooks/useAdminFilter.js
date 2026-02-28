/**
 * Reusable Admin Filter Hook
 * Provides consistent filtering functionality across all admin pages
 */

import { useState, useMemo, useCallback } from 'react';

// Helper: Get nested object value
const getNestedValue = (obj, path) => {
    if (!path) return obj;

    // Handle object.property notation
    if (typeof obj === 'object' && obj !== null) {
        const parts = path.split('.');
        let value = obj;

        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) break;
        }

        return value;
    }

    return obj[path];
};

// Helper: Normalize value for comparison
const normalizeValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
};

/**
 * Generic filter hook for admin pages
 * @param {Array} items - Array of items to filter
 * @param {Object} filterConfig - Configuration for filters
 * @returns {Object} - Filter state and methods
 */
export const useAdminFilter = (items = [], filterConfig = {}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(() => {
        // Initialize filters from config
        const initialFilters = {};
        Object.keys(filterConfig).forEach(key => {
            initialFilters[key] = '';
        });
        return initialFilters;
    });

    // Apply filters to items
    const filteredItems = useMemo(() => {
        let result = Array.isArray(items) ? items : [];

        // Debug: Log initial state
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Filter Debug:', {
                totalItems: result.length,
                activeFilters: Object.entries(filters).filter(([_, v]) => v !== ''),
                sampleItem: result[0]
            });
        }

        Object.entries(filters).forEach(([filterKey, filterValue]) => {
            if (!filterValue || filterValue === '') return;

            const config = filterConfig[filterKey];
            if (!config) {
                console.warn(`⚠️ No config found for filter: ${filterKey}`);
                return;
            }

            const beforeCount = result.length;

            result = result.filter(item => {
                const itemValue = getNestedValue(item, config.field);

                switch (config.type) {
                    case 'exact':
                        const normalized = normalizeValue(itemValue);
                        const filterNormalized = normalizeValue(filterValue);
                        return normalized === filterNormalized;

                    case 'range':
                        const numValue = Number(itemValue) || 0;
                        if (config.ranges && config.ranges[filterValue]) {
                            const { min, max } = config.ranges[filterValue];
                            if (min !== undefined && max !== undefined) {
                                return numValue >= min && numValue <= max;
                            } else if (min !== undefined) {
                                return numValue >= min;
                            } else if (max !== undefined) {
                                return numValue <= max;
                            }
                        }
                        return true;

                    case 'boolean':
                        const boolValue = itemValue === true || itemValue === 'true' ||
                            itemValue === 1 || itemValue === '1' ||
                            (typeof itemValue === 'string' && itemValue.toLowerCase() === 'active');
                        const filterBool = filterValue === 'true' || filterValue === true;
                        return boolValue === filterBool;

                    case 'contains':
                        return normalizeValue(itemValue).includes(normalizeValue(filterValue));

                    case 'date':
                        // Implement date filtering if needed
                        return true;

                    default:
                        return normalizeValue(itemValue) === normalizeValue(filterValue);
                }
            });

            // Debug: Log filter results
            if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Filter "${filterKey}" (${filterValue}): ${beforeCount} → ${result.length}`);
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log(`🎯 Final filtered count: ${result.length}`);
        }

        return result;
    }, [items, filters, filterConfig]);

    // Update a single filter
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const clearedFilters = {};
        Object.keys(filters).forEach(key => {
            clearedFilters[key] = '';
        });
        setFilters(clearedFilters);
    }, [filters]);

    // Toggle filter panel visibility
    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length;
    }, [filters]);

    // Get active filter details
    const activeFilters = useMemo(() => {
        return Object.entries(filters)
            .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            .map(([key, value]) => ({
                key,
                value,
                label: filterConfig[key]?.label || key,
                displayValue: filterConfig[key]?.options?.find(opt => opt.value === value)?.label || value
            }));
    }, [filters, filterConfig]);

    return {
        showFilters,
        setShowFilters,
        toggleFilters,
        filters,
        setFilters,
        filteredItems,
        handleFilterChange,
        clearFilters,
        activeFilterCount,
        activeFilters
    };
};

export default useAdminFilter;
