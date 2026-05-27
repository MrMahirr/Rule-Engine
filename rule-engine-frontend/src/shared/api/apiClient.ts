import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError } from './types';

// Development: Vite proxy (/api → localhost:3500) kullanılır, baseURL boş kalır.
// Production: VITE_API_BASE_URL env variable ile gerçek backend URL'i set edilir.
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // İhtiyaç halinde token eklenebilir
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Global hata yönetimi eklenebilir (örn: toast notification)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

interface RequestConfig extends AxiosRequestConfig {
  endpoint: string;
}

export const apiClient = {
  async request<T>(config: RequestConfig): Promise<T> {
    const response = await axiosInstance.request<T>({
      ...config,
      url: config.endpoint,
    });
    return response.data;
  },
};

/**
 * Endpoint içindeki :param değerlerini değiştirmek için yardımcı fonksiyon
 * Örnek: replaceParams('/api/rules/:id', { id: '123' }) -> '/api/rules/123'
 */
export function replaceParams(endpoint: string, params: Record<string, string | number>): string {
  let url = endpoint;
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key].toString());
  });
  return url;
}
