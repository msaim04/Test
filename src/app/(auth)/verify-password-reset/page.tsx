'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { THEME } from '@/shared/constants/theme';
import AuthLayout from '../components/auth-layout';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';

// ---------- STYLED COMPONENTS (DRY: Reusable styled components) ----------
const StyledButton = styled(Button)(() => ({
  borderRadius: THEME.borderRadius.button,
  textTransform: 'none',
  fontWeight: 700,
}));

// ---------- MAIN COMPONENT ----------
export default function VerifyPasswordReset() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string>('');

  const {
    isVerifying,
    isResendingOtp,
    verifyResetCode,
    resendResetCode,
  } = useForgotPassword();

  // Get email from sessionStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('password_reset_email');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // No email found, redirect to forgot password with smooth navigation
        router.replace('/forgot-password');
      }
    }
  }, [router]);

  // Prevent back navigation - block browser back button
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push current state to history to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // When user tries to go back, push current state again
      window.history.pushState(null, '', window.location.href);
      // Redirect to forgot password if they try to go back
      router.replace('/forgot-password');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // State for 6-digit code
  const [codeDigits, setCodeDigits] = React.useState<string[]>(['', '', '', '', '', '']);
  const codeInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Update verification token when code digits change
  const verificationToken = codeDigits.join('');

  // Focus first input when component mounts
  React.useEffect(() => {
    if (codeInputRefs.current[0]) {
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, []);


  // Handle verify - accepts optional token to avoid closure issues
  const handleVerify = React.useCallback(async (token?: string) => {
    const code = token || codeDigits.join('');
    if (code.length !== 6) {
      return;
    }
    await verifyResetCode(email, code);
  }, [email, codeDigits, verifyResetCode]);

  // Handle code digit input
  const handleCodeChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Only allow single digit
    if (numericValue.length > 1) return;
    
    const newDigits = [...codeDigits];
    newDigits[index] = numericValue;
    setCodeDigits(newDigits);
    
    // Auto-focus next input
    if (numericValue && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace and prevent non-numeric input
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      // Handle backspace navigation
      if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
        codeInputRefs.current[index - 1]?.focus();
      }
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z (for copy/paste/undo)
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    
    // Block non-numeric keys
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle paste
  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Extract only numeric characters from pasted data
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newDigits = pastedData.split('').slice(0, 6);
    while (newDigits.length < 6) {
      newDigits.push('');
    }
    setCodeDigits(newDigits);
    
    // Focus last filled input or first empty
    const lastFilledIndex = newDigits.findIndex(d => !d) - 1;
    const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : 5;
    codeInputRefs.current[focusIndex]?.focus();
  };

  // Handle resend
  const handleResend = React.useCallback(async () => {
    if (!isResendingOtp && email) {
      await resendResetCode(email);
      // Reset code digits
      setCodeDigits(['', '', '', '', '', '']);
      // Focus first input
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [email, isResendingOtp, resendResetCode]);

  if (!email) {
    return null;
  }

  return (
    <div>
      <AuthLayout
        imageHeight={{
          xs: 300,
          sm: 420,
          md: 500,
          lg: 600,
          breakpoint1024: 550,
        }}
      >
      <Box
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: 760 },
          width: '100%',
          py: { xs: 2, sm: 3, md: 4, lg: 5 },
          '@media (min-width: 1024px)': {
            maxWidth: '720px',
          },
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '85%', md: '70%' }, mx: 'auto' }}>
          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: THEME.colors.primary,
              fontSize: { xs: 24, sm: 28, md: 32, lg: 36 },
              mb: { xs: 1, sm: 1.5 },
              textAlign: 'center',
            }}
          >
            OTP Verification
          </Typography>

          {/* Instructional Text */}
          <Typography
            variant="body2"
            sx={{
              color: THEME.colors.text.black,
              mb: { xs: 2.5, sm: 3, md: 3.5 },
              fontSize: { xs: 13, sm: 14, md: 16 },
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: { xs: '100%', sm: '90%', md: 600 },
              mx: 'auto',
              px: { xs: 1, sm: 0 },
            }}
          >
            We just sent a reset link to{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {email}
            </Box>
            . Enter the 6-digit code from your email and you&apos;re good to go!
          </Typography>

          {/* 6-Digit Code Input Fields */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mb: { xs: 2.5, sm: 3 },
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextField
                key={index}
                inputRef={(el) => {
                  codeInputRefs.current[index] = el;
                }}
                value={codeDigits[index]}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                onPaste={handleCodePaste}
                disabled={isVerifying}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: {
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 600,
                    padding: '12px',
                  },
                }}
                sx={{
                  width: 56,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    border: `2px solid ${THEME.colors.primary}`,
                    '& fieldset': {
                      border: `2px solid ${THEME.colors.primary}`,
                    },
                    '&:hover fieldset': {
                      border: `2px solid ${THEME.colors.primary}`,
                    },
                    '&.Mui-focused fieldset': {
                      border: `2px solid ${THEME.colors.primary}`,
                    },
                  },
                }}
                variant="outlined"
              />
            ))}
          </Box>

          {/* Confirm Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 2.5, sm: 3 },
            }}
          >
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => handleVerify()}
              disabled={isVerifying || verificationToken.length !== 6}
              sx={{
                width: { xs: '100%', sm: '50%', md: '50%' },
                height: { xs: 48, sm: 44 },
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              {isVerifying ? 'Confirming...' : 'Confirm'}
            </StyledButton>
          </Box>

          {/* Resend Email Link */}
          <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3 } }}>
            <Typography
              variant="body2"
              sx={{
                color: THEME.colors.text.black,
                fontSize: { xs: 13, sm: 14, md: 16 },
              }}
            >
              Didn&apos;t get it?{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleResend();
                }}
                sx={{
                  color: THEME.colors.primary,
                  fontWeight: 700,
                  textDecoration: 'underline',
                  cursor: isResendingOtp ? 'not-allowed' : 'pointer',
                  opacity: isResendingOtp ? 0.6 : 1,
                  pointerEvents: isResendingOtp ? 'none' : 'auto',
                }}
              >
                {isResendingOtp ? 'Sending...' : 'Resend email'}
              </Link>
            </Typography>
          </Box>

          {/* OR Divider */}
          <Divider sx={{ my: { xs: 2.5, sm: 3, md: 3.5 } }}>
            <Typography
              variant="body2"
              sx={{
                color: THEME.colors.text.lightGrey,
                px: 2,
                fontSize: { xs: 12, sm: 13, md: 14 },
              }}
            >
              OR
            </Typography>
          </Divider>
        </Box>
      </Box>
    </AuthLayout>
    </div>
  );
}

