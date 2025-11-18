/**
 * Auth Messages Constants
 * DRY: Centralized message constants to avoid duplication
 */

export const AUTH_MESSAGES = {
  // Validation messages
  EMAIL_REQUIRED: 'Email and password are required',
  TOKEN_REQUIRED: 'Please enter the verification token',
  EMAIL_REQUIRED_FOR_RESEND: 'Email is required to resend OTP',
  
  // Success messages
  REGISTRATION_SUCCESS: 'Registration successful',
  VERIFICATION_SUCCESS: 'Verification successful',
  OTP_RESENT: 'Verification code resent to your email',
  
  // Error messages
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  VERIFICATION_FAILED: 'Verification failed. Please try again.',
  RESEND_OTP_FAILED: 'Failed to resend OTP. Please try again.',
  UNEXPECTED_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
  
  // User status messages
  USER_ALREADY_ACTIVE: 'This account is already active. Please log in instead.',
  ACCOUNT_EXISTS: 'An account with this email already exists. Please log in instead.',
  
  // Email sending errors
  EMAIL_SEND_FAILED: 'Registration successful, but email sending failed. Please contact support for verification token.',
  EMAIL_SEND_FAILED_GENERIC: 'Registration successful, but we couldn\'t send the verification email. Please contact support for assistance.',
  
  // Rate limiting
  RATE_LIMIT_RESEND: 'Please wait before requesting another code.',
  RATE_LIMIT_TOO_MANY: 'Too many resend attempts. Please wait a few minutes and try again.',
  
  // Validation errors
  CHECK_INFORMATION: 'Please check your information and try again.',
  ERROR_OCCURRED: 'An error occurred during registration. Please try again.',
} as const;

