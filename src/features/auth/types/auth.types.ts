/**
 * Auth Types
 * Type definitions for authentication feature
 */

export interface RegisterRequest {
  email: string;
  phone: string;
  address: string;
  password: string;
  first_name?: string;
  last_name?: string;
  tin?: string;
  cnic?: string;
  role_id?: number;
  docs?: Array<{
    url: string;
    doc_type: string;
  }>;
}

/**
 * Register API Response
 * Based on actual API documentation:
 * - 200 OK: Returns user object directly
 * - 409 Conflict: User Already Exists
 * - Other errors: Standard error response
 */
export interface RegisterResponse {
  // 200 OK response structure
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role_id?: number;
  
  // Error response structure
  statusCode?: number;
    message?: string;
  data?: unknown;
}

export interface VerifyTokenRequest {
  email: string;
  token: string;
}

/**
 * Verify Token API Response
 * Based on actual API documentation:
 * - 201 Created: Verification successful
 * - Other errors: Standard error response
 */
export interface VerifyTokenResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_token: string;
  device_type: string;
}

/**
 * Login API Response
 * Based on actual API documentation:
 * - 200 OK: "User authorized." Returns { user: {}, access_token: string }
 * - 201 Created: Success (empty description)
 * - 401 Unauthorized: "Invalid credentials."
 * - 404 Not Found: "User not found."
 * - 500 Internal Server Error
 */
export interface LoginResponse {
  // 200 OK response structure
  user?: Record<string, unknown>;
  access_token?: string;
  
  // Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface DeleteAccountResponse {
  status: string;
  message: string;
  data?: unknown;
}

/**
 * Logout API Response
 * Based on actual API documentation:
 * - 201 Created: Logout successful
 * - Other errors: Standard error response
 */
export interface LogoutResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Update Password API Response
 * Based on actual API documentation:
 * - 401 Unauthorized: "Not Authorized to access this endpoint."
 * - Other errors: Standard error response
 */
export interface UpdatePasswordResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
    access_token?: string;
    refresh_token?: string;
  };
  token?: string;
  refresh_token?: string;
}

export interface ResendOtpRequest {
  email: string;
}

/**
 * Resend OTP API Response
 * Based on actual API documentation:
 * - 201 Created: OTP sent successfully
 * - Other errors: Standard error response
 */
export interface ResendOtpResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Forgot Password API Response
 * Based on actual API documentation:
 * - 201 Created: Reset code sent successfully
 * - Other errors: Standard error response
 */
export interface ForgotPasswordResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface VerifyPasswordResetRequest {
  email: string;
  token: string;
}

/**
 * Verify Password Reset Token API Response
 * Based on actual API documentation:
 * - 201 Created: Token verified successfully
 * - Other errors: Standard error response
 */
export interface VerifyPasswordResetResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: {
    token?: string;
    reset_token?: string;
    [key: string]: unknown;
  };
  token?: string;
  reset_token?: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Reset Password API Response
 * Based on actual API documentation:
 * - 201 Created: Password reset successfully
 * - Other errors: Standard error response
 */
export interface ResetPasswordResponse {
  // Success/Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export interface RegisterProviderRequest {
  user_id: number;
  categories?: number[];
  subcategories?: number[];
  description?: string;
  workingHours: string;
  skills?: string[];
  referred_by?: string;
  price_hourly?: number;
  experience_years?: number;
  files?: string[];
}

export interface RegisterProviderResponse {
  status: string;
  message: string;
  data?: unknown;
}

export interface VerifyUserStatusResponse {
  status: string;
  message: string;
  data?: {
    user?: {
      id?: string | number;
      email?: string;
      role?: string;
      type?: string;
      user_type?: string;
      is_provider?: boolean;
      isProvider?: boolean;
      provider_id?: string | number;
      providerId?: string | number;
      is_provider_verified?: boolean;
      isProviderVerified?: boolean;
      is_verified?: boolean;
      isVerified?: boolean;
      verified?: boolean;
      status?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  user?: {
    id?: string | number;
    email?: string;
    role?: string;
    type?: string;
    user_type?: string;
    is_provider?: boolean;
    isProvider?: boolean;
    provider_id?: string | number;
    providerId?: string | number;
    is_provider_verified?: boolean;
    isProviderVerified?: boolean;
    is_verified?: boolean;
    isVerified?: boolean;
    verified?: boolean;
    status?: string;
    [key: string]: unknown;
  };
}

export interface SocialLoginRequest {
  email: string;
  socialId: string;
  type: string; // "google", "facebook", "apple"
  device_token: string;
  device_type: string;
}

/**
 * Social Login API Response
 * Based on API documentation:
 * - 200 OK: "User authorized." Returns { user: {}, access_token: string }
 * - 401 Unauthorized: "Invalid credentials."
 * - 404 Not Found: "User not found."
 * - 500 Internal Server Error
 */
export interface SocialLoginResponse {
  // 200 OK response structure
  user?: Record<string, unknown>;
  access_token?: string;
  
  // Error response structure
  statusCode?: number;
  message?: string;
  data?: unknown;
}

