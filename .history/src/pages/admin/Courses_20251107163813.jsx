import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    title: '', 
    price: 0, 
    url: '', 
    teacherName: '', 
    teacherPicture: null, 
    coursePicture: null, 
    courseVedio: null 
  });

  const load = async (forceRefresh = false) => {
    setLoading(true); setError('');
    try {
      if (forceRefresh) api.clearCache();
      const data = await api.get('/api/Courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load courses');
    } finally { setLoading(false); }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('Title', form.title);
      formData.append('Price', form.price.toString());
      formData.append('Url', 'placeholder-url'); // Backend requires a non-empty URL
      formData.append('TeacherName', form.teacherName);
      
      // Append files if they exist
      if (form.teacherPicture) {
        formData.append('TeacherPicture', form.teacherPicture);
      }
      if (form.coursePicture) {
        formData.append('CoursePicture', form.coursePicture);
      }
      if (form.courseVedio) {
        formData.append('CourseVedio', form.courseVedio);
      }

      await api.post('/api/Courses', formData);
      setForm({ 
        title: '', 
        price: 0, 
        url: '', 
        teacherName: '', 
        teacherPicture: null, 
        coursePicture: null, 
        courseVedio: null 
      });
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      load();
    } catch (e) {
      setError(e?.message || 'Create failed');
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    setLoading(true); setError('');
    try {
      await api.delete(`/api/Courses/${id}`);
      load();
    } catch (e) {
      setError(e?.message || 'Delete failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-6 max-w-full">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Courses</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 text-red-600">
          <p className="font-semibold">Error:</p>
          <p className="break-words">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-4 rounded border mb-6 w-full max-w-2xl">
        <h2 className="font-semibold mb-3 text-lg">Create Course</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input 
            placeholder="Title" 
            value={form.title} 
            onChange={(e)=>setForm(s=>({ ...s, title: e.target.value }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            required 
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={form.price} 
            onChange={(e)=>setForm(s=>({ ...s, price: parseFloat(e.target.value) || 0 }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            required 
          />
          <input 
            placeholder="Teacher Name" 
            value={form.teacherName} 
            onChange={(e)=>setForm(s=>({ ...s, teacherName: e.target.value }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base sm:col-span-2" 
          />
          
          {/* File inputs */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Picture</label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e)=>setForm(s=>({ ...s, teacherPicture: e.target.files[0] || null }))} 
              className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Picture</label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e)=>setForm(s=>({ ...s, coursePicture: e.target.files[0] || null }))} 
              className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Video</label>
            <input 
              type="file"
              accept="video/*"
              onChange={(e)=>setForm(s=>({ ...s, courseVedio: e.target.files[0] || null }))} 
              className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            />
          </div>
        </div>
        <button 
          onClick={onCreate}
          disabled={loading}
          className="mt-3 bg-[#54C5F8] text-white px-4 py-2 rounded w-full hover:bg-[#3DB5E8] disabled:opacity-50 text-sm md:text-base"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded border w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-base md:text-lg">All Courses</h2>
          <button 
            onClick={() => load(true)} 
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
                <th className="p-3 border-b font-semibold">Price</th>
                <th className="p-3 border-b font-semibold">URL</th>
                <th className="p-3 border-b font-semibold">Teacher</th>
                <th className="p-3 border-b font-semibold">Picture</th>
                <th className="p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, idx) => (
                <tr key={c.id || idx} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{idx + 1}</td>
                  <td className="p-3 border-b">{c.title || ''}</td>
                  <td className="p-3 border-b">${c.price || 0}</td>
                  <td className="p-3 border-b">
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {c.url ? 'View' : 'No URL'}
                    </a>
                  </td>
                  <td className="p-3 border-b">{c.teacherName || ''}</td>
                  <td className="p-3 border-b">
                    {c.teacherPicture ? (
                      <img src={c.teacherPicture} alt={c.teacherName} className="h-10 w-10 object-cover rounded-full border" />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3 border-b">
                    <button 
                      onClick={()=>onDelete(c.id)} 
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!courses.length && !loading && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={7}>No courses found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : courses.length > 0 ? (
            <div className="divide-y">
              {courses.map((c, idx) => (
                <div key={c.id || idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                        <h3 className="font-semibold text-base">{c.title || 'Untitled'}</h3>
                      </div>
                      <p className="text-lg font-bold text-[#54C5F8]">${c.price || 0}</p>
                    </div>
                    {c.teacherPicture && (
                      <img src={c.teacherPicture} alt={c.teacherName} className="h-12 w-12 object-cover rounded-full border ml-3" />
                    )}
                  </div>
                  
                  {c.teacherName && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Teacher: </span>
                      <span className="text-sm">{c.teacherName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3">
                    <a 
                      href={c.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline flex-1"
                    >
                      {c.url ? 'View Course →' : 'No URL'}
                    </a>
                    <button 
                      onClick={()=>onDelete(c.id)} 
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
            <div className="p-4 text-center text-gray-500">No courses found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;