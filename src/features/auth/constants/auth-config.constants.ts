/**
 * Auth Configuration Constants
 * Centralized configuration values for authentication feature
 * Makes the code more maintainable and scalable
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://api.servisca.co.uk',
  TIMEOUT: 30000, // 30 seconds - default timeout for most endpoints
  VERIFY_TIMEOUT: 10000, // 10 seconds - faster timeout for verification endpoints
  ENDPOINTS: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    RESEND_OTP: '/auth/resendOtp',
    REFRESH_TOKEN: '/auth/refresh-token',
    DELETE_ACCOUNT: '/auth/delete-account',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_PASSWORD_RESET: '/auth/verify_Password_token',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PASSWORD: '/auth/update-password',
    REGISTER_PROVIDER: '/auth/register-provider',
    VERIFY_USER_STATUS: '/auth/me',
    SOCIAL_LOGIN: '/auth/social-login',
  },
} as const;

/**
 * Navigation Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROVIDER_ONBOARDING: '/provider/onboarding',
} as const;

/**
 * Toast Configuration
 * Duration guidelines:
 * - Success: 2000-3000ms (2-3s)
 * - Info/Neutral: 2500-3500ms
 * - Error/Warning: 3000-5000ms (3-5s)
 */
export const TOAST_CONFIG = {
  POSITION: 'top-right' as const,
  DURATION: {
    SUCCESS_MIN: 2000,
    SUCCESS_MAX: 3000,
    INFO_MIN: 2500,
    INFO_MAX: 3500,
    ERROR_MIN: 3000,
    ERROR_MAX: 5000,
    ERROR_WORD_DURATION: 100, // milliseconds per word (reduced for shorter durations)
    DEFAULT_SUCCESS: 2500,
    DEFAULT_ERROR: 4000,
  },
} as const;

/**
 * Validation Configuration
 */
export const VALIDATION = {
  REQUIRED_FIELDS: {
    EMAIL: 'Email is required',
    PASSWORD: 'Password is required',
    TOKEN: 'Token is required',
  },
} as const;

/**
 * Device Configuration
 */
export const DEVICE_CONFIG = {
  TOKEN_PREFIX: 'web_',
  TEMP_TOKEN_PREFIX: 'web_temp_',
  STORAGE_KEY: 'device_token',
  MOBILE_BREAKPOINT: 768,
} as const;

/**
 * Navigation Fallback Configuration
 */
export const NAVIGATION_CONFIG = {
  FALLBACK_DELAY: 2000, // milliseconds
  CHECK_PATHS: ['/login'],
} as const;

