/**
 * useRegister Hook
 * Handles user registration and email verification
 * Uses React Query mutations for API calls with proper caching
 * Uses Zustand store for UI state management
 * DRY: Reusable registration logic with proper state management
 * 
 * Best Practices:
 * - Uses React Query for automatic cleanup and caching
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Proper error handling with centralized utilities
 * - No memory leaks (React Query handles cleanup automatically)
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser, verifyPasswordToken, resendOtp } from '../services/auth.service';
import type { RegisterRequest, VerifyTokenRequest } from '../types/auth.types';
import { useRegistrationStore } from '../stores/registration.store';
import {
  extractResponseMessage,
  extractErrorMessage,
  extractToken,
  isSuccessMessage,
  isErrorMessage,
  isRateLimitMessage,
} from '../utils/auth-response.utils';
import {
  handleTimeoutError,
  handleNetworkError,
  handleVerificationError,
  handleResendOtpError,
  isTimeoutError,
  isNetworkError,
  isAxiosError,
} from '../utils/auth-error-handlers.utils';
import {
  handleNewRegistration,
  type DialogHandlers,
} from '../utils/auth-dialog-handlers.utils';
import { showErrorToast, showSuccessToast } from '../utils/auth-toast.utils';
import { handleCommonErrors } from '../utils/auth-response-helpers.utils';
import { containsAnyKeyword } from '../utils/auth-keyword-matcher.utils';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';
import { AUTH_MESSAGES } from '../constants/auth-messages.constants';

/**
 * Query keys for registration-related queries
 */
export const registrationKeys = {
  all: ['registration'] as const,
  verification: (email: string) => [...registrationKeys.all, 'verification', email] as const,
};

interface UseRegisterReturn {
  isSubmitting: boolean;
  isVerifying: boolean;
  isResendingOtp: boolean;
  showVerificationDialog: boolean;
  showEmailExistsDialog: boolean;
  showUserAlreadyActiveDialog: boolean;
  emailExistsMessage: string;
  userAlreadyActiveMessage: string;
  verificationEmail: string;
  verificationToken: string;
  isVerificationSuccess: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  verify: (data: VerifyTokenRequest) => Promise<void>;
  resendOtpCode: (email: string) => Promise<void>;
  setShowVerificationDialog: (show: boolean) => void;
  setShowEmailExistsDialog: (show: boolean) => void;
  setShowUserAlreadyActiveDialog: (show: boolean) => void;
  setVerificationToken: (token: string) => void;
  handleLoginRedirect: () => void;
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Get Zustand store state and actions
  const {
    showVerificationDialog,
    showEmailExistsDialog,
    showUserAlreadyActiveDialog,
    emailExistsMessage,
    userAlreadyActiveMessage,
    verificationEmail,
    verificationToken,
    isVerificationSuccess,
    setShowVerificationDialog,
    setShowEmailExistsDialog,
    setShowUserAlreadyActiveDialog,
    setEmailExistsMessage,
    setUserAlreadyActiveMessage,
    setVerificationEmail,
    setVerificationToken,
    setIsVerificationSuccess,
  } = useRegistrationStore();

  // Memoize dialog handlers to prevent unnecessary re-renders
  const dialogHandlers: DialogHandlers = useMemo(
    () => ({
      setShowVerificationDialog,
      setShowEmailExistsDialog,
      setShowUserAlreadyActiveDialog,
      setEmailExistsMessage,
      setUserAlreadyActiveMessage,
      setVerificationEmail,
      setVerificationToken,
    }),
    [
      setShowVerificationDialog,
      setShowEmailExistsDialog,
      setShowUserAlreadyActiveDialog,
      setEmailExistsMessage,
      setUserAlreadyActiveMessage,
      setVerificationEmail,
      setVerificationToken,
    ]
  );

  /**
   * Registration mutation with React Query
   * Handles actual API responses based on HTTP status codes:
   * - 200 OK: User registered successfully (returns user object)
   * - 409 Conflict: User Already Exists
   * - Other errors: Standard error responses
   */
  const registerMutation = useMutation({
    mutationFn: registerUser,
    retry: false,
    onSuccess: (response, variables) => {
      const userEmail = variables.email.trim();
      const httpStatus = response.status;
      const responseData = response.data;

      // Only show OTP screen if status is 200 (new user registered successfully)
      if (httpStatus === HTTP_STATUS.OK) {
        // API returns user object directly: { id, email, first_name, last_name, is_active, role_id }
        // User is new - show OTP verification dialog
        handleNewRegistration(
          userEmail,
          responseData,
          dialogHandlers,
          queryClient,
          registrationKeys,
          extractToken
        );
        return;
      }

      // For any other status code, treat as error and show API error message
      const message = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
      showErrorToast(message);
    },
    onError: (error: unknown) => {
      if (isTimeoutError(error)) {
        handleTimeoutError('register');
          return;
        }

      if (isNetworkError(error)) {
        handleNetworkError('register');
          return;
        }

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Show error message from API response for all error status codes
        // extractErrorMessage handles fallback to status-based message if no API message exists
        const errorMessage = extractErrorMessage(errorData, status);
        showErrorToast(errorMessage);
        return;
      } else {
        // Handle non-axios errors (network, timeout, etc.)
        const errorMessage = handleCommonErrors(error, AUTH_MESSAGES.UNEXPECTED_ERROR, {
          normalizeMessage: (msg) => {
            const networkKeywords = ['network', 'fetch'];
            return containsAnyKeyword(msg, networkKeywords) ? AUTH_MESSAGES.NETWORK_ERROR : msg;
          },
        });
        showErrorToast(errorMessage);
      }
    },
  });

  /**
   * Verification mutation with React Query
   * Handles actual API responses based on HTTP status codes:
   * - 201 Created: Verification successful
   * - Other errors: Standard error responses
   */
  const verifyMutation = useMutation({
    mutationFn: verifyPasswordToken,
    onSuccess: (response) => {
      const httpStatus = response.status;
      const responseData = response.data;
      const message = extractResponseMessage(responseData);

      // 201 Created: Verification successful (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        setIsVerificationSuccess(true);

        if (verificationEmail) {
          queryClient.invalidateQueries({ queryKey: registrationKeys.verification(verificationEmail) });
        }

        // Show success message if available
        if (message) {
          showSuccessToast(message); // Success: 2000-3000ms (auto-calculated)
        }
        
        // Redirect to login immediately after successful verification
        router.replace('/login');
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccessInMessage = isSuccessMessage(message);
      const isErrorInMessage = isErrorMessage(message);

      if (httpStatus === HTTP_STATUS.OK || (isSuccessInMessage && !isErrorInMessage)) {
        setIsVerificationSuccess(true);

        if (verificationEmail) {
          queryClient.invalidateQueries({ queryKey: registrationKeys.verification(verificationEmail) });
        }

        if (message) {
          showSuccessToast(message); // Success: 2000-3000ms (auto-calculated)
        }
        
        // Redirect to login immediately after successful verification
        router.replace('/login');
        return;
      }

      // Fallback for unexpected responses - show API message
        const errorMessage = message || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
    },
    onError: (error: unknown) => {
      if (isNetworkError(error)) {
        handleNetworkError('verify');
          return;
        }

      if (isAxiosError(error)) {
        const status = error.response?.status || 500;
          const errorData = error.response?.data;
        const message = extractErrorMessage(errorData, status);
        handleVerificationError(status, message);
      }
    },
  });
          
  /**
   * Resend OTP mutation with React Query
   * Handles actual API responses based on HTTP status codes:
   * - 201 Created: OTP sent successfully
   * - Other errors: Standard error responses
   */
  const resendOtpMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (response) => {
      const httpStatus = response.status;
      const responseData = response.data;
      const message = extractResponseMessage(responseData);
      const messageLower = message.toLowerCase();
      const isRateLimit = isRateLimitMessage(message);

      // Check for rate limiting first
      if (isRateLimit) {
        const rateLimitMessage = message || AUTH_MESSAGES.RATE_LIMIT_RESEND;
        showErrorToast(rateLimitMessage);
        return;
      }

      // 201 Created: OTP sent successfully (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        const successMessage = message || AUTH_MESSAGES.OTP_RESENT;
        showSuccessToast(successMessage, { duration: 4000 });

        if (verificationEmail) {
          const timestamp = Date.now();
          queryClient.setQueryData(registrationKeys.verification(verificationEmail), {
            email: verificationEmail,
            timestamp,
          });
        }
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccessInMessage = isSuccessMessage(message) || messageLower.includes('sent') || messageLower.includes('resent');
      const isErrorInMessage = isErrorMessage(message);

      if (httpStatus === HTTP_STATUS.OK || (isSuccessInMessage && !isErrorInMessage)) {
        const successMessage = message || AUTH_MESSAGES.OTP_RESENT;
        showSuccessToast(successMessage, { duration: 4000 });

        if (verificationEmail) {
          const timestamp = Date.now();
          queryClient.setQueryData(registrationKeys.verification(verificationEmail), {
            email: verificationEmail,
            timestamp,
          });
        }
        return;
      }

      // Fallback for unexpected responses - show API message
      const errorMessage = message || extractErrorMessage(responseData, httpStatus);
      showErrorToast(errorMessage);
    },
    onError: (error: unknown) => {
      if (isNetworkError(error)) {
        handleNetworkError('resend-otp');
          return;
        }

      if (isAxiosError(error)) {
        const status = error.response?.status || 500;
          const errorData = error.response?.data;
        const message = extractErrorMessage(errorData, status);
        handleResendOtpError(status, message);
      }
    },
  });

  /**
   * Wrapper functions that use mutations
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const register = useCallback(async (data: RegisterRequest) => {
    if (!data.email?.trim() || !data.password) {
      showErrorToast(AUTH_MESSAGES.EMAIL_REQUIRED); // Error: 3000-5000ms (auto-calculated)
      return;
    }
    registerMutation.mutate(data);
  }, [registerMutation]);

  const verify = useCallback(async (data: VerifyTokenRequest) => {
    if (!data.token.trim()) {
      showErrorToast(AUTH_MESSAGES.TOKEN_REQUIRED); // Error: 3000-5000ms (auto-calculated)
      return;
    }
    verifyMutation.mutate(data);
  }, [verifyMutation]);

  const resendOtpCode = useCallback(async (email: string) => {
    if (!email?.trim()) {
      showErrorToast(AUTH_MESSAGES.EMAIL_REQUIRED_FOR_RESEND); // Error: 3000-5000ms (auto-calculated)
      return;
    }
    resendOtpMutation.mutate({ email: email.trim() });
  }, [resendOtpMutation]);

  const handleLoginRedirect = useCallback(() => {
    router.replace('/login');
  }, [router]);

  return {
    isSubmitting: registerMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResendingOtp: resendOtpMutation.isPending,
    showVerificationDialog,
    showEmailExistsDialog,
    showUserAlreadyActiveDialog,
    emailExistsMessage,
    userAlreadyActiveMessage,
    verificationEmail,
    verificationToken,
    isVerificationSuccess,
    register,
    verify,
    resendOtpCode,
    setShowVerificationDialog,
    setShowEmailExistsDialog,
    setShowUserAlreadyActiveDialog,
    setVerificationToken,
    handleLoginRedirect,
  };
}
