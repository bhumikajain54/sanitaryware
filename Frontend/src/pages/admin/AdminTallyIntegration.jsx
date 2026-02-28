import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdCheckCircle, 
  MdError, 
  MdSync, 
  MdSettings,
  MdRefresh,
  MdCloud,
  MdCloudOff,
  MdInfo
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import {
  getTallyStatus,
  testTallyConnection,
  syncProductToTally,
  syncCustomerToTally,
  syncAllProductsToTally
} from '../../services/additionalServices';

const AdminTallyIntegration = () => {
  const [tallyStatus, setTallyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  useEffect(() => {
    checkTallyStatus();
  }, []);

  const checkTallyStatus = async () => {
    try {
      setLoading(true);
      const status = await getTallyStatus();
      setTallyStatus(status);
    } catch (error) {
      console.error('Error checking Tally status:', error);
      setTallyStatus({ connected: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      toast.loading('Testing Tally connection...', { id: 'test-tally' });
      const result = await testTallyConnection();
      
      if (result.success) {
        toast.success('Tally connection successful!', { id: 'test-tally' });
        checkTallyStatus(); // Refresh status
      } else {
        toast.error(result.message || 'Connection test failed', { id: 'test-tally' });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error.message || 'Connection test failed', { id: 'test-tally' });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAllProducts = async () => {
    try {
      setSyncing(true);
      toast.loading('Syncing all products to Tally...', { id: 'sync-products' });
      
      const result = await syncAllProductsToTally();
      
      toast.success(
        `Successfully synced ${result.syncedCount || 'all'} products!`,
        { id: 'sync-products' }
      );
      
      // Add to sync logs
      addSyncLog({
        type: 'Products',
        action: 'Bulk Sync',
        count: result.syncedCount,
        status: 'success',
        timestamp: new Date()
      });
      
      checkTallyStatus();
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error(error.message || 'Failed to sync products', { id: 'sync-products' });
      
      addSyncLog({
        type: 'Products',
        action: 'Bulk Sync',
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      setSyncing(false);
    }
  };

  const addSyncLog = (log) => {
    setSyncLogs(prev => [log, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const isConnected = tallyStatus?.connected;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] mb-2">
            Tally Integration
          </h1>
          <p className="text-[var(--text-muted)] font-medium">
            Manage synchronization with Tally accounting software
          </p>
        </div>

        {/* Connection Status Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 mb-6 border border-[var(--border-main)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isConnected ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {isConnected ? (
                  <MdCloud className="text-3xl text-green-600" />
                ) : (
                  <MdCloudOff className="text-3xl text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-[var(--text-main)] mb-1">
                  {isConnected ? 'Connected to Tally' : 'Not Connected'}
                </h2>
                <p className="text-sm text-[var(--text-muted)] font-medium mb-2">
                  {isConnected 
                    ? `Last synced: ${tallyStatus.lastSyncTime ? new Date(tallyStatus.lastSyncTime).toLocaleString('en-IN') : 'Never'}`
                    : tallyStatus?.error || 'Tally connection is not established'
                  }
                </p>
                {isConnected && tallyStatus.version && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Tally Version: {tallyStatus.version}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl font-bold hover:bg-[var(--bg-card)] transition-all disabled:opacity-50"
              >
                <MdRefresh className={testing ? 'animate-spin' : ''} />
                Test Connection
              </button>
              <button
                onClick={checkTallyStatus}
                className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl hover:bg-[var(--bg-card)] transition-all"
              >
                <MdRefresh className="text-xl text-[var(--text-main)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sync Products */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MdSync className="text-2xl text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[var(--text-main)] mb-1">
                  Sync All Products
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  Synchronize all products from your inventory to Tally
                </p>
              </div>
            </div>
            <button
              onClick={handleSyncAllProducts}
              disabled={!isConnected || syncing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSync className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Products'}
            </button>
          </div>

          {/* Sync Settings */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MdSettings className="text-2xl text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[var(--text-main)] mb-1">
                  Sync Settings
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  Configure automatic synchronization preferences
                </p>
              </div>
            </div>
            <button
              disabled={!isConnected}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl font-bold hover:bg-[var(--bg-card)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSettings />
              Configure Settings
            </button>
          </div>
        </div>

        {/* Sync Statistics */}
        {isConnected && tallyStatus.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Products Synced
              </p>
              <p className="text-3xl font-black text-teal-600">
                {tallyStatus.stats.productsSynced || 0}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Customers Synced
              </p>
              <p className="text-3xl font-black text-blue-600">
                {tallyStatus.stats.customersSynced || 0}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Invoices Synced
              </p>
              <p className="text-3xl font-black text-green-600">
                {tallyStatus.stats.invoicesSynced || 0}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Last Sync
              </p>
              <p className="text-sm font-black text-[var(--text-main)]">
                {tallyStatus.lastSyncTime 
                  ? new Date(tallyStatus.lastSyncTime).toLocaleTimeString('en-IN')
                  : 'Never'
                }
              </p>
            </div>
          </div>
        )}

        {/* Sync Logs */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-main)]">
          <h3 className="text-xl font-black text-[var(--text-main)] mb-4">
            Recent Sync Activity
          </h3>
          
          {syncLogs.length === 0 ? (
            <div className="text-center py-12">
              <MdInfo className="text-5xl text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-muted)] font-medium">
                No sync activity yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-main)]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {log.status === 'success' ? (
                        <MdCheckCircle className="text-xl text-green-600" />
                      ) : (
                        <MdError className="text-xl text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)]">
                        {log.type} - {log.action}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {log.count && `${log.count} items synced • `}
                        {log.timestamp.toLocaleString('en-IN')}
                      </p>
                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">{log.error}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {!isConnected && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex gap-4">
              <MdInfo className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-black text-blue-600 mb-2">
                  Tally Connection Required
                </h4>
                <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                  To use Tally integration features, ensure that:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Tally software is running on your system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Tally API is enabled and configured correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Network connectivity between the application and Tally is established</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTallyIntegration;
