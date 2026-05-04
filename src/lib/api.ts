import axios from 'axios';
import { useAuthStore } from '../features/auth/useAuthStore';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: sliding refresh + error handling
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-aics-new-token'];
    if (newToken) {
      useAuthStore.getState().setToken(newToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
