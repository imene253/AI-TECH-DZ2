import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    userId: '',
    courseId: ''
  });

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

  const handleCreateEnrollment = async (e) => {
    e.preventDefault();

    if (!newEnrollment.userId || !newEnrollment.courseId) {
      setError('Please select both user and course');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const enrollmentBody = {
        date: new Date().toISOString(),
        userId: Number(newEnrollment.userId),
        courseId: Number(newEnrollment.courseId)
      };

      await api.post('/api/Enrollment', enrollmentBody);

      setNewEnrollment({ userId: '', courseId: '' });
      setShowCreateForm(false);

      await loadEnrollments(true);
    } catch (err) {
      setError(err?.message || 'Failed to create enrollment');
    } finally {
      setLoading(false);
    }
  };

  const deleteEnrollment = async (enrollmentId) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.delete(`/api/Enrollment/${enrollmentId}`);
      await loadEnrollments(true);
    } catch (err) {
      setError(err?.message || 'Failed to delete enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">

        {showCreateForm && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-4">

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