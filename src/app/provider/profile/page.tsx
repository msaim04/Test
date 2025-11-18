'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/use-auth';
import { useDeleteAccount } from '@/features/auth/hooks/use-delete-account';
import { THEME } from '@/shared/constants/theme';

type ProviderUserProfile = {
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  phone?: string;
  service_area?: string;
  is_provider?: boolean;
  is_provider_verified?: boolean;
};

type ProviderFlagKey = 'is_provider' | 'is_provider_verified';

type ProviderStatusChip = {
  key: ProviderFlagKey;
  label: string;
  color: 'primary' | 'success';
  isActive: (user: ProviderUserProfile | null) => boolean;
};

const providerStatusChips: ProviderStatusChip[] = [
  {
    key: 'is_provider',
    label: 'Provider',
    color: 'primary',
    isActive: (user) => Boolean(user?.is_provider),
  },
  {
    key: 'is_provider_verified',
    label: 'Verified Provider',
    color: 'success',
    isActive: (user) => Boolean(user?.is_provider_verified),
  },
];

function getDisplayName(user: ProviderUserProfile | null): string | null {
  if (user?.business_name) return user.business_name;
  if (user?.name) return user.name;
  if (user?.first_name || user?.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }
  return null;
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isDeleting, deleteUserAccount } = useDeleteAccount();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const providerUser = (user ?? null) as ProviderUserProfile | null;
  const displayName = getDisplayName(providerUser);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleDeleteAccount = async () => {
    await deleteUserAccount();
    setOpenDeleteDialog(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  const providerMetadata = providerStatusChips.filter(({ isActive }) => isActive(providerUser));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: THEME.colors.primary,
          mb: 4,
        }}
      >
        Provider Profile
      </Typography>

      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          p: 3,
          mb: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: THEME.colors.text.black }}>
          Provider Details
        </Typography>

        {providerMetadata.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {providerMetadata.map((meta) => (
              <Chip
                key={meta.key}
                label={meta.label}
                color={meta.color}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        )}

        {displayName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 0.5 }}>
              Name
            </Typography>
            <Typography variant="body1" sx={{ color: THEME.colors.text.black }}>
              {displayName}
            </Typography>
          </Box>
        )}

        {providerUser?.email && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 0.5 }}>
              Email
            </Typography>
            <Typography variant="body1" sx={{ color: THEME.colors.text.black }}>
              {providerUser.email}
            </Typography>
          </Box>
        )}

        {providerUser?.phone && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 0.5 }}>
              Phone
            </Typography>
            <Typography variant="body1" sx={{ color: THEME.colors.text.black }}>
              {providerUser.phone}
            </Typography>
          </Box>
        )}

        {providerUser?.service_area && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 0.5 }}>
              Service Area
            </Typography>
            <Typography variant="body1" sx={{ color: THEME.colors.text.black }}>
              {providerUser.service_area}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: THEME.colors.text.black }}>
          Danger Zone
        </Typography>
        <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 2 }}>
          Deleting your provider account removes your listings and history permanently.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Delete Provider Account
        </Button>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => !isDeleting && setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: THEME.colors.primary }}>
          Delete Provider Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your provider account? This action cannot be undone and
            all jobs, reviews, and related data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

