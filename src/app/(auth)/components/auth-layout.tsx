'use client';

import * as React from 'react';
import {
  ThemeProvider,
  createTheme,
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';

// ---------- THEME CONFIGURATION ----------
const theme = createTheme({
  palette: {
    primary: { main: THEME.colors.primary },
    text: { primary: THEME.colors.text.darkBlue },
  },
  typography: {
    fontFamily: THEME.fonts.primary,
  },
});

// ---------- SECTION COMPONENTS (DRY: Layout organization) ----------

/**
 * Logo section component
 * DRY: Encapsulates header section logic
 */
const LogoSection = React.memo(function LogoSection() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: { xs: 3, sm: 4, md: 5, lg: 6 },
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <Image
          src={MEDIA.logos.servisca.src}
          alt={MEDIA.logos.servisca.alt}
          width={221}
          height={41}
          className="object-contain"
          style={{
            height: 'auto',
            width: 'clamp(150px, 20vw, 221px)',
            maxWidth: '221px',
            cursor: 'pointer',
          }}
        />
      </Link>
    </Box>
  );
});

/**
 * Image and app download section component
 * DRY: Encapsulates left section logic
 * Memoized to prevent image reloads on navigation
 */
interface ImageSectionProps {
  imageHeight?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    breakpoint1024?: number;
  };
}

const ImageSection = React.memo(function ImageSection({ imageHeight }: ImageSectionProps) {
  const taskersImageSrc = MEDIA.auth.signup.taskersImage as string;
  const hasValidImage = taskersImageSrc && taskersImageSrc.trim().length > 0;

  const defaultHeight = {
    xs: 250,
    sm: 350,
    md: 400,
    lg: 482,
  };

  const height = imageHeight || defaultHeight;
  const height1024 = imageHeight?.breakpoint1024;

  // Memoize image src to prevent unnecessary re-renders
  const imageSrc = React.useMemo(() => MEDIA.auth.signup.taskersImage, []);

  return (
    <Box>
      {/* Image Container */}
      {hasValidImage ? (
        <Box
          sx={{
            width: '100%',
            height: {
              xs: height.xs || defaultHeight.xs,
              sm: height.sm || defaultHeight.sm,
              md: height.md || defaultHeight.md,
              lg: height.lg || defaultHeight.lg,
            },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            overflow: 'hidden',
            position: 'relative',
            '@media (min-width: 1024px)': {
              height: height1024 || height.md || defaultHeight.md,
            },
            // Prevent layout shift during image load
            backgroundColor: THEME.colors.background.placeholder,
          }}
        >
          <Image
            src={imageSrc}
            priority // Preload image to prevent reloads
            unoptimized={false} // Use Next.js image optimization
            alt="Taskers"
            fill
            style={{
              objectFit: 'cover',
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            // Prevent image reload on navigation
            loading="eager"
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: {
              xs: height.xs || defaultHeight.xs,
              sm: height.sm || defaultHeight.sm,
              md: height.md || defaultHeight.md,
              lg: height.lg || defaultHeight.lg,
            },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            backgroundColor: '#E6E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (min-width: 1024px)': {
              height: height1024 || height.md || defaultHeight.md,
            },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Taskers Image
          </Typography>
        </Box>
      )}

      {/* App Download Section - Using Flex for horizontal layout */}
      <Box
        sx={{
          mt: { xs: 3, sm: 4, md: 5 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: THEME.colors.text.black,
            fontWeight: 400,
            fontSize: { xs: 13, sm: 14, md: 16 },
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          Get started faster.
          <br />
          Download our app
        </Typography>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          flexWrap="wrap"
          justifyContent="center"
          gap={{ xs: 1.5, sm: 2 }}
        >
          <Image
            src={MEDIA.badges.googlePlay}
            alt="Google Play"
            width={178}
            height={58}
            style={{
              height: 'auto',
              width: 'clamp(120px, 25vw, 178px)',
              maxWidth: '178px',
              cursor: 'pointer',
            }}
          />
          <Image
            src={MEDIA.badges.appStore}
            alt="App Store"
            width={184}
            height={58}
            style={{
              height: 'auto',
              width: 'clamp(120px, 25vw, 184px)',
              maxWidth: '184px',
              cursor: 'pointer',
              marginLeft: 0,
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
});

// ---------- MAIN LAYOUT COMPONENT ----------

interface AuthLayoutProps {
  children: React.ReactNode;
  imageHeight?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    breakpoint1024?: number;
  };
}

/**
 * Reusable Auth Layout Component
 * DRY: Shared layout for signup and login pages
 * Memoized to prevent unnecessary re-renders and image reloads
 * 
 * @param children - The form component to render on the right side
 * @param imageHeight - Optional custom image heights for different breakpoints
 */
const AuthLayout = React.memo(function AuthLayout({ children, imageHeight }: AuthLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
        <Box
          className="auth-layout"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 2, sm: 4, md: 6, lg: 8 },
            px: { xs: 2, sm: 3, md: 4 },
            backgroundColor: THEME.colors.background.auth,
          }}
        >
        <Container
          maxWidth={false}
          sx={{
            width: '90%',
            px: { xs: 0, sm: 1, md: 2 },
            mx: 'auto',
          }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 2.5, md: THEME.borderRadius.card },
              overflow: 'hidden',
              backgroundColor: THEME.colors.background.card,
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3, md: 3.5, lg: 5 },
                '@media (min-width: 1024px)': {
                  p: 4,
                },
              }}
            >
              <LogoSection />

              {/* Main Content - Using Grid for responsive 2-column layout */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(12, 1fr)',
                  },
                  gap: { xs: 3, sm: 4, md: 4, lg: 6 },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  m: { xs: 2, sm: 3, md: 3.5 },
            
                  py: { xs: 2, sm: 3, md: 4 },
                  px: { xs: 2, sm: 3, md: 4 },
                  '@media (min-width: 1024px)': {
                    gap: 5,
                    mt: 4,
                    mb: 4,
                    py: 4,
                    px: 4,
                  },
                }}
              >
                {/* LEFT: Image + App Download Section */}
                <Box
                  sx={{
                    gridColumn: { xs: '1', md: 'span 5' },
                  }}
                >
                  <ImageSection imageHeight={imageHeight} />
                </Box>

                {/* RIGHT: Form Section - Accepts children */}
                <Box
                  sx={{
                    gridColumn: { xs: '1', md: 'span 7' },
                  }}
                >
                  {children}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
});

export default AuthLayout;

