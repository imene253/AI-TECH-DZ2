import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    url: '', 
    chapterId: 0, 
    videoFile: null,
    title: ''
  });

  const loadVideos = async (forceRefresh = false) => {
    setLoading(true); setError('');
    try {
      if (forceRefresh) {
        api.clearCache();
      }
      
      const data = await api.get('/api/Video');
      setVideos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load videos');
    } finally { setLoading(false); }
  };

  const loadChapters = async () => {
    try {
      const data = await api.get('/api/Chapter');
      setChapters(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load chapters:', e);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (!form.videoFile) {
        setError('Please select a video file to upload');
        setLoading(false);
        return;
      }

      if (form.chapterId === 0) {
        setError('Please select a chapter');
        setLoading(false);
        return;
      }

      // Create FormData for multipart/form-data (same pattern as Courses)
      const formData = new FormData();
      formData.append('Url', ''); // Required field, send empty string like in Courses
      formData.append('ChapterId', form.chapterId.toString());
      formData.append('VideoFile', form.videoFile);
      
      await api.post('/api/Video', formData);
      
      setForm({ url: '', chapterId: 0, videoFile: null, title: '' });
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      await loadVideos();
    } catch (e) {
      setError(e?.message || 'Create failed');
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    setLoading(true); setError('');
    try {
      await api.delete(`/api/Video/${id}`);
      await loadVideos();
    } catch (e) {
      setError(e?.message || 'Delete failed');
    } finally { setLoading(false); }
  };

  const onUpdate = async (id, updatedData) => {
    setLoading(true); setError('');
    try {
      await api.put(`/api/Video/${id}`, updatedData);
      await loadVideos();
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    loadVideos();
    loadChapters();
  }, []);

  const getChapterTitle = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.title : 'Unknown Chapter';
  };

  return (
    <div className="p-4 md:p-6 max-w-full">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Videos</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 text-red-600">
          <p className="font-semibold">Error:</p>
          <p className="break-words">{error}</p>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white p-4 rounded border mb-6 w-full max-w-2xl">
        <h2 className="font-semibold mb-3 text-lg">Create Video</h2>
        <div className="grid grid-cols-1 gap-3">
          <input 
            placeholder="Video Title" 
            value={form.title} 
            onChange={(e)=>setForm(s=>({ ...s, title: e.target.value }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
          />
          
          <select 
            value={form.chapterId} 
            onChange={(e)=>setForm(s=>({ ...s, chapterId: parseInt(e.target.value) }))} 
            className="border rounded px-3 py-2 w-full text-sm md:text-base" 
            required
          >
            <option value={0}>Select Chapter</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
            ))}
          </select>

          <div className="border-t pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File
              </label>
              <input 
                type="file"
                accept="video/*"
                onChange={(e)=>setForm(s=>({ ...s, videoFile: e.target.files[0] || null }))} 
                className="border rounded px-3 py-2 w-full text-sm md:text-base" 
              />
            </div>
          </div>
        </div>
        <button 
          onClick={onCreate}
          disabled={loading || (form.chapterId === 0) || !form.videoFile}
          className="mt-3 bg-[#54C5F8] text-white px-4 py-2 rounded w-full hover:bg-[#3DB5E8] disabled:opacity-50 text-sm md:text-base"
        >
          {loading ? 'Creating...' : 'Create Video'}
        </button>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded border w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-base md:text-lg">All Videos</h2>
          <button 
            onClick={() => loadVideos(true)} 
            disabled={loading}
            className="text-xs md:text-sm text-[#54C5F8] hover:underline disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3 border-b font-semibold">#</th>
                <th className="p-3 border-b font-semibold">URL</th>
                <th className="p-3 border-b font-semibold">Chapter</th>
                <th className="p-3 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video, idx) => (
                <tr key={video.id || idx} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{idx + 1}</td>
                  <td className="p-3 border-b">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {video.url ? 'Watch Video' : 'No URL'}
                    </a>
                  </td>
                  <td className="p-3 border-b">{getChapterTitle(video.chapterId)}</td>
                  <td className="p-3 border-b">
                    <button 
                      onClick={()=>onDelete(video.id)} 
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!videos.length && !loading && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={4}>No videos found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : videos.length > 0 ? (
            <div className="divide-y">
              {videos.map((video, idx) => (
                <div key={video.id || idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-700">Video</span>
                      </div>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {video.url ? video.url : 'No URL'}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mb-3 mt-3">
                    <span className="inline-block bg-[#54C5F8] bg-opacity-10 text-[#54C5F8] text-xs font-medium px-2 py-1 rounded">
                      {getChapterTitle(video.chapterId)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-[#54C5F8] hover:underline font-medium flex-1"
                    >
                      Watch Video →
                    </a>
                    <button 
                      onClick={()=>onDelete(video.id)} 
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
            <div className="p-4 text-center text-gray-500">No videos found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;