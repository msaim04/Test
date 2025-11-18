/**
 * Auth Validation Utilities
 * Centralized validation logic for authentication feature
 * Provides reusable validation functions
 */

import { VALIDATION } from '../constants/auth-config.constants';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: VALIDATION.REQUIRED_FIELDS.EMAIL,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string | undefined | null): ValidationResult {
  if (!password || password.trim().length === 0) {
    return {
      isValid: false,
      error: VALIDATION.REQUIRED_FIELDS.PASSWORD,
    };
  }

  return { isValid: true };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(
  email: string | undefined | null,
  password: string | undefined | null
): ValidationResult {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
}

/**
 * Validate token
 */
export function validateToken(token: string | undefined | null): ValidationResult {
  if (!token || !token.trim()) {
    return {
      isValid: false,
      error: VALIDATION.REQUIRED_FIELDS.TOKEN,
    };
  }

  return { isValid: true };
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): ValidationResult {
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      return {
        isValid: false,
        error: `${String(field)} is required`,
      };
    }
  }

  return { isValid: true };
}

