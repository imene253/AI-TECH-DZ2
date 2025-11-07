import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEnrollments = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
    
      
      if (forceRefresh) {
        api.clearCache();
      }
      
      const [enrollmentsData, coursesData, usersData] = await Promise.all([
        api.get('/api/Enrollment'),
        api.get('/api/Courses'),
        api.get('/api/Authentification/GetAll')
      ]);
      
   
      
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error('Failed to load enrollments:', e);
      setError(e?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : `Course ID: ${courseId}`;
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.email || user.userName || user.user || `User ID: ${userId}`) : `User ID: ${userId}`;
  };

  const getCourseDetails = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course || null;
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl shadow-sm">
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">All Enrollments</h2>
                <span className="text-xs sm:text-sm text-gray-500">({enrollments.length} total)</span>
              </div>
              <button
                onClick={() => loadEnrollments(true)}
                className="w-full sm:w-auto text-sm text-sky-400 hover:text-sky-600 font-medium transition-colors text-left sm:text-right"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {error && (
            <div className="m-3 sm:m-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Loading…</div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500 text-sm">No enrollments found.</div>
          ) : (
            <>
              {/* Mobile  View */}
              <div className="block md:hidden divide-y divide-gray-200">
                {enrollments.map((enrollment, idx) => {
                  const courseDetails = getCourseDetails(enrollment.courseId);
                  return (
                    <div key={enrollment.id || idx} className="p-4 space-y-3 bg-white hover:bg-gray-50">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Enrollment ID</span>
                          <span className="text-sm font-semibold text-gray-900">{enrollment.id ?? '-'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">User</span>
                          <div className="text-sm text-gray-900 font-medium">{getUserEmail(enrollment.userId)}</div>
                          <div className="text-xs text-gray-500">ID: {enrollment.userId}</div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">Course</span>
                          <div className="text-sm text-gray-900 font-medium">{getCourseTitle(enrollment.courseId)}</div>
                          <div className="text-xs text-gray-500">ID: {enrollment.courseId}</div>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">Course Details</span>
                          {courseDetails ? (
                            <div className="text-xs space-y-1">
                              <div><span className="font-medium">Price:</span> ${courseDetails.price || 0}</div>
                              <div><span className="font-medium">Teacher:</span> {courseDetails.teacherName || 'N/A'}</div>
                              <div><span className="font-medium">URL:</span> {courseDetails.url ? 'Available' : 'N/A'}</div>
                              <div><span className="font-medium">Chapters:</span> {courseDetails.chapters?.length || 0}</div>
                            </div>
                          ) : (
                            <span className="text-red-500 text-xs">Course not found!</span>
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500 block mb-1">Enrollment Date</span>
                          <div className="text-sm text-gray-900">
                            {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleString() : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Enrollment ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Course</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Course Details</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enrollments.map((enrollment, idx) => {
                      const courseDetails = getCourseDetails(enrollment.courseId);
                      return (
                        <tr key={enrollment.id || idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{enrollment.id ?? '-'}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{getUserEmail(enrollment.userId)}</div>
                              <div className="text-xs text-gray-500">ID: {enrollment.userId}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{getCourseTitle(enrollment.courseId)}</div>
                              <div className="text-xs text-gray-500">ID: {enrollment.courseId}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {courseDetails ? (
                              <div className="text-xs space-y-0.5">
                                <div><span className="font-medium">Price:</span> ${courseDetails.price || 0}</div>
                                <div><span className="font-medium">Teacher:</span> {courseDetails.teacherName || 'N/A'}</div>
                                <div><span className="font-medium">URL:</span> {courseDetails.url ? 'Available' : 'N/A'}</div>
                                <div><span className="font-medium">Chapters:</span> {courseDetails.chapters?.length || 0}</div>
                              </div>
                            ) : (
                              <span className="text-red-500 text-xs">Course not found!</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Enrollments;