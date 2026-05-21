import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || 'حدث خطأ غير متوقع';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('انتهت الجلسة، الرجاء تسجيل الدخول مجدداً');
    } else if (error.response?.status === 403) {
      toast.error('ليس لديك صلاحية');
    } else if (error.response?.status !== 401) {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

export default api;
