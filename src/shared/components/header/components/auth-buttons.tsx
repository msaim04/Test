import React from "react";
import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import toast from "react-hot-toast";
import { MEDIA } from "@/shared/constants/media";
import { useAuth } from "@/shared/hooks/use-auth";
import { logoutUser } from "@/features/auth/services/auth.service";
import { useHeaderAuth } from "../hooks/use-header-auth";

interface AuthButtonProps {
  href: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Desktop auth button with full image
 * DRY: Reusable component for desktop auth buttons
 * Responsive: Adapts button sizes for different screens
 */
export const AuthButton = React.memo<AuthButtonProps>(function AuthButton({
  href,
  imageSrc,
  imageAlt,
  className = "",
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block ${className}`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={100}
        height={40}
        className="w-full h-full object-contain hover:opacity-80 transition-opacity"
      />
    </Link>
  );
});

interface AuthButtonsProps {
  onLinkClick?: () => void;
  variant?: "desktop" | "mobile";
}

/**
 * User Profile Button Component
 * Shows user profile when logged in with dropdown menu
 */
const UserProfileButton = React.memo<{ 
  user: Record<string, unknown> | null; 
  variant?: "desktop" | "mobile";
  onClick?: () => void;
}>(function UserProfileButton({ user, variant = "desktop", onClick }) {
  const { refreshToken, clearAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  // Use optimized header auth hook with caching
  const { userName, userEmail, userInitials } = useHeaderAuth(user);
  
  // Debug: Log user data in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && user) {
      console.log('UserProfileButton - User object:', user);
      console.log('UserProfileButton - Extracted userName:', userName);
      console.log('UserProfileButton - Extracted userEmail:', userEmail);
    }
  }, [user, userName, userEmail]);
  
  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true);
    
    // Clear authentication state IMMEDIATELY (optimistic update)
    // This provides instant UI feedback
      clearAuth();
      
    // Clear device token immediately
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('device_token');
        // Also clear any cached query data
        if (window.caches) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          }).catch(() => {
            // Ignore cache errors
          });
        }
        }
      } catch (storageError) {
        console.error('Failed to clear device token:', storageError);
      }
      
    // Show success toast immediately
      toast.success('Logged out successfully', {
      duration: 2000,
        position: 'top-center',
      });
      
    // Redirect immediately (don't wait for API call)
      if (typeof window !== 'undefined') {
      // Use replace instead of href for faster navigation
      window.location.replace('/login');
      }
    
    // Make logout API call in background (fire-and-forget)
    // Use a shorter timeout for logout (5 seconds instead of 30)
    if (refreshToken) {
      // Don't await - let it run in background
      logoutUser(refreshToken).catch((apiError) => {
        // Silently handle errors - user is already logged out locally
        if (process.env.NODE_ENV === 'development') {
          console.warn('Logout API call failed (non-blocking):', apiError);
        }
      });
    }
  }, [refreshToken, clearAuth]);

  const triggerButton = (
    <button
      type="button"
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors outline-none"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#4541F1] to-[#DE75D4] flex items-center justify-center text-white font-semibold text-sm sm:text-base">
        {userInitials}
      </div>
      {variant === "desktop" && (
        <div className="hidden lg:block text-left">
          {userName ? (
            <div className="text-sm font-semibold text-gray-900 text-left mb-0.5">
              {userName}
            </div>
          ) : null}
          {userEmail ? (
            <div className={`text-xs truncate max-w-[120px] xl:max-w-[150px] text-left ${userName ? 'text-gray-500' : 'font-semibold text-gray-900'}`}>
              {userEmail}
            </div>
          ) : null}
        </div>
      )}
      {variant === "mobile" && (
        <div className="text-left">
          {userName ? (
            <div className="text-sm font-semibold text-gray-900 text-left mb-0.5">
              {userName}
            </div>
          ) : null}
          {userEmail ? (
            <div className={`text-xs truncate max-w-[120px] text-left ${userName ? 'text-gray-500' : 'font-semibold text-gray-900'}`}>
              {userEmail}
            </div>
          ) : null}
        </div>
      )}
    </button>
  );

  const dropdownContent = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {triggerButton}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/customer/profile"
              onClick={onClick}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none text-sm text-gray-900"
            >
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none text-sm text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  if (variant === "mobile") {
    return (
      <div className="lg:hidden flex items-center mr-2">
        {dropdownContent}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center">
      {dropdownContent}
    </div>
  );
});

/**
 * Desktop auth buttons component
 * DRY: Reuses AuthButton component to avoid duplication
 * Responsive: Hidden on mobile, shown on desktop
 * Shows user profile when logged in, login/signup when not
 */
export const AuthButtons = React.memo<AuthButtonsProps>(function AuthButtons({
  onLinkClick,
  variant = "desktop",
}) {
  const { isAuthenticated, user, hasHydrated } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: Log auth state (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('AuthButtons - isAuthenticated:', isAuthenticated, 'user:', user, 'hasHydrated:', hasHydrated);
  }

  // Don't render until hydrated and mounted (prevents flash of wrong state)
  if (!hasHydrated || !isMounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    if (variant === "mobile") {
      return (
        <div className="lg:hidden flex items-center gap-1.5 mr-2 w-[130px] sm:w-[150px]">
          {/* Placeholder to prevent layout shift */}
        </div>
      );
    }
    return (
      <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-5 w-[180px] xl:w-[200px] 2xl:w-[220px]">
        {/* Placeholder to prevent layout shift */}
      </div>
    );
  }

  // If user is logged in, show profile
  // Even if user object is empty, we'll handle it in UserProfileButton
  if (isAuthenticated) {
    return <UserProfileButton user={user || {}} variant={variant} onClick={onLinkClick} />;
  }

  // If not logged in, show login/signup buttons
  if (variant === "mobile") {
    return (
      <div className="lg:hidden flex items-center gap-1.5 mr-2">
        <AuthButton
          href="/login"
          imageSrc={MEDIA.icons.userLogin}
          imageAlt="Login"
          className="w-[60px] h-[24px] sm:w-[70px] sm:h-[28px]"
          onClick={onLinkClick}
        />
        <AuthButton
          href="/signup"
          imageSrc={MEDIA.icons.userSignup}
          imageAlt="Sign Up"
          className="w-[60px] h-[24px] sm:w-[70px] sm:h-[28px]"
          onClick={onLinkClick}
        />
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-5">
      <AuthButton
        href="/login"
        imageSrc={MEDIA.icons.userLogin}
        imageAlt="Login"
        className="w-[85px] xl:w-[90px] 2xl:w-[100px]"
        onClick={onLinkClick}
      />
      <AuthButton
        href="/signup"
        imageSrc={MEDIA.icons.userSignup}
        imageAlt="Sign Up"
        className="w-[85px] xl:w-[90px] 2xl:w-[114px]"
        onClick={onLinkClick}
      />
    </div>
  );
});

