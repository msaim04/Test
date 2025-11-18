/**
 * useTokenRefresh Hook
 * Handles token refresh on app load and for long-term sessions
 * DRY: Reusable token refresh logic
 * 
 * Features:
 * - Automatically refreshes tokens on app load if needed
 * - Handles long-term sessions (weeks) by using refresh tokens
 * - Periodically checks and refreshes tokens before expiration
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { refreshToken } from '../services/auth.service';
import type { RefreshTokenResponse } from '../types/auth.types';

// Interval to check for token refresh (every 5 minutes)
const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Attempt to refresh the access token using the refresh token
 */
async function attemptTokenRefresh(
  storedRefreshToken: string
): Promise<{ success: boolean; newToken?: string; newRefreshToken?: string }> {
        try {
          const response: RefreshTokenResponse = await refreshToken(storedRefreshToken);

          const statusStr = String(response.status || '').toLowerCase();
          const isSuccess = statusStr === '1' || 
                           statusStr === 'success' || 
                           statusStr === 'ok' ||
                           statusStr === '200';

          const messageLower = (response.message || '').toLowerCase();
          const isSuccessInMessage = messageLower.includes('success') || 
                                     messageLower.includes('refreshed');

          if (isSuccess || (isSuccessInMessage && !messageLower.includes('error'))) {
            const responseData = response.data;
            const newToken = responseData?.token || 
                            responseData?.access_token || 
                            response.token || 
                            '';
            const newRefreshToken = responseData?.refresh_token || 
                                   response.refresh_token || 
                                   storedRefreshToken;

            if (newToken) {
        return { success: true, newToken, newRefreshToken };
            } else {
        // No token in response, refresh failed
        return { success: false };
            }
          } else {
      // Refresh failed
      return { success: false };
    }
  } catch (error) {
    // Refresh token expired or invalid
    console.error('Token refresh failed:', error);
    return { success: false };
  }
}

/**
 * Hook to check and refresh token on app load and periodically
 * Should be called once in the root layout or app component
 * 
 * Handles long-term sessions by:
 * - Refreshing tokens on app load if access token is missing/expired
 * - Periodically checking and refreshing tokens before expiration
 * - Using refresh tokens to maintain sessions for weeks
 */
export function useTokenRefresh() {
  const router = useRouter();
  const { token, refreshToken: storedRefreshToken, clearAuth, setAuth, user } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Function to refresh token
    const refreshAccessToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) return;
      
      if (!storedRefreshToken) {
        // No refresh token available, can't refresh
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ No refresh token available for token refresh');
        }
        return;
      }

      isRefreshingRef.current = true;

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Attempting to refresh access token...', {
          hasRefreshToken: !!storedRefreshToken,
          refreshTokenLength: storedRefreshToken.length,
        });
      }

      try {
        const result = await attemptTokenRefresh(storedRefreshToken);
        
        if (result.success && result.newToken) {
          // Update tokens in store
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Token refresh successful', {
              hasNewToken: !!result.newToken,
              hasNewRefreshToken: !!result.newRefreshToken,
            });
          }
          setAuth(result.newToken, user || undefined, result.newRefreshToken || storedRefreshToken);
        } else {
          // Refresh failed - might be expired or invalid
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Token refresh failed - token might be expired or invalid');
          }
          // Don't clear auth immediately, let the interceptor handle 401 errors
          // This allows for graceful handling of expired refresh tokens
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Don't clear auth on error, let the interceptor handle it
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Initial refresh check on mount
    // If we have a refresh token but no access token (or token might be expired)
    // Try to refresh silently
    if (storedRefreshToken && (!token || token === 'authenticated')) {
      refreshAccessToken();
    }

    // Set up periodic refresh check
    // This ensures tokens are refreshed before expiration for long-term sessions
    intervalRef.current = setInterval(() => {
      // Only refresh if we have a refresh token
      // The interceptor will handle 401 errors and trigger refresh as needed
      if (storedRefreshToken) {
        // Check if we should refresh (e.g., if token is missing or might be expired soon)
        // For now, we'll let the interceptor handle this, but we can add proactive refresh here
        refreshAccessToken();
      }
    }, REFRESH_CHECK_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [storedRefreshToken, token, clearAuth, setAuth, user, router]);

  // Also refresh when refresh token changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If we get a new refresh token but no access token, try to refresh
    if (storedRefreshToken && (!token || token === 'authenticated')) {
      const refreshAccessToken = async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;

        try {
          const result = await attemptTokenRefresh(storedRefreshToken);
          if (result.success && result.newToken) {
            setAuth(result.newToken, user || undefined, result.newRefreshToken || storedRefreshToken);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        } finally {
          isRefreshingRef.current = false;
        }
      };

      refreshAccessToken();
    }
  }, [storedRefreshToken, token, clearAuth, setAuth, user]);
}

