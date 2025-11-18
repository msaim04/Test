/**
 * useDeleteAccount Hook
 * Handles account deletion
 * DRY: Reusable delete account logic
 */

import { useState, useCallback } from 'react';
import { deleteAccount } from '../services/auth.service';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';
import {
  checkResponseSuccess,
  handleSuccessResponse,
  handleCommonErrors,
} from '../utils/auth-response-helpers.utils';
import {
  isNetworkError,
  isAxiosError,
  handleNetworkError,
} from '../utils/auth-error-handlers.utils';
import {
  extractResponseMessage,
  extractErrorMessage,
} from '../utils/auth-response.utils';
import { showErrorToast } from '../utils/auth-toast.utils';

interface UseDeleteAccountReturn {
  isDeleting: boolean;
  deleteUserAccount: () => Promise<void>;
}

export function useDeleteAccount(): UseDeleteAccountReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  /**
   * Handle account deletion
   */
  const deleteUserAccount = useCallback(async () => {
    if (!token) {
      showErrorToast('You must be logged in to delete your account'); // Error: 3000-5000ms (auto-calculated)
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteAccount(token);
      const isSuccess = checkResponseSuccess(response, 'ACCOUNT_DELETED');

      if (isSuccess) {
        // Clear authentication state
        clearAuth();
        
        // Clear device token
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('device_token');
          }
        } catch (storageError) {
          console.error('Failed to clear device token:', storageError);
        }

        handleSuccessResponse(
          response,
          'Your account has been deleted successfully',
          {
            duration: 3000, // Success: 2000-3000ms per guidelines
            onSuccess: () => {
              // Redirect immediately using window.location to prevent intermediate state
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            },
          }
        );
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(response) || extractErrorMessage(response, 400);
        showErrorToast(errorMessage, {
          duration: 4000, // Error: 3000-5000ms per guidelines
        });
      }
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        handleNetworkError('delete-account');
      } else if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = extractErrorMessage(errorData, status);
        showErrorToast(errorMessage); // Error: 3000-5000ms (auto-calculated)

        if (status === HTTP_STATUS.UNAUTHORIZED) {
          clearAuth();
        }
      } else {
        // Non-axios errors (network, etc.) - legitimate frontend errors
        const errorMessage = handleCommonErrors(error, 'Something went wrong. Please try again.');
        showErrorToast(errorMessage); // Error: 3000-5000ms (auto-calculated)
      }
    } finally {
      setIsDeleting(false);
    }
  }, [token, clearAuth]);

  return {
    isDeleting,
    deleteUserAccount,
  };
}

