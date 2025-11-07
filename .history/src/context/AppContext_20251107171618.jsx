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
  const coursesLoadedRef = useRef(false); // Track if courses have been loaded

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

  // Improved course persistence
  const saveCourses = useCallback((courses, userId) => {
    if (userId) {
      const key = getStorageKey(userId);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(courses));
          localStorage.setItem(`coursesLoaded_${userId}`, 'true');
        } catch (error) {
          console.error('Error saving courses to localStorage:', error);
        }
      }
    }
  }, [getStorageKey]);

  const refreshEnrollments = useCallback(async (forceRefresh = false) => {
    const userId = currentUserIdRef.current;

    if (!userId) {
      setMyCourses([]);
      coursesLoadedRef.current = false;
      return;
    }

    // Don't refresh if already loaded and not forced
    if (coursesLoadedRef.current && !forceRefresh) {
      return;
    }

    if (isRefreshingRef.current && !forceRefresh) {
      return;
    }
    
    isRefreshingRef.current = true;

    try {
      if (forceRefresh) {
        api.clearCache();
      }
      
      let enrolledCourseIds = [];
      
      try {
        const enrollments = await api.get('/api/Enrollment');
        const eitems = Array.isArray(enrollments) ? enrollments : (enrollments?.items || []);
        const mine = eitems.filter((en) => Number(en.userId ?? en.UserId) === userId);
        enrolledCourseIds = Array.from(new Set(mine.map(en => Number(en.courseId ?? en.CourseId)).filter(Boolean)));
      } catch (err) {
        try {
          const payments = await api.get('/api/PaymentFille');
          const items = Array.isArray(payments) ? payments : (payments?.items || []);
          const approved = items.filter((p) => {
            const s = typeof p.status === 'number' ? p.status : (typeof p.state === 'number' ? p.state : 0);
            const paymentUserId = Number(p.userId ?? p.UserId ?? p.userid ?? NaN);
            return s === 1 && paymentUserId === userId;
          });
          enrolledCourseIds = Array.from(new Set(approved.map(p => Number(p.courseId)).filter(Boolean)));
        } catch (paymentErr) {
          console.error('Error fetching both enrollments and payments:', paymentErr);
        }
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
            coursePicture: courseData.coursePicture,
            duration: '08 hr 12 mins',
            author: courseData.teacherName || 'Instructor',
            teacherPhoto: courseData.teacherPicture || '/images/teacherphoto1.png',
            price: courseData.price ? `$${courseData.price}` : 'Free',
            description: courseData.title,
            url: courseData.url,
            chapters: courseData.chapters || []
          });
        } catch (err) {
          console.error(`Error fetching course ${courseId}:`, err);
        }
      }

      setMyCourses(enrolledCourses);
      saveCourses(enrolledCourses, userId);
      coursesLoadedRef.current = true;
      
    } catch (error) {
      console.error('Error refreshing enrollments:', error);
      // On error, try to load from cache
      const cached = loadCoursesForUser(userId);
      if (cached.length > 0) {
        setMyCourses(cached);
        coursesLoadedRef.current = true;
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [saveCourses, loadCoursesForUser]);

  // Initialize context with better state management
  const initializeContext = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCurrentUserId(null);
        currentUserIdRef.current = null;
        setMyCourses([]);
        coursesLoadedRef.current = false;
        setIsInitialized(true);
        return;
      }

      const me = await api.get('/api/Authentification/GetMe');
      const uid = Number(me?.id ?? me?.userId ?? me?.UserId ?? me?.Id ?? NaN);
      const resolvedId = Number.isNaN(uid) ? null : uid;
      
      setCurrentUserId(resolvedId);
      currentUserIdRef.current = resolvedId;

      if (resolvedId) {
        // Always load cached courses first for immediate display
        const cached = loadCoursesForUser(resolvedId);
        if (cached.length > 0) {
          setMyCourses(cached);
          coursesLoadedRef.current = true;
        }

        // Then refresh from server (will update if needed)
        await refreshEnrollments(false);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing context:', err);
      localStorage.removeItem('auth_token');
      setCurrentUserId(null);
      currentUserIdRef.current = null;
      setMyCourses([]);
      coursesLoadedRef.current = false;
      setIsInitialized(true);
    }
  }, [loadCoursesForUser, refreshEnrollments]);

  // Remove the aggressive auto-refresh that might be clearing courses
  useEffect(() => {
    if (!currentUserId || !isInitialized) return;

    // Only auto-refresh every 5 minutes instead of 30 seconds
    const interval = setInterval(() => {
      refreshEnrollments(true);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentUserId, isInitialized, refreshEnrollments]);

  // Initialize on mount
  useEffect(() => {
    initializeContext();
  }, []);

  // Handle authentication changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        coursesLoadedRef.current = false; // Reset loaded flag
        initializeContext();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeContext]);

  const value = useMemo(() => ({
    myCourses,
    refreshEnrollments,
    isInitialized,
    currentUserId,
    forceRefresh: () => {
      coursesLoadedRef.current = false;
      return refreshEnrollments(true);
    },
  }), [myCourses, refreshEnrollments, isInitialized, currentUserId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);