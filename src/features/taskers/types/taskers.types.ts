/**
 * Taskers/Providers Types
 * Type definitions for taskers/providers feature
 */

export interface Provider {
  id: number;
  category: string;
  image: string | null;
  name: string;
  experience_years: number;
  price_hourly: number;
  avg_rating: number;
}

/**
 * Providers API Response
 * Based on actual API documentation:
 * - 200 OK: Returns { statusCode: 200, data: Provider[] }
 * - Other errors: Standard error response
 */
export interface ProvidersResponse {
  statusCode: number;
  data: Provider[];
}

