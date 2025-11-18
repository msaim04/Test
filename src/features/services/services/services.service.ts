/**
 * Services Service
 * API calls for services feature
 * DRY: Centralized API calls for service operations
 */

import axios from 'axios';
import type { CategoriesResponse, Category } from '../types/services.types';
import { validateResponseStatus } from '@/core/utils/http-status-codes';

const API_BASE_URL = 'http://api.servisca.co.uk';

/**
 * Get service categories
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 200 OK: Returns array of categories directly [{ id, name, icon, image, description }]
 * - Other errors: Standard error response
 */
export async function getCategories(): Promise<{ data: CategoriesResponse; status: number }> {
  try {
    const response = await axios.get<unknown>(
      `${API_BASE_URL}/services/categories`
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    // Log the actual response for debugging
    console.log('Raw Categories API Response:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
    });
    
    // Handle different response structures
    let categoriesArray: Category[] = [];
    const responseData = response.data as Record<string, unknown>;
    
    // Case 1: API returns array directly (as per documentation)
    if (Array.isArray(response.data)) {
      categoriesArray = response.data;
    }
    // Case 2: API returns wrapped in { data: [...] }
    else if (responseData && Array.isArray(responseData.data)) {
      categoriesArray = responseData.data as Category[];
    }
    // Case 3: API returns wrapped in { statusCode, data: [...] }
    else if (responseData && responseData.statusCode && Array.isArray(responseData.data)) {
      categoriesArray = responseData.data as Category[];
    }
    // Case 4: Try to extract from nested structure
    else if (responseData && typeof responseData === 'object') {
      // Try common property names
      const possibleData = responseData.data || responseData.categories || responseData.items;
      if (Array.isArray(possibleData)) {
        categoriesArray = possibleData as Category[];
      }
    }
    
    // If we still don't have an array, throw error with details
    if (!Array.isArray(categoriesArray)) {
      console.error('Invalid categories response structure:', response.data);
      throw new Error(
        `Invalid response from server: expected array of categories. Received: ${JSON.stringify(response.data).substring(0, 200)}`
      );
    }
    
    return {
      data: categoriesArray,
      status: response.status,
    };
  } catch (error) {
    // Re-throw with more context
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch categories';
      console.error('Categories API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });
      // If it's a validation error from validateResponseStatus, preserve the response data
      if ((error as Error & { status?: number; responseData?: unknown }).status) {
        const validationError = error as Error & { status: number; responseData?: unknown };
        const apiError = new Error(errorMessage) as Error & { status: number; responseData?: unknown };
        apiError.status = validationError.status;
        apiError.responseData = validationError.responseData || error.response?.data;
        throw apiError;
      }
      throw new Error(errorMessage);
    }
    // Re-throw validation errors with their status and response data
    if ((error as Error & { status?: number; responseData?: unknown }).status) {
      throw error;
    }
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred');
  }
}

