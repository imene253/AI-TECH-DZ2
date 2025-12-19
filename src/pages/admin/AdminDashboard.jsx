// AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to users page immediately
    navigate('/admin/users');
  }, [navigate]);

  return null;
};

export default AdminDashboard;
