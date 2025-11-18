'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { THEME } from '@/shared/constants/theme';
import AuthLayout from '../components/auth-layout';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import OtpVerificationDialog from '../components/otp-verification-dialog';

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
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ---------- CUSTOM HOOKS (DRY: Reusable logic) ----------
function useForgotPasswordForm(
  onCodeSent: (email: string) => void
) {
  const {
    sendResetCode,
    isSubmitting,
  } = useForgotPassword();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = React.useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        await sendResetCode(data.email);
        // Only open dialog if code was sent successfully (no error thrown)
        // Check if email was stored in sessionStorage as confirmation
        if (typeof window !== 'undefined') {
          const storedEmail = sessionStorage.getItem('password_reset_email');
          if (storedEmail === data.email.trim()) {
            onCodeSent(data.email);
          }
        }
      } catch {
        // Error handling is done in the hook, just don't open dialog
      }
    },
    [sendResetCode, onCodeSent]
  );

  return {
    register,
    handleSubmit: handleFormSubmit(onSubmit),
    errors,
    isSubmitting,
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

interface TextInputProps {
  register: ReturnType<typeof useForm<ForgotPasswordFormData>>['register'];
  name: keyof ForgotPasswordFormData;
  type?: string;
  placeholder?: string;
  error?: string;
}

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

// ---------- FORM SECTION COMPONENT ----------
const ForgotPasswordFormSection = React.memo(function ForgotPasswordFormSection() {
  const [showOtpDialog, setShowOtpDialog] = React.useState(false);
  const [email, setEmail] = React.useState<string>('');

  // Callback to open dialog when code is sent
  const handleCodeSent = React.useCallback((email: string) => {
    setEmail(email);
    setShowOtpDialog(true);
  }, []);

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
  } = useForgotPasswordForm(handleCodeSent);

  // Close dialog when component unmounts (user navigates away)
  React.useEffect(() => {
    return () => {
      setShowOtpDialog(false);
    };
  }, []);

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
      <Box component="form" onSubmit={handleSubmit} noValidate>
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
            Forgot Password?
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
            Oops, forgot your password? Don&apos;t worry enter your email and we&apos;ll help you reset it.
          </Typography>

          <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
            {/* Email Field */}
            <FormField label="Email Id">
              <TextInput
                register={register}
                name="email"
                type="email"
                error={errors.email?.message}
              />
            </FormField>
          </Box>

          {/* Send Code Button */}
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
              disabled={isSubmitting}
              sx={{
                width: { xs: '100%', sm: '50%', md: '50%' },
                height: { xs: 48, sm: 44 },
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Code'}
            </StyledButton>
          </Box>

          {/* Return to Sign in Link */}
          <Typography
            align="center"
            sx={{
              color: THEME.colors.text.black,
              fontSize: { xs: 13, sm: 14, md: 16 },
            }}
          >
            <MuiLink
              component={Link}
              href="/login"
              underline="hover"
              sx={{ color: THEME.colors.primary, fontWeight: 700 }}
            >
              Return to Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Box>
      
      {/* OTP Verification Dialog */}
      {email && (
        <OtpVerificationDialog
          open={showOtpDialog}
          onClose={() => setShowOtpDialog(false)}
          email={email}
        />
      )}
    </Box>
  );
});

// ---------- MAIN COMPONENT ----------
export default function ForgotPassword() {
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
        <ForgotPasswordFormSection />
      </AuthLayout>
    </div>
  );
}

