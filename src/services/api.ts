import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена (без явных типов)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Создаем новый объект конфига с обновленными headers
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`, 
      } as Record<string, unknown> // Явное приведение типа
    };
  }
  return config;
});

// Обработка ошибок
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default API;