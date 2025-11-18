/**
 * Social Login Hook
 * Handles Google, Facebook, Apple authentication
 * DRY: Centralized social login logic
 */

import { useState, useCallback } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/lib/firebase/config';
import { socialLogin, getDeviceToken, getDeviceType, verifyUserStatus } from '../services/auth.service';
import { useAuth, useAuthStore } from '@/shared/hooks/use-auth';
import toast from 'react-hot-toast';
import { TOAST_CONFIG } from '../constants/auth-config.constants';
import { useRouter } from 'next/navigation';
import { navigateToHome, navigateToOnboarding } from '../utils/auth-navigation.utils';
import { needsOnboardingFromBackend, extractAccessToken, extractUserData, extractErrorMessage } from '../utils/auth-response.utils';
import { isAxiosError } from '../utils/auth-error-handlers.utils';

interface UseSocialLoginOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for social login (Google, Facebook, Apple)
 */
export function useSocialLogin(options: UseSocialLoginOptions = {}) {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuth();
  const router = useRouter();

  /**
   * Handle Google sign-in
   */
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      toast.error('Firebase Auth is not initialized');
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with Google using popup
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;

      // Extract required information from Firebase user
      const email = firebaseUser.email;
      const socialId = firebaseUser.uid; // Firebase user ID
      const displayName = firebaseUser.displayName; // Google account display name

      if (!email) {
        throw new Error('Google account does not have an email address');
      }

      // Call your backend API
      const deviceToken = getDeviceToken();
      const deviceType = getDeviceType();

      const response = await socialLogin({
        email,
        socialId,
        type: 'google',
        device_token: deviceToken,
        device_type: deviceType,
      });

      const httpStatus = response.status;
      const responseData = response.data as Record<string, unknown>;
      
      // If status is 200 or 201, treat as success and proceed with authentication
      if (httpStatus === 200 || httpStatus === 201) {
        // Extract access token - check multiple locations
        // The service already tries to extract from headers and add to responseData.access_token
        let accessToken = (responseData.access_token as string) || '';
        
        // If not found in responseData, try extraction utility (handles nested structures)
        if (!accessToken) {
          accessToken = extractAccessToken(response.data);
        }   
        
        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Social Login - Token Extraction:', {
            hasTokenInResponseData: !!(responseData.access_token),
            extractedToken: accessToken ? `Found (${accessToken.substring(0, 20)}...)` : 'Not found',
            responseDataKeys: Object.keys(responseData),
          });
        }
        
        // Extract user data
        const extractedUserData = extractUserData(response.data);
        const userFromResponse = (responseData.user as Record<string, unknown>) || {};
        
        // Extract name from Firebase user if available
        let firebaseName: string | null = null;
        let firebaseFirstName: string | null = null;
        let firebaseLastName: string | null = null;
        
        if (displayName) {
          firebaseName = displayName;
          // Try to split displayName into first and last name
          const nameParts = displayName.trim().split(/\s+/);
          if (nameParts.length > 0) {
            firebaseFirstName = nameParts[0];
            if (nameParts.length > 1) {
              firebaseLastName = nameParts.slice(1).join(' ');
            }
          }
        }
        
        // Merge extracted user data with response user data
        // Priority: API response > Firebase user > fallback
        const userData: Record<string, unknown> = {
          ...(extractedUserData && typeof extractedUserData === 'object' ? extractedUserData as Record<string, unknown> : {}),
          ...userFromResponse,
          // Ensure email is present (from Firebase user if not in response)
          email: userFromResponse.email || email || '',
          // Add name from Firebase if not in API response
          // Priority: API response name > Firebase displayName
          name: userFromResponse.name || firebaseName || undefined,
          first_name: userFromResponse.first_name || firebaseFirstName || undefined,
          last_name: userFromResponse.last_name || firebaseLastName || undefined,
        };

        // Always set auth state - required for header to show profile instead of login buttons
        // This must be called for the header to update properly
        // Encryption/decryption is handled automatically by setAuth (same as regular login)
        if (accessToken && accessToken.trim().length > 0 && accessToken !== 'authenticated') {
          // Validate token before setting (same validation as regular login)
          if (process.env.NODE_ENV === 'development') {
            console.log('Social Login - Setting auth state with token (encryption will happen automatically):', {
              tokenLength: accessToken.length,
              tokenPreview: accessToken.substring(0, 20) + '...',
              hasUserData: !!userData,
              userEmail: userData.email,
            });
          }
          
          // setAuth automatically handles encryption via Zustand persist middleware
          // The token will be encrypted before storing in localStorage
        setAuth(
          accessToken,
          userData,
          undefined // No refresh token from social login response
        );
        
          if (process.env.NODE_ENV === 'development') {
            console.log('Social Login - Auth state set with token (encryption queued)');
          }
          
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
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('Social Login - User profile fetched and updated:', profileData);
                }
              }
            }).catch((error) => {
              // Silently fail - user is already logged in
              if (process.env.NODE_ENV === 'development') {
                console.warn('Social Login - Failed to fetch user profile:', error);
              }
            });
          }
        } else {
          // If no token in response but status is 200/201, backend might use cookies/session
          // We still need to set auth state for the header to show profile
          // Generate a temporary token that will be validated by backend on next request
          // This is a workaround - ideally backend should return token in response
          const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          
        if (process.env.NODE_ENV === 'development') {
            console.warn('Social login: No access token in response, using temporary token. Backend should return token in response or use cookies/session.');
            console.log('Social Login - Setting auth state with temporary token (encryption will happen automatically):', {
              tokenLength: tempToken.length,
            hasUserData: !!userData,
            userEmail: userData.email,
          });
        }
          
          // setAuth automatically handles encryption via Zustand persist middleware
          // The token will be encrypted before storing in localStorage
          setAuth(
            tempToken,
            userData,
            undefined
          );
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Social Login - Auth state set with temporary token (encryption queued)');
          }
        }

        // Get success message from response
        const responseMessage = (responseData.message as string) || '';
        const messageLower = responseMessage.toLowerCase();
        
        // Detect if this is a new user creation or existing user login
        const isNewUser = messageLower.includes('created') || 
                         messageLower.includes('registered') ||
                         messageLower.includes('sign up') ||
                         messageLower.includes('account created');
        
        const isExistingUser = messageLower.includes('logged in') || 
                              messageLower.includes('authorized') ||
                              messageLower.includes('welcome back');

        // Show appropriate success message
        let successMessage: string;
        if (isNewUser) {
          successMessage = 'Account created successfully! Welcome to Servisca!';
        } else if (isExistingUser) {
          successMessage = 'Welcome back! Logging you in...';
        } else {
          successMessage = responseMessage || 'Signed in with Google successfully!';
        }

        toast.success(successMessage, {
          duration: TOAST_CONFIG.DURATION.DEFAULT_SUCCESS,
        });

        // Zustand set() is synchronous, so state is immediately available
        // Use microtask to ensure state update is processed before navigation
        // This is imperceptible to users (executes in < 1ms)
        await Promise.resolve();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Handle navigation based on backend response (same as regular login)
          const needsOnboarding = needsOnboardingFromBackend(responseData);

          if (needsOnboarding) {
            navigateToOnboarding(router);
            return;
          }

          // Use Next.js router for smooth client-side navigation (no page reload)
          // This prevents blinking/flashing and provides smooth transition
          // State is already set synchronously, so header will show profile immediately
          navigateToHome(router);
        }
      } else {
        // If status is not 200/201, show API error message
        const errorMessage = extractErrorMessage(responseData, httpStatus);
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle Firebase auth errors
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          // User closed the popup - don't show error
          setIsLoading(false);
          return;
        }
        if (error.message.includes('auth/popup-blocked')) {
          toast.error('Popup was blocked. Please allow popups for this site.', {
            duration: TOAST_CONFIG.DURATION.DEFAULT_ERROR,
          });
          setIsLoading(false);
          return;
        }
        if (error.message.includes('auth/network-request-failed')) {
          toast.error('Network error. Please check your connection.', {
            duration: TOAST_CONFIG.DURATION.DEFAULT_ERROR,
          });
          setIsLoading(false);
          return;
        }
      }

      // Handle API errors - show the actual API response message
      let errorMessage = 'Failed to sign in with Google';
      
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        errorMessage = extractErrorMessage(errorData, status);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show API error message
        toast.error(errorMessage, {
          duration: TOAST_CONFIG.DURATION.DEFAULT_ERROR,
        });

      // Call error callback if provided
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, router, setAuth]);

  return {
    signInWithGoogle,
    isLoading,
  };
}

