import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interview_ai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('interview_ai_token');
      localStorage.removeItem('interview_ai_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Resume Services
export const resumeApi = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResume: () => api.get('/resume'),
  updateSkills: (skills) => api.put('/resume/skills', { skills }),
};

// Question Bank Services
export const questionApi = {
  generate: (data) => api.post('/questions/generate', data),
  getAll: () => api.get('/questions'),
  getById: (id) => api.get(`/questions/${id}`),
  delete: (id) => api.delete(`/questions/${id}`),
};

// Interview Session Services
export const interviewApi = {
  start: (data) => api.post('/interview/start', data),
  sendMessage: (sessionId, message, nextQuestion = false) =>
    api.post(`/interview/${sessionId}/message`, { message, nextQuestion }),
  endInterview: (sessionId) => api.post(`/interview/${sessionId}/end`),
  getSession: (sessionId) => api.get(`/interview/${sessionId}`),
  getSessions: () => api.get('/interview/sessions'),
};

// Feedback Services
export const feedbackApi = {
  getBySessionId: (sessionId) => api.get(`/feedback/${sessionId}`),
  getHistory: () => api.get('/feedback/history'),
};

// Analytics Services
export const analyticsApi = {
  getAnalytics: () => api.get('/analytics'),
  refresh: () => api.post('/analytics/refresh'),
};

export default api;
