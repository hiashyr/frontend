import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Интерцептор для добавления токена с правильными типами
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Неверный email или пароль'));
    }
    return Promise.reject(error);
  }
);

export default API;