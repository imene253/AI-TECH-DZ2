import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../api/client';

const MyCourses = () => {
  const { myCourses, refreshEnrollments, isInitialized, currentUserId } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [displayCourses, setDisplayCourses] = useState([]);
  const navigate = useNavigate();

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/course-img-1.png'; 
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBaseUrl()}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  // Main effect to handle course loading
  useEffect(() => {
    const loadCourses = async () => {
      // Don't proceed until context is initialized
      if (!isInitialized) {
        return;
      }

      const hasToken = localStorage.getItem('auth_token');
      
      if (hasToken && currentUserId) {
        setLoading(true);
        try {
          await refreshEnrollments();
        } catch (error) {
          console.error('Error refreshing enrollments:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // User is not authenticated or no token
        setLoading(false);
      }
    };
    
    loadCourses();
  }, [isInitialized, currentUserId, refreshEnrollments]);

  // Update display courses when myCourses changes
  useEffect(() => {
    setDisplayCourses(myCourses);
  }, [myCourses]);

  // Additional check to reload courses if user becomes authenticated
  useEffect(() => {
    if (isInitialized && currentUserId && myCourses.length === 0) {
      const delayedRefresh = setTimeout(() => {
        refreshEnrollments();
      }, 1000);
      
      return () => clearTimeout(delayedRefresh);
    }
  }, [isInitialized, currentUserId, myCourses.length, refreshEnrollments]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="max-w-[1120px] w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-10 pb-6">
        <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#0E2A46] text-right">دروسي</h1>

        {!isInitialized || loading ? (
          <p className="text-[#667085] text-right mt-4">يرجى الانتظار…</p>
        ) : displayCourses.length === 0 ? (
          <div className="text-right mt-4">
            {/* Check if user is not authenticated */}
            {!localStorage.getItem('auth_token') || !currentUserId ? (
              <div>
                <p className="text-[#667085] mb-2">يجب عليك تسجيل الدخول أولاً</p>
                <button 
                  onClick={() => navigate('/auth/signin')}
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