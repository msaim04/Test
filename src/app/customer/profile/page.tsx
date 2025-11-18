'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isDeleting, deleteUserAccount } = useDeleteAccount();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Construct user name from available fields
  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.first_name || user?.last_name) {
      const parts = [user.first_name, user.last_name].filter(Boolean);
      if (parts.length > 0) return parts.join(' ');
    }
    return null;
  };

  const displayName = getUserName();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleDeleteAccount = async () => {
    await deleteUserAccount();
    setShowDeleteDialog(false);
  };

  if (!isAuthenticated) {
    return null;
  }

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
        Profile
      </Typography>

      {/* User Information */}
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
          Account Information
        </Typography>
        
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

        {user?.email && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: THEME.colors.text.grey, mb: 0.5 }}>
              Email
            </Typography>
            <Typography variant="body1" sx={{ color: THEME.colors.text.black }}>
              {user.email}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete Account Section */}
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
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowDeleteDialog(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Delete Account
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: THEME.colors.primary }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone. All your
            data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            disabled={isDeleting}
            sx={{ color: THEME.colors.text.black }}
          >
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

