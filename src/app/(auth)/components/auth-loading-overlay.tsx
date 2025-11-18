'use client';

import * as React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { THEME } from '@/shared/constants/theme';

interface AuthLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

/**
 * Loading overlay component
 * Prevents blinking during navigation and API calls
 */
export function AuthLoadingOverlay({ isLoading, message }: AuthLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <Box
      className="auth-loading-overlay"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: THEME.colors.primary,
          mb: message ? 2 : 0,
        }}
      />
      {message && (
        <Box
          sx={{
            color: THEME.colors.text.black,
            fontSize: 16,
            fontWeight: 500,
            mt: 2,
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
}

