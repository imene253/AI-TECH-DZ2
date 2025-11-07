// AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      const res = await api.post('/api/Authentification/login', { email, password });
      const token = res?.token || res?.accessToken;

      if (!token) {
        throw new Error('No token returned by server');
      }

      
      localStorage.setItem('auth_token', token);

     
      const me = await api.get('/api/Authentification/GetMe');

     
      const roleVal = Number(me?.role ?? -1);
      const isAdmin = roleVal === 0;

      if (!isAdmin) {
        localStorage.removeItem('auth_token');
        setError('Access denied. You are not an admin.');
        return;
      }

     
      localStorage.setItem('admin_user_info', JSON.stringify(me));
      navigate('/admin', { replace: true });

    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white w-full max-w-md p-6 rounded shadow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">Admin Login</h1>
          <p className="text-sm text-gray-600">Sign in to access the admin panel</p>
        </div>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={onSubmit}>
          <label className="block mb-2 text-sm">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            required
            placeholder="admin@example.com"
          />

          <label className="block mb-2 text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            required
            placeholder="Enter password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#54C5F8] text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
