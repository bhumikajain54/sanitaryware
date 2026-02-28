import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebugger = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    const data = {
      user: localStorage.getItem('user'),
      userToken: localStorage.getItem('userToken'),
      adminToken: localStorage.getItem('adminToken'),
      userId: localStorage.getItem('userId')
    };
    setStorageData(data);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-2xl max-w-md z-[9999] text-xs font-mono">
      <h3 className="font-bold text-teal-400 mb-2">🔍 Auth Debug Panel</h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-slate-400">Authenticated:</span>{' '}
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">Is Admin:</span>{' '}
          <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>
            {isAdmin ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">User Role:</span>{' '}
          <span className="text-yellow-400">{user?.role || 'N/A'}</span>
        </div>
        
        <div>
          <span className="text-slate-400">User ID:</span>{' '}
          <span className="text-blue-400">{user?.id || 'N/A'}</span>
        </div>
        
        <div>
          <span className="text-slate-400">Token Present:</span>{' '}
          <span className={user?.token ? 'text-green-400' : 'text-red-400'}>
            {user?.token ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        
        <div className="pt-2 border-t border-slate-700">
          <details>
            <summary className="cursor-pointer text-slate-400 hover:text-white">
              LocalStorage Data
            </summary>
            <pre className="mt-2 text-[10px] bg-slate-800 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(storageData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
