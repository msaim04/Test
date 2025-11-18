/**
 * useCategories Hook
 * React Query hook for fetching service categories
 * DRY: Reusable query hook with caching
 */

import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/services.service';
import type { Category } from '../types/services.types';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Query key factory for categories
 * DRY: Centralized query keys
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export function useCategories(): UseCategoriesReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      try {
        const response = await getCategories();
        const httpStatus = response.status;
        const responseData = response.data;
        
        // Log response for debugging
        console.log('Categories API Response:', { status: httpStatus, data: responseData });
        
        // 200 OK: Returns array of categories directly (from API documentation)
        if (httpStatus === HTTP_STATUS.OK) {
          // Ensure data is an array to prevent errors
          if (Array.isArray(responseData)) {
            return responseData;
        }
          throw new Error('Invalid response format: expected array of categories');
        }
        
        // Handle other success status codes (201, etc.) as fallback
        if (httpStatus === HTTP_STATUS.CREATED || (Array.isArray(responseData) && responseData.length > 0)) {
          return Array.isArray(responseData) ? responseData : [];
        }
        
        throw new Error('Failed to fetch categories');
      } catch (err) {
        // Enhanced error handling
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('An unexpected error occurred while fetching categories');
      }
    },
    // Categories data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache categories for 10 minutes
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
    categories: Array.isArray(data) ? data : [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

