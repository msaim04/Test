/**
 * Taskers Service
 * API calls for taskers/providers feature
 * DRY: Centralized API calls for provider operations
 */

import axios from 'axios';
import type { ProvidersResponse } from '../types/taskers.types';
import { validateResponseStatus } from '@/core/utils/http-status-codes';

const API_BASE_URL = 'http://api.servisca.co.uk';

/**
 * Get providers for home page
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 200 OK: Returns { statusCode: 200, data: Provider[] }
 * - Other errors: Standard error response
 */
export async function getProviders(): Promise<{ data: ProvidersResponse; status: number }> {
  try {
    const response = await axios.get<ProvidersResponse>(
      `${API_BASE_URL}/provider/home`
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    // Validate response structure - API returns { statusCode, data }
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response from server: expected object with data array');
    }
    
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    // Re-throw with more context
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch providers';
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

