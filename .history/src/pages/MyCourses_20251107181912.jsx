import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl, api } from '../api/client';

const MyCourses = () => {
  const { myCourses, isInitialized, currentUserId, forceRefresh, loading } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const navigate = useNavigate();

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/course-img-1.png'; 
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBaseUrl()}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Check if current user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const user = await api.get('/api/Authentification/GetMe');
        const userRole = Number(user?.role ?? -1);
        setIsAdminUser(userRole === 0);
      } catch (e) {
        setIsAdminUser(false);
      }
    };
    
    if (isInitialized) {
      checkUserRole();
    }
  }, [isInitialized]);

  // Force refresh when visiting the page (only for non-admin users)
  useEffect(() => {
    if (isInitialized && currentUserId && !isAdminUser) {
      forceRefresh();
    }
  }, [isInitialized, currentUserId, isAdminUser, forceRefresh]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="max-w-[1120px] w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-10 pb-6">
          <p className="text-[#667085] text-right mt-4">جاري التحميل...</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="max-w-[1120px] w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-10 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#0E2A46] text-right">دروسي</h1>
        </div>

        {/* Admin Warning */}
        {isAdminUser && (
          <div className="bg-orange-100 border border-orange-300 p-4 rounded-lg mb-4 text-right">
            <h3 className="font-bold text-orange-800 mb-2">⚠️ تنبيه: أنت مسجل دخول كمدير</h3>
            <p className="text-orange-700 text-sm mb-2">
              أنت حالياً مسجل دخول كمدير (User ID: {currentUserId}). المديرون لا يملكون دورات تعليمية.
            </p>
            <p className="text-orange-700 text-sm mb-3">
              للوصول إلى الدورات التعليمية، يجب تسجيل الدخول كمستخدم عادي.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  navigate('/login');
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
              >
                تسجيل الخروج والدخول كمستخدم
              </button>
              <button 
                onClick={() => navigate('/admin')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                العودة إلى لوحة الإدارة
              </button>
            </div>
          </div>
        )}

        {/* Course content - only show for non-admin users */}
        {!isAdminUser && (
          <>
            {myCourses.length === 0 ? (
              <div className="text-right mt-4">
                {!localStorage.getItem('auth_token') || !currentUserId ? (
                  <div>
                    <p className="text-[#667085] mb-2">يجب عليك تسجيل الدخول أولاً</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className="bg-[#54C5F8] text-white px-4 py-2 rounded-lg hover:bg-[#46b1e1] transition"
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                ) : (
                  <p className="text-[#667085]">لم يتم إضافة أي دورات بعد.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {myCourses.map((course) => {
                  const courseImageUrl = getImageUrl(course.coursePicture || course.image);
                  
                  return (
                    <div
                      key={course.id}
                      className="rounded-lg shadow hover:shadow-lg border border-gray-100 cursor-pointer transition"
                      onClick={() => navigate(`/player/${course.id}`)}
                    >
                      <div
                        className="h-40 bg-cover bg-center bg-gray-200"
                        style={{ 
                          backgroundImage: `url(${courseImageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div className="p-5 text-right">
                        <span className="text-[#1A906B] text-sm font-semibold">{course.category || 'دورة'}</span>
                        <h2 className="text-[#101828] text-lg font-bold mt-1">{course.title}</h2>
                        {course.subtitle && (
                          <p className="text-[#667085] text-sm mt-1">{course.subtitle}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default MyCourses;