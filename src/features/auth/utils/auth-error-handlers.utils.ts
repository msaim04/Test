/**
 * Auth Error Handlers Utilities
 * DRY: Centralized error handling logic for auth operations
 */

import toast from 'react-hot-toast';
import axios from 'axios';
import { HTTP_STATUS, getErrorMessage } from '@/core/utils/http-status-codes';
import {
  normalizeTokenErrorMessage,
  normalizeLoginErrorMessage,
  isEmailSendingFailed,
  isRateLimitMessage,
  calculateDuration,
} from './auth-response.utils';
import { containsAnyKeyword } from './auth-keyword-matcher.utils';
import { generateToastId } from './auth-toast.utils';

/**
 * Generate unique ID for error toasts
 */
function generateErrorToastId(operation: string, type: string): string {
  return generateToastId(`${operation}-error-${type}`);
}

/**
 * Handle timeout errors
 */
export function handleTimeoutError(operation: string): void {
  const toastId = generateErrorToastId(operation, 'timeout');
  toast.error('Request timed out. The server is taking too long to respond. Please try again.', {
    duration: 4000, // Error: 3000-5000ms per guidelines
    position: 'top-center',
    id: toastId,
  });
}

/**
 * Handle network errors
 */
export function handleNetworkError(operation: string): void {
  const toastId = generateErrorToastId(operation, 'network');
  toast.error('Network error. Please check your internet connection and try again.', {
    duration: 4000, // Error: 3000-5000ms per guidelines
    position: 'top-center',
    id: toastId,
  });
}

/**
 * Handle HTTP status code errors with appropriate messages
 */
export function handleHttpStatusError(
  status: number,
  message: string,
  operation: string,
  defaultMessages: Record<number, string> = {}
): void {
  const toastId = generateErrorToastId(operation, 'http');
  
  const defaultMessage = defaultMessages[status] || 'An error occurred. Please try again.';
  const finalMessage = message || defaultMessage;
  
  toast.error(finalMessage, {
    duration: calculateDuration(finalMessage),
    position: 'top-center',
    id: toastId,
  });
}

/**
 * Handle verification errors with status-specific messages
 * Shows API message directly, only uses status-based fallback if no API message exists
 */
export function handleVerificationError(status: number, message: string): void {
  const toastId = generateErrorToastId('verify', 'error');
  
  toast.dismiss();
  
  // Use API message if available, otherwise use status-based fallback
  // Only normalize if message exists (to preserve API message structure)
  const finalMessage = message && message.trim() 
    ? normalizeTokenErrorMessage(message) 
    : getErrorMessage(status);
  
  toast.error(finalMessage, {
    duration: calculateDuration(finalMessage),
    position: 'top-center',
    id: toastId,
  });
}

/**
 * Handle resend OTP errors with status-specific messages
 * Shows API message directly, only uses status-based fallback if no API message exists
 */
export function handleResendOtpError(status: number, message: string): void {
  const toastId = generateErrorToastId('resend-otp', 'error');
  toast.dismiss();
  
  // Use API message if available, otherwise use status-based fallback
  // Only normalize rate limit messages to preserve API message structure
  let finalMessage = message && message.trim() ? message : getErrorMessage(status);
  
  // Only normalize rate limit messages if they're not already clear
  if (isRateLimitMessage(finalMessage) && !containsAnyKeyword(finalMessage, ['wait', 'please wait'])) {
    finalMessage = 'Too many resend attempts. Please wait a few minutes and try again.';
  }
  
  toast.error(finalMessage, {
    duration: calculateDuration(finalMessage),
    position: 'top-center',
    id: toastId,
  });
}

/**
 * Handle registration errors with email sending failure detection
 */
export function handleRegistrationError(
  status: number,
  message: string
): void {
  const emailFailed = isEmailSendingFailed(message);
  
  if (emailFailed) {
    const emailErrorMsg = 'Registration successful, but we couldn\'t send the verification email. Please contact support for assistance.';
    toast.error(emailErrorMsg, {
      duration: calculateDuration(emailErrorMsg),
      position: 'top-center',
    });
    
    // Try to extract email from error if available
    // This would need to be passed from the calling context
  } else {
    const defaultMessages: Record<number, string> = {
      [HTTP_STATUS.BAD_REQUEST]: 'Please check your information and try again.',
      [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Please check your information and try again.',
    };
    
    const finalMessage = message || defaultMessages[status] || 'An error occurred during registration. Please try again.';
    toast.error(finalMessage, {
      duration: calculateDuration(finalMessage),
      position: 'top-center',
    });
  }
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  const err = error as Record<string, unknown>;
  return err.code === 'ECONNABORTED' || (typeof err.message === 'string' && err.message.includes('timeout'));
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  const err = error as Record<string, unknown>;
  return !err.response && !!err.request;
}

/**
 * Check if error is an axios error
 */
export function isAxiosError(error: unknown): error is import('axios').AxiosError {
  return axios.isAxiosError(error);
}

/**
 * Handle login-specific error messages
 * @deprecated This function is no longer used. API messages are shown directly.
 */
export function handleLoginError(
  message: string
): { message: string; duration: number } {
  let errorMessage = message;
  let duration = 12000;

  // Account status errors
  const inactiveKeywords = ['user not active', 'account not active', 'account is inactive'];
  if (containsAnyKeyword(message, inactiveKeywords)) {
    errorMessage = 'Your account is not active. Please contact support for assistance.';
  } else {
    const blockedKeywords = ['account blocked', 'account suspended', 'account banned'];
    if (containsAnyKeyword(message, blockedKeywords)) {
      errorMessage = 'Your account has been blocked or suspended. Please contact support for assistance.';
    } else {
      const notVerifiedKeywords = ['account not verified', 'email not verified', 'please verify your email'];
      if (containsAnyKeyword(message, notVerifiedKeywords)) {
        errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
      } else {
        const rateLimitKeywords = ['too many attempts', 'rate limit', 'too many requests'];
        if (containsAnyKeyword(message, rateLimitKeywords)) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
        } else {
          const passwordExpiredKeywords = ['password expired', 'password must be changed'];
          if (containsAnyKeyword(message, passwordExpiredKeywords)) {
            errorMessage = 'Your password has expired. Please reset your password.';
          } else if (containsAnyKeyword(message, ['session expired'])) {
            errorMessage = 'Your session has expired. Please log in again.';
          } else {
            // Use normalizeLoginErrorMessage for credential errors
            errorMessage = normalizeLoginErrorMessage(message);
          }
        }
      }
    }
  }

  // Calculate duration based on message length (Error: 3000-5000ms per guidelines)
  const wordCount = errorMessage.split(/\s+/).length;
  duration = Math.max(3000, Math.min(wordCount * 100, 5000));

  return { message: errorMessage, duration };
}

/**
 * Handle login HTTP status errors
 * Shows API message directly, only uses status-based fallback if no API message exists
 */
export function handleLoginHttpError(status: number, message: string): void {
  const toastId = generateErrorToastId('login', 'error');

  // Use API message if available, otherwise use status-based fallback
  // Only normalize if message exists (to preserve API message structure)
  const finalMessage = message && message.trim() 
    ? message 
    : getErrorMessage(status);
  
  // Calculate duration based on message length (Error: 3000-5000ms per guidelines)
  const wordCount = finalMessage.split(/\s+/).length;
  const finalDuration = Math.max(3000, Math.min(wordCount * 100, 5000));
  
  toast.error(finalMessage, {
    duration: finalDuration,
    position: 'top-center',
    id: toastId,
  });
}

