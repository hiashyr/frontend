import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

const API: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Создаем новый объект конфигурации с правильными заголовками
    const newConfig = {
      ...config,
      headers: new AxiosHeaders(config.headers)
    };
    
    if (!newConfig.headers.has('Authorization')) {
      newConfig.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return newConfig;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Интерцептор для обработки ответов
API.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data?.success === false) {
      return Promise.reject(response.data.message || 'Request failed');
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject('Network error');
    }

    const { status, data } = error.response;
    
    if (status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sessionExpired=true';
      }
      return Promise.reject('Session expired');
    }

    const errorMessage = data?.message || error.message || 'Request failed';
    return Promise.reject(errorMessage);
  }
);

// Обертка для удобства использования API
export const api = {
  get: <T>(url: string, config?: InternalAxiosRequestConfig) => 
    API.get<ApiResponse<T>>(url, config).then(res => res.data.data),
  
  post: <T>(url: string, data?: any, config?: InternalAxiosRequestConfig) => 
    API.post<ApiResponse<T>>(url, data, config).then(res => res.data.data),
  
  put: <T>(url: string, data?: any, config?: InternalAxiosRequestConfig) => 
    API.put<ApiResponse<T>>(url, data, config).then(res => res.data.data),
  
  delete: <T>(url: string, config?: InternalAxiosRequestConfig) => 
    API.delete<ApiResponse<T>>(url, config).then(res => res.data.data),
  
  patch: <T>(url: string, data?: any, config?: InternalAxiosRequestConfig) => 
    API.patch<ApiResponse<T>>(url, data, config).then(res => res.data.data),
};

export default API;