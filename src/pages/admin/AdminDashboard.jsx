// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { api, getBaseUrl } from '../../api/client';

const AdminDashboard = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        
        await api.get('/swagger/v1/swagger.json');
        if (mounted) setStatus('Welcome to Dashboard');
      } catch (e) {
        console.error('AdminDashboard - connection test failed', e);
        if (mounted) setError(e?.response?.data?.message || e?.message || 'Failed to connect');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {status && <p className="text-green-600 mb-4">{status}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading && <p>Loading dashboard...</p>}
    </div>
  );
};

export default AdminDashboard;
