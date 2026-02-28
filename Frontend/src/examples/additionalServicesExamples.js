// ============================================
// BILLING & INVOICE MANAGEMENT EXAMPLES
// ============================================

import {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByOrderId,
    getUnsyncedInvoices,
    generateInvoice,
    syncInvoiceToTally,
    syncAllInvoicesToTally
} from '../services/additionalServices';

// Example 1: Fetch all invoices for admin dashboard
export const fetchInvoicesForDashboard = async () => {
    try {
        const invoices = await getAllInvoices();
        console.log('All invoices:', invoices);
        return invoices;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

// Example 2: Generate invoice when order is completed
export const handleOrderCompletion = async (orderId) => {
    try {
        const invoice = await generateInvoice(orderId);
        console.log('Invoice generated:', invoice);

        // Optionally sync to Tally immediately
        if (invoice.id) {
            await syncInvoiceToTally(invoice.id);
            console.log('Invoice synced to Tally');
        }

        return invoice;
    } catch (error) {
        console.error('Error generating invoice:', error);
        throw error;
    }
};

// Example 3: Get invoice for a specific order
export const fetchOrderInvoice = async (orderId) => {
    try {
        const invoice = await getInvoiceByOrderId(orderId);
        return invoice;
    } catch (error) {
        console.error('Error fetching order invoice:', error);
        return null;
    }
};

// Example 4: Sync all unsynced invoices to Tally
export const syncPendingInvoices = async () => {
    try {
        // First get all unsynced invoices
        const unsyncedInvoices = await getUnsyncedInvoices();
        console.log(`Found ${unsyncedInvoices.length} unsynced invoices`);

        // Sync all at once
        const result = await syncAllInvoicesToTally();
        console.log('Sync result:', result);

        return result;
    } catch (error) {
        console.error('Error syncing invoices:', error);
        throw error;
    }
};

// ============================================
// TALLY INTEGRATION EXAMPLES
// ============================================

import {
    getTallyStatus,
    testTallyConnection,
    syncProductToTally,
    syncCustomerToTally,
    syncAllProductsToTally
} from '../services/additionalServices';

// Example 5: Check Tally connection status
export const checkTallyIntegration = async () => {
    try {
        const status = await getTallyStatus();
        console.log('Tally status:', status);

        if (!status.connected) {
            // Test connection if not connected
            const testResult = await testTallyConnection();
            console.log('Connection test:', testResult);
        }

        return status;
    } catch (error) {
        console.error('Error checking Tally status:', error);
        return { connected: false, error: error.message };
    }
};

// Example 6: Sync product when created/updated
export const handleProductSync = async (productId) => {
    try {
        // Check if Tally is connected first
        const tallyStatus = await getTallyStatus();

        if (tallyStatus.connected) {
            const result = await syncProductToTally(productId);
            console.log('Product synced to Tally:', result);
            return result;
        } else {
            console.warn('Tally not connected, skipping sync');
            return null;
        }
    } catch (error) {
        console.error('Error syncing product to Tally:', error);
        throw error;
    }
};

// Example 7: Sync customer when they register
export const handleCustomerRegistration = async (customerId) => {
    try {
        const result = await syncCustomerToTally(customerId);
        console.log('Customer synced to Tally:', result);
        return result;
    } catch (error) {
        console.error('Error syncing customer to Tally:', error);
        // Don't throw - customer registration should succeed even if Tally sync fails
        return null;
    }
};

// Example 8: Bulk sync all products (admin action)
export const handleBulkProductSync = async () => {
    try {
        const result = await syncAllProductsToTally();
        console.log('All products synced:', result);
        return result;
    } catch (error) {
        console.error('Error in bulk sync:', error);
        throw error;
    }
};

// ============================================
// PAYMENT STATUS UPDATE EXAMPLES
// ============================================

import { updatePaymentStatus } from '../services/additionalServices';

// Example 9: Update payment status after webhook
export const handlePaymentWebhook = async (webhookData) => {
    try {
        const statusUpdate = {
            paymentId: webhookData.paymentId,
            status: webhookData.status, // SUCCESS, FAILED, PENDING
            transactionId: webhookData.transactionId,
            gatewayResponse: webhookData.response
        };

        const result = await updatePaymentStatus(statusUpdate);
        console.log('Payment status updated:', result);

        return result;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

// Example 10: Manual payment status update (admin)
export const manuallyUpdatePayment = async (paymentId, newStatus) => {
    try {
        const result = await updatePaymentStatus({
            paymentId,
            status: newStatus,
            updatedBy: 'admin',
            notes: 'Manual status update'
        });

        return result;
    } catch (error) {
        console.error('Error in manual payment update:', error);
        throw error;
    }
};

// ============================================
// GLOBAL SEARCH EXAMPLES
// ============================================

import { globalSearch } from '../services/additionalServices';

// Example 11: Search across all entities
export const performGlobalSearch = async (searchQuery) => {
    try {
        const results = await globalSearch(searchQuery);
        console.log('Search results:', results);

        // Results might be grouped by type
        return {
            products: results.products || [],
            categories: results.categories || [],
            brands: results.brands || [],
            orders: results.orders || []
        };
    } catch (error) {
        console.error('Error in global search:', error);
        return null;
    }
};

// Example 12: Search with filters
export const searchWithFilters = async (query, filters) => {
    try {
        const results = await globalSearch(query, {
            category: filters.category,
            brand: filters.brand,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            inStock: filters.inStock
        });

        return results;
    } catch (error) {
        console.error('Error in filtered search:', error);
        return null;
    }
};

// ============================================
// CONTENT PAGE EXAMPLES
// ============================================

import { getContentPageBySlug } from '../services/additionalServices';

// Example 13: Load dynamic content page
export const loadContentPage = async (slug) => {
    try {
        const page = await getContentPageBySlug(slug);
        console.log('Content page:', page);

        return {
            title: page.title,
            content: page.content,
            metadata: page.metadata,
            lastUpdated: page.updatedAt
        };
    } catch (error) {
        console.error('Error loading content page:', error);
        return null;
    }
};

// Example 14: Load About Us page
export const loadAboutPage = () => loadContentPage('about-us');

// Example 15: Load Privacy Policy
export const loadPrivacyPolicy = () => loadContentPage('privacy-policy');

// Example 16: Load Terms & Conditions
export const loadTermsAndConditions = () => loadContentPage('terms-conditions');

// ============================================
// REACT COMPONENT INTEGRATION EXAMPLES
// ============================================

// Example 17: Invoice Management Component
import React, { useState, useEffect } from 'react';
import { getAllInvoices, syncInvoiceToTally } from '../services/additionalServices';

export const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await getAllInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (invoiceId) => {
        try {
            await syncInvoiceToTally(invoiceId);
            alert('Invoice synced successfully!');
            fetchInvoices(); // Refresh list
        } catch (error) {
            alert('Sync failed: ' + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Invoices</h2>
            {invoices.map(invoice => (
                <div key={invoice.id}>
                    <span>{invoice.orderNumber}</span>
                    <span>₹{invoice.amount}</span>
                    <button onClick={() => handleSync(invoice.id)}>
                        Sync to Tally
                    </button>
                </div>
            ))}
        </div>
    );
};

// Example 18: Tally Status Monitor Component
import React, { useState, useEffect } from 'react';
import { getTallyStatus, testTallyConnection } from '../services/additionalServices';

export const TallyStatusMonitor = () => {
    const [status, setStatus] = useState(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const result = await getTallyStatus();
        setStatus(result);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            const result = await testTallyConnection();
            alert(result.success ? 'Connection successful!' : 'Connection failed!');
            checkStatus();
        } catch (error) {
            alert('Test failed: ' + error.message);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div>
            <h3>Tally Integration Status</h3>
            <p>Status: {status?.connected ? '✅ Connected' : '❌ Disconnected'}</p>
            <button onClick={handleTestConnection} disabled={testing}>
                {testing ? 'Testing...' : 'Test Connection'}
            </button>
        </div>
    );
};

export default {
    // Billing
    fetchInvoicesForDashboard,
    handleOrderCompletion,
    fetchOrderInvoice,
    syncPendingInvoices,

    // Tally
    checkTallyIntegration,
    handleProductSync,
    handleCustomerRegistration,
    handleBulkProductSync,

    // Payment
    handlePaymentWebhook,
    manuallyUpdatePayment,

    // Search
    performGlobalSearch,
    searchWithFilters,

    // Content
    loadContentPage,
    loadAboutPage,
    loadPrivacyPolicy,
    loadTermsAndConditions
};
