/**
 * API Interceptors
 * Handles request/response interceptors for token management and refresh
 * DRY: Centralized interceptor logic
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { apiClient } from './client';
import { useAuthStore } from '@/shared/hooks/use-auth';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Setup request interceptor to add auth token
 * Sets up interceptors for both apiClient and default axios instance
 */
export function setupRequestInterceptor() {
  const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  const errorInterceptor = (error: AxiosError | Error) => {
    return Promise.reject(error);
  };

  // Setup for apiClient
  apiClient.interceptors.request.use(requestInterceptor, errorInterceptor);
  
  // Setup for default axios instance (used by services)
  axios.interceptors.request.use(requestInterceptor, errorInterceptor);
}

/**
 * Setup response interceptor to handle token refresh
 * Sets up interceptors for both apiClient and default axios instance
 */
export function setupResponseInterceptor() {
  const responseInterceptor = async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If error is 401 and we haven't retried yet
      // Skip interceptor for password reset endpoints (user is not logged in during reset flow)
      const url = originalRequest.url || '';
      const isPasswordResetEndpoint = url.includes('/auth/reset-password') ||
                                      url.includes('/auth/forgot-password') ||
                                      url.includes('/auth/verify_Password_token') ||
                                      url.includes('/auth/verify-password-reset');
      
      if (error.response?.status === 401 && !originalRequest._retry && !isPasswordResetEndpoint) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              const axiosInstance = (originalRequest as InternalAxiosRequestConfig & { __axiosInstance?: typeof axios }).__axiosInstance || axios;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (!refreshToken) {
          // No refresh token, logout user
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No refresh token available for token refresh');
          }
          processQueue(error, null);
          useAuthStore.getState().clearAuth();
          
          // Clear device token
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('device_token');
            }
          } catch {
            // Ignore storage errors during logout
          }
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          // Import refresh function dynamically to avoid circular dependency
          const { refreshToken: refreshTokenService } = await import('@/features/auth/services/auth.service');
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Attempting to refresh token using refresh token...', {
              hasRefreshToken: !!refreshToken,
              refreshTokenLength: refreshToken?.length || 0,
            });
          }
          
          const response = await refreshTokenService(refreshToken);

          const statusStr = String(response.status || '').toLowerCase();
          const isSuccess = statusStr === '1' || 
                           statusStr === 'success' || 
                           statusStr === 'ok' ||
                           statusStr === '200';

          const messageLower = (response.message || '').toLowerCase();
          const isSuccessInMessage = messageLower.includes('success') || 
                                     messageLower.includes('refreshed');

          if (isSuccess || (isSuccessInMessage && !messageLower.includes('error'))) {
            const responseData = response.data as unknown as Record<string, unknown>;
            const responseObj = response as unknown as Record<string, unknown>;
            const newToken = (responseData?.token as string) || 
                            (responseData?.access_token as string) || 
                            (responseObj?.token as string) || 
                            '';
            const newRefreshToken = (responseData?.refresh_token as string) || 
                                   (responseObj?.refreshToken as string) || 
                                   refreshToken;

            if (newToken) {
              // Update tokens in store
              const user = useAuthStore.getState().user;
              useAuthStore.getState().setAuth(newToken, user || undefined, newRefreshToken);

              // Update authorization header
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }

              // Process queued requests
              processQueue(null, newToken);

              // Retry original request
              // Use the same axios instance that made the original request
              const axiosInstance = (originalRequest as InternalAxiosRequestConfig & { __axiosInstance?: typeof axios }).__axiosInstance || axios;
              return axiosInstance(originalRequest);
            }
          }

          // Refresh failed, logout user
          processQueue(error, null);
          useAuthStore.getState().clearAuth();
          
          // Clear device token
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('device_token');
            }
          } catch {
            // Ignore storage errors during logout
          }
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        } catch (refreshError) {
          // Refresh token expired or invalid, logout user
          const error = refreshError as AxiosError;
          
          // Log error for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.error('Token refresh failed:', error);
          }
          
          processQueue(error, null);
          useAuthStore.getState().clearAuth();
          
          // Clear device token
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('device_token');
            }
          } catch {
            // Ignore storage errors during logout
          }
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
  };

  // Setup for apiClient
  apiClient.interceptors.response.use(
    (response) => response,
    responseInterceptor
  );
  
  // Setup for default axios instance (used by services)
  axios.interceptors.response.use(
    (response) => response,
    responseInterceptor
  );
}

