import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Automatically append /api if it's an external URL and is missing the /api suffix
if (API_BASE_URL !== '/api' && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log full error details in browser console
    console.error('[API Error Details]:', error);

    let message = error.response?.data?.message || 'Something went wrong';

    // If message contains raw Prisma invocation or technical stack traces, sanitize for UI display
    if (typeof message === 'string' && (message.includes('prisma.') || message.includes('FATAL:') || message.includes('ENOTFOUND') || message.includes('invocation in'))) {
      message = 'Database connection error. Please try again later.';
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status, rawError: error });
  }
);

export default api;
