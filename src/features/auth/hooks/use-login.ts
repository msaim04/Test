/**
 * useLogin Hook
 * Handles user login with robust error handling and validation
 * 
 * Features:
 * - Input validation
 * - Centralized error handling
 * - Consistent logging
 * - Navigation utilities
 * - Toast notifications
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, getDeviceToken, getDeviceType, verifyUserStatus, verifyPasswordToken, resendOtp } from '../services/auth.service';
import type { LoginRequest } from '../types/auth.types';
import { useAuthStore } from '@/shared/hooks/use-auth';
import {
  extractResponseMessage,
  extractAccessToken,
  extractRefreshToken,
  extractUserData,
  needsOnboardingFromBackend,
  extractErrorMessage,
} from '../utils/auth-response.utils';
import {
  isNetworkError,
  isAxiosError,
  handleNetworkError,
} from '../utils/auth-error-handlers.utils';
import { validateLoginCredentials } from '../utils/auth-validation.utils';
import { navigateToHome, navigateToOnboarding } from '../utils/auth-navigation.utils';
import { showSuccessToast, showErrorToast } from '../utils/auth-toast.utils';
import { loginLogger } from '../utils/auth-logger.utils';
import { containsAnyKeyword } from '../utils/auth-keyword-matcher.utils';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';

interface UseLoginReturn {
  isSubmitting: boolean;
  login: (data: Omit<LoginRequest, 'device_token' | 'device_type'>) => Promise<void>;
  showVerificationDialog: boolean;
  verificationEmail: string;
  isVerifying: boolean;
  isResendingOtp: boolean;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtpCode: (email: string) => Promise<void>;
  setShowVerificationDialog: (show: boolean) => void;
}

export function useLogin(): UseLoginReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  // Use ref to track if we're already handling an error to prevent unnecessary state updates
  const isHandlingErrorRef = useRef(false);

  /**
   * Handle login
   */
  const login = useCallback(
    async (data: Omit<LoginRequest, 'device_token' | 'device_type'>) => {
      isHandlingErrorRef.current = false;
      setIsSubmitting(true);

      try {
        // Validate input
        const validation = validateLoginCredentials(data.email, data.password);
        if (!validation.isValid) {
          showErrorToast(validation.error || 'Email and password are required'); // Error: 3000-5000ms (auto-calculated)
          setIsSubmitting((prev) => (prev ? false : prev));
          return;
        }

        // Prepare login request
        const deviceToken = getDeviceToken();
        const deviceType = getDeviceType();
        const finalDeviceToken = deviceToken || `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        loginLogger.debug('Login request', {
          email: data.email.trim(),
          hasDeviceToken: !!finalDeviceToken,
          deviceType,
        });

        // Execute login
        const response = await loginUser({
          email: data.email.trim(),
          password: data.password,
          device_token: finalDeviceToken,
          device_type: deviceType,
        });

        const httpStatus = response.status;
        const responseData = response.data;

        loginLogger.debug('Login API Response', {
          status: httpStatus,
          hasData: !!responseData,
          responseKeys: responseData ? Object.keys(responseData) : [],
        });

        // Handle non-success status codes - show API response message directly
        if (httpStatus !== HTTP_STATUS.OK && httpStatus !== HTTP_STATUS.CREATED) {
          const apiMessage = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
          isHandlingErrorRef.current = true;
          if (apiMessage) {
            showErrorToast(apiMessage);
          } else {
            showErrorToast('Login failed. Please try again.');
          }
          setIsSubmitting(false);
          return;
        }

        // Handle success responses (200 OK or 201 Created)
        if (httpStatus === HTTP_STATUS.OK || httpStatus === HTTP_STATUS.CREATED) {
          // API returns { data: { user: {}, tokens: {} } } for 200 OK
          // Extract user data from nested structure: responseData.data.user or responseData.user
          const nestedData = (responseData as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
          const userFromNested = nestedData?.user;
          const extractedUserData = userFromNested || responseData?.user || extractUserData(responseData);
          
          // Ensure userData always has at least the email
          // Merge extracted data with email from login form to ensure we have basic info
          // Preserve all fields including first_name, last_name, etc.
          const extractedDataObj = extractedUserData && typeof extractedUserData === 'object' 
            ? extractedUserData as Record<string, unknown>
            : {};
          
          const userData: Record<string, unknown> = {
            ...extractedDataObj,
            // Preserve email from API response, fallback to form email
            email: (typeof extractedDataObj.email === 'string' ? extractedDataObj.email : '') || data.email,
            // All other fields (first_name, last_name, etc.) are preserved via spread operator above
          };
          
          const accessToken = extractAccessToken(responseData);
          const refreshToken = extractRefreshToken(responseData);

          // Validate access_token exists
          if (!accessToken) {
            loginLogger.error('Login successful but no access_token found', {
              status: httpStatus,
              responseData,
            });

            isHandlingErrorRef.current = true;
            showErrorToast('Unable to complete login. Please try again later'); // Error: 3000-5000ms (auto-calculated)
            setIsSubmitting((prev) => (prev ? false : prev));
            return;
          }

          // Check if user is_active is false - requires OTP verification
          const isActive = extractedDataObj.is_active;
          if (isActive === false) {
            loginLogger.info('User is not active, showing OTP verification dialog');
            const userEmail = (typeof extractedDataObj.email === 'string' ? extractedDataObj.email : '') || data.email;
            
            // Store authentication data even when inactive - we'll use it after OTP verification
            setAuth(accessToken, userData, refreshToken);
            
            setVerificationEmail(userEmail);
            setShowVerificationDialog(true);
            setIsSubmitting(false);
            return;
          }

          // Store authentication data
          setAuth(accessToken, userData, refreshToken);
          
          // If user data doesn't have name fields, try to fetch full profile
          // This ensures we have complete user information including name
          if (accessToken && (!userData.first_name && !userData.last_name && !userData.name && !userData.username)) {
            // Fetch user profile in background to get complete user data
            verifyUserStatus(accessToken).then((profileResponse) => {
              const profileData = profileResponse?.data?.user || profileResponse?.user || profileResponse?.data || {};
              if (profileData && (profileData.first_name || profileData.last_name || profileData.name || profileData.username)) {
                // Update user data with profile information
                const { updateUser } = useAuthStore.getState();
                updateUser(profileData);
              }
            }).catch((error) => {
              // Silently fail - user is already logged in
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to fetch user profile:', error);
              }
            });
          }

          // Show success message
          const responseMessage = extractResponseMessage(responseData);
          const successMessage =
            responseMessage &&
            !responseMessage.toLowerCase().includes('error') &&
            !responseMessage.toLowerCase().includes('fail')
              ? responseMessage
              : httpStatus === HTTP_STATUS.OK ? 'User authorized.' : 'Login successful!';

          showSuccessToast(successMessage);

          // Handle navigation based on backend response
          const needsOnboarding = needsOnboardingFromBackend(responseData);

          if (needsOnboarding) {
            loginLogger.info('User needs onboarding, redirecting...');
            navigateToOnboarding(router);
            return;
          }

          loginLogger.info('Login successful, redirecting to home...');
          navigateToHome(router);
          return;
        }

      } catch (error: unknown) {
        isHandlingErrorRef.current = true;
        const errorObj = error as Error & { response?: { status?: number; data?: unknown } };
        loginLogger.error('Login error occurred', { 
          error: errorObj?.message,
          errorType: errorObj?.constructor?.name,
          isAxiosError: isAxiosError(error),
          responseStatus: errorObj?.response?.status,
          responseData: errorObj?.response?.data,
        });

        // Handle network errors
        if (isNetworkError(error)) {
          handleNetworkError('login');
          setIsSubmitting(false);
          return;
        }

        // Handle axios errors - show API response message directly
        if (isAxiosError(error)) {
          const status = error.response?.status;
          const errorData = error.response?.data;
          const apiMessage = extractErrorMessage(errorData, status);

          // Show API response message directly (extractErrorMessage handles fallback to status-based message)
          showErrorToast(apiMessage);
        } else {
          // Handle non-axios errors (network errors, etc.)
          // These are legitimate frontend errors, not API errors
          const errorObj = error as Error;
          let errorMessage = errorObj?.message || '';

          const networkKeywords = ['network', 'fetch'];
          const timeoutKeywords = ['timeout'];

          if (containsAnyKeyword(errorMessage, networkKeywords)) {
            errorMessage = 'Unable to connect. Please check your internet connection and try again.';
          } else if (containsAnyKeyword(errorMessage, timeoutKeywords)) {
            errorMessage = 'The request took too long. Please try again.';
          } else if (!errorMessage) {
            // Only use generic message if we truly have no error information
            errorMessage = 'An error occurred. Please try again.';
          }

          loginLogger.debug('Showing error toast for non-axios error', { errorMessage });
          showErrorToast(errorMessage);
        }
      } finally {
        // Always set submitting to false, regardless of error handling
        // This ensures the form is not stuck in submitting state
        setIsSubmitting(false);
        // Reset the ref for next attempt
        isHandlingErrorRef.current = false;
      }
    },
    [router, setAuth]
  );

  /**
   * Verify OTP token for login
   */
  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      if (!email?.trim() || !token?.trim()) {
        showErrorToast('Please enter the verification code');
        return;
      }

      setIsVerifying(true);
      try {
        const response = await verifyPasswordToken({
          email: email.trim(),
          token: token.trim(),
        });

        const httpStatus = response.status;
        const responseData = response.data;
        const message = extractResponseMessage(responseData);

        // 201 Created: Verification successful
        if (httpStatus === HTTP_STATUS.CREATED || httpStatus === HTTP_STATUS.OK) {
          const successMessage = message || 'Email verified successfully';
          showSuccessToast(successMessage);

          // Close dialog and redirect to home
          setShowVerificationDialog(false);
          navigateToHome(router);
          return;
        }

        // Handle error responses - show API message directly
        const errorMessage = message || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      } catch (error: unknown) {
        if (isNetworkError(error)) {
          handleNetworkError('verify');
        } else if (isAxiosError(error)) {
          const status = error.response?.status || 500;
          const errorData = error.response?.data;
          const message = extractErrorMessage(errorData, status);
          showErrorToast(message);
        } else {
          // Non-axios errors (network, etc.) - legitimate frontend errors
          showErrorToast('Verification failed. Please try again.');
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [router]
  );

  /**
   * Resend OTP code
   */
  const resendOtpCode = useCallback(
    async (email: string) => {
      if (!email?.trim()) {
        showErrorToast('Email is required');
        return;
      }

      setIsResendingOtp(true);
      try {
        const response = await resendOtp({
          email: email.trim(),
        });

        const httpStatus = response.status;
        const responseData = response.data;
        const message = extractResponseMessage(responseData);

        // 201 Created: OTP sent successfully
        if (httpStatus === HTTP_STATUS.CREATED || httpStatus === HTTP_STATUS.OK) {
          const successMessage = message || 'Verification code sent successfully';
          showSuccessToast(successMessage, { duration: 4000 });
          return;
        }

        // Handle error responses - show API message directly
        const errorMessage = message || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      } catch (error: unknown) {
        if (isNetworkError(error)) {
          handleNetworkError('resend');
        } else if (isAxiosError(error)) {
          const status = error.response?.status || 500;
          const errorData = error.response?.data;
          const message = extractErrorMessage(errorData, status);
          showErrorToast(message);
        } else {
          // Non-axios errors (network, etc.) - legitimate frontend errors
          showErrorToast('Failed to resend code. Please try again.');
        }
      } finally {
        setIsResendingOtp(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    login,
    showVerificationDialog,
    verificationEmail,
    isVerifying,
    isResendingOtp,
    verifyOtp,
    resendOtpCode,
    setShowVerificationDialog,
  };
}

