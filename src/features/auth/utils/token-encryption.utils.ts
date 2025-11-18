/**
 * Token Encryption Utilities
 * Encrypts/decrypts tokens for secure storage
 * Uses Web Crypto API (AES-GCM) for encryption
 * DRY: Centralized token encryption logic
 * 
 * Note: Encryption/decryption is async, but we provide sync wrappers
 * that cache results for use with Zustand's synchronous storage
 */

// Cache for decrypted tokens to avoid repeated async operations
const decryptionCache = new Map<string, { token: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a key from a password using PBKDF2
 * This creates a consistent key from a stable password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Ensure salt is a proper Uint8Array with ArrayBuffer
  // Create a new Uint8Array to ensure proper ArrayBuffer type
  const saltBuffer = new Uint8Array(salt.length);
  saltBuffer.set(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create a stable salt for key derivation
 * Uses a combination of domain and a stable identifier
 */
function getSalt(): Uint8Array {
  if (typeof window === 'undefined') {
    // Server-side: use a default salt
    return new Uint8Array([
      0x73, 0x65, 0x72, 0x76, 0x69, 0x73, 0x63, 0x61,
      0x61, 0x75, 0x74, 0x68, 0x74, 0x6f, 0x6b, 0x65,
      0x6e, 0x73, 0x61, 0x6c, 0x74, 0x76, 0x31, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
    ]);
  }

  // Client-side: get or create salt in sessionStorage
  const SALT_KEY = 'servisca_auth_salt';
  let saltStr = sessionStorage.getItem(SALT_KEY);

  if (!saltStr) {
    // Generate a new salt and store it
    const salt = crypto.getRandomValues(new Uint8Array(32));
    saltStr = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    try {
      sessionStorage.setItem(SALT_KEY, saltStr);
    } catch {
      // If sessionStorage fails, use default salt
      console.warn('Failed to store salt in sessionStorage, using default');
      return new Uint8Array([
        0x73, 0x65, 0x72, 0x76, 0x69, 0x73, 0x63, 0x61,
        0x61, 0x75, 0x74, 0x68, 0x74, 0x6f, 0x6b, 0x65,
        0x6e, 0x73, 0x61, 0x6c, 0x74, 0x76, 0x31, 0x30,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      ]);
    }
  }

  // Convert hex string back to Uint8Array
  const salt = new Uint8Array(
    saltStr.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  return salt;
}

/**
 * Get encryption password
 * Uses a combination of domain and browser fingerprint
 */
function getEncryptionPassword(): string {
  if (typeof window === 'undefined') {
    return 'servisca-default-encryption-key-v1';
  }

  // Use domain and user agent as part of the password
  // This makes it harder for attackers to decrypt tokens from another domain
  const domain = window.location.hostname;
  const userAgent = navigator.userAgent.substring(0, 50); // Limit length
  
  // Create a stable password based on domain
  return `servisca-${domain}-${userAgent}-encryption-key-v1`;
}

/**
 * Encrypt a token (async)
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encryptToken(token: string): Promise<string> {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token provided for encryption');
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);

    // Generate IV (Initialization Vector) for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

    // Get salt and derive key
    const salt = getSalt();
    const password = getEncryptionPassword();
    const key = await deriveKey(password, salt);

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a token (async)
 * Expects base64-encoded encrypted data with IV prepended
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  if (!encryptedToken || typeof encryptedToken !== 'string') {
    throw new Error('Invalid encrypted token provided for decryption');
  }

  // Check cache first
  const cached = decryptionCache.get(encryptedToken);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.token;
  }

  try {
    // Decode from base64
    const combined = Uint8Array.from(
      atob(encryptedToken)
        .split('')
        .map((char) => char.charCodeAt(0))
    );

    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Get salt and derive key
    const salt = getSalt();
    const password = getEncryptionPassword();
    const key = await deriveKey(password, salt);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    // Convert back to string
    const decoder = new TextDecoder();
    const decrypted = decoder.decode(decryptedData);
    
    // Cache the result
    decryptionCache.set(encryptedToken, { token: decrypted, timestamp: Date.now() });
    
    return decrypted;
  } catch (error) {
    console.error('Token decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Check if a string is encrypted (base64 format check)
 */
export function isEncryptedToken(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Check if it's base64 encoded and has minimum length
  // Encrypted tokens will be longer than plain tokens
  try {
    const decoded = atob(value);
    // Encrypted tokens should have at least IV (12 bytes) + some encrypted data
    return decoded.length >= 20;
  } catch {
    // Not valid base64, so not encrypted
    return false;
  }
}

/**
 * Clear decryption cache
 */
export function clearDecryptionCache(): void {
  decryptionCache.clear();
}

