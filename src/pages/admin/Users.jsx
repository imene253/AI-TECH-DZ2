import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (forceRefresh = false) => {
    setLoading(true); setError('');
    try {
      
      if (forceRefresh) {
        api.clearCache();
      }
      
      const data = await api.get('/api/Authentification/GetAll');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load users');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white p-4 rounded border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">All Users</h2>
          <button onClick={() => load(true)} className="text-sm text-[#54C5F8]">Refresh</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2 border-b">#</th>
                  <th className="p-2 border-b">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id || idx} className="odd:bg-gray-50">
                    <td className="p-2 border-b">{idx + 1}</td>
                    <td className="p-2 border-b">{u.email || u.userName || u.user || ''}</td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td className="p-2" colSpan={2}>No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
