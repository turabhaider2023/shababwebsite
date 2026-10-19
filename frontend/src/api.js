import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shabab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLogin = url.includes('/auth/login') || url.includes('/auth/admin/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('shabab_token');
    }
    return Promise.reject(error);
  }
);

export default api;
