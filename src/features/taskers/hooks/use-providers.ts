/**
 * useProviders Hook
 * React Query hook for fetching providers
 * DRY: Reusable query hook with caching
 */

import { useQuery } from '@tanstack/react-query';
import { getProviders } from '../services/taskers.service';
import type { Provider } from '../types/taskers.types';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';

interface UseProvidersReturn {
  providers: Provider[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Query key factory for providers
 * DRY: Centralized query keys
 */
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (filters: string) => [...providerKeys.lists(), { filters }] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: number) => [...providerKeys.details(), id] as const,
};

export function useProviders(): UseProvidersReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: providerKeys.lists(),
    queryFn: async () => {
      try {
        const response = await getProviders();
        const httpStatus = response.status;
        const responseData = response.data;
        
        // Log response for debugging
        console.log('Providers API Response:', { status: httpStatus, data: responseData });
        
        // 200 OK: Returns { statusCode: 200, data: Provider[] } (from API documentation)
        if (httpStatus === HTTP_STATUS.OK) {
          // Ensure data is an array to prevent errors
          if (responseData.data && Array.isArray(responseData.data)) {
            return responseData.data;
        }
          throw new Error('Invalid response format: expected object with data array');
        }
        
        // Handle other success status codes (201, etc.) as fallback
        if (httpStatus === HTTP_STATUS.CREATED || (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0)) {
          return Array.isArray(responseData.data) ? responseData.data : [];
        }
        
        throw new Error('Failed to fetch providers');
      } catch (err) {
        // Enhanced error handling
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('An unexpected error occurred while fetching providers');
      }
    },
    // Providers data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache providers for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Keep previous data on error (show cached data if available)
    placeholderData: (previousData) => previousData,
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && 'status' in error) {
        const errorObj = error as Error & { status?: unknown };
        const status = typeof errorObj.status === 'number' ? errorObj.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
      }
      // Retry once for other errors
      return failureCount < 1;
    },
  });

  return {
    providers: Array.isArray(data) ? data : [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

