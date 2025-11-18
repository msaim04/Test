/**
 * Auth Navigation Utilities
 * Centralized navigation logic for authentication feature
 * Provides reusable navigation functions with fallback handling
 */

import { ROUTES, NAVIGATION_CONFIG } from '../constants/auth-config.constants';

/**
 * Navigation options
 */
export interface NavigationOptions {
  useFallback?: boolean;
  fallbackDelay?: number;
  checkPath?: string | string[];
  usePush?: boolean; // Use push instead of replace to allow back navigation
}

/**
 * Navigate to a route with fallback support
 */
export function navigateTo(
  router: { replace: (path: string) => void; push: (path: string) => void },
  path: string,
  options: NavigationOptions = {}
): void {
  const {
    useFallback = true,
    fallbackDelay = NAVIGATION_CONFIG.FALLBACK_DELAY,
    checkPath = NAVIGATION_CONFIG.CHECK_PATHS,
    usePush = false, // Default to replace for backward compatibility
  } = options;

  // Primary navigation - use push to allow back navigation, or replace to prevent it
  if (usePush) {
    router.push(path);
  } else {
    router.replace(path);
  }

  // Fallback navigation if needed (only for replace, not for push)
  if (useFallback && !usePush && typeof window !== 'undefined') {
    setTimeout(() => {
      const currentPath = window.location.pathname;
      const pathsToCheck = Array.isArray(checkPath) ? checkPath : [checkPath];

      const shouldUseFallback = pathsToCheck.some(
        (p) => typeof p === 'string' && (currentPath === p || currentPath.startsWith(p))
      );

      if (shouldUseFallback) {
        window.location.replace(path);
      }
    }, fallbackDelay);
  }
}

/**
 * Navigate to home page
 * Uses push instead of replace to allow users to go back
 */
export function navigateToHome(router: { replace: (path: string) => void; push: (path: string) => void }): void {
  navigateTo(router, ROUTES.HOME, {
    usePush: true, // Use push to allow back navigation
    useFallback: false, // No fallback needed when using push
  });
}

/**
 * Navigate to login page
 */
export function navigateToLogin(router: { replace: (path: string) => void; push: (path: string) => void }): void {
  navigateTo(router, ROUTES.LOGIN);
}

/**
 * Navigate to provider onboarding
 * Uses push to allow users to go back
 */
export function navigateToOnboarding(router: { replace: (path: string) => void; push: (path: string) => void }): void {
  navigateTo(router, ROUTES.PROVIDER_ONBOARDING, {
    usePush: true, // Use push to allow back navigation
    useFallback: false, // No fallback needed when using push
  });
}

