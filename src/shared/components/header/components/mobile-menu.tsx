"use client";

import React from "react";
import { NavigationLinks } from "./navigation-links";
import type { MobileMenuProps } from "../types/header.types";

/**
 * Mobile menu component - Memoized for performance
 * DRY: Uses reusable AuthLink component instead of duplicated Link code
 * Rendered directly in header structure to stay fixed with header
 */
export const MobileMenu = React.memo<MobileMenuProps>(function MobileMenu({
  isOpen,
  navLinks,
  isActiveLink,
  onLinkClick,
}) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden absolute left-1/2 -translate-x-1/2 w-screen bg-[var(--color-text-white)] z-[10000] shadow-lg border-b border-gray-200 top-full">
      <nav className="flex flex-col py-4 w-full">
        <NavigationLinks
          links={navLinks}
          isActiveLink={isActiveLink}
          variant="mobile"
          onLinkClick={onLinkClick}
        />
      </nav>
    </div>
  );
});

// Re-export MobileMenuButton for convenience
export { MobileMenuButton } from "./mobile-menu-button";

