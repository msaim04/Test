/**
 * Reset Password Hook
 * Handles password reset API calls and state management
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '../services/auth.service';
import type { ResetPasswordRequest } from '../types/auth.types';
import {
  checkResponseSuccess,
  handleSuccessResponse,
  handleCommonErrors,
} from '../utils/auth-response-helpers.utils';
import {
  extractResponseMessage,
  extractErrorMessage,
} from '../utils/auth-response.utils';
import {
  isNetworkError,
  isAxiosError,
  handleNetworkError,
} from '../utils/auth-error-handlers.utils';
import { showErrorToast, showSuccessToast } from '../utils/auth-toast.utils';
import { navigateToLogin } from '../utils/auth-navigation.utils';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';

export interface UseResetPasswordReturn {
  isSubmitting: boolean;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  /**
   * Reset password with new password
   */
  const handleResetPassword = useCallback(async (data: ResetPasswordRequest) => {
    // Get the reset token from sessionStorage (stored during OTP verification)
    let resetToken = '';
    if (typeof window !== 'undefined') {
      resetToken = sessionStorage.getItem('password_reset_token') || '';
    }
    
    // Fallback to token from data if sessionStorage doesn't have it
    if (!resetToken && data.token?.trim()) {
      resetToken = data.token.trim();
    }

    if (!data.password || !data.confirmPassword || !resetToken) {
      showErrorToast('Please fill in all fields'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    if (data.password !== data.confirmPassword) {
      showErrorToast('Passwords do not match'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    if (data.password.length < 8) {
      showErrorToast('Password must be at least 8 characters'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    setIsSubmitting(true);
    try {
      // Call reset-password endpoint with stored reset token
      const response = await resetPassword({
        email: data.email?.trim() || '',
        token: resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const httpStatus = response.status;
      const responseData = response.data;

      // 201 Created: Password reset successfully (from API documentation)
      if (httpStatus === HTTP_STATUS.CREATED) {
        // Clear the stored reset token and email
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('password_reset_token');
          sessionStorage.removeItem('password_reset_email');
        }

        const message = extractResponseMessage(responseData);
        const successMessage = message || 'Password reset successfully';
        showSuccessToast(successMessage); // Success: 2000-3000ms (auto-calculated)

        setTimeout(() => {
          navigateToLogin(router);
        }, 1500);
        return;
      }

      // Handle other success status codes (200, etc.)
      const isSuccess = checkResponseSuccess(responseData, 'PASSWORD_CHANGED');
      if (isSuccess) {
        // Clear the stored reset token and email
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('password_reset_token');
          sessionStorage.removeItem('password_reset_email');
        }

        handleSuccessResponse(
          responseData,
          'Password reset successfully',
          {
            duration: 8000,
            onSuccess: () => {
              setTimeout(() => {
                navigateToLogin(router);
              }, 1500);
            },
          }
        );
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(responseData) || extractErrorMessage(responseData, httpStatus);
        showErrorToast(errorMessage);
      }
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        handleNetworkError('reset-password');
      } else if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = extractErrorMessage(errorData, status);
        showErrorToast(errorMessage);

        // Clear token and email on error if it's invalid/expired
        const msgLower = errorMessage.toLowerCase();
        if (msgLower.includes('expired') || msgLower.includes('invalid')) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('password_reset_token');
            sessionStorage.removeItem('password_reset_email');
          }
        }
      } else {
        const errorMessage = handleCommonErrors(error, 'Failed to reset password. Please try again.');
        showErrorToast(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  return {
    isSubmitting,
    resetPassword: handleResetPassword,
  };
}

