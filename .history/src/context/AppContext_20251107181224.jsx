import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);

  // Simple storage functions
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

  // Direct course loading function
  const loadUserCourses = async (userId, useCache = true) => {
    if (!userId) return [];

    // Load cached first if requested
    if (useCache) {
      const cached = loadCachedCourses(userId);
      if (cached.length > 0) {
        setMyCourses(cached);
      }
    }

    try {
      // Get enrollments or payments
      let courseIds = [];
      
      try {
        const enrollments = await api.get('/api/Enrollment');
        const userEnrollments = (Array.isArray(enrollments) ? enrollments : [])
          .filter(e => Number(e.userId || e.UserId) === userId);
        courseIds = userEnrollments.map(e => Number(e.courseId || e.CourseId));
      } catch {
        const payments = await api.get('/api/PaymentFille');
        const userPayments = (Array.isArray(payments) ? payments : [])
          .filter(p => {
            const status = p.status || p.state || 0;
            return status === 1 && Number(p.userId || p.UserId) === userId;
          });
        courseIds = userPayments.map(p => Number(p.courseId));
      }

      courseIds = [...new Set(courseIds.filter(Boolean))];

      // Get course details
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
      saveCourses(courses, userId);
      return courses;

    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  // Initialize user with route-based logic
  const initializeUser = async () => {
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
      const userRole = Number(user?.role ?? -1);
      
      if (isNaN(userId)) {
        localStorage.removeItem('auth_token');
        setCurrentUserId(null);
        setMyCourses([]);
        setIsInitialized(true);
        return;
      }

      // Check if we're on user pages but logged in as admin
      const currentPath = window.location.pathname;
      const isUserPage = !currentPath.includes('/admin');
      const isAdmin = userRole === 0;

      if (isUserPage && isAdmin) {
        // On user pages but logged in as admin - don't load courses
        setCurrentUserId(userId);
        setMyCourses([]);
        setIsInitialized(true);
        return;
      }

      setCurrentUserId(userId);
      
      // Only load courses for non-admin users or when explicitly on user pages
      if (!isAdmin) {
        await loadUserCourses(userId, true);
      }
      
      setIsInitialized(true);

    } catch (error) {
      console.error('Failed to initialize user:', error);
      localStorage.removeItem('auth_token');
      setCurrentUserId(null);
      setMyCourses([]);
      setIsInitialized(true);
    }
  };

  // Refresh function
  const refreshEnrollments = useCallback(async (force = false) => {
    if (!currentUserId || loading) return;
    
    setLoading(true);
    try {
      if (force) api.clearCache();
      await loadUserCourses(currentUserId, !force);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, loading]);

  // Initialize on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        initializeUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(() => ({
    myCourses,
    refreshEnrollments,
    isInitialized,
    currentUserId,
    loading,
    forceRefresh: () => refreshEnrollments(true),
  }), [myCourses, refreshEnrollments, isInitialized, currentUserId, loading]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);