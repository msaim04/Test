/**
 * Auth Response Utilities
 * DRY: Centralized utilities for parsing and handling auth API responses
 */

import { getErrorMessage } from '@/core/utils/http-status-codes';
import { containsAnyKeyword, matchesAnyValue, hasAnyPropertyExact } from './auth-keyword-matcher.utils';

/**
 * Calculate toast duration based on message length
 * Error: 3000-5000ms per guidelines
 */
export function calculateDuration(msg: string): number {
  const wordCount = msg.split(/\s+/).length;
  const baseDuration = 3000; // 3 seconds base (Error: 3000-5000ms)
  const wordDuration = wordCount * 100; // 100ms per word
  return Math.max(baseDuration, Math.min(wordDuration, 5000)); // Max 5 seconds
}

/**
 * Extract error message from API error response
 * Prioritizes API messages and only uses status-based fallback when no API message exists
 */
export function extractErrorMessage(errorData: unknown, status?: number): string {
  // First, try to extract message from API response
  if (errorData && typeof errorData === 'object') {
    const data = errorData as Record<string, unknown>;
    
    // Try multiple possible message fields from API
    const apiMessage = 
      (typeof data.message === 'string' && data.message.trim() ? data.message.trim() : '') ||
      (typeof data.error === 'string' && data.error.trim() ? data.error.trim() : '') ||
      (data.errors && typeof data.errors === 'object' && 'message' in data.errors && typeof data.errors.message === 'string' ? (data.errors.message as string).trim() : '') ||
      (Array.isArray(data.errors) && data.errors.length > 0 && typeof data.errors[0] === 'string' ? (data.errors[0] as string).trim() : '');
    
    // If we have an API message, return it directly
    if (apiMessage) {
      return apiMessage;
    }
  }
  
  // Only use status-based message if no API message was found
  // This ensures we always show API messages when available
  return status ? getErrorMessage(status) : getErrorMessage(500);
}

/**
 * Extract message from API response (success or error)
 */
export function extractResponseMessage(response: unknown): string {
  if (!response || typeof response !== 'object') {
    return '';
  }
  
  const res = response as Record<string, unknown>;
  const responseData = (res.data && typeof res.data === 'object' ? res.data : res) as Record<string, unknown>;
  
  return (
    (typeof responseData.message === 'string' ? responseData.message : '') ||
    (typeof res.message === 'string' ? res.message : '') ||
    ''
  );
}

/**
 * Get user data from API response
 */
export function extractUserData(responseData: unknown): unknown {
  if (!responseData || typeof responseData !== 'object') {
    return responseData;
  }
  
  const data = responseData as Record<string, unknown>;
  return data.user || data.data || responseData;
}

/**
 * Check if user is verified based on API response data
 * CRITICAL: Always trust backend API response for verification status
 * This function should only be called with backend response data, not frontend state
 */
export function isUserVerified(userData: unknown, responseData?: unknown): boolean {
  const data = responseData || userData;
  if (!data || typeof data !== 'object') return false;

  const verifiedProperties = ['is_verified', 'verified', 'isVerified'];
  const verifiedValues = [true, 'true'];
  const statusValues = ['verified', 'active', 'activated'];
  const dataObj = data as Record<string, unknown>;

  const statusCheck = dataObj.status !== undefined && dataObj.status !== null 
    ? matchesAnyValue(dataObj.status as string | number | boolean, statusValues)
    : false;

  return (
    hasAnyPropertyExact(dataObj, verifiedProperties, verifiedValues) ||
    statusCheck
  );
}

/**
 * Check if message indicates user is already active
 * CRITICAL: Always trust backend API response message for this check
 */
export function isUserAlreadyActive(message: string): boolean {
  const keywords = [
    'user is already active',
    'user already active',
    'account is already active',
    'already active',
  ];
  return containsAnyKeyword(message, keywords);
}

/**
 * Check if message or status indicates account exists
 * CRITICAL: Always trust backend API response (message and HTTP status) for this check
 */
export function isAccountExists(message: string, httpStatus?: number): boolean {
  if (httpStatus === 409) return true;

  const keywords = [
    'email already exists',
    'email already registered',
    'user already exists',
    'already exists',
    'account already exists',
  ];
  return containsAnyKeyword(message, keywords);
}

/**
 * Extract token from API response
 */
export function extractToken(responseData: unknown, response?: unknown): string {
  const tokenProperties = ['token', 'verification_token'];
  
  if (responseData && typeof responseData === 'object') {
    const data = responseData as Record<string, unknown>;
    for (const prop of tokenProperties) {
      if (typeof data[prop] === 'string') return data[prop] as string;
    }
  }
  
  if (response && typeof response === 'object') {
    const res = response as Record<string, unknown>;
    for (const prop of tokenProperties) {
      if (typeof res[prop] === 'string') return res[prop] as string;
    }
  }
  
  return '';
}

/**
 * Extract email from error config
 */
export function extractEmailFromError(error: unknown): string {
  try {
    if (!error || typeof error !== 'object') {
      return '';
    }
    
    const err = error as Record<string, unknown>;
    const config = err.config as Record<string, unknown> | undefined;
    if (!config) {
      return '';
    }
    
    const configData = config.data;
    if (configData) {
      const parsed = typeof configData === 'string' ? JSON.parse(configData) : configData;
      if (parsed && typeof parsed === 'object' && 'email' in parsed && typeof parsed.email === 'string') {
        return parsed.email;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return '';
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const res = response as Record<string, unknown>;
  const statusStr = String(res.status || '').toLowerCase();
  const successValues = ['1', 'success', 'ok', '200', 'true'];
  return matchesAnyValue(statusStr, successValues);
}

/**
 * Check if message indicates success
 */
export function isSuccessMessage(message: string): boolean {
  const keywords = ['success', 'registered', 'verification', 'verified'];
  return containsAnyKeyword(message, keywords);
}

/**
 * Check if message indicates error
 */
export function isErrorMessage(message: string): boolean {
  const keywords = ['error', 'fail', 'invalid'];
  return containsAnyKeyword(message, keywords);
}

/**
 * Check if error message indicates email sending failure
 */
export function isEmailSendingFailed(message: string): boolean {
  const emailKeywords = ['email'];
  const failureKeywords = ['fail', 'error', 'not sent', 'unable to send'];
  
  return (
    containsAnyKeyword(message, emailKeywords) &&
    containsAnyKeyword(message, failureKeywords)
  );
}

/**
 * Check if message indicates rate limiting
 */
export function isRateLimitMessage(message: string): boolean {
  const keywords = [
    'wait',
    'please wait',
    'too many',
    'rate limit',
    'try again later',
    'cooldown',
  ];
  return containsAnyKeyword(message, keywords);
}

/**
 * Normalize OTP/token error messages
 */
export function normalizeTokenErrorMessage(message: string): string {
  const tokenMismatchKeywords = ["token doesn't match", 'token does not match', "token don't match"];
  if (containsAnyKeyword(message, tokenMismatchKeywords)) {
    return 'OTP doesn\'t match';
  }

  const invalidTokenKeywords = ['invalid token', 'token is invalid', 'wrong token'];
  if (containsAnyKeyword(message, invalidTokenKeywords)) {
    return 'Invalid verification code. Please check the code and try again.';
  }

  const expiredKeywords = ['token expired', 'code expired'];
  if (containsAnyKeyword(message, expiredKeywords)) {
    return 'Verification code has expired. Please request a new code.';
  }

  const notFoundKeywords = ['token not found', 'code not found'];
  if (containsAnyKeyword(message, notFoundKeywords)) {
    return 'Verification code not found. Please check the code and try again.';
  }

  const alreadyVerifiedKeywords = ['already verified', 'already activated'];
  if (containsAnyKeyword(message, alreadyVerifiedKeywords)) {
    return 'This email has already been verified. You can proceed to login.';
  }

  const notFoundEmailKeywords = ['email not found', 'user not found'];
  if (containsAnyKeyword(message, notFoundEmailKeywords)) {
    return 'Email not found. Please check your email address.';
  }

  return message;
}

/**
 * Get HTTP status from response (handles different response formats)
 */
export function getHttpStatus(response: unknown, error?: unknown): number {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const errResponse = err.response as Record<string, unknown> | undefined;
    if (errResponse && typeof errResponse.status === 'number') {
      return errResponse.status;
    }
  }
  
  if (response && typeof response === 'object') {
    const res = response as Record<string, unknown>;
    if (typeof res.statusCode === 'number') {
      return res.statusCode;
    }
    if (typeof res.status === 'number') {
      return res.status;
    }
  }
  
  return 200;
}

/**
 * Extract value from nested object using path array
 * Reusable helper for token extraction and similar patterns
 */
export function extractNestedValue(obj: unknown, paths: string[][]): string {
  if (!obj || typeof obj !== 'object') return '';

  for (const path of paths) {
    let current: unknown = obj;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        current = undefined;
        break;
      }
    }
    if (typeof current === 'string' && current) {
      return current;
    }
  }

  return '';
}

/**
 * Extract user role from backend API response
 * Always trust backend response for role information
 */
export function extractUserRoleFromBackend(responseData: unknown): string {
  const userData = extractUserData(responseData);
  if (!userData || typeof userData !== 'object') return '';

  const userObj = userData as Record<string, unknown>;
  const roleProperties = ['role', 'type', 'user_type'];
  for (const prop of roleProperties) {
    const value = userObj[prop];
    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
}

/**
 * Check if user is a provider/tasker based on backend API response
 * Always trust backend response for this critical check
 */
export function isProviderFromBackend(responseData: unknown): boolean {
  const userData = extractUserData(responseData);
  if (!userData || typeof userData !== 'object') return false;

  const role = extractUserRoleFromBackend(responseData);
  const providerRoles = ['tasker', 'provider'];
  const providerProperties = ['is_provider', 'isProvider'];
  const userObj = userData as Record<string, unknown>;

  return (
    matchesAnyValue(role, providerRoles) ||
    hasAnyPropertyExact(userObj, providerProperties, [true])
  );
}

/**
 * Check if provider profile exists based on backend API response
 * Always trust backend response for this critical check
 */
export function hasProviderProfileFromBackend(responseData: unknown): boolean {
  const userData = extractUserData(responseData);
  if (!userData || typeof userData !== 'object') return false;

  const userObj = userData as Record<string, unknown>;
  const idProperties = ['provider_id', 'providerId'];
  const verifiedProperties = ['is_provider_verified', 'isProviderVerified'];

  // Check if any ID property exists
  const hasId = idProperties.some((prop) => userObj[prop] !== undefined && userObj[prop] !== null);
  
  // Check if any verified property is true
  const isVerified = hasAnyPropertyExact(userObj, verifiedProperties, [true]);

  return !!(hasId || isVerified);
}

/**
 * Check if user needs onboarding based on backend API response
 * Always trust backend response for this critical check
 */
export function needsOnboardingFromBackend(responseData: unknown): boolean {
  const isProvider = isProviderFromBackend(responseData);
  const hasProfile = hasProviderProfileFromBackend(responseData);
  
  // User needs onboarding if they are a provider but don't have a profile
  return isProvider && !hasProfile;
}

/**
 * Extract access token from login response
 * Handles multiple possible response structures
 */
export function extractAccessToken(response: unknown): string {
  if (!response || typeof response !== 'object') {
    return '';
  }
  
  const res = response as Record<string, unknown>;
  const responseData = (res.data && typeof res.data === 'object' ? res.data : res) as Record<string, unknown>;
  if (!responseData) return '';

  const tokenPaths = [
    ['tokens', 'access_token'],
    ['tokens', 'accessToken'],
    ['tokens', 'token'],
    ['token'],
    ['access_token'],
    ['accessToken'],
    ['auth_token'],
    ['authToken'],
  ];

  // Check in responseData
  const token = extractNestedValue(responseData, tokenPaths);
  if (token) return token;

  // Check in response root (single-level paths only)
  const rootPaths = tokenPaths.filter((path) => path.length === 1);
  const rootToken = extractNestedValue(response, rootPaths);
  if (rootToken) return rootToken;

  // Check in nested data
  if (responseData.data && typeof responseData.data === 'object') {
    const nestedToken = extractNestedValue(responseData.data, tokenPaths);
    if (nestedToken) return nestedToken;
  }

  return '';
}

/**
 * Extract refresh token from login response
 * Handles multiple possible response structures
 */
export function extractRefreshToken(response: unknown): string {
  if (!response || typeof response !== 'object') {
    return '';
  }
  
  const res = response as Record<string, unknown>;
  const responseData = (res.data && typeof res.data === 'object' ? res.data : res) as Record<string, unknown>;
  if (!responseData) return '';

  const tokenPaths = [
    ['tokens', 'refresh_token'],
    ['tokens', 'refreshToken'],
    ['refresh_token'],
    ['refreshToken'],
  ];

  // Check in responseData
  const token = extractNestedValue(responseData, tokenPaths);
  if (token) return token;

  // Check in response root (single-level paths only)
  const rootPaths = tokenPaths.filter((path) => path.length === 1);
  const rootToken = extractNestedValue(response, rootPaths);
  if (rootToken) return rootToken;

  // Check in nested data
  if (responseData.data && typeof responseData.data === 'object') {
    const nestedToken = extractNestedValue(responseData.data, tokenPaths);
    if (nestedToken) return nestedToken;
  }

  return '';
}

/**
 * Normalize login error message based on error content
 * Provides user-friendly error messages
 * For email/password mismatches, always returns "Invalid credentials"
 */
export function normalizeLoginErrorMessage(message: string): string {
  const messageLower = message.toLowerCase();
  
  // Credential-related errors (email/password mismatch) - show "Invalid credentials"
  const credentialErrorKeywords = [
    'invalid password',
    'incorrect password',
    'wrong password',
    'password mismatch',
    'password incorrect',
    'invalid email',
    'incorrect email',
    'wrong email',
    'invalid credentials',
    'incorrect credentials',
    'wrong credentials',
    'email or password',
    'password or email',
    'credentials',
    'authentication failed',
    'login failed',
    'unauthorized',
  ];
  
  const passwordKeywords = ['password'];
  const emailKeywords = ['email'];
  const invalidKeywords = ['invalid', 'incorrect', 'wrong', 'mismatch'];
  
  // Check if it's a credential-related error
  if (
    containsAnyKeyword(messageLower, credentialErrorKeywords) ||
    (containsAnyKeyword(messageLower, passwordKeywords) && containsAnyKeyword(messageLower, invalidKeywords)) ||
    (containsAnyKeyword(messageLower, emailKeywords) && containsAnyKeyword(messageLower, invalidKeywords)) ||
    containsAnyKeyword(messageLower, invalidKeywords)
  ) {
    return 'Invalid credentials';
  }

  // User not found errors (different from invalid credentials)
  const notFoundKeywords = [
    'not found',
    "doesn't exist",
    'does not exist',
    'not registered',
    'no account',
    'user not found',
    'email not found',
    'email not registered',
    'email does not exist',
  ];
  if (containsAnyKeyword(messageLower, notFoundKeywords)) {
    return 'No account found with this email address. Please check your email or sign up.';
  }

  // Default fallback
  return 'Invalid credentials';
}

/**
 * Check if response indicates login success
 */
export function isLoginSuccess(response: unknown, message: string): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const res = response as Record<string, unknown>;
  const statusStr = String(res.status || '').toLowerCase();
  const successStatusValues = ['1', 'success', 'ok', '200', 'true'];
  const successMessageKeywords = ['success', 'logged in', 'login successful'];

  return (
    matchesAnyValue(statusStr, successStatusValues) ||
    containsAnyKeyword(message, successMessageKeywords)
  );
}

/**
 * Check if response message indicates an error
 */
export function isLoginError(message: string): boolean {
  const keywords = [
    'error',
    'fail',
    'invalid',
    'incorrect',
    'not found',
    "doesn't exist",
    'does not exist',
    'not registered',
    'no account',
    'user not found',
    'email not found',
    'wrong',
    'incorrect password',
    'invalid credentials',
  ];
  return containsAnyKeyword(message, keywords);
}

/**
 * Check if error message indicates that new password is the same as old password
 * Detects various error message formats from backend
 */
export function isSamePasswordError(message: string): boolean {
  const messageLower = message.toLowerCase();
  
  // Keywords that indicate same password error
  const samePasswordKeywords = [
    'same password',
    'same as old password',
    'same as previous password',
    'same as current password',
    'same as your old password',
    'same as your previous password',
    'same as your current password',
    'cannot be the same',
    'must be different',
    'different from',
    'different than',
    'different to',
  ];
  
  // Check if message contains "same" and password-related keywords
  const hasSameKeyword = messageLower.includes('same');
  const hasPasswordKeyword = messageLower.includes('password') || messageLower.includes('old password') || messageLower.includes('previous password') || messageLower.includes('current password');
  
  // Check for explicit same password error messages
  if (containsAnyKeyword(messageLower, samePasswordKeywords)) {
    return true;
  }
  
  // Check if message contains both "same" and password-related terms
  if (hasSameKeyword && hasPasswordKeyword) {
    return true;
  }
  
  return false;
}

/**
 * Normalize same password error message to user-friendly format
 */
export function normalizeSamePasswordError(message: string): string {
  if (isSamePasswordError(message)) {
    return 'New password must be different from your previous password. Please choose a different password.';
  }
  return message;
}

