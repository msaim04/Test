/**
 * Forgot Password Hook
 * Handles forgot password API calls and state management
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyPasswordReset } from '../services/auth.service';
import {
  checkResponseSuccess,
  extractResetToken,
  handleSuccessResponse,
  handleCommonErrors,
} from '../utils/auth-response-helpers.utils';
import {
  extractResponseMessage,
  extractErrorMessage,
  isRateLimitMessage,
} from '../utils/auth-response.utils';
import {
  isNetworkError,
  isAxiosError,
  handleNetworkError,
  handleVerificationError,
} from '../utils/auth-error-handlers.utils';
import { showErrorToast, showSuccessToast } from '../utils/auth-toast.utils';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';

export interface UseForgotPasswordReturn {
  isSubmitting: boolean;
  isVerifying: boolean;
  isResendingOtp: boolean;
  sendResetCode: (email: string) => Promise<void>;
  verifyResetCode: (email: string, token: string) => Promise<void>;
  resendResetCode: (email: string) => Promise<void>;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useRouter();

  /**
   * Send password reset code
   */
  const sendResetCode = useCallback(async (email: string) => {
    if (!email?.trim()) {
      showErrorToast('Please enter your email address'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      const httpStatus = response.status;
      const responseData = response.data;

      // 201 Created: Reset code sent successfully (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        // Store email in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('password_reset_email', email.trim());
        }

        const message = extractResponseMessage(responseData);
        const successMessage = message || 'Password reset code has been sent to your email';
        showSuccessToast(successMessage); // Success: 2000-3000ms (auto-calculated)
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccess = checkResponseSuccess(responseData, 'PASSWORD_RESET');
      if (isSuccess) {
        // Store email in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('password_reset_email', email.trim());
        }

        handleSuccessResponse(
          responseData,
          'Password reset code has been sent to your email',
          { duration: 8000 }
        );
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      }
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        handleNetworkError('forgot-password');
      } else if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = extractErrorMessage(errorData, status);
        showErrorToast(errorMessage);
      } else {
        // Non-axios errors (network, etc.) - legitimate frontend errors
        const errorMessage = handleCommonErrors(error, 'Unable to connect to the server. Please check your internet connection.');
        showErrorToast(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Verify password reset OTP
   */
  const verifyResetCode = useCallback(async (email: string, token: string) => {
    if (!email?.trim() || !token?.trim()) {
      showErrorToast('Please enter the verification code'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyPasswordReset({
        email: email.trim(),
        token: token.trim(),
      });

      const httpStatus = response.status;
      const responseData = response.data;

      // 201 Created: Token verified successfully (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        const resetToken = extractResetToken(responseData, token.trim());

        if (typeof window !== 'undefined' && resetToken) {
          sessionStorage.setItem('password_reset_token', resetToken);
          sessionStorage.setItem('password_reset_email', email.trim());
        }

        const message = extractResponseMessage(responseData);
        const successMessage = message || 'Code verified successfully';
        showSuccessToast(successMessage); // Success: 2000-3000ms (auto-calculated)

        // Redirect immediately without delay
          router.replace('/new-password');
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccess = checkResponseSuccess(responseData, 'PASSWORD_VERIFY');
      if (isSuccess) {
        const resetToken = extractResetToken(responseData, token.trim());

        if (typeof window !== 'undefined' && resetToken) {
          sessionStorage.setItem('password_reset_token', resetToken);
          sessionStorage.setItem('password_reset_email', email.trim());
        }

        // Show success toast and redirect immediately
        const message = extractResponseMessage(responseData);
        const successMessage = message || 'Code verified successfully';
        showSuccessToast(successMessage);
        
        // Redirect immediately without delay
                router.replace('/new-password');
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      }
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        handleNetworkError('verify-reset');
      } else if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status) {
          const errorData = error.response?.data;
          const message = extractResponseMessage(errorData) || extractErrorMessage(errorData, status);
          handleVerificationError(status, message);
        } else {
          const errorData = error.response?.data;
          const errorMessage = extractErrorMessage(errorData, 500);
          showErrorToast(errorMessage);
        }
      } else {
        // Non-axios errors (network, etc.) - legitimate frontend errors
        const errorMessage = handleCommonErrors(error, 'Failed to verify code. Please try again.');
        showErrorToast(errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  /**
   * Resend password reset code
   * Calls the same API as the initial "Send Code" button (/auth/forgot-password)
   */
  const resendResetCode = useCallback(async (email: string) => {
    if (!email?.trim()) {
      showErrorToast('Email address is required'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    setIsResendingOtp(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      const httpStatus = response.status;
      const responseData = response.data;
      const message = extractResponseMessage(responseData);
      const isRateLimited = isRateLimitMessage(message);

      if (isRateLimited) {
        const rateLimitMessage = message || 'Please wait before requesting another code';
        showErrorToast(rateLimitMessage);
        return;
      }

      // 201 Created: Reset code sent successfully (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        const successMessage = message || 'Reset code has been resent to your email';
        showSuccessToast(successMessage); // Success: 2000-3000ms (auto-calculated)
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccess = checkResponseSuccess(responseData, 'PASSWORD_RESET');
      if (isSuccess) {
        handleSuccessResponse(responseData, 'Reset code has been resent to your email', { duration: 8000 });
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      }
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        handleNetworkError('resend-reset');
      } else if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = extractErrorMessage(errorData, status);
        showErrorToast(errorMessage);
      } else {
        // Non-axios errors (network, etc.) - legitimate frontend errors
        const errorMessage = handleCommonErrors(error, 'Failed to resend code. Please try again.');
        showErrorToast(errorMessage);
      }
    } finally {
      setIsResendingOtp(false);
    }
  }, []);

  return {
    isSubmitting,
    isVerifying,
    isResendingOtp,
    sendResetCode,
    verifyResetCode,
    resendResetCode,
  };
}

