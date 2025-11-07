import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';

const MyCourses = () => {
  const { myCourses, refreshEnrollments, isInitialized, currentUserId, forceRefresh } = useAppContext();
  const [loading, setLoading] = useState(false); // Changed initial value to false
  const [displayCourses, setDisplayCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/course-img-1.png'; 
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBaseUrl()}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  // Update display courses immediately when myCourses changes
  useEffect(() => {
    setDisplayCourses(myCourses);
  }, [myCourses]);

  // Simplified loading logic
  useEffect(() => {
    if (!isInitialized) {
      setLoading(true);
      return;
    }

    const hasToken = localStorage.getItem('auth_token');
    
    if (hasToken && currentUserId) {
      // User is authenticated
      if (myCourses.length === 0) {
        // Only show loading if we truly have no courses
        setLoading(true);
        refreshEnrollments().finally(() => setLoading(false));
      } else {
        // We have courses, no need to show loading
        setLoading(false);
      }
    } else {
      // User is not authenticated
      setLoading(false);
    }
  }, [isInitialized, currentUserId, myCourses.length, refreshEnrollments]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Don't show loading if we already have courses to display
  const shouldShowLoading = loading && displayCourses.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="max-w-[1120px] w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-10 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#0E2A46] text-right">دروسي</h1>
          
          {/* Refresh button for authenticated users */}
          {currentUserId && (
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                refreshing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#54C5F8] text-white hover:bg-[#46b1e1]'
              }`}
            >
              {refreshing ? 'جاري التحديث...' : 'تحديث الدورات'}
            </button>
          )}
        </div>

        {/* Only show loading when we truly don't have any courses */}
        {!isInitialized || shouldShowLoading ? (
          <p className="text-[#667085] text-right mt-4">يرجى الانتظار…</p>
        ) : displayCourses.length === 0 ? (
          <div className="text-right mt-4">
            {/* Check if user is not authenticated */}
            {!localStorage.getItem('auth_token') || !currentUserId ? (
              <div>
                <p className="text-[#667085] mb-2">يجب عليك تسجيل الدخول أولاً</p>
           
              </div>
            ) : (
              <div>
                <p className="text-[#667085] mb-2">لم يتم إضافة أي دورات بعد.</p>
            
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {displayCourses.map((course) => {
            
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
                    onError={(e) => {
                     
                      e.target.style.backgroundImage = "url('/images/course-img-1.png')";
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