/**
 * Auth Response Helpers Utilities
 * Reusable helper functions for common response processing patterns
 * Eliminates code duplication across hooks
 */

import {
  extractResponseMessage,
  isSuccessResponse,
  isErrorMessage,
} from './auth-response.utils';
import { containsAnyKeyword } from './auth-keyword-matcher.utils';
import { showSuccessToast, showErrorToast, generateToastId } from './auth-toast.utils';

/**
 * Success message keywords for different operations
 */
export const SUCCESS_KEYWORDS = {
  GENERAL: ['success', 'registered', 'verified'],
  PASSWORD_RESET: ['success', 'sent', 'code sent', 'reset code', 'reset link'],
  PASSWORD_VERIFY: ['success', 'verified', 'verified successfully', 'code verified'],
  PASSWORD_CHANGED: ['success', 'reset', 'password reset', 'password changed'],
  PROVIDER_REGISTER: ['success', 'registered', 'provider registered'],
  ACCOUNT_DELETED: ['success', 'deleted', 'removed'],
  OTP_SENT: ['success', 'sent', 'resent'],
} as const;

/**
 * Check if response indicates success for a specific operation
 */
function getValueFromPath(source: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source ?? undefined);
}

export function checkResponseSuccess(
  response: unknown,
  operation: keyof typeof SUCCESS_KEYWORDS = 'GENERAL'
): boolean {
  const isSuccess = isSuccessResponse(response);
  const message = extractResponseMessage(response);
  const keywords = SUCCESS_KEYWORDS[operation];
  const isSuccessInMessage = containsAnyKeyword(message, keywords);
  const isErrorInMessage = isErrorMessage(message);

  return isSuccess || (isSuccessInMessage && !isErrorInMessage);
}

/**
 * Extract reset token from password reset response
 */
export function extractResetToken(response: unknown, fallbackToken?: string): string {
  const tokenPaths = [
    ['data', 'token'],
    ['data', 'reset_token'],
    ['token'],
    ['reset_token'],
  ];

  for (const path of tokenPaths) {
    const value = getValueFromPath(response, path);
    if (typeof value === 'string' && value) return value;
  }

  return fallbackToken || '';
}

/**
 * Handle successful response with toast and optional callback
 */
export function handleSuccessResponse(
  response: unknown,
  defaultMessage: string,
  options: {
    onSuccess?: () => void;
    customMessage?: string;
    duration?: number;
  } = {}
): void {
  const { onSuccess, customMessage, duration } = options;
  const message = customMessage || extractResponseMessage(response) || defaultMessage;

  // Success: 2000-3000ms per guidelines
  // If duration is provided, ensure it's within range, otherwise use auto-calculated
  const finalDuration = duration 
    ? Math.max(2000, Math.min(duration, 3000))
    : undefined; // Let showSuccessToast calculate automatically

  showSuccessToast(message, {
    duration: finalDuration,
    onSuccess,
  });
}

/**
 * Handle error response with normalized error message
 */
export function handleErrorResponse(
  response: unknown,
  defaultMessage: string,
  options: {
    normalizeMessage?: (msg: string) => string;
    toastId?: string;
    duration?: number;
  } = {}
): void {
  const { normalizeMessage, toastId, duration } = options;
  let errorMessage = extractResponseMessage(response) || defaultMessage;

  if (normalizeMessage) {
    errorMessage = normalizeMessage(errorMessage);
  }

  // Error: 3000-5000ms per guidelines
  // If duration is provided, ensure it's within range, otherwise use auto-calculated
  const finalDuration = duration 
    ? Math.max(3000, Math.min(duration, 5000))
    : undefined; // Let showErrorToast calculate automatically

  showErrorToast(errorMessage, {
    id: toastId || generateToastId('error'),
    duration: finalDuration,
  });
}

/**
 * Common error message normalization for network/timeout errors
 */
export function normalizeCommonErrors(message: string): string {
  const networkKeywords = ['network', 'fetch'];
  const timeoutKeywords = ['timeout'];
  const notFoundKeywords = ['email not found', 'user not found'];
  const invalidEmailKeywords = ['invalid email'];

  if (containsAnyKeyword(message, networkKeywords)) {
    return 'Network error. Please check your connection and try again.';
  }
  if (containsAnyKeyword(message, timeoutKeywords)) {
    return 'Request timed out. Please try again.';
  }
  if (containsAnyKeyword(message, notFoundKeywords)) {
    return 'No account found with this email address.';
  }
  if (containsAnyKeyword(message, invalidEmailKeywords)) {
    return 'Invalid email address. Please check and try again.';
  }

  return message;
}

/**
 * Extract error message from error object (handles multiple formats)
 */
export function extractErrorFromException(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    
    // Check responseData property (set by handleAxiosError)
    if (err.responseData && typeof err.responseData === 'object') {
      const responseData = err.responseData as Record<string, unknown>;
      
      if (typeof responseData.message === 'string') {
        return responseData.message;
      }
      if (typeof responseData.error === 'string') {
        return responseData.error;
      }
      if (responseData.errors && typeof responseData.errors === 'object') {
        const errors = responseData.errors as Record<string, unknown>;
        if (typeof errors.message === 'string') {
          return errors.message;
        }
      }
      if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const firstError = responseData.errors[0];
        if (firstError && typeof firstError === 'object') {
          const errorObj = firstError as Record<string, unknown>;
          if (typeof errorObj.message === 'string') {
            return errorObj.message;
          }
        }
      }
    }
    
    // Check axios response structure
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        
        if (typeof data.message === 'string') {
          return data.message;
        }
        if (typeof data.error === 'string') {
          return data.error;
        }
        if (data.errors && typeof data.errors === 'object') {
          const errors = data.errors as Record<string, unknown>;
          if (typeof errors.message === 'string') {
            return errors.message;
          }
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const firstError = data.errors[0];
          if (firstError && typeof firstError === 'object') {
            const errorObj = firstError as Record<string, unknown>;
            if (typeof errorObj.message === 'string') {
              return errorObj.message;
            }
          }
        }
      }
    }
    
    // Check error message property (set by handleAxiosError or native errors)
    if (typeof err.message === 'string') {
      return err.message;
    }
  }

  return '';
}

/**
 * Handle common error cases (network, timeout, etc.)
 */
export function handleCommonErrors(
  error: unknown,
  defaultMessage: string,
  options: {
    normalizeMessage?: (msg: string) => string;
    onNetworkError?: () => void;
    onTimeoutError?: () => void;
  } = {}
): string {
  const { normalizeMessage, onNetworkError, onTimeoutError } = options;
  let errorMessage = extractErrorFromException(error) || defaultMessage;

  const networkKeywords = ['network', 'fetch'];
  const timeoutKeywords = ['timeout'];

  if (containsAnyKeyword(errorMessage, networkKeywords)) {
    if (onNetworkError) onNetworkError();
    return 'Network error. Please check your connection and try again.';
  }

  if (containsAnyKeyword(errorMessage, timeoutKeywords)) {
    if (onTimeoutError) onTimeoutError();
    return 'Request timed out. Please try again.';
  }

  if (normalizeMessage) {
    errorMessage = normalizeMessage(errorMessage);
  } else {
    errorMessage = normalizeCommonErrors(errorMessage);
  }

  return errorMessage;
}

