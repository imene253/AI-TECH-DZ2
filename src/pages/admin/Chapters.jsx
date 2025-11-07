import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', details: '', courseId: 0 });

  const loadChapters = async () => {
    setLoading(true); setError('');
    try {
      const data = await api.get('/api/Chapter');
      setChapters(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load chapters');
    } finally { setLoading(false); }
  };

  const loadCourses = async () => {
    try {
      const data = await api.get('/api/Courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load courses:', e);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/Chapter', form);
      setForm({ title: '', details: '', courseId: 0 });
      await loadChapters();
    } catch (e) {
      setError(e?.message || 'Create failed');
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    setLoading(true); setError('');
    try {
      await api.delete(`/api/Chapter/${id}`);
      await loadChapters();
    } catch (e) {
      setError(e?.message || 'Delete failed');
    } finally { setLoading(false); }
  };

  const onUpdate = async (id, updatedData) => {
    setLoading(true); setError('');
    try {
      await api.put(`/api/Chapter/${id}`, updatedData);
      await loadChapters();
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    loadChapters();
    loadCourses();
  }, []);

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <div className="p-4 md:p-6 max-w-full">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Chapters</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 text-red-600">
          <p className="font-semibold">Error:</p>
          <p className="break-words">{error}</p>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white p-4 rounded border mb-6 w-full max-w-2xl">
        <h2 className="font-semibold mb-3 text-lg">Create Chapter</h2>
        <div className="grid grid-cols-1 gap-3">
          <input 
            placeholder="Title" 
            value={form.title} 
            onChange={(e)=>setForm(s=>({ ...s, title: e.target.value }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            required 
          />
          <textarea 
            placeholder="Details" 
            value={form.details} 
            onChange={(e)=>setForm(s=>({ ...s, details: e.target.value }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            rows={3} 
            required 
          />
          <select 
            value={form.courseId} 
            onChange={(e)=>setForm(s=>({ ...s, courseId: parseInt(e.target.value) }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            required
          >
            <option value={0}>Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={onCreate}
          disabled={loading}
          className="mt-3 bg-[#54C5F8] text-white px-4 py-2 rounded w-full hover:bg-[#3DB5E8] disabled:opacity-50 text-sm md:text-base"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Chapters List */}
      <div className="bg-white rounded border w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-base md:text-lg">All Chapters</h2>
          <button 
            onClick={loadChapters} 
            disabled={loading}
            className="text-xs md:text-sm text-[#54C5F8] hover:underline disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3 border-b font-semibold">#</th>
                <th className="p-3 border-b font-semibold">Title</th>
                <th className="p-3 border-b font-semibold">Details</th>
                <th className="p-3 border-b font-semibold">Course</th>
                <th className="p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter, idx) => (
                <tr key={chapter.id || idx} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{idx + 1}</td>
                  <td className="p-3 border-b">{chapter.title || ''}</td>
                  <td className="p-3 border-b max-w-xs truncate" title={chapter.details}>{chapter.details || ''}</td>
                  <td className="p-3 border-b">{getCourseTitle(chapter.courseId)}</td>
                  <td className="p-3 border-b">
                    <button 
                      onClick={()=>onDelete(chapter.id)} 
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!chapters.length && !loading && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={5}>No chapters found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chapters.length > 0 ? (
            <div className="divide-y">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id || idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                        <h3 className="font-semibold text-base">{chapter.title || 'Untitled'}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {chapter.details || 'No details'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3 mt-2">
                    <span className="inline-block bg-[#54C5F8] bg-opacity-10 text-[#54C5F8] text-xs font-medium px-2 py-1 rounded">
                      {getCourseTitle(chapter.courseId)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                    <button 
                      onClick={()=>onDelete(chapter.id)} 
                      disabled={loading}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No chapters found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chapters;