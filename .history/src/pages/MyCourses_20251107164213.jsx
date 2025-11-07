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

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/course-img-1.png'; 
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a relative path, prepend base URL
    return `${getBaseUrl()}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  useEffect(() => {
    const loadCourses = async () => {
      const hasToken = localStorage.getItem('auth_token');
      
      if (hasToken && currentUserId) {
        setLoading(true);
        await refreshEnrollments();
        setLoading(false);
      } else if (isInitialized) {
        setLoading(false);
      }
    };
    
    loadCourses();
    
    const delayedCheck = setTimeout(() => {
      if (currentUserId && myCourses.length === 0) {
        refreshEnrollments();
      }
    }, 500);
    
    return () => clearTimeout(delayedCheck);
  }, [isInitialized, currentUserId, refreshEnrollments, myCourses.length])

  useEffect(() => {
    setDisplayCourses(myCourses);
  }, [myCourses]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="max-w-[1120px] w-full mx-auto px-6 sm:px-8 md:px-10 lg:px-16 pt-10 pb-6">
        <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#0E2A46] text-right">دروسي</h1>

        {loading ? (
          <p className="text-[#667085] text-right mt-4">يرجى الانتظار…</p>
        ) : displayCourses.length === 0 ? (
          <p className="text-[#667085] text-right mt-4">لم يتم إضافة أي دورات بعد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {displayCourses.map((course) => {
              // Get proper course image URL
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
                      // Fallback to default image if the course image fails to load
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