// AdminGuard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../api/client';

const AdminGuard = () => {
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthorized(false);
        return;
      }

      try {
        const me = await api.get('/api/Authentification/GetMe');
        const role = Number(me?.role ?? -1);
        
        if (role === 0) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }

      } catch (err) {
        localStorage.removeItem('auth_token');
        setAuthorized(false);
      }
    };

    checkAdmin();
  }, [location.pathname]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking admin access…
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminGuard;
