/**
 * Auth Toast Utilities
 * Centralized toast notification logic for authentication feature
 * Provides consistent toast messages with proper configuration
 */

import toast from 'react-hot-toast';
import { TOAST_CONFIG } from '../constants/auth-config.constants';

/**
 * Calculate toast duration based on message length
 * Returns duration within the specified min/max range
 */
export function calculateToastDuration(
  message: string,
  min?: number,
  max?: number,
  wordDuration?: number
): number {
  const wordCount = message.split(/\s+/).length;
  const minDuration = min ?? TOAST_CONFIG.DURATION.ERROR_MIN;
  const maxDuration = max ?? TOAST_CONFIG.DURATION.ERROR_MAX;
  const wordDurationMs = wordDuration ?? TOAST_CONFIG.DURATION.ERROR_WORD_DURATION;
  const calculatedDuration = wordCount * wordDurationMs;

  return Math.max(minDuration, Math.min(calculatedDuration, maxDuration));
}

/**
 * Generate unique toast ID
 */
export function generateToastId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Show success toast
 * Duration: 2000-3000ms (2-3s) per guidelines
 */
export function showSuccessToast(
  message: string,
  options?: {
    duration?: number;
    position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
    id?: string;
    onSuccess?: () => void;
  }
): void {
  const finalDuration = options?.duration || calculateToastDuration(
    message,
    TOAST_CONFIG.DURATION.SUCCESS_MIN,
    TOAST_CONFIG.DURATION.SUCCESS_MAX,
    80 // milliseconds per word for success messages
  );
  toast.success(message, {
    duration: finalDuration,
    position: options?.position || TOAST_CONFIG.POSITION,
    id: options?.id,
  });
  if (options?.onSuccess) {
    options.onSuccess();
  }
}

/**
 * Show error toast with calculated duration
 * Duration: 3000-5000ms (3-5s) per guidelines
 */
export function showErrorToast(
  message: string,
  options: {
    id?: string;
    duration?: number;
    dismissExisting?: boolean;
  } = {}
): void {
  const {
    id = generateToastId('error'),
    duration = calculateToastDuration(
      message,
      TOAST_CONFIG.DURATION.ERROR_MIN,
      TOAST_CONFIG.DURATION.ERROR_MAX,
      TOAST_CONFIG.DURATION.ERROR_WORD_DURATION
    ),
    dismissExisting = true,
  } = options;

  if (dismissExisting) {
    toast.dismiss();
  }

  toast.error(message, {
    duration,
    position: TOAST_CONFIG.POSITION,
    id,
  });
}

/**
 * Show error toast with default duration
 * Uses default error duration (4000ms) per guidelines
 */
export function showErrorToastDefault(message: string, id?: string): void {
  showErrorToast(message, {
    id: id || generateToastId('error-default'),
    duration: TOAST_CONFIG.DURATION.DEFAULT_ERROR,
  });
}

