import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';
import ImageWithFallback from './ImageWithFallback';

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return Boolean(localStorage.getItem('auth_token')); } catch { return false; }
  });

  useEffect(() => {
    const onStorage = () => {
      try { setIsAuthenticated(Boolean(localStorage.getItem('auth_token'))); } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('auth_token'); } catch {}
    setIsAuthenticated(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
     
      <nav className="bg-white border-b border-[#54C5F8] h-16 sm:h-20 md:h-28 flex items-center justify-between px-3 sm:px-4 md:px-12 relative z-50">
        
        {/* Left side  */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-10">
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-[#656565] hover:text-[#54C5F8] transition-colors order-1"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <FaBars className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 p-2 sm:p-4 md:p-10 w-20 sm:w-32 md:w-64 order-2">
            <ImageWithFallback
              src="/images/logo.png"
              alt="Ramy School Logo"
              className="w-10 h-10 sm:w-16 sm:h-16 md:w-22 md:h-22 object-cover"
            />
          
          </div>
          
          {/* Desktop  Items */}
          <div className="hidden lg:flex items-center order-3">
            <Link to="/" className="flex items-center gap-2.5 p-5 hover:bg-gray-50 rounded-lg transition-colors">
              <FaHome className="w-6 h-6 text-[#656565]" />
              <span className="text-[#656565] text-base font-normal">الرئيسية</span>
            </Link>
            <Link to="/courses" className="flex items-center gap-2.5 p-5 hover:bg-gray-50 rounded-lg transition-colors">
              <FaBook className="w-6 h-6 text-[#656565]" />
              <span className="text-[#656565] text-base font-normal">الدورات</span>
            </Link>
            <Link to="/my-courses" className="flex items-center gap-2.5 p-5 hover:bg-gray-50 rounded-lg transition-colors">
              <FaChartLine className="w-6 h-6 text-[#656565]" />
              <span className="text-[#656565] text-base font-normal">دروسي</span>
            </Link>
          
          </div>
        </div>
        
        {/* Right side  */}
        <div className="flex items-center gap-2 md:gap-5 p-2 sm:p-4 md:p-10">
          <div className="hidden md:block w-px h-12 bg-[#EFEFEF]"></div>
          <div className="flex items-center gap-2 md:gap-5">
            {isAuthenticated ? (
              <button className="hidden lg:block px-4 py-2 text-sm text-white bg-red-500 rounded" onClick={handleLogout}>تسجيل الخروج</button>
            ) : (
              <button className="hidden lg:block px-4 py-2 text-sm text-white bg-[#54C5F8] rounded" onClick={() => navigate('/login')}>تسجيل الدخول</button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu  */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#54C5F8]">
          <div className="flex items-center gap-2">
            <ImageWithFallback
              src="/images/logo.png"
              alt="Ramy School Logo"
              className="w-8 h-8 object-cover"
            />
            <span className="text-[#54C5F8] text-lg font-bold">Ramy School</span>
          </div>
          <button 
            onClick={toggleMobileMenu}
            className="p-2 text-[#656565] hover:text-[#54C5F8] transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <div className="flex flex-col p-4">
          <Link to="/" className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <FaHome className="w-5 h-5 text-[#656565]" />
            <span className="text-[#656565] text-base font-normal">الرئيسية</span>
          </Link>
          <Link to="/courses" className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <FaBook className="w-5 h-5 text-[#656565]" />
            <span className="text-[#656565] text-base font-normal">الدورات</span>
          </Link>
          <Link to="/my-courses" className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <FaChartLine className="w-5 h-5 text-[#656565]" />
            <span className="text-[#656565] text-base font-normal">دروسي</span>
          </Link>
        
        </div>

        {/* Mobile Menu User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#EFEFEF] bg-gray-50">
          <div className="flex items-center justify-between">
            {isAuthenticated ? (
              <button className="w-full bg-red-500 text-white py-2 rounded" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>تسجيل الخروج</button>
            ) : (
              <button className="w-full bg-[#54C5F8] text-white py-2 rounded" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>تسجيل الدخول</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;