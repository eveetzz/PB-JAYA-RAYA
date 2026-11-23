import axios from 'axios';

// Backend menggunakan cookie-based auth (httpOnly cookie),
// jadi withCredentials WAJIB true agar cookie token terkirim otomatis.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: auto-redirect ke /login jika 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hindari loop redirect jika sudah di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
