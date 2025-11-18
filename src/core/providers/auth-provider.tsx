'use client';

/**
 * Auth Provider
 * Initializes API interceptors and handles token refresh on app load
 */

import { useEffect } from 'react';
import { setupRequestInterceptor, setupResponseInterceptor } from '@/lib/api/interceptors';
import { useTokenRefresh } from '@/features/auth/hooks/use-token-refresh';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize interceptors once
  useEffect(() => {
    setupRequestInterceptor();
    setupResponseInterceptor();
  }, []);

  // Check and refresh token on app load
  useTokenRefresh();

  return <>{children}</>;
}

