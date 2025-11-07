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
  const refreshCountRef = useRef(0);
  const currentUserIdRef = useRef(null); 

 
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const getStorageKey = (userId) => (userId != null ? `myCourses_${userId}` : null);

  const loadCoursesForUser = useCallback((userId) => {
    if (userId == null) return [];
    try {
      const key = getStorageKey(userId);
      const raw = key ? localStorage.getItem(key) : null;
      const savedCourses = raw ? JSON.parse(raw) : [];
      return savedCourses.filter((c) => c?.type !== 'devoir');
    } catch {
      return [];
    }
  }, []);

  // Refresh enrollments function with improved cache handling
  const refreshEnrollments = useCallback(async (forceRefresh = false) => {
    refreshCountRef.current += 1;
    const currentRefresh = refreshCountRef.current;
   
    const userId = currentUserIdRef.current;

    if (!userId) {
      setMyCourses([]);
      return;
    }

    if (isRefreshingRef.current && !forceRefresh) {
      // Wait for current refresh to complete unless forced
      let attempts = 0;
      while (isRefreshingRef.current && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return;
    }
    
    isRefreshingRef.current = true;

    try {
      // Clear API cache to ensure fresh data
      api.clearCache();
      
      let enrolledCourseIds = [];
      try {
        // Try to get enrollments first
        const enrollments = await api.get('/api/Enrollment');
        const eitems = Array.isArray(enrollments) ? enrollments : (enrollments?.items || []);
        const mine = eitems.filter((en) => Number(en.userId ?? en.UserId) === userId);
        enrolledCourseIds = Array.from(new Set(mine.map(en => Number(en.courseId ?? en.CourseId)).filter(Boolean)));
      } catch (err) {
        // Fallback to payments
        const payments = await api.get('/api/PaymentFille');
        const items = Array.isArray(payments) ? payments : (payments?.items || []);
        const approved = items.filter((p) => {
          const s = typeof p.status === 'number' ? p.status : (typeof p.state === 'number' ? p.state : 0);
          const paymentUserId = Number(p.userId ?? p.UserId ?? p.userid ?? NaN);
          return s === 1 && paymentUserId === userId;
        });
        enrolledCourseIds = Array.from(new Set(approved.map(p => Number(p.courseId)).filter(Boolean)));
      }

      const enrolledCourses = [];
      for (const courseId of enrolledCourseIds) {
        try {
          const courseData = await api.get(`/api/Courses/${courseId}`);
          enrolledCourses.push({
            id: courseData.id,
            title: courseData.title,
            category: courseData.teacherName || 'General',
            subtitle: courseData.title,
            image: courseData.teacherPicture || '/images/course-img-1.png',
            coursePicture: courseData.coursePicture, // Add coursePicture field
            duration: '08 hr 12 mins',
            author: courseData.teacherName || 'Instructor',
            teacherPhoto: courseData.teacherPicture || '/images/teacherphoto1.png',
            price: courseData.price ? `$${courseData.price}` : 'Free',
            description: courseData.title,
            url: courseData.url,
            chapters: courseData.chapters || []
          });
        } catch (err) {
          // Continue with other courses if one fails
        }
      }

      // Always update the courses, even if empty
      setMyCourses(enrolledCourses);
      
      // Update localStorage cache
      const key = getStorageKey(userId);
      if (key) {
        localStorage.setItem(key, JSON.stringify(enrolledCourses));
      }
      
    } catch (error) {
      console.error('Error refreshing enrollments:', error);
      // Don't clear courses on error, keep existing ones
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Auto-refresh enrollments periodically when user is authenticated
  useEffect(() => {
    if (!currentUserId || !isInitialized) return;

    // Set up periodic refresh every 30 seconds when user is authenticated
    const interval = setInterval(() => {
      refreshEnrollments(true); // Force refresh to bypass cache
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId, isInitialized, refreshEnrollments]);

  // Listen for focus events to refresh when user comes back to tab
  useEffect(() => {
    const handleFocus = () => {
      if (currentUserId && isInitialized) {
        refreshEnrollments(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUserId, isInitialized, refreshEnrollments]);

 
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        initializeContext();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
 
  const initializeContext = useCallback(async () => {
   
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
      
        setCurrentUserId(null);
        currentUserIdRef.current = null;
        setMyCourses([]);
        setIsInitialized(true);
        return;
      }

    
      const me = await api.get('/api/Authentification/GetMe');
      const uid = Number(me?.id ?? me?.userId ?? me?.UserId ?? me?.Id ?? NaN);
      const resolvedId = Number.isNaN(uid) ? null : uid;
      

      setCurrentUserId(resolvedId);
      currentUserIdRef.current = resolvedId; 

     
      const cached = loadCoursesForUser(resolvedId);
    
      if (cached.length > 0) setMyCourses(cached);

    
      if (resolvedId) {
        
        await refreshEnrollments();
      }

     
      setIsInitialized(true);
    } catch (err) {
    
      localStorage.removeItem('auth_token');
      setCurrentUserId(null);
      currentUserIdRef.current = null;
      setMyCourses([]);
      setIsInitialized(true);
    }
  }, [loadCoursesForUser, refreshEnrollments]);

 
  useEffect(() => {
    initializeContext();
  }, [initializeContext]);

  const value = useMemo(() => ({
    myCourses,
    refreshEnrollments,
    isInitialized,
    currentUserId,
    forceRefresh: () => refreshEnrollments(true), // Add force refresh function
  }), [myCourses, refreshEnrollments, isInitialized, currentUserId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);