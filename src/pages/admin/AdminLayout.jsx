import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user_info');
    api.clearCache();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(84,197,248,0.08)_0%,rgba(84,197,248,0)_30%)]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
        <Link to="/admin" className="text-[#54C5F8] font-extrabold text-lg">Ramy School • Admin</Link>
      </header>
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-56px)] bg-white border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-sm font-semibold mb-4 text-[#0E2A46] uppercase tracking-wide">Menu</h2>
          <nav className="space-y-1 flex-1">
            <Link to="/admin/users" className={`block px-3 py-2 rounded ${isActive('/admin/users') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Users</Link>
            <Link to="/admin/courses" className={`block px-3 py-2 rounded ${isActive('/admin/courses') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Courses</Link>
            <Link to="/admin/chapters" className={`block px-3 py-2 rounded ${isActive('/admin/chapters') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Chapters</Link>
            <Link to="/admin/videos" className={`block px-3 py-2 rounded ${isActive('/admin/videos') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Videos</Link>
            <Link to="/admin/quiz" className={`block px-3 py-2 rounded ${isActive('/admin/quiz') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Quizzes & Questions</Link>
            <Link to="/admin/payments" className={`block px-3 py-2 rounded ${isActive('/admin/payments') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Payments</Link>
            <Link to="/admin/enrollments" className={`block px-3 py-2 rounded ${isActive('/admin/enrollments') ? 'bg-[#54C5F8] text-white' : 'hover:bg-gray-100 text-[#0E2A46]'}`}>Enrollments</Link>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full block px-3 py-2 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;



