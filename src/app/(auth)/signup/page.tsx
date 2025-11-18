'use client';

import * as React from 'react';
import {
  styled,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Link as MuiLink,
  Dialog,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Image from 'next/image';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { THEME } from '@/shared/constants/theme';
import { MEDIA } from '@/shared/constants/media';
import AuthLayout from '../components/auth-layout';
import { useRegister } from '@/features/auth/hooks/use-register';
import { useRegistrationStore } from '@/features/auth/stores/registration.store';
import { useSocialLogin } from '@/features/auth/hooks/use-social-login';
import {
  PASSWORD_REQUIREMENTS,
  PASSWORD_REGEX,
  checkPasswordRequirements,
  getPasswordStrength,
  getStrengthColor,
} from '@/features/auth/utils/password-strength.utils';

// ---------- CONSTANTS (DRY: Single source of truth) ----------
const ROLE_OPTIONS = [
  { value: 'Customer', label: 'Customer' },
  { value: 'Tasker', label: 'Tasker' },
] as const;

const SOCIAL_LOGIN_PROVIDERS = [
  { iconSrc: MEDIA.auth.google, label: 'Sign up with Google' },
  { iconSrc: MEDIA.auth.facebook, label: 'Sign up with Facebook' },
  { iconSrc: MEDIA.auth.apple, label: 'Sign up with Apple' },
] as const;

const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;

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
    '& .MuiSelect-select': {
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
const selectFieldSx = createFieldStyles();

// ---------- UTILITY FUNCTIONS ----------
/**
 * Check if password contains name or email
 */
const checkPasswordContainsNameOrEmail = (password: string, name: string, email: string): boolean => {
  if (!password || (!name && !email)) return false;
  
  const nameLower = name.toLowerCase().trim();
  const emailLower = email.toLowerCase().trim();
  const passwordLower = password.toLowerCase();
  const emailName = emailLower ? emailLower.split('@')[0] : '';
  
  return (
    (nameLower.length > 0 && passwordLower.includes(nameLower)) ||
    (emailName.length > 0 && passwordLower.includes(emailName)) ||
    (emailLower.length > 0 && passwordLower.includes(emailLower))
  );
};


// ---------- VALIDATION SCHEMA (Zod) ----------
const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    role: z.string().min(1, 'Please select a role'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters')
      .regex(PASSWORD_REGEX, 'Password must contain an uppercase letter, a number, and a special character (! @ # $ % &)'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agree: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(
    (data) => {
      const { email, password } = data;
      if (!email || !password) return true;
      return !checkPasswordContainsNameOrEmail(password, '', email);
    },
    {
      message: 'Cannot contain your name or email address',
      path: ['password'],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please make sure both passwords are the same.',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

// ---------- CUSTOM HOOKS (DRY: Reusable logic) ----------

/**
 * Custom hook for managing form state with React Hook Form
 * DRY: Centralizes form state management logic
 */
function useSignUpForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // Use the register hook for API calls
  const {
    isSubmitting,
    isVerifying,
    isResendingOtp,
    showVerificationDialog,
    showEmailExistsDialog,
    showUserAlreadyActiveDialog,
    emailExistsMessage,
    userAlreadyActiveMessage,
    verificationEmail,
    verificationToken,
    isVerificationSuccess,
    register: registerUser,
    verify: verifyToken,
    resendOtpCode,
    setShowVerificationDialog,
    setShowEmailExistsDialog,
    setShowUserAlreadyActiveDialog,
    setVerificationToken,
    handleLoginRedirect,
  } = useRegister();

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    formState: { errors, isValid },
    trigger,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const watchedValues = useWatch({
    control,
    name: ['name', 'email', 'phone', 'address', 'role', 'password', 'confirmPassword', 'agree'],
  });

  const [
    name,
    email,
    phone,
    address,
    role,
    passwordValue,
    confirmPasswordValue,
    agree,
  ] = watchedValues as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    boolean
  ];

  const password = passwordValue || '';
  const confirmPassword = confirmPasswordValue || '';

  const onSubmit = React.useCallback(
    async (data: SignUpFormData) => {
      // Split name into first_name and last_name if provided
      const nameParts = data.name?.trim().split(/\s+/) || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await registerUser({
        email: data.email?.trim() || '',
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
        password: data.password,
        first_name: firstName,
        last_name: lastName,
      });
    },
    [registerUser]
  );

  const passwordStrength = React.useMemo(
    () => getPasswordStrength(password),
    [password]
  );
  
  // Trigger validation when all fields are filled to ensure isValid is up to date
  React.useEffect(() => {
    const allFieldsFilled = 
      Boolean(name?.trim()) && 
      Boolean(email?.trim()) && 
      Boolean(phone?.trim()) && 
      Boolean(address?.trim()) && 
      Boolean(role) && 
      Boolean(password) && 
      Boolean(confirmPassword) &&
      Boolean(agree);
    
    const passwordsMatch = password === confirmPassword;
    
    // If all fields are filled and passwords match, trigger validation
    // This ensures React Hook Form validates all fields and updates isValid
    if (allFieldsFilled && passwordsMatch) {
      trigger().catch(() => {
        // Silently handle trigger errors
      });
    }
  }, [name, email, phone, address, role, password, confirmPassword, agree, trigger]);
  
  // Check if form is valid
  // Use React Hook Form's isValid as the primary source of truth
  // Also check manual validations for immediate feedback
  const isFormValid = React.useMemo(() => {
    // Check if all required fields are filled (for immediate UI feedback)
    const allFieldsFilled = 
      Boolean(name?.trim()) && 
      Boolean(email?.trim()) && 
      Boolean(phone?.trim()) && 
      Boolean(address?.trim()) && 
      Boolean(role) && 
      Boolean(password) && 
      Boolean(confirmPassword) &&
      Boolean(agree);
    
    // Check if passwords match (for immediate UI feedback)
    const passwordsMatch = password === confirmPassword;
    
    // Check if there are any validation errors
    const hasErrors = Object.keys(errors).length > 0;
    
    // Use React Hook Form's isValid as the primary validation
    // In onChange mode, isValid updates after validation runs
    // Fallback: If all fields are filled, passwords match, and no errors,
    // consider form valid even if isValid hasn't updated yet
    const formIsValid = (isValid || (!hasErrors && allFieldsFilled && passwordsMatch)) && allFieldsFilled && passwordsMatch;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      if (!formIsValid && allFieldsFilled && passwordsMatch) {
        console.log('Form validation debug:', {
          isValid,
          allFieldsFilled,
          passwordsMatch,
          hasErrors,
          errors: Object.keys(errors),
          errorDetails: errors,
        });
      }
    }
    
    return formIsValid;
  }, [name, email, phone, address, role, password, confirmPassword, agree, errors, isValid]);

  const handleVerify = React.useCallback(async (token?: string) => {
    const code = token || verificationToken;
    await verifyToken({
      email: verificationEmail,
      token: code,
    });
  }, [verificationEmail, verificationToken, verifyToken]);

  const handleResendOtp = React.useCallback(async () => {
    if (verificationEmail) {
      await resendOtpCode(verificationEmail);
    }
  }, [verificationEmail, resendOtpCode]);

  return {
    register,
    control,
    handleSubmit: handleFormSubmit(onSubmit),
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    errors,
    isSubmitting,
    password,
    passwordStrength,
    isFormValid,
    showVerificationDialog,
    setShowVerificationDialog,
    showEmailExistsDialog,
    setShowEmailExistsDialog,
    showUserAlreadyActiveDialog,
    setShowUserAlreadyActiveDialog,
    emailExistsMessage,
    userAlreadyActiveMessage,
    verificationEmail,
    setVerificationToken,
    isVerifying,
    isResendingOtp,
    isVerificationSuccess,
    handleVerify,
    handleResendOtp,
    handleLoginRedirect,
  };
}

// ---------- REUSABLE COMPONENTS (DRY: Component reusability) ----------

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Reusable form field wrapper component
 * DRY: Eliminates duplication of label + field structure
 */
const FormField = React.memo(function FormField({ label, children, fullWidth = false }: FormFieldProps) {
  return (
    <Box
      sx={{
        gridColumn: fullWidth ? { xs: '1', md: 'span 2' } : 'auto',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: THEME.colors.text.black,
          mb: { xs: 0.75, sm: 0.5 },
          fontWeight: 400,
          fontSize: { xs: 13, sm: 14 },
        }}
      >
        {label}
          </Typography>
      {children}
    </Box>
  );
});

interface TextInputProps {
  register: ReturnType<typeof useForm<SignUpFormData>>['register'];
  name: keyof SignUpFormData;
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
  register: ReturnType<typeof useForm<SignUpFormData>>['register'];
  name: keyof SignUpFormData;
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
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

interface SelectFieldProps {
  control: ReturnType<typeof useForm<SignUpFormData>>['control'];
  name: keyof SignUpFormData;
  options: readonly { value: string; label: string }[];
  error?: string;
}

/**
 * Reusable select field component
 * DRY: Eliminates duplication of select field logic and styling
 */
const SelectField = React.memo(function SelectField({ control, name, options, error }: SelectFieldProps) {
  return (
    <Controller
      name={name as keyof SignUpFormData}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth sx={selectFieldSx} error={!!error}>
          <Select
            {...field}
            displayEmpty
            renderValue={(val) =>
              val ? (
                val as string
              ) : (
                <span style={{ opacity: 0.5 }}></span>
              )
            }
            variant="outlined"
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
              {error}
            </Typography>
          )}
        </FormControl>
      )}
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

// ---------- FORM SECTION COMPONENT ----------

/**
 * Form section component
 * DRY: Encapsulates form logic and structure
 */
const FormSection = React.memo(function FormSection() {
  const {
    register,
    control,
    handleSubmit,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    errors,
    isSubmitting,
    password,
    passwordStrength,
    isFormValid,
    showVerificationDialog,
    setShowVerificationDialog,
    showEmailExistsDialog,
    setShowEmailExistsDialog,
    showUserAlreadyActiveDialog,
    setShowUserAlreadyActiveDialog,
    emailExistsMessage,
    userAlreadyActiveMessage,
    verificationEmail,
    setVerificationToken,
    isVerifying,
    isResendingOtp,
    isVerificationSuccess,
    handleVerify,
    handleResendOtp,
    handleLoginRedirect,
  } = useSignUpForm();

  // Get reset function from store
  const { resetRegistrationState } = useRegistrationStore();

  // Social login hook
  const { signInWithGoogle, isLoading: isSocialLoginLoading } = useSocialLogin({
    // No onSuccess callback - let the hook handle redirect automatically
    onError: (error) => {
      // Error handling is done in the hook with toast
      console.error('Social login error:', error);
    },
  });

  // Close dialogs and reset state when component unmounts (user navigates away)
  React.useEffect(() => {
    return () => {
      setShowVerificationDialog(false);
      setShowEmailExistsDialog(false);
      setShowUserAlreadyActiveDialog(false);
      // Reset registration state on unmount to prevent stale state
      resetRegistrationState();
    };
  }, [setShowVerificationDialog, setShowEmailExistsDialog, setShowUserAlreadyActiveDialog, resetRegistrationState]);

  const passwordChecks = React.useMemo(
    () => checkPasswordRequirements(password),
    [password]
  );

  // Toggle visibility callbacks
  const togglePasswordVisibility = React.useCallback(() => {
    setShowPassword((prev) => !prev);
  }, [setShowPassword]);

  const toggleConfirmPasswordVisibility = React.useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, [setShowConfirmPassword]);

  // Code input state
  const [codeDigits, setCodeDigits] = React.useState<string[]>(Array(CODE_LENGTH).fill(''));
  const codeInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  // Check if all code digits are filled
  const isCodeComplete = React.useMemo(() => {
    return codeDigits.every(digit => digit.trim() !== '') && codeDigits.length === CODE_LENGTH;
  }, [codeDigits]);

  // Reset code when dialog opens
  React.useEffect(() => {
    if (showVerificationDialog && !isVerificationSuccess) {
      const emptyCode = Array(CODE_LENGTH).fill('');
      setCodeDigits(emptyCode);
      setVerificationToken('');
      // Focus first input after a short delay
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showVerificationDialog, isVerificationSuccess, setVerificationToken]);

  // Handle code digit input - only accept numbers
  const handleCodeChange = React.useCallback((index: number, value: string) => {
    // Only allow numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;
    
    setCodeDigits((prevDigits) => {
      const newDigits = [...prevDigits];
      newDigits[index] = numericValue;
      const code = newDigits.join('');
      setVerificationToken(code);
      return newDigits;
    });
    
    if (numericValue && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  }, [setVerificationToken]);

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
    const code = newDigits.join('');
    setCodeDigits(newDigits);
    setVerificationToken(code);
    const lastFilledIndex = newDigits.findIndex(d => !d) - 1;
    const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : CODE_LENGTH - 1;
    codeInputRefs.current[focusIndex]?.focus();
  }, [setVerificationToken]);

  return (
    <Box
            sx={{
        maxWidth: { xs: '100%', sm: '100%', md: 760 },
        width: '100%',
      }}
    >
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
                      Sign Up
                    </Typography>
                    <Typography
                      variant="body2"
        sx={{
          color: THEME.colors.text.black,
          mb: { xs: 2.5, sm: 3, md: 3.5 },
          fontSize: { xs: 13, sm: 14, md: 16 },
          maxWidth: { xs: '100%', sm: '90%', md: 480 },
          textAlign: 'center',
          mx: 'auto',
          px: { xs: 1, sm: 0 },
        }}
      >
        Join us today! Create an account to book trusted handymen and get your tasks done
        hassle-free.
                    </Typography>

      {/* Form - Using Grid for 2-column layout */}
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: { xs: 3, sm: 3.5, md: 4 },
          }}
        >
          <FormField label="Name">
            <TextInput register={register} name="name" error={errors.name?.message} />
          </FormField>

          <FormField label="E-mail">
            <TextInput register={register} name="email" type="email" error={errors.email?.message} />
          </FormField>

          <FormField label="Phone Number">
            <TextInput register={register} name="phone" type="tel" error={errors.phone?.message} />
          </FormField>

          <FormField label="Address">
            <TextInput register={register} name="address" error={errors.address?.message} />
          </FormField>

          <FormField label="Select Role" fullWidth>
            <SelectField control={control} name="role" options={ROLE_OPTIONS} error={errors.role?.message} />
          </FormField>

          <FormField label="Password">
            <PasswordField
              register={register}
              name="password"
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
              error={errors.password?.message}
            />
          </FormField>

          <FormField label="Confirm Password">
            <PasswordField
              register={register}
              name="confirmPassword"
              showPassword={showConfirmPassword}
              onToggleVisibility={toggleConfirmPasswordVisibility}
              error={errors.confirmPassword?.message}
            />
          </FormField>
        </Box>

        {/* Password Strength and Requirements - Show when password exists (once user starts typing, keep it visible) */}
        {password.length > 0 && (
          <Box 
            sx={{ 
              mt: { xs: 1.5, sm: 2 },
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: THEME.colors.text.black,
                fontSize: { xs: 12, sm: 13 },
                mb: 1.5,
              }}
            >
              Password Strength : <span style={{ fontWeight: 600, color: getStrengthColor(passwordStrength) }}>{passwordStrength}</span>
            </Typography>

            {/* Password Requirements */}
            <Stack spacing={1}>
              {PASSWORD_REQUIREMENTS.map((req) => {
                const isMet = passwordChecks[req.id as keyof typeof passwordChecks];
                return (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isMet ? (
                      <CheckCircleIcon
                        sx={{
                          fontSize: 18,
                          color: '#4CAF50', // Green filled checkmark when requirement is met
                        }}
                      />
                    ) : (
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: 18,
                          color: '#9B7EDE', // Purple outline when requirement is not met
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
        )}

                      {/* Terms Agreement */}
        <Box sx={{ mt: { xs: 2.5, sm: 3 } }}>
          <Controller
            name="agree"
            control={control}
            render={({ field }) => (
              <>
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} size="small" />}
                  label={
                    <Typography variant="body2" sx={{ color: THEME.colors.text.black, fontSize: 14 }}>
                      I agree the{' '}
                      <MuiLink
                        component={Link}
                        href="/support/terms"
                        underline="hover"
                        sx={{ color: THEME.colors.primary }}
                      >
                        Terms and Conditions
                      </MuiLink>
                    </Typography>
                  }
                />
                {errors.agree && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 4.5 }}>
                    {errors.agree.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Box>

                      {/* Submit Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 2.5, sm: 3 },
          }}
        >
          <StyledButton
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
            sx={{
              width: { xs: '100%', sm: '75%', md: '60%', lg: '50%' },
              height: { xs: 48, sm: 44 },
              fontSize: { xs: 14, sm: 16 },
            }}
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </StyledButton>
        </Box>

                      {/* Sign In Link */}
                      <Typography
                        align="center"
          sx={{
            mt: { xs: 2.5, sm: 3 },
            color: THEME.colors.text.black,
            fontSize: { xs: 13, sm: 14, md: 16 },
            px: { xs: 1, sm: 0 },
          }}
                      >
                        Already have an account?{' '}
          <MuiLink
            component={Link}
            href="/login"
            underline="hover"
            sx={{ color: THEME.colors.primary, fontWeight: 700 }}
          >
                          Sign in
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

        {/* Verification Dialog */}
        <Dialog
          open={showVerificationDialog}
          onClose={() => !isVerifying && !isVerificationSuccess && setShowVerificationDialog(false)}
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
            onClick={() => !isVerifying && !isVerificationSuccess && setShowVerificationDialog(false)}
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
            onClick={() => !isVerifying && !isVerificationSuccess && setShowVerificationDialog(false)}
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

            {!isVerificationSuccess ? (
              <>
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
                    {verificationEmail}
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
                  onClick={() => handleVerify()}
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
                          handleResendOtp();
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
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.colors.primary, mb: 3 }}>
                  Registration Successful
                </Typography>
                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={handleLoginRedirect}
                  fullWidth
                  sx={{
                    minWidth: 120,
                  }}
                >
                  Login
                </StyledButton>
              </Box>
            )}
          </Box>
        </Dialog>

        {/* Email Exists Dialog */}
        <Dialog
          open={showEmailExistsDialog}
          onClose={() => setShowEmailExistsDialog(false)}
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
            onClick={() => setShowEmailExistsDialog(false)}
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

          <Box sx={{ px: 4, pt: 6, pb: 4 }}>
            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: THEME.colors.primary,
                textAlign: 'center',
                mb: 3,
              }}
            >
              Account Already Exists
            </Typography>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: THEME.colors.text.black,
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              {emailExistsMessage}
            </Typography>

            {/* Login Button */}
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => {
                setShowEmailExistsDialog(false);
                handleLoginRedirect();
              }}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Go to Login
            </StyledButton>
          </Box>
        </Dialog>

        {/* User Already Active Dialog */}
        <Dialog
          open={showUserAlreadyActiveDialog}
          onClose={() => setShowUserAlreadyActiveDialog(false)}
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
            onClick={() => setShowUserAlreadyActiveDialog(false)}
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

          <Box sx={{ px: 4, pt: 6, pb: 4 }}>
            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: THEME.colors.primary,
                textAlign: 'center',
                mb: 3,
              }}
            >
              Account Already Active
            </Typography>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: THEME.colors.text.black,
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              {userAlreadyActiveMessage}
            </Typography>

            {/* Login Button */}
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => {
                setShowUserAlreadyActiveDialog(false);
                handleLoginRedirect();
              }}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Go to Login
            </StyledButton>
          </Box>
        </Dialog>
                  </Box>
  );
});

// ---------- MAIN COMPONENT ----------

export default function SignUp() {
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
        <FormSection />
      </AuthLayout>
    </div>
  );
}
