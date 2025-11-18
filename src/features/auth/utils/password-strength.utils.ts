/**
 * Password Strength Utilities
 * Shared password validation and strength checking logic
 * DRY: Reusable across signup and password reset flows
 */

// ---------- CONSTANTS ----------
export const PASSWORD_REQUIREMENTS = [
  { id: 'minLength', text: 'At least 8 characters long' },
  { id: 'hasUppercase', text: 'Contains one uppercase letter (A-Z)' },
  { id: 'hasNumber', text: 'Includes at least one number (0-9)' },
  { id: 'hasSpecialChar', text: 'Includes at least one special character (! @ # $ % &)' },
] as const;

export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_NUMBER_REGEX = /[0-9]/;
export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%&]/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&]).{8,}$/;

export const STRENGTH_COLORS = {
  Strong: '#4CAF50',
  Medium: '#FF9800',
  Weak: '#F44336',
} as const;

// ---------- TYPES ----------
export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

// ---------- FUNCTIONS ----------

/**
 * Check password requirements
 * Returns an object with boolean values for each requirement
 */
export function checkPasswordRequirements(password: string): PasswordChecks {
  return {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: PASSWORD_UPPERCASE_REGEX.test(password),
    hasNumber: PASSWORD_NUMBER_REGEX.test(password),
    hasSpecialChar: PASSWORD_SPECIAL_CHAR_REGEX.test(password),
  };
}

/**
 * Get password strength based on requirements
 * - Strong: All 4 requirements met
 * - Medium: 2-3 requirements met
 * - Weak: 0-1 requirements met
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 'Weak';
  
  const checks = checkPasswordRequirements(password);
  const requirementsMet = Object.values(checks).filter(Boolean).length;
  
  if (requirementsMet === 4) return 'Strong';
  if (requirementsMet >= 2) return 'Medium';
  return 'Weak';
}

/**
 * Get color based on password strength
 */
export function getStrengthColor(strength: PasswordStrength): string {
  return STRENGTH_COLORS[strength] || '#9B7EDE';
}

