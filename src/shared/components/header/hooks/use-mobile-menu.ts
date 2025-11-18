import { useEffect } from "react";
import { useHeaderStore } from "../stores/header.store";

/**
 * Custom hook for mobile menu management
 * Handles mobile menu state and auto-close on route change
 */
export function useMobileMenu(pathname: string) {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useHeaderStore();

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  };
}

