'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import { THEME } from '@/shared/constants/theme';
import { MEDIA } from '@/shared/constants/media';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';

// ---------- STYLED COMPONENTS (DRY: Reusable styled components) ----------
const StyledButton = styled(Button)(() => ({
  borderRadius: THEME.borderRadius.button,
  textTransform: 'none',
  fontWeight: 700,
}));

// ---------- OTP VERIFICATION DIALOG COMPONENT ----------
interface OtpVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export default function OtpVerificationDialog({
  open,
  onClose,
  email,
}: OtpVerificationDialogProps) {
  const {
    isVerifying,
    isResendingOtp,
    verifyResetCode,
    resendResetCode,
  } = useForgotPassword();

  // State for 6-digit code
  const [codeDigits, setCodeDigits] = React.useState<string[]>(['', '', '', '', '', '']);
  const codeInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Update verification token when code digits change
  const verificationToken = codeDigits.join('');

  // Focus first input when dialog opens
  React.useEffect(() => {
    if (open && codeInputRefs.current[0]) {
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  // Reset code when dialog closes
  React.useEffect(() => {
    if (!open) {
      setCodeDigits(['', '', '', '', '', '']);
    }
  }, [open]);

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

  // Handle verify - accepts optional token to avoid closure issues
  const handleVerify = React.useCallback(async (token?: string) => {
    const code = token || verificationToken;
    if (code.length !== 6) {
      return;
    }
    await verifyResetCode(email, code);
    // Dialog will be closed automatically when redirecting to new-password page
    // The redirect happens in the hook after successful verification
  }, [email, verificationToken, verifyResetCode]);

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

  return (
    <Dialog
      open={open}
      onClose={() => !isVerifying && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          position: 'relative',
        },
      }}
    >
      {/* Close Button - Top Right */}
      <IconButton
        onClick={() => !isVerifying && onClose()}
        disabled={isVerifying}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          color: '#000',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Back Button - Top Left */}
      <IconButton
        onClick={() => !isVerifying && onClose()}
        disabled={isVerifying}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
          backgroundColor: '#E3F2FD',
          color: THEME.colors.primary,
          '&:hover': {
            backgroundColor: '#BBDEFB',
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ px: 4, pt: 6, pb: 3 }}>
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: THEME.colors.primary,
            textAlign: 'center',
            mb: 4,
          }}
        >
          Verify your email
        </Typography>

        {/* Email Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image
            src={MEDIA.logos.email}
            alt="Verify email"
            width={80}
            height={80}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Instructional Text */}
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: THEME.colors.text.black,
            mt: 7,
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          We just sent a Verification Code to{' '}
          <Box component="span" sx={{ fontWeight: 700, textDecoration: 'underline' }}>
            {email}
          </Box>
          . Enter the 6-digit code from your email and you&apos;re good to go!
        </Typography>

        {/* Code Input Fields */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mb: 8,
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
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
                height: 64,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  borderRadius: 1,
                  '& input': {
                    height: '100%',
                    padding: 0,
                  },
                  '& fieldset': {
                    border: `1px solid theme.colors.darkblue`,
                  },
                  '&:hover fieldset': {
                    border: `1px solid theme.colors.darkblue`,
                  },
                  '&.Mui-focused fieldset': {
                    border: `1px solid theme.colors.darkblue`,
                  },
                },
              }}
              variant="outlined"
            />
          ))}
        </Box>

        {/* Verify Button */}
        <StyledButton
          variant="contained"
          color="primary"
          onClick={() => handleVerify()}
          disabled={isVerifying || verificationToken.length !== 6}
          fullWidth
          sx={{
            mb: 2,
            py: 1.5,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </StyledButton>

        {/* Resend Email Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: THEME.colors.text.black }}>
            Didn&apos;t get it?{' '}
            <MuiLink
              component="button"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!isResendingOtp) {
                  handleResend();
                }
              }}
              sx={{
                color: THEME.colors.primary,
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: isResendingOtp ? 'not-allowed' : 'pointer',
                opacity: isResendingOtp ? 0.6 : 1,
                pointerEvents: isResendingOtp ? 'none' : 'auto',
                border: 'none',
                background: 'none',
                padding: 0,
                font: 'inherit',
              }}
            >
              {isResendingOtp ? 'Sending...' : 'Resend email'}
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}

