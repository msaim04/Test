/**
 * HTTP Status Codes Constants
 * DRY: Centralized status code definitions for consistent error handling
 * Reusable across all API error handling
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Error message mappings for common status codes
 * DRY: Centralized error messages for consistent user experience
 */
export const STATUS_ERROR_MESSAGES: Record<HttpStatus, string> = {
  [HTTP_STATUS.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Invalid credentials. Please try again.',
  [HTTP_STATUS.FORBIDDEN]: 'Access denied. Your account may not be verified or has been blocked.',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found.',
  [HTTP_STATUS.CONFLICT]: 'User Already Exists.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Validation error. Please check your input.',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Server error. Please try again later.',
  [HTTP_STATUS.BAD_GATEWAY]: 'Server error. Please try again later.',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [HTTP_STATUS.OK]: '',
  [HTTP_STATUS.CREATED]: '',
};

/**
 * Helper function to get error message for a status code
 * DRY: Reusable error message retrieval
 */
export function getErrorMessage(status: number, customMessage?: string): string {
  return customMessage || STATUS_ERROR_MESSAGES[status as HttpStatus] || 'An error occurred. Please try again.';
}

/**
 * Check if HTTP status code indicates success (200 or 201)
 * DRY: Centralized success status validation
 */
export function isSuccessStatus(status: number): boolean {
  return status === HTTP_STATUS.OK || status === HTTP_STATUS.CREATED;
}

/**
 * Validate response status and throw error if not successful
 * DRY: Centralized response validation for all API calls
 */
export function validateResponseStatus(status: number, responseData?: unknown): void {
  if (!isSuccessStatus(status)) {
    const errorMessage = getErrorMessage(status);
    const error = new Error(errorMessage) as Error & { status: number; responseData?: unknown };
    error.status = status;
    error.responseData = responseData;
    throw error;
  }
}

