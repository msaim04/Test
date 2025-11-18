/**
 * Auth Service
 * API calls for authentication feature
 * DRY: Centralized API calls for auth operations
 * 
 * IMPORTANT: Always trust backend API responses for critical checks
 * - User verification status
 * - User roles and permissions
 * - Account status (active, verified, etc.)
 * - Provider profile existence
 * 
 * Frontend state should only be used for UX optimizations (display, fast UI response)
 * For sensitive actions, always validate against backend API
 */

import axios from 'axios';
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
  LoginRequest,
  LoginResponse,
  DeleteAccountResponse,
  LogoutResponse,
  RefreshTokenResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyPasswordResetRequest,
  VerifyPasswordResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  RegisterProviderRequest,
  RegisterProviderResponse,
  VerifyUserStatusResponse,
  SocialLoginRequest,
  SocialLoginResponse,
} from '../types/auth.types';
import { API_CONFIG, DEVICE_CONFIG } from '../constants/auth-config.constants';
import { serviceLogger } from '../utils/auth-logger.utils';
import { validateResponseStatus, getErrorMessage } from '@/core/utils/http-status-codes';

// Set default timeout for all axios requests
axios.defaults.timeout = API_CONFIG.TIMEOUT;

/**
 * Helper function to handle axios responses and errors
 * Ensures status codes are checked and error responses are preserved
 */
function handleAxiosResponse<T>(response: { status: number; data: T }): { data: T; status: number } {
  // Validate status code - only proceed if 200 or 201
  validateResponseStatus(response.status, response.data);
  return {
    data: response.data,
    status: response.status,
  };
}

/**
 * Helper function to handle axios errors and preserve response data
 */
function handleAxiosError(error: unknown): never {
  // Handle axios errors - preserve response data for error status codes
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    const responseData = error.response.data;
    // Return error response with status and data
    const apiError = new Error(
      (responseData as { message?: string })?.message || 
      getErrorMessage(status)
    ) as Error & { status: number; responseData?: unknown };
    apiError.status = status;
    apiError.responseData = responseData;
    throw apiError;
  }
  throw error;
}

/**
 * Register a new user
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 200 OK: Returns user object { id, email, first_name, last_name, is_active, role_id }
 * - 409 Conflict: User Already Exists
 * - Other errors: Standard error response
 */
export async function registerUser(data: RegisterRequest): Promise<{ data: RegisterResponse; status: number }> {
  try {
    const requestData: Record<string, unknown> = {
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      password: data.password,
    };
    
    // Add optional fields if provided
    if (data.first_name) requestData.first_name = data.first_name.trim();
    if (data.last_name) requestData.last_name = data.last_name.trim();
    if (data.tin) requestData.tin = data.tin.trim();
    if (data.cnic) requestData.cnic = data.cnic.trim();
    if (data.role_id !== undefined) requestData.role_id = data.role_id;
    if (data.docs && data.docs.length > 0) requestData.docs = data.docs;
    
    const response = await axios.post<RegisterResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
      requestData,
      {
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Verify OTP token
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: Verification successful
 * - Other errors: Standard error response
 * 
 * OPTIMIZED: Uses shorter timeout (10s) for faster verification response
 */
export async function verifyPasswordToken(
  data: VerifyTokenRequest
): Promise<{ data: VerifyTokenResponse; status: number }> {
  try {
    const response = await axios.post<VerifyTokenResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY}`,
      {
        email: data.email.trim(),
        token: data.token.trim(),
      },
      {
        timeout: API_CONFIG.VERIFY_TIMEOUT, // 10 seconds - faster timeout for verification
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Resend OTP
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: OTP sent successfully
 * - Other errors: Standard error response
 * 
 * OPTIMIZED: Uses shorter timeout (10s) for faster response
 */
export async function resendOtp(data: ResendOtpRequest): Promise<{ data: ResendOtpResponse; status: number }> {
  try {
    const response = await axios.post<ResendOtpResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_OTP}`,
      {
        email: data.email.trim(),
      },
      {
        timeout: API_CONFIG.VERIFY_TIMEOUT, // 10 seconds - faster timeout
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Login user
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 200 OK: "User authorized." Returns { user: {}, access_token: string }
 * - 201 Created: Success (empty description)
 * - 401 Unauthorized: "Invalid credentials."
 * - 404 Not Found: "User not found."
 * - 500 Internal Server Error
 */
export async function loginUser(data: LoginRequest): Promise<{ data: LoginResponse; status: number }> {
  serviceLogger.debug('Login API Request', {
    url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
    method: 'POST',
    data: {
      email: data.email.trim(),
      password: '***',
      device_token: data.device_token,
      device_type: data.device_type,
    },
  });

  const requestData = {
    email: data.email.trim(),
    password: data.password,
    device_token: data.device_token || generateDeviceToken(),
    device_type: data.device_type || getDeviceType(),
  };

  // Validate required fields
  if (!requestData.email || !requestData.password || !requestData.device_token || !requestData.device_type) {
    throw new Error('Missing required login parameters');
  }

  try {
    const response = await axios.post<LoginResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
      requestData
    );

    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);

    const headerToken = extractHeaderToken(response.headers);
    const cleanHeaderToken = cleanBearerToken(headerToken);

    serviceLogger.debug('Login API Full Response', {
      status: response.status,
      statusText: response.statusText,
      hasHeaderToken: !!cleanHeaderToken,
      responseDataKeys: response.data ? Object.keys(response.data) : [],
    });

    const responseData = response.data as Record<string, unknown>;
    
    // Handle access_token from response (API returns access_token, not token)
    // Also check for token in header as fallback
    if (cleanHeaderToken && !responseData.access_token && !(responseData as Record<string, unknown>)?.access_token) {
      // If no access_token in response but we have header token, use it
      responseData.access_token = cleanHeaderToken;
    }

    return {
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Extract token from response headers
 */
function extractHeaderToken(headers: Record<string, unknown>): string {
  return (headers?.authorization as string) || (headers?.Authorization as string) || (headers?.['authorization'] as string) || '';
}

/**
 * Remove Bearer prefix from token
 */
function cleanBearerToken(token: string): string {
  return token.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Generate device token
 */
function generateDeviceToken(): string {
  return `${DEVICE_CONFIG.TOKEN_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Logout user
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: Logout successful
 * - Other errors: Standard error response
 * 
 * OPTIMIZED: Uses shorter timeout (5s) since logout should be fast
 * and we don't want to block the UI
 */
export async function logoutUser(refreshToken: string): Promise<{ data: LogoutResponse; status: number }> {
  try {
    const response = await axios.post<LogoutResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`,
      {
        refresh_token: refreshToken,
      },
      {
        timeout: 5000, // 5 seconds - shorter timeout for logout
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Update password
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 401 Unauthorized: "Not Authorized to access this endpoint."
 * - Other errors: Standard error response
 */
export async function updatePassword(
  data: UpdatePasswordRequest,
  token: string
): Promise<{ data: UpdatePasswordResponse; status: number }> {
  try {
    const response = await axios.patch<UpdatePasswordResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PASSWORD}`,
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
      {
        refresh_token: refreshToken,
      }
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(token: string): Promise<DeleteAccountResponse> {
  try {
    const response = await axios.post<DeleteAccountResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_ACCOUNT}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Forgot password - send reset code
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: Reset code sent successfully
 * - Other errors: Standard error response
 * 
 * OPTIMIZED: Uses shorter timeout (10s) for faster response
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ data: ForgotPasswordResponse; status: number }> {
  try {
    const response = await axios.post<ForgotPasswordResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
      {
        email: data.email.trim(),
      },
      {
        timeout: API_CONFIG.VERIFY_TIMEOUT, // 10 seconds - faster timeout
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Verify password reset OTP
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: Token verified successfully
 * - Other errors: Standard error response
 * 
 * OPTIMIZED: Uses shorter timeout (10s) for faster verification response
 */
export async function verifyPasswordReset(data: VerifyPasswordResetRequest): Promise<{ data: VerifyPasswordResetResponse; status: number }> {
  try {
    const response = await axios.post<VerifyPasswordResetResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_PASSWORD_RESET}`,
      {
        email: data.email.trim(),
        token: data.token.trim(),
      },
      {
        timeout: API_CONFIG.VERIFY_TIMEOUT, // 10 seconds - faster timeout for verification
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Reset password with new password (POST request)
 * Used on "Set a new Password" screen
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 201 Created: Password reset successfully
 * - Other errors: Standard error response
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ data: ResetPasswordResponse; status: number }> {
  try {
    const response = await axios.post<ResetPasswordResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
      {
        password: data.password,
        token: data.token.trim(),
      }
    );
    
    return handleAxiosResponse(response);
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Get device token from localStorage or generate new one
 */
export function getDeviceToken(): string {
  if (typeof window === 'undefined') return '';

  try {
    let deviceToken = localStorage.getItem(DEVICE_CONFIG.STORAGE_KEY);
    if (!deviceToken) {
      deviceToken = generateDeviceToken();
      try {
        localStorage.setItem(DEVICE_CONFIG.STORAGE_KEY, deviceToken);
      } catch (error) {
        serviceLogger.error('Failed to save device token to localStorage', error);
      }
    }
    return deviceToken;
  } catch (error) {
    serviceLogger.error('Failed to get device token', error);
    return `${DEVICE_CONFIG.TEMP_TOKEN_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Get device type: 'phone' or 'desktop'
 */
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';

  try {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia(`(max-width: ${DEVICE_CONFIG.MOBILE_BREAKPOINT}px)`).matches) ||
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    return isMobile ? 'phone' : 'desktop';
  } catch (error) {
    serviceLogger.error('Failed to detect device type', error);
    return 'desktop';
  }
}

/**
 * Register provider (tasker)
 */
export async function registerProvider(
  data: RegisterProviderRequest,
  token: string
): Promise<RegisterProviderResponse> {
  try {
    const response = await axios.post<RegisterProviderResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_PROVIDER}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Verify user status, role, and permissions from backend
 * Always trust backend for critical checks
 */
export async function verifyUserStatus(token: string): Promise<VerifyUserStatusResponse> {
  try {
    const response = await axios.get<VerifyUserStatusResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_USER_STATUS}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);
    
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Social login (Google, Facebook, Apple)
 * Returns the full axios response to access status codes
 * Based on API documentation:
 * - 200 OK: "User authorized." Returns { user: {}, access_token: string }
 * - 401 Unauthorized: "Invalid credentials."
 * - 404 Not Found: "User not found."
 * - 500 Internal Server Error
 */
export async function socialLogin(data: SocialLoginRequest): Promise<{ data: SocialLoginResponse; status: number }> {
  serviceLogger.debug('Social Login API Request', {
    url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SOCIAL_LOGIN}`,
    method: 'POST',
    data: {
      email: data.email,
      socialId: data.socialId,
      type: data.type,
      device_token: data.device_token,
      device_type: data.device_type,
    },
  });

  const requestData = {
    email: data.email.trim(),
    socialId: data.socialId,
    type: data.type,
    device_token: data.device_token || generateDeviceToken(),
    device_type: data.device_type || getDeviceType(),
  };

  // Validate required fields
  if (!requestData.email || !requestData.socialId || !requestData.type || !requestData.device_token || !requestData.device_type) {
    throw new Error('Missing required social login parameters');
  }

  try {
    const response = await axios.post<SocialLoginResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SOCIAL_LOGIN}`,
      requestData
    );

    // Validate status code - only proceed if 200 or 201
    validateResponseStatus(response.status, response.data);

    const headerToken = extractHeaderToken(response.headers);
    const cleanHeaderToken = cleanBearerToken(headerToken);

    const responseData = response.data as Record<string, unknown>;
    
    serviceLogger.debug('Social Login API Full Response', {
      status: response.status,
      statusText: response.statusText,
      hasHeaderToken: !!cleanHeaderToken,
      headerTokenPreview: cleanHeaderToken ? `${cleanHeaderToken.substring(0, 20)}...` : null,
      responseDataKeys: response.data ? Object.keys(response.data) : [],
      hasAccessTokenInBody: !!(responseData?.access_token),
      responseHeaders: Object.keys(response.headers || {}),
      authorizationHeader: response.headers?.authorization || response.headers?.Authorization || 'not found',
    });

    // Handle access_token from response (API returns access_token, not token)
    // Also check for token in header as fallback
    if (cleanHeaderToken && !responseData.access_token && !(responseData as Record<string, unknown>)?.access_token) {
      // If no access_token in response but we have header token, use it
      responseData.access_token = cleanHeaderToken;
      serviceLogger.debug('Added access_token from header to response data');
    }

    return {
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
}

