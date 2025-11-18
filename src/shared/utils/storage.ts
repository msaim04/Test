/**
 * Storage Utilities
 * Safe localStorage operations with error handling
 * DRY: Centralized storage operations
 */

/**
 * Safely get item from localStorage
 */
export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get item from localStorage: ${key}`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

