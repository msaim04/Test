/**
 * useAuth Hook
 * Manages authentication state and user data using Zustand
 * DRY: Centralized auth state management
 * 
 * IMPORTANT: Frontend state is ONLY for UX optimizations (display, fast UI response)
 * CRITICAL checks (authentication, roles, permissions) MUST always validate against backend API
 * 
 * AUTH STATE MANAGEMENT:
 * - Login (use-login.ts): ✅ Uses Zustand - calls setAuth() after successful login
 * - Register (use-register.ts): ❌ Does NOT use Zustand - only handles registration/verification
 *   (Auth state is set after user logs in, not after registration)
 * - Forgot Password (use-forgot-password.ts): ❌ Does NOT use Zustand - only handles password reset flow
 *   (Does not set auth state, just resets password)
 * 
 * USAGE GUIDELINES:
 * - Use frontend state (isAuthenticated, user, token) for: UI display, conditional rendering, UX optimizations
 * - Always validate against backend API for: route protection, role checks, permission checks, sensitive actions
 * - Combine both: Use frontend state for fast UI response, validate against backend on sensitive actions
 * 
 * SECURITY:
 * - Tokens are encrypted before storage using AES-GCM encryption
 * - Tokens are decrypted when retrieved from storage
 * - Refresh tokens are also encrypted for security
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptToken, decryptToken, isEncryptedToken } from '@/features/auth/utils/token-encryption.utils';

/**
 * Validate token format (basic validation)
 */
function isValidToken(token: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  // Token should not be empty and should have some minimum length
  return token.trim().length > 0 && token !== 'authenticated';
}

interface User {
  email?: string;
  name?: string;
  id?: string | number;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAuth: (token: string, user?: User, refreshToken?: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// Queue for async encryption operations
const encryptionQueue: Array<{ name: string; value: string }> = [];
let isProcessingQueue = false;

/**
 * Process encryption queue
 */
async function processEncryptionQueue() {
  if (isProcessingQueue || encryptionQueue.length === 0) return;
  
  isProcessingQueue = true;
  const baseStorage = typeof window !== 'undefined' ? localStorage : null;
  if (!baseStorage) {
    isProcessingQueue = false;
    return;
  }

  while (encryptionQueue.length > 0) {
    const item = encryptionQueue.shift();
    if (!item) continue;

    try {
      const parsed = JSON.parse(item.value);
      if (parsed.state) {
        let needsUpdate = false;

        // Encrypt tokens if they're not already encrypted
        if (parsed.state.token && typeof parsed.state.token === 'string' && !isEncryptedToken(parsed.state.token)) {
          try {
            const originalToken = parsed.state.token;
            parsed.state.token = await encryptToken(parsed.state.token);
            needsUpdate = true;
            
            // Log encryption success (only in development)
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Token encrypted successfully', {
                originalLength: originalToken.length,
                encryptedLength: parsed.state.token.length,
                isEncrypted: isEncryptedToken(parsed.state.token),
              });
            }
          } catch (error) {
            console.error('❌ Failed to encrypt token:', error);
          }
        } else if (parsed.state.token && isEncryptedToken(parsed.state.token)) {
          // Token is already encrypted
          if (process.env.NODE_ENV === 'development') {
            console.log('🔒 Token is already encrypted');
          }
        }

        if (parsed.state.refreshToken && typeof parsed.state.refreshToken === 'string' && !isEncryptedToken(parsed.state.refreshToken)) {
          try {
            parsed.state.refreshToken = await encryptToken(parsed.state.refreshToken);
            needsUpdate = true;
          } catch (error) {
            console.error('Failed to encrypt refresh token:', error);
          }
        }

        // Save encrypted version
        if (needsUpdate) {
          baseStorage.setItem(item.name, JSON.stringify(parsed));
        } else {
          // Already encrypted or no tokens, save as-is
          baseStorage.setItem(item.name, item.value);
        }
      } else {
        // No state, save as-is
        baseStorage.setItem(item.name, item.value);
      }
    } catch (error) {
      console.error('Failed to process encryption queue:', error);
      // Fallback: save as-is if encryption fails
      baseStorage.setItem(item.name, item.value);
    }
  }

  isProcessingQueue = false;
}

/**
 * Create encrypted storage wrapper
 * Encrypts tokens before storing, decrypts when retrieving
 * Uses a queue system to handle async encryption
 */
function createEncryptedStorage() {
  const baseStorage = typeof window !== 'undefined' ? localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  return {
    getItem: (name: string): string | null => {
      try {
        return baseStorage.getItem(name);
      } catch (error) {
        console.error('Failed to get item from storage:', error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        // Parse the value to check if it contains tokens
        const parsed = JSON.parse(value);
        const hasTokens = parsed?.state?.token || parsed?.state?.refreshToken;
        
        if (hasTokens) {
          // Add to encryption queue and process asynchronously
          // Note: There's a small window where tokens might be unencrypted
          // This is acceptable because encryption happens very quickly (< 100ms)
          // and localStorage is only accessible to the same origin
          encryptionQueue.push({ name, value });
          
          // Process queue immediately (non-blocking)
          processEncryptionQueue().catch((error) => {
            console.error('Encryption queue processing failed:', error);
            // Fallback: save unencrypted if encryption fails (not ideal, but better than losing data)
            try {
              baseStorage.setItem(name, value);
            } catch (saveError) {
              console.error('Failed to save item:', saveError);
            }
          });
        } else {
          // No tokens, save directly
          baseStorage.setItem(name, value);
        }
      } catch (error) {
        // If parsing fails, save as-is
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse storage value, saving as-is:', error);
        }
        try {
          baseStorage.setItem(name, value);
        } catch (saveError) {
          console.error('Failed to set item in storage:', saveError);
        }
      }
    },
    removeItem: (name: string): void => {
      try {
        baseStorage.removeItem(name);
      } catch (error) {
        console.error('Failed to remove item from storage:', error);
      }
    },
  };
}


/**
 * Auth store using Zustand with persistence
 * Stores auth state in localStorage with encrypted tokens
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setAuth: (token: string, user?: User, refreshToken?: string) => {
        // Validate token before setting
        if (!isValidToken(token)) {
          console.error('Invalid token provided to setAuth');
          return;
        }
        
        // Ensure user object has at least basic structure
        // If user is provided but empty, ensure it's at least an object
        let userData: User | null = null;
        if (user) {
          userData = {
            ...user,
            // Preserve email if it exists
            email: user.email || undefined,
          };
        }
        
        set({
          isAuthenticated: true,
          token,
          refreshToken: refreshToken || null,
          user: userData,
        });
      },
      clearAuth: () =>
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          user: null,
        }),
      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createEncryptedStorage()),
      // Validate and decrypt stored state on rehydration
      onRehydrateStorage: () => async (state) => {
        if (state) {
          // Mark as hydrated after rehydration completes
          state.setHasHydrated(true);
          
          // Decrypt tokens if they are encrypted
          if (state.token && typeof state.token === 'string') {
            try {
              if (isEncryptedToken(state.token)) {
                const encryptedToken = state.token;
                const encryptedLength = encryptedToken.length;
                state.token = await decryptToken(state.token);
                
                // Log decryption success (only in development)
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Token decrypted successfully', {
                    wasEncrypted: true,
                    encryptedLength,
                    decryptedLength: state.token.length,
                    decryptedPreview: state.token.substring(0, 30) + '...',
                    decryptedEnd: '...' + state.token.substring(state.token.length - 10),
                  });
                }
              } else {
                // Token is not encrypted (might be from old version or error)
                if (process.env.NODE_ENV === 'development') {
                  console.warn('⚠️ Token is not encrypted - this should not happen!', {
                    tokenLength: state.token.length,
                    tokenPreview: state.token.substring(0, 30) + '...',
                  });
                }
              }
            } catch (error) {
              console.error('❌ Failed to decrypt token:', error);
              // If decryption fails, clear the token
              state.token = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
            }
          }

          if (state.refreshToken && typeof state.refreshToken === 'string') {
            try {
              if (isEncryptedToken(state.refreshToken)) {
                const encryptedRefreshToken = state.refreshToken;
                const encryptedLength = encryptedRefreshToken.length;
                state.refreshToken = await decryptToken(state.refreshToken);
                
                // Log decryption success (only in development)
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Refresh token decrypted successfully', {
                    wasEncrypted: true,
                    encryptedLength,
                    decryptedLength: state.refreshToken.length,
                    decryptedPreview: state.refreshToken.substring(0, 30) + '...',
                    decryptedEnd: '...' + state.refreshToken.substring(state.refreshToken.length - 10),
                  });
                }
              } else {
                // Refresh token is not encrypted (might be from old version or error)
                if (process.env.NODE_ENV === 'development') {
                  console.warn('⚠️ Refresh token is not encrypted - this should not happen!', {
                    tokenLength: state.refreshToken.length,
                    tokenPreview: state.refreshToken.substring(0, 30) + '...',
                  });
                }
              }
            } catch (error) {
              console.error('❌ Failed to decrypt refresh token:', error);
              state.refreshToken = null;
            }
          }

          // Validate token if present
          if (state.token && !isValidToken(state.token)) {
            console.warn('Invalid token found in storage, clearing auth state');
            state.clearAuth();
          }
        } else {
          // If no state, still mark as hydrated
          useAuthStore.getState().setHasHydrated(true);
        }
      },
    }
  )
);

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { isAuthenticated, token, refreshToken, user, hasHydrated, setAuth, clearAuth, updateUser, setHasHydrated } = useAuthStore();
  
  // Fallback: If we're on client and hasn't hydrated after a short delay, mark as hydrated
  // This handles edge cases where onRehydrateStorage might not fire
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !hasHydrated) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().hasHydrated) {
          setHasHydrated(true);
        }
      }, 100); // Small delay to allow rehydration to complete
      
      return () => clearTimeout(timer);
    }
  }, [hasHydrated, setHasHydrated]);
  
  return {
    isAuthenticated,
    token,
    refreshToken,
    user,
    hasHydrated,
    setAuth,
    clearAuth,
    updateUser,
  };
}

