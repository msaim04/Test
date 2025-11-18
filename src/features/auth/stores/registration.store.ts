/**
 * Registration Store
 * Manages registration and verification state using Zustand
 * DRY: Centralized registration state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RegistrationState {
  // UI State
  showVerificationDialog: boolean;
  showEmailExistsDialog: boolean;
  showUserAlreadyActiveDialog: boolean;
  emailExistsMessage: string;
  userAlreadyActiveMessage: string;
  verificationEmail: string;
  verificationToken: string;
  isVerificationSuccess: boolean;
  
  // Actions
  setShowVerificationDialog: (show: boolean) => void;
  setShowEmailExistsDialog: (show: boolean) => void;
  setShowUserAlreadyActiveDialog: (show: boolean) => void;
  setEmailExistsMessage: (message: string) => void;
  setUserAlreadyActiveMessage: (message: string) => void;
  setVerificationEmail: (email: string) => void;
  setVerificationToken: (token: string) => void;
  setIsVerificationSuccess: (success: boolean) => void;
  resetRegistrationState: () => void;
}

const initialState = {
  showVerificationDialog: false,
  showEmailExistsDialog: false,
  showUserAlreadyActiveDialog: false,
  emailExistsMessage: '',
  userAlreadyActiveMessage: '',
  verificationEmail: '',
  verificationToken: '',
  isVerificationSuccess: false,
};

/**
 * Registration store using Zustand
 * Only persists verification email (for resend functionality)
 * Other state is ephemeral and resets on page reload
 */
export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...initialState,
      setShowVerificationDialog: (show: boolean) =>
        set({ showVerificationDialog: show }),
      setShowEmailExistsDialog: (show: boolean) =>
        set({ showEmailExistsDialog: show }),
      setShowUserAlreadyActiveDialog: (show: boolean) =>
        set({ showUserAlreadyActiveDialog: show }),
      setEmailExistsMessage: (message: string) =>
        set({ emailExistsMessage: message }),
      setUserAlreadyActiveMessage: (message: string) =>
        set({ userAlreadyActiveMessage: message }),
      setVerificationEmail: (email: string) =>
        set({ verificationEmail: email }),
      setVerificationToken: (token: string) =>
        set({ verificationToken: token }),
      setIsVerificationSuccess: (success: boolean) =>
        set({ isVerificationSuccess: success }),
      resetRegistrationState: () => set(initialState),
    }),
    {
      name: 'registration-storage',
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch (error) {
          console.error('localStorage not available:', error);
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      // Only persist verification email for resend functionality
      partialize: (state) => ({
        verificationEmail: state.verificationEmail,
      }),
    }
  )
);

