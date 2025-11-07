const BASE_URL = 'http://iatech.runasp.net';

export function getBaseUrl() {
  return BASE_URL;
}

function getDefaultHeaders(path) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
 
  const isAuthEndpoint = typeof path === 'string' && /\/api\/Authentification\/(login|register)/i.test(path);
  if (!isAuthEndpoint) {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch {}
  }
  return headers;
}

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  
  const isFormData = options.body instanceof FormData;
  
  const init = {
    method: options.method || 'GET',
    headers: { ...getDefaultHeaders(path), ...(options.headers || {}) },
    body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  };

  
  if (isFormData) {
    delete init.headers['Content-Type'];
  }

  const timeoutMs = typeof options.timeout === 'number' ? options.timeout : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      const toThrow = new Error('Request timed out');
      toThrow.status = 408;
      throw toThrow;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const message = (isJson && data && (data.message || data.error || data.title)) || res.statusText;
    const err = new Error(message || 'Request failed');
    err.status = res.status;
    err.data = data;
    
    
    if (res.status === 401 || res.status === 403) {
      try {
        localStorage.removeItem('auth_token');
      } catch {}
    }
    
    throw err;
  }
  return data;
}

export const api = {
  
  __cache: new Map(),
  clearCache: () => {
    api.__cache.clear();
  },
  get: async (path, options) => {
    const key = `GET ${path}`;
    const cached = api.__cache.get(key);
    const revalidate = async () => {
      const fresh = await apiRequest(path, { ...options, method: 'GET' });
      api.__cache.set(key, { data: fresh, ts: Date.now() });
      return fresh;
    };
    if (cached) {
     
      revalidate().catch(() => {});
      return cached.data;
    }
    const data = await revalidate();
    return data;
  },
  post: (path, body, options) => {
    
    if (body instanceof FormData) {
      return apiRequest(path, { ...options, method: 'POST', body });
    }
    return apiRequest(path, { ...options, method: 'POST', body });
  },
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};


export const chapterApi = {
  getAll: () => api.get('/api/Chapter').catch(err => {
    console.error('Error fetching all chapters:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/Chapter/${id}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching chapter ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/Chapter', data),
  update: (id, data) => api.put(`/api/Chapter/${id}`, data),
  delete: (id) => api.delete(`/api/Chapter/${id}`),
  getChaptersByCourseId: (courseId) => api.get(`/api/Chapter?courseId=${courseId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching chapters for course ${courseId}:`, err);
    }
    return [];
  }),
};


export const videoApi = {
  getAll: () => api.get('/api/Video').catch(err => {
    console.error('Error fetching all videos:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/Video/${id}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching video ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/Video', data),
  update: (id, data) => api.put(`/api/Video/${id}`, data),
  delete: (id) => api.delete(`/api/Video/${id}`),
  getVideosByChapterId: (chapterId) => api.get(`/api/Video?chapterId=${chapterId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching videos for chapter ${chapterId}:`, err);
    }
    return [];
  }),
};


export const courseApi = {
  getAll: () => api.get('/api/Course').catch(err => {
    console.error('Error fetching all courses:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/Course/${id}`).catch(err => {
    // Only log errors that are NOT 404s (404 is expected for some courses)
    if (err.status !== 404) {
      console.error(`Error fetching course ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/Course', data),
  update: (id, data) => api.put(`/api/Course/${id}`, data),
  delete: (id) => api.delete(`/api/Course/${id}`),
};


export const quizApi = {
  getAll: () => api.get('/api/Quiz').catch(err => {
    console.error('Error fetching all quizzes:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/Quiz/${id}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching quiz ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/Quiz', data),
  update: (id, data) => api.put(`/api/Quiz/UpdateQuiz/${id}`, data),
  delete: (id) => api.delete(`/api/Quiz/DeleteQuiz/${id}`),
  addToChapter: (data) => api.post('/api/Quiz/AddQuizToChapter', data),
  getQuizzesByChapterId: (chapterId) => api.get(`/api/Quiz?chapterId=${chapterId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching quizzes for chapter ${chapterId}:`, err);
    }
    return [];
  }),
};


export const questionApi = {
  getAll: () => api.get('/api/Question').catch(err => {
    console.error('Error fetching all questions:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/Question/${id}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching question ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/Question', data),
  update: (id, data) => api.put(`/api/Question/${id}`, data),
  delete: (id) => api.delete(`/api/Question/${id}`),
  getQuestionsByQuizId: (quizId) => api.get(`/api/Question?quizId=${quizId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching questions for quiz ${quizId}:`, err);
    }
    return [];
  }),
};


export const userAnswerApi = {
  getAll: () => api.get('/api/UserAnswer').catch(err => {
    console.error('Error fetching all user answers:', err);
    return [];
  }),
  getById: (id) => api.get(`/api/UserAnswer/${id}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching user answer ${id}:`, err);
    }
    return null;
  }),
  create: (data) => api.post('/api/UserAnswer', data),
  update: (id, data) => api.put(`/api/UserAnswer/${id}`, data),
  delete: (id) => api.delete(`/api/UserAnswer/${id}`),
  getUserAnswersByQuizId: (quizId) => api.get(`/api/UserAnswer?quizId=${quizId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching user answers for quiz ${quizId}:`, err);
    }
    return [];
  }),
  getUserAnswersByUserId: (userId) => api.get(`/api/UserAnswer?userId=${userId}`).catch(err => {
    if (err.status !== 404) {
      console.error(`Error fetching user answers for user ${userId}:`, err);
    }
    return [];
  }),
};