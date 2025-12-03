import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expectedFields, setExpectedFields] = useState([]);
  const [role] = useState(1);
  const navigate = useNavigate();

  
  useEffect(() => {}, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const candidates = [];
      
      candidates.push({ email, password, role: Number(role) });
      if (expectedFields.length) {
        const body = {};
        for (const key of expectedFields) {
          const lower = key.toLowerCase();
          if (lower.includes('email') || lower.includes('user') || lower.includes('login')) body[key] = email;
          else if (lower.includes('pass')) body[key] = password;
          else if (lower.includes('role')) body[key] = Number(role);
        }
        candidates.push(body);
      }
      candidates.push(
        { email, password, role: Number(role) },
        { Email: email, Password: password, Role: Number(role) },
      );

      let ok = false, lastError;
      for (const body of candidates) {
        try { await api.post('/api/Authentification/register', body); ok = true; break; }
        catch (err) { lastError = err; }
      }
      if (!ok) throw lastError || new Error('Register failed');

      navigate('/login', { replace: true });
    } catch (e) {
      const apiMessage = e?.data?.message || e?.data?.error || e?.data?.title || '';
      setError(apiMessage || e?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="bg-white w-full max-w-md p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <label className="block mb-2 text-sm">Email or Username</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" required />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" required />
     
        <button disabled={loading} className="w-full bg-[#54C5F8] text-white py-2 rounded hover:opacity-90">
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-sm text-gray-600">Already have an account? <Link className="text-[#54C5F8]" to="/login">Sign In</Link></p>
      </form>
    </div>
  );
};

export default SignUp;


