// src/services/api.js
import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Добавляем токен к запросам
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});