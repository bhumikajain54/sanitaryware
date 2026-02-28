/**
 * Performance Monitoring Usage Example
 * 
 * This file demonstrates how to use the performance monitoring hook
 * and display component in your pages.
 */

import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import PerformanceSummary from '@/components/PerformanceSummary';

// Example 1: Basic Usage in a Page Component
export const ExamplePage = () => {
  const { metrics, trackApiCall } = usePerformanceMonitor('Example Page');

  // Example API call with tracking
  const fetchData = async () => {
    const startTime = performance.now();
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      
      // Track the API call
      const duration = performance.now() - startTime;
      trackApiCall('/api/data', duration);
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return (
    <div>
      <h1>Example Page</h1>
      {/* Your page content */}
      
      {/* Display performance metrics (only in dev mode) */}
      <PerformanceSummary metrics={metrics} />
    </div>
  );
};

// Example 2: Using with Axios
import axios from 'axios';

export const ExampleWithAxios = () => {
  const { metrics, trackApiCall } = usePerformanceMonitor('Axios Example');

  const fetchDataWithAxios = async () => {
    const startTime = performance.now();
    try {
      const response = await axios.get('/api/data');
      trackApiCall('GET /api/data', performance.now() - startTime);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return (
    <div>
      <h1>Axios Example</h1>
      <PerformanceSummary metrics={metrics} />
    </div>
  );
};

// Example 3: Using the measureApiCall helper
import { measureApiCall } from '@/hooks/usePerformanceMonitor';

export const ExampleWithHelper = () => {
  const { metrics } = usePerformanceMonitor('Helper Example');

  const fetchData = async () => {
    // Automatically measures and logs the API call
    return await measureApiCall('Fetch User Data', async () => {
      const response = await fetch('/api/user');
      return response.json();
    });
  };

  return (
    <div>
      <h1>Helper Example</h1>
      <PerformanceSummary metrics={metrics} />
    </div>
  );
};
