import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl, api } from '../api/client';

const MyCourses = () => {
  const { myCourses, isInitialized, currentUserId, forceRefresh, loading } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
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

  // Debug function to test the API directly
  const testCoursesDirectly = async () => {
    try {
      setDebugInfo('Testing API directly...');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setDebugInfo('No auth token found');
        return;
      }

      // Get user info
      const user = await api.get('/api/Authentification/GetMe');
      const userId = Number(user?.id || user?.userId || user?.UserId || user?.Id);
      setDebugInfo(`User ID: ${userId}`);

      // Test enrollments
      try {
        const enrollments = await api.get('/api/Enrollment');
        const userEnrollments = (Array.isArray(enrollments) ? enrollments : [])
          .filter(e => Number(e.userId || e.UserId) === userId);
        setDebugInfo(prev => prev + `\nEnrollments: ${JSON.stringify(userEnrollments, null, 2)}`);
        
        if (userEnrollments.length === 0) {
          // Try payments fallback
          const payments = await api.get('/api/PaymentFille');
          const userPayments = (Array.isArray(payments) ? payments : [])
            .filter(p => {
              const status = p.status || p.state || 0;
              return status === 1 && Number(p.userId || p.UserId) === userId;
            });
          setDebugInfo(prev => prev + `\nApproved Payments: ${JSON.stringify(userPayments, null, 2)}`);
        }
      } catch (e) {
        setDebugInfo(prev => prev + `\nError fetching enrollments: ${e.message}`);
      }

    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  // Force refresh when visiting the page
  useEffect(() => {
    if (isInitialized && currentUserId) {
      // Always refresh courses when visiting MyCourses page
      forceRefresh();
    }
  }, [isInitialized, currentUserId, forceRefresh]);

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
          
          <div className="flex gap-2">
            {currentUserId && (
              <>
                <button
                  onClick={testCoursesDirectly}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
                >
                  Debug API
                </button>
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    refreshing || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#54C5F8] text-white hover:bg-[#46b1e1]'
                  }`}
                >
                  {refreshing || loading ? 'جاري التحديث...' : 'تحديث الدورات'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Debug Info Display */}
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            <button 
              onClick={() => setDebugInfo('')}
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-xs"
            >
              Clear Debug
            </button>
          </div>
        )}

        <div className="bg-yellow-100 p-3 rounded-lg mb-4 text-right">
          <p className="text-sm">
            <strong>Debug Status:</strong><br/>
            User ID: {currentUserId || 'None'}<br/>
            Initialized: {isInitialized ? 'Yes' : 'No'}<br/>
            Loading: {loading ? 'Yes' : 'No'}<br/>
            Courses Count: {myCourses.length}<br/>
            Auth Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
          </p>
        </div>

        {/* Show loading state when refreshing */}
        {(loading && myCourses.length === 0) ? (
          <p className="text-[#667085] text-right mt-4">جاري تحميل الدورات...</p>
        ) : myCourses.length === 0 ? (
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
              <div>
                <p className="text-[#667085] mb-2">لم يتم إضافة أي دورات بعد.</p>
                <button 
                  onClick={handleManualRefresh}
                  disabled={refreshing || loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    refreshing || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#54C5F8] text-white hover:bg-[#46b1e1]'
                  }`}
                >
                  {refreshing || loading ? 'جاري البحث...' : 'البحث عن دورات جديدة'}
                </button>
              </div>
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
      </section>
      <Footer />
    </div>
  );
};

export default MyCourses;