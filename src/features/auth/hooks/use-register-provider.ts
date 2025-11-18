/**
 * useRegisterProvider Hook
 * Handles provider (tasker) registration/verification
 * Uses React Query mutations for API calls with proper caching
 * DRY: Reusable provider registration logic
 */

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { registerProvider } from '../services/auth.service';
import type { RegisterProviderRequest } from '../types/auth.types';
import { HTTP_STATUS } from '@/core/utils/http-status-codes';
import { useAuth } from '@/shared/hooks/use-auth';
import {
  isNetworkError,
  isAxiosError,
  handleNetworkError,
} from '../utils/auth-error-handlers.utils';
import {
  extractResponseMessage,
  extractErrorMessage,
} from '../utils/auth-response.utils';
import {
  checkResponseSuccess,
  handleSuccessResponse,
  handleCommonErrors,
} from '../utils/auth-response-helpers.utils';
import { showErrorToast } from '../utils/auth-toast.utils';
import { navigateToHome, navigateToLogin } from '../utils/auth-navigation.utils';

interface UseRegisterProviderReturn {
  isSubmitting: boolean;
  registerProvider: (data: Omit<RegisterProviderRequest, 'user_id'>) => Promise<void>;
}

export function useRegisterProvider(): UseRegisterProviderReturn {
  const router = useRouter();
  const { token, user } = useAuth();

  /**
   * Provider registration mutation with React Query
   */
  const registerProviderMutation = useMutation({
    mutationFn: async (data: Omit<RegisterProviderRequest, 'user_id'>) => {
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (!user?.id) {
        throw new Error('User ID not found. Please log in again.');
      }

      return registerProvider(
        {
          ...data,
          user_id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
        },
        token
      );
    },
    onSuccess: (response) => {
      const isSuccess = checkResponseSuccess(response, 'PROVIDER_REGISTER');

      if (isSuccess) {
        handleSuccessResponse(
          response,
          'Provider registered successfully',
          {
            onSuccess: () => navigateToHome(router),
          }
        );
      } else {
        // Show API error message directly
        const errorMessage = extractResponseMessage(response) || extractErrorMessage(response, 400);
        showErrorToast(errorMessage);
      }
    },
    onError: (error: unknown) => {
      if (isNetworkError(error)) {
        handleNetworkError('register-provider');
        return;
      }

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = extractErrorMessage(errorData, status);
        const duration = status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN ? 5000 : undefined;

        showErrorToast(errorMessage, { duration });

        if (status === HTTP_STATUS.UNAUTHORIZED) {
          navigateToLogin(router);
        }
      } else {
        // Non-axios errors (network, etc.) - legitimate frontend errors
        const errorMessage = handleCommonErrors(error, 'Something went wrong. Please try again.');
        showErrorToast(errorMessage);
      }
    },
  });

  const registerProviderHandler = async (data: Omit<RegisterProviderRequest, 'user_id'>) => {
    if (!token) {
      showErrorToast('Authentication required. Please log in again.'); // Error: 3000-5000ms (auto-calculated)
      navigateToLogin(router);
      return;
    }

    if (!user?.id) {
      showErrorToast('User ID not found. Please log in again.'); // Error: 3000-5000ms (auto-calculated)
      navigateToLogin(router);
      return;
    }

    registerProviderMutation.mutate(data);
  };

  return {
    isSubmitting: registerProviderMutation.isPending,
    registerProvider: registerProviderHandler,
  };
}

