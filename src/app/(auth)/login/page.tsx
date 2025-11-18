'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
  Link as MuiLink,
  Divider,
  Dialog,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';
import AuthLayout from '../components/auth-layout';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useSocialLogin } from '@/features/auth/hooks/use-social-login';
import { AuthLoadingOverlay } from '../components/auth-loading-overlay';

// ---------- CONSTANTS (DRY: Single source of truth) ----------
const SOCIAL_LOGIN_PROVIDERS = [
  { iconSrc: MEDIA.auth.google, label: 'Sign in with Google' },
  { iconSrc: MEDIA.auth.facebook, label: 'Sign in with Facebook' },
  { iconSrc: MEDIA.auth.apple, label: 'Sign in with Apple' },
] as const;

// ---------- STYLED COMPONENTS (DRY: Reusable styled components) ----------
const StyledButton = styled(Button)(() => ({
  borderRadius: THEME.borderRadius.button,
  textTransform: 'none',
  fontWeight: 700,
}));

const StyledSocialButton = styled(IconButton)(() => ({
  width: 44,
  height: 44,
  border: `1px solid ${THEME.colors.border.social}`,
  '&:hover': {
    backgroundColor: THEME.colors.background.socialHover,
  },
}));

// ---------- SHARED STYLES (DRY: Centralized styling) ----------
const createFieldStyles = () => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: THEME.borderRadius.field,
    backgroundColor: THEME.colors.background.card,
    '& input': {
      fontSize: { xs: 14, sm: 15, md: 16 },
      py: { xs: 1.25, sm: 1.5 },
      px: { xs: 1.5, sm: 2 },
    },
    '& fieldset': {
      border: '1px solid #465FF166',
    },
    '&:hover fieldset': {
      border: '1px solid #465FF166',
    },
    '&.Mui-focused fieldset': {
      border: '1px solid #465FF166',
    },
  },
});

const fieldSx = createFieldStyles();

// ---------- VALIDATION SCHEMA (Zod) ----------
const loginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(
    (data) => {
      const email = data.email || '';
      const password = data.password || '';
      if (!email || !password) return true; // Skip if either is empty
      const name = email.split('@')[0] || '';
      return (
        !password.toLowerCase().includes(name.toLowerCase()) &&
        !password.toLowerCase().includes(email.toLowerCase())
      );
    },
    {
      message: 'Cannot contain your name or email address',
      path: ['password'],
    }
  );

type LoginFormData = z.infer<typeof loginSchema>;

// ---------- CUSTOM HOOKS (DRY: Reusable logic) ----------

/**
 * Custom hook for managing login form state with React Hook Form
 * DRY: Centralizes form state management logic
 */
function useLoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Use the login hook for API calls
  const {
    isSubmitting,
    login: loginUser,
    showVerificationDialog,
    verificationEmail,
    isVerifying,
    isResendingOtp,
    verifyOtp,
    resendOtpCode,
    setShowVerificationDialog,
  } = useLogin();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Changed from 'onChange' to 'onBlur' to reduce re-renders
    shouldUnregister: false, // Keep form values even when fields unmount
    shouldFocusError: true, // Focus on first error field
  });

  const onSubmit = React.useCallback(
    async (data: LoginFormData) => {
      // Don't reset form on error - preserve user input
      // React Hook Form preserves values by default unless reset() is called
      await loginUser({
        email: data.email?.trim() || '',
        password: data.password,
      });
      // Only reset form on successful login (which redirects anyway)
      // Form values are preserved on error automatically
    },
    [loginUser]
  );

  return {
    register,
    handleSubmit: handleFormSubmit(onSubmit),
    showPassword,
    setShowPassword,
    errors,
    isSubmitting,
    showVerificationDialog,
    verificationEmail,
    isVerifying,
    isResendingOtp,
    verifyOtp,
    resendOtpCode,
    setShowVerificationDialog,
  };
}

// ---------- REUSABLE COMPONENTS (DRY: Component reusability) ----------

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

/**
 * Reusable form field wrapper component
 * DRY: Eliminates duplication of label + field structure
 */
const FormField = React.memo(function FormField({ label, children, rightAction }: FormFieldProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 0.75, sm: 0.5 } }}>
        <Typography
          variant="body2"
          sx={{
            color: THEME.colors.text.black,
            fontWeight: 400,
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          {label}
        </Typography>
        {rightAction}
      </Box>
      {children}
    </Box>
  );
});

interface TextInputProps {
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  name: keyof LoginFormData;
  type?: string;
  placeholder?: string;
  error?: string;
}

/**
 * Reusable text input component
 * DRY: Eliminates duplication of TextField styling and configuration
 */
const TextInput = React.memo(function TextInput({
  register,
  name,
  type = 'text',
  placeholder = '',
  error,
}: TextInputProps) {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      type={type}
      {...register(name)}
      error={!!error}
      helperText={error}
      sx={fieldSx}
      variant="outlined"
    />
  );
});

interface PasswordFieldProps {
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  name: keyof LoginFormData;
  showPassword: boolean;
  onToggleVisibility: () => void;
  placeholder?: string;
  error?: string;
}

/**
 * Reusable password field component
 * DRY: Eliminates duplication of password field logic and styling
 */
const PasswordField = React.memo(function PasswordField({
  register,
  name,
  showPassword,
  onToggleVisibility,
  placeholder = '',
  error,
}: PasswordFieldProps) {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      type={showPassword ? 'text' : 'password'}
      {...register(name)}
      error={!!error}
      helperText={error}
      sx={fieldSx}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onToggleVisibility} edge="end" size="small" type="button">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
});

interface SocialLoginButtonProps {
  iconSrc: string;
  'aria-label': string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Reusable social login button component
 * DRY: Eliminates duplication of social button styling and structure
 */
const SocialLoginButton = React.memo(function SocialLoginButton({
  iconSrc,
  'aria-label': ariaLabel,
  onClick,
  disabled = false,
}: SocialLoginButtonProps) {
  return (
    <StyledSocialButton
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 0,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <Image
          src={iconSrc}
          alt={ariaLabel}
          fill
          style={{
            objectFit: 'cover',
          }}
        />
      </Box>
    </StyledSocialButton>
  );
});

// ---------- OTP VERIFICATION DIALOG CONTENT ----------

interface OtpVerificationDialogContentProps {
  email: string;
  isVerifying: boolean;
  isResendingOtp: boolean;
  onVerify: (email: string, token: string) => Promise<void>;
  onResend: (email: string) => Promise<void>;
}

const CODE_LENGTH = 6;

const OtpVerificationDialogContent = React.memo(function OtpVerificationDialogContent({
  email,
  isVerifying,
  isResendingOtp,
  onVerify,
  onResend,
}: OtpVerificationDialogContentProps) {
  const [codeDigits, setCodeDigits] = React.useState<string[]>(Array(CODE_LENGTH).fill(''));
  const codeInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Check if all code digits are filled
  const isCodeComplete = React.useMemo(() => {
    return codeDigits.every(digit => digit.trim() !== '') && codeDigits.length === CODE_LENGTH;
  }, [codeDigits]);

  const verificationToken = codeDigits.join('');

  // Reset code when dialog opens
  React.useEffect(() => {
    const emptyCode = Array(CODE_LENGTH).fill('');
    setCodeDigits(emptyCode);
    // Focus first input after a short delay
    setTimeout(() => {
      codeInputRefs.current[0]?.focus();
    }, 100);
  }, [email]);

  // Handle code digit input - only accept numbers
  const handleCodeChange = React.useCallback((index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;
    
    setCodeDigits((prevDigits) => {
      const newDigits = [...prevDigits];
      newDigits[index] = numericValue;
      return newDigits;
    });
    
    if (numericValue && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  }, []);

  // Handle backspace
  const handleCodeKeyDown = React.useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      setCodeDigits((prevDigits) => {
        if (!prevDigits[index] && index > 0) {
          codeInputRefs.current[index - 1]?.focus();
        }
        return prevDigits;
      });
    }
  }, []);

  // Handle paste - only accept numbers
  const handleCodePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    const newDigits = pastedData.split('').slice(0, CODE_LENGTH);
    while (newDigits.length < CODE_LENGTH) {
      newDigits.push('');
    }
    setCodeDigits(newDigits);
    const lastFilledIndex = newDigits.findIndex(d => !d) - 1;
    const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : CODE_LENGTH - 1;
    codeInputRefs.current[focusIndex]?.focus();
  }, []);

  // Handle verify
  const handleVerify = React.useCallback(async () => {
    if (verificationToken.length === CODE_LENGTH && email) {
      await onVerify(email, verificationToken);
    }
  }, [email, verificationToken, onVerify]);

  // Handle resend
  const handleResend = React.useCallback(async () => {
    if (email && !isResendingOtp) {
      await onResend(email);
      // Reset code digits
      setCodeDigits(Array(CODE_LENGTH).fill(''));
      // Focus first input
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [email, isResendingOtp, onResend]);

  return (
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
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
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
        onClick={handleVerify}
        disabled={isVerifying || !isCodeComplete}
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
  );
});

// ---------- FORM SECTION COMPONENT ----------

/**
 * Login form section component
 * DRY: Encapsulates form logic and structure
 */
const LoginFormSection = React.memo(function LoginFormSection() {
  const {
    register,
    handleSubmit,
    showPassword,
    setShowPassword,
    errors,
    isSubmitting,
    showVerificationDialog,
    verificationEmail,
    isVerifying,
    isResendingOtp,
    verifyOtp,
    resendOtpCode,
    setShowVerificationDialog,
  } = useLoginForm();

  // Social login hook
  const { signInWithGoogle, isLoading: isSocialLoginLoading } = useSocialLogin({
    // No onSuccess callback - let the hook handle redirect automatically
    onError: (error) => {
      // Error handling is done in the hook with toast
      console.error('Social login error:', error);
    },
  });

  // Memoize setShowPassword callback to prevent unnecessary re-renders
  const handleTogglePassword = React.useCallback(() => {
    setShowPassword((prev) => !prev);
  }, [setShowPassword]);

  return (
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
      {/* Form */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        noValidate // Prevent browser form validation that might cause resets
      >
        <Box sx={{ width: { xs: '100%', sm: '85%', md: '70%' }, mx: 'auto' }}>
          {/* Title and Description */}
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
            Sign In
          </Typography>
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
            Welcome back! Enter your credentials to access trusted handyman services and get the job done with ease.
          </Typography>

          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            {/* Email Field */}
            <FormField label="Email Id">
              <TextInput
                register={register}
                name="email"
                type="email"
                error={errors.email?.message}
              />
            </FormField>

            {/* Password Field */}
            <FormField label="Password">
              <PasswordField
                register={register}
                name="password"
                showPassword={showPassword}
                onToggleVisibility={handleTogglePassword}
                error={errors.password?.message}
              />
              {/* Forgot Password Link - Below password input */}
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <MuiLink
                  component={Link}
                  href="/forgot-password"
                  underline="hover"
                  sx={{
                    color: THEME.colors.text.lightGrey,
                    fontSize: { xs: 12, sm: 13 },
                    fontWeight: 400,
                  }}
                >
                  Forgot Password?
                </MuiLink>
              </Box>
            </FormField>
          </Stack>
        </Box>

        {/* Submit Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 3, sm: 3.5 },
          }}
        >
          <StyledButton
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting}
            sx={{
              width: { xs: '100%', sm: '50%', md: '50%' },
              height: { xs: 48, sm: 44 },
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </StyledButton>
        </Box>

        {/* Sign Up Link */}
        <Typography
          align="center"
          sx={{
            mt: { xs: 2.5, sm: 3 },
            color: THEME.colors.text.black,
            fontSize: { xs: 13, sm: 14, md: 16 },
          }}
        >
          Don&apos;t have an account?{' '}
          <MuiLink
            component={Link}
            href="/signup"
            underline="hover"
            sx={{ color: THEME.colors.primary, fontWeight: 700 }}
          >
            Sign Up
          </MuiLink>
        </Typography>

        {/* Social Login Divider */}
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

        {/* Social Login Buttons */}
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent="center"
          flexWrap="wrap"
          gap={{ xs: 1.5, sm: 2 }}
        >
          {SOCIAL_LOGIN_PROVIDERS.map((provider) => {
            const isGoogle = provider.iconSrc === MEDIA.auth.google;
            return (
              <SocialLoginButton
                key={provider.label}
                iconSrc={provider.iconSrc}
                aria-label={provider.label}
                onClick={isGoogle ? signInWithGoogle : undefined}
                disabled={isGoogle && (isSocialLoginLoading || isSubmitting)}
              />
            );
          })}
        </Stack>
      </Box>

      {/* OTP Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => !isVerifying && setShowVerificationDialog(false)}
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
          onClick={() => !isVerifying && setShowVerificationDialog(false)}
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
          onClick={() => !isVerifying && setShowVerificationDialog(false)}
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

        <OtpVerificationDialogContent
          email={verificationEmail}
          isVerifying={isVerifying}
          isResendingOtp={isResendingOtp}
          onVerify={verifyOtp}
          onResend={resendOtpCode}
        />
      </Dialog>
    </Box>
  );
});

// ---------- MAIN COMPONENT ----------

export default function Login() {
  const { isSubmitting } = useLogin();
  
  return (
    <div>
      <AuthLoadingOverlay isLoading={isSubmitting} message="Signing you in..." />
      <AuthLayout
        imageHeight={{
          xs: 300,
          sm: 420,
          md: 500,
          lg: 600,
          breakpoint1024: 550,
        }}
      >
        <LoginFormSection />
      </AuthLayout>
    </div>
  );
}
