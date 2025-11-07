import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { api } from '../api/client';

const AppContext = createContext({
  myCourses: [],
  addCourse: (_course) => {},
  refreshEnrollments: async () => {},
  currentUserId: null,
  isInitialized: false,
});

export const AppProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isRefreshingRef = useRef(false);
  const initializingRef = useRef(false);

  // Simplified storage functions
  const getStorageKey = (userId) => `myCourses_${userId}`;
  
  const loadCachedCourses = (userId) => {
    if (!userId) return [];
    try {
      const cached = localStorage.getItem(getStorageKey(userId));
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const saveCourses = (courses, userId) => {
    if (!userId) return;
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses:', e);
    }
  };

  // Simplified refresh function
  const refreshEnrollments = useCallback(async (force = false) => {
    if (!currentUserId || (isRefreshingRef.current && !force)) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      if (force) api.clearCache();

      // Get enrollments
      let courseIds = [];
      try {
        const enrollments = await api.get('/api/Enrollment');
        const userEnrollments = (Array.isArray(enrollments) ? enrollments : [])
          .filter(e => Number(e.userId || e.UserId) === currentUserId);
        courseIds = userEnrollments.map(e => Number(e.courseId || e.CourseId));
      } catch {
        // Fallback to payments
        const payments = await api.get('/api/PaymentFille');
        const userPayments = (Array.isArray(payments) ? payments : [])
          .filter(p => {
            const status = p.status || p.state || 0;
            return status === 1 && Number(p.userId || p.UserId) === currentUserId;
          });
        courseIds = userPayments.map(p => Number(p.courseId));
      }

      // Get unique course IDs
      courseIds = [...new Set(courseIds.filter(Boolean))];

      // Fetch course details
      const courses = [];
      for (const courseId of courseIds) {
        try {
          const course = await api.get(`/api/Courses/${courseId}`);
          courses.push({
            id: course.id,
            title: course.title,
            category: course.teacherName || 'دورة',
            subtitle: course.title,
            image: course.teacherPicture || '/images/course-img-1.png',
            coursePicture: course.coursePicture,
            teacherPhoto: course.teacherPicture,
            price: course.price,
            url: course.url
          });
        } catch (e) {
          console.error(`Failed to fetch course ${courseId}:`, e);
        }
      }

      setMyCourses(courses);
      saveCourses(courses, currentUserId);

    } catch (error) {
      console.error('Error refreshing enrollments:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [currentUserId]);

  // Initialize user and load courses
  const initializeUser = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCurrentUserId(null);
        setMyCourses([]);
        setIsInitialized(true);
        return;
      }

      const user = await api.get('/api/Authentification/GetMe');
      const userId = Number(user?.id || user?.userId || user?.UserId || user?.Id);
      
      if (isNaN(userId)) {
        localStorage.removeItem('auth_token');
        setCurrentUserId(null);
        setMyCourses([]);
        setIsInitialized(true);
        return;
      }

      setCurrentUserId(userId);

      // Load cached courses immediately
      const cached = loadCachedCourses(userId);
      if (cached.length > 0) {
        setMyCourses(cached);
      }

      // Then refresh from server
      setTimeout(() => {
        refreshEnrollments(false);
      }, 100);

      setIsInitialized(true);

    } catch (error) {
      console.error('Failed to initialize user:', error);
      localStorage.removeItem('auth_token');
      setCurrentUserId(null);
      setMyCourses([]);
      setIsInitialized(true);
    } finally {
      initializingRef.current = false;
    }
  }, [refreshEnrollments]);

  // Initialize on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        initializeUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeUser]);

  const value = useMemo(() => ({
    myCourses,
    refreshEnrollments,
    isInitialized,
    currentUserId,
    forceRefresh: () => refreshEnrollments(true),
  }), [myCourses, refreshEnrollments, isInitialized, currentUserId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);