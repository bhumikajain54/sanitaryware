/**
 * Performance Summary Component
 * Displays real-time performance metrics in development mode
 */
export const PerformanceSummary = ({ metrics }) => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  const totalApiTime = metrics.apiCalls.reduce(
    (sum, call) => sum + call.duration,
    0
  );

  const slowestApi = metrics.apiCalls.reduce(
    (slowest, call) => (call.duration > (slowest?.duration || 0) ? call : slowest),
    null
  );

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-2xl text-xs font-mono z-50 max-w-sm">
      <h3 className="font-bold mb-2 text-teal-400">⚡ Performance Metrics</h3>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Render:</span>{' '}
          <span className={metrics.renderTime < 100 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.renderTime.toFixed(0)}ms
          </span>
        </div>
        <div>
          <span className="text-gray-400">Load:</span>{' '}
          <span className={metrics.pageLoadTime < 1000 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.pageLoadTime.toFixed(0)}ms
          </span>
        </div>
        <div>
          <span className="text-gray-400">API Calls:</span>{' '}
          <span className="text-white">{metrics.apiCalls.length}</span>
        </div>
        <div>
          <span className="text-gray-400">Total API Time:</span>{' '}
          <span className={totalApiTime < 500 ? 'text-green-400' : 'text-yellow-400'}>
            {totalApiTime.toFixed(0)}ms
          </span>
        </div>
        {slowestApi && (
          <div className="text-red-400 mt-2">
            Slowest: {slowestApi.endpoint} ({slowestApi.duration.toFixed(0)}ms)
          </div>
        )}
        {metrics.apiCalls.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-teal-400 hover:text-teal-300">
              API Details ({metrics.apiCalls.length})
            </summary>
            <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
              {metrics.apiCalls.map((call, idx) => (
                <div key={idx} className="text-xs pl-2 border-l border-slate-700">
                  <span className="text-gray-500">{call.endpoint}:</span>{' '}
                  <span className={call.duration < 200 ? 'text-green-400' : call.duration < 500 ? 'text-yellow-400' : 'text-red-400'}>
                    {call.duration.toFixed(0)}ms
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default PerformanceSummary;
