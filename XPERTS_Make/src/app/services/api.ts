import axios from 'axios';

// 10.0.2.2 is the special IP for Android emulator to access the host's localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://10.0.2.2:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xperts_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xperts_token');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

export default api;
