/**
 * Auth Dialog Handlers Utilities
 * DRY: Centralized dialog state management handlers
 * 
 * IMPORTANT: These handlers work with backend API responses
 * Always pass backend response data, not frontend state, to these functions
 */

/**
 * Get current timestamp (extracted to avoid impure function warnings)
 */
function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Dialog handler actions interface
 */
export interface DialogHandlers {
  setShowVerificationDialog: (show: boolean) => void;
  setShowEmailExistsDialog: (show: boolean) => void;
  setShowUserAlreadyActiveDialog: (show: boolean) => void;
  setEmailExistsMessage: (msg: string) => void;
  setUserAlreadyActiveMessage: (msg: string) => void;
  setVerificationEmail: (email: string) => void;
  setVerificationToken: (token: string) => void;
}

/**
 * Handle user already active case
 */
export function handleUserAlreadyActive(
  message: string,
  handlers: DialogHandlers,
  defaultMessage = 'This account is already active. Please log in instead.'
): void {
  handlers.setShowVerificationDialog(false);
  const activeUserMsg = message || defaultMessage;
  handlers.setUserAlreadyActiveMessage(activeUserMsg);
  handlers.setShowUserAlreadyActiveDialog(true);
}

/**
 * Handle account exists and verified case
 */
export function handleAccountExistsVerified(
  message: string,
  handlers: DialogHandlers,
  defaultMessage = 'An account with this email already exists. Please log in instead.'
): void {
  handlers.setShowVerificationDialog(false);
  const existsMessage = message || defaultMessage;
  handlers.setEmailExistsMessage(existsMessage);
  handlers.setShowEmailExistsDialog(true);
}

/**
 * Handle account exists but not verified case
 */
export function handleAccountExistsNotVerified(
  userEmail: string,
  responseData: unknown,
  handlers: DialogHandlers,
  extractToken: (data: unknown, response?: unknown) => string
): void {
  handlers.setVerificationEmail(userEmail);
  handlers.setShowVerificationDialog(true);
  
  const token = extractToken(responseData);
  if (token) {
    handlers.setVerificationToken(token);
  }
}

/**
 * Handle successful new registration
 */
export function handleNewRegistration(
  userEmail: string,
  responseData: unknown,
  handlers: DialogHandlers,
  queryClient: { setQueryData: (queryKey: readonly unknown[], data: { email: string; timestamp: number }) => void },
  registrationKeys: { verification: (email: string) => readonly unknown[] },
  extractToken: (data: unknown, response?: unknown) => string
): void {
  handlers.setVerificationEmail(userEmail);
  handlers.setShowVerificationDialog(true);

  const token = extractToken(responseData);
  if (token) {
    handlers.setVerificationToken(token);
  }

  queryClient.setQueryData(registrationKeys.verification(userEmail), {
    email: userEmail,
    timestamp: getCurrentTimestamp(),
  });
}

