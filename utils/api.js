import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_token=;path=/;max-age=0';
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
