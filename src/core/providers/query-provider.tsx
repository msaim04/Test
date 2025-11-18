'use client';

/**
 * Query Provider
 * Sets up React Query with caching configuration
 * DRY: Centralized query client configuration
 * Error-safe: Includes comprehensive error handling
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient with default options and error handling
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache data for 10 minutes after it becomes inactive
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            // Retry failed requests 1 time
            retry: 1,
            // Refetch on window focus (good for keeping data fresh)
            refetchOnWindowFocus: true,
            // Don't refetch on reconnect by default (can be overridden per query)
            refetchOnReconnect: false,
            // Don't throw errors to error boundaries - handle them in components
            throwOnError: false,
            // Network error handling
            retryOnMount: true,
          },
          mutations: {
            // Don't retry mutations by default (they're usually user actions)
            // Retries can cause duplicate submissions and confusing UX
            retry: false,
            // Don't throw errors to error boundaries
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

