/**
 * Token Encryption Verification Utility
 * Helper functions to verify if tokens are properly encrypted
 * Use this in browser console to check token encryption status
 */

import { isEncryptedToken } from './token-encryption.utils';

/**
 * Check if a token stored in localStorage is encrypted
 * Run this in browser console: checkTokenEncryption()
 */
export function checkTokenEncryption(): {
  isEncrypted: boolean;
  tokenLength: number;
  tokenPreview: string;
  storageKey: string;
} {
  if (typeof window === 'undefined') {
    console.error('This function must be run in the browser');
    return {
      isEncrypted: false,
      tokenLength: 0,
      tokenPreview: '',
      storageKey: 'auth-storage',
    };
  }

  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) {
      console.log('❌ No auth-storage found in localStorage');
      return {
        isEncrypted: false,
        tokenLength: 0,
        tokenPreview: '',
        storageKey: 'auth-storage',
      };
    }

    const parsed = JSON.parse(stored);
    const token = parsed?.state?.token;

    if (!token) {
      console.log('❌ No token found in auth-storage');
      return {
        isEncrypted: false,
        tokenLength: 0,
        tokenPreview: '',
        storageKey: 'auth-storage',
      };
    }

    const encrypted = isEncryptedToken(token);
    const result = {
      isEncrypted: encrypted,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      storageKey: 'auth-storage',
    };

    if (encrypted) {
      console.log('✅ Token IS encrypted:', result);
    } else {
      console.warn('⚠️ Token is NOT encrypted:', result);
      console.warn('This is a security issue! Token should be encrypted.');
    }

    return result;
  } catch (error) {
    console.error('❌ Error checking token encryption:', error);
    return {
      isEncrypted: false,
      tokenLength: 0,
      tokenPreview: '',
      storageKey: 'auth-storage',
    };
  }
}

/**
 * Verify encryption by checking token format
 * Encrypted tokens should be:
 * - Base64 encoded
 * - Longer than the original token (due to IV + encryption overhead)
 * - Decodable as base64
 */
export function verifyEncryptionFormat(token: string): {
  isValidBase64: boolean;
  decodedLength: number;
  hasMinimumLength: boolean;
  isLikelyEncrypted: boolean;
} {
  try {
    // Try to decode as base64
    const decoded = atob(token);
    const isValidBase64 = decoded.length > 0;
    const hasMinimumLength = decoded.length >= 20; // IV (12 bytes) + encrypted data
    const isLikelyEncrypted = isValidBase64 && hasMinimumLength;

    return {
      isValidBase64,
      decodedLength: decoded.length,
      hasMinimumLength,
      isLikelyEncrypted,
    };
  } catch {
    return {
      isValidBase64: false,
      decodedLength: 0,
      hasMinimumLength: false,
      isLikelyEncrypted: false,
    };
  }
}

// Make it available globally for easy console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).checkTokenEncryption = checkTokenEncryption;
  (window as unknown as Record<string, unknown>).verifyEncryptionFormat = verifyEncryptionFormat;
  
  console.log('🔍 Token encryption verification tools available:');
  console.log('  - checkTokenEncryption() - Check if stored token is encrypted');
  console.log('  - verifyEncryptionFormat(token) - Verify token format');
}

