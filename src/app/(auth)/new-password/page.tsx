'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { THEME } from '@/shared/constants/theme';
import AuthLayout from '../components/auth-layout';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import {
  PASSWORD_REQUIREMENTS,
  checkPasswordRequirements,
  getPasswordStrength,
} from '@/features/auth/utils/password-strength.utils';

// ---------- CONSTANTS (DRY: Single source of truth) ----------
// Password requirements are imported from shared utility

// ---------- STYLED COMPONENTS (DRY: Reusable styled components) ----------
const StyledButton = styled(Button)(() => ({
  borderRadius: THEME.borderRadius.button,
  textTransform: 'none',
  fontWeight: 700,
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
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&]).{8,}$/, 'Password must contain an uppercase letter, a number, and a special character (! @ # $ % &)'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ---------- CUSTOM HOOKS (DRY: Reusable logic) ----------
function useResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string>('');

  const { resetPassword, isSubmitting } = useResetPassword();

  // Get email from sessionStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('password_reset_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Use useWatch instead of watch() for React Compiler compatibility
  const password = useWatch({ control, name: 'password' }) || '';

  // Use shared password strength utilities
  const passwordChecks = React.useMemo(() => checkPasswordRequirements(password), [password]);
  const passwordStrength = React.useMemo(() => getPasswordStrength(password), [password]);
  const isPasswordStrong = passwordStrength === 'Strong';

  // Redirect if no email or no reset token in sessionStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('password_reset_email');
      const resetToken = sessionStorage.getItem('password_reset_token');
      
      if (!storedEmail || !resetToken) {
        // Missing email or token, redirect to forgot password with smooth navigation
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

  const onSubmit = React.useCallback(
    async (data: ResetPasswordFormData) => {
      await resetPassword({
        email: email.trim(),
        token: '', // Token will be retrieved from sessionStorage in the hook
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    },
    [email, resetPassword]
  );

  return {
    register,
    handleSubmit: handleFormSubmit(onSubmit),
    showPassword,
    showConfirmPassword,
    setShowPassword: React.useCallback(() => setShowPassword((prev) => !prev), []),
    setShowConfirmPassword: React.useCallback(() => setShowConfirmPassword((prev) => !prev), []),
    errors,
    isSubmitting,
    password,
    passwordChecks,
    isPasswordFocused,
    setIsPasswordFocused,
    passwordStrength,
    isPasswordStrong,
  };
}

// ---------- REUSABLE COMPONENTS (DRY: Component reusability) ----------
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

const FormField = React.memo(function FormField({ label, children }: FormFieldProps) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          color: THEME.colors.text.black,
          fontWeight: 400,
          fontSize: { xs: 13, sm: 14 },
          mb: { xs: 0.75, sm: 0.5 },
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
});

interface PasswordFieldProps {
  register: ReturnType<typeof useForm<ResetPasswordFormData>>['register'];
  name: keyof ResetPasswordFormData;
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PasswordField = React.memo(function PasswordField({
  register,
  name,
  showPassword,
  onToggleVisibility,
  error,
  onFocus,
  onBlur,
}: PasswordFieldProps) {
  return (
    <TextField
      fullWidth
      type={showPassword ? 'text' : 'password'}
      {...register(name)}
      error={!!error}
      helperText={error}
      sx={fieldSx}
      variant="outlined"
      onFocus={onFocus}
      onBlur={onBlur}
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

// ---------- FORM SECTION COMPONENT ----------
const ResetPasswordFormSection = React.memo(function ResetPasswordFormSection() {
  const {
    register,
    handleSubmit,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    errors,
    isSubmitting,
    password,
    passwordChecks,
    setIsPasswordFocused,
    passwordStrength,
    isPasswordStrong,
  } = useResetPasswordForm();

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
      <Box component="form" onSubmit={handleSubmit} noValidate>
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
            Set a new Password
          </Typography>

          {/* Description */}
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
            Create a strong password that&apos;s different from your previous password to keep your account secure.
          </Typography>

          {/* New Password Field */}
          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <FormField label="New Password">
              <PasswordField
                register={register}
                name="password"
                showPassword={showPassword}
                onToggleVisibility={setShowPassword}
                error={errors.password?.message}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
            </FormField>
          </Box>

          {/* Confirm Password Field */}
          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <FormField label="Confirm Password">
              <PasswordField
                register={register}
                name="confirmPassword"
                showPassword={showConfirmPassword}
                onToggleVisibility={setShowConfirmPassword}
                error={errors.confirmPassword?.message}
              />
            </FormField>
          </Box>

          {/* Password Requirements - Always visible */}
          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <Typography
              variant="body2"
              sx={{
                color: THEME.colors.text.black,
                mb: 1.5,
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 600,
              }}
            >
              Password Strength : {password ? passwordStrength : 'Weak'}
            </Typography>
            <Stack spacing={1}>
              {PASSWORD_REQUIREMENTS.map((req) => {
                const isMet = passwordChecks[req.id as keyof typeof passwordChecks];
                return (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isMet ? (
                      <CheckCircleIcon
                        sx={{
                          fontSize: 18,
                          color: '#4CAF50',
                        }}
                      />
                    ) : (
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: 18,
                          color: '#9B7EDE',
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: THEME.colors.text.black,
                        fontSize: { xs: 12, sm: 13 },
                      }}
                    >
                      {req.text}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
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
              type="submit"
              disabled={isSubmitting || !isPasswordStrong}
              sx={{
                width: { xs: '100%', sm: '50%', md: '50%' },
                height: { xs: 48, sm: 44 },
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              {isSubmitting ? 'Resetting...' : 'Confirm'}
            </StyledButton>
          </Box>

          {/* Sign In Link */}
          <Typography
            align="center"
            sx={{
              color: THEME.colors.text.black,
              fontSize: { xs: 13, sm: 14, md: 16 },
            }}
          >
            <Link
              href="/login"
              underline="hover"
              sx={{ color: THEME.colors.primary, fontWeight: 700 }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

// ---------- MAIN COMPONENT ----------
export default function NewPassword() {
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
        <ResetPasswordFormSection />
      </AuthLayout>
    </div>
  );
}

