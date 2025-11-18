/**
 * Auth Logger Utilities
 * Centralized logging for authentication feature
 * Provides consistent logging with proper environment checks
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Logger interface
 */
interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Create a logger instance
 */
function createLogger(context: string): Logger {
  const prefix = `[Auth:${context}]`;

  return {
    debug: (message: string, data?: unknown) => {
      if (isDevelopment) {
        console.log(`${prefix} ${message}`, data || '');
      }
    },
    info: (message: string, data?: unknown) => {
      if (isDevelopment) {
        console.log(`ℹ️ ${prefix} ${message}`, data || '');
      }
    },
    warn: (message: string, data?: unknown) => {
      console.warn(`⚠️ ${prefix} ${message}`, data || '');
    },
    error: (message: string, data?: unknown) => {
      console.error(`❌ ${prefix} ${message}`, data || '');
    },
  };
}

/**
 * Login logger instance
 */
export const loginLogger = createLogger('Login');

/**
 * Registration logger instance
 */
export const registrationLogger = createLogger('Registration');

/**
 * Service logger instance
 */
export const serviceLogger = createLogger('Service');

