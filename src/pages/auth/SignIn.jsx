import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expectedFields, setExpectedFields] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {}, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const candidates = [];
      if (expectedFields.length) {
        const body = {};
        for (const key of expectedFields) {
          const lower = key.toLowerCase();
          if (lower.includes('email') || lower.includes('user') || lower.includes('login')) body[key] = email;
          else if (lower.includes('pass')) body[key] = password;
        }
        candidates.push(body);
      }
      candidates.push(
        { email, password },
        { Email: email, Password: password },
      );

      let data, lastError;
      for (const body of candidates) {
        try { data = await api.post('/api/Authentification/login', body); break; }
        catch (err) { lastError = err; }
      }
      if (!data) throw lastError || new Error('Login failed');

      const token = data?.token || data?.accessToken || data;
      if (!token) throw new Error('No token returned');
      
      try { 
        localStorage.setItem('auth_token', token); 
       
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_token',
          newValue: token
        }));
      } catch {}

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
     
      // Pre-fetch user data
      (async () => { try { await api.get('/api/Authentification/GetMe', { timeout: 8000 }); } catch {} })();
    } catch (e) {
      const apiMessage = e?.data?.message || e?.data?.error || e?.data?.title || '';
      setError(apiMessage || e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="bg-white w-full max-w-md p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <label className="block mb-2 text-sm">Email </label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" required />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" required />
        <button disabled={loading} className="w-full bg-[#54C5F8] text-white py-2 rounded hover:opacity-90">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="mt-4 text-sm text-gray-600">No account? <Link className="text-[#54C5F8]" to="/register">Sign Up</Link></p>
      </form>
    </div>
  );
};

export default SignIn;




