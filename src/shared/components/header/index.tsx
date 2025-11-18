"use client";

import React from "react";
import { Logo } from "./components/logo";
import { NavigationLinks } from "./components/navigation-links";
import { AuthButtons } from "./components/auth-buttons";
import { MobileMenu } from "./components/mobile-menu";
import { MobileMenuButton } from "./components/mobile-menu-button";
import { SearchForm } from "./components/search-form";
import { SupportMessage } from "./components/support-message";
import { LanguageSelector } from "./components/language-selector";
import { useNavigation } from "./hooks/use-navigation";
import { useSearchForm } from "./hooks/use-search-form";
import { useLanguage } from "./hooks/use-language";
import { useMobileMenu } from "./hooks/use-mobile-menu";
import { cn } from "./utils/cn";
import { HEADER_SPACING } from "./utils/styles";
import type { HeaderProps } from "./types/header.types";

/**
 * Header component - Refactored following best practices
 * 
 * Features:
 * - Server/Client component separation (Client component for interactivity)
 * - Reusable hooks for logic separation
 * - Memoized components for performance
 * - Clear separation of concerns
 * - Feature-based architecture
 * - DRY principles: Uses utility functions, shared components, constants
 * 
 * Performance: Memoized to prevent unnecessary re-renders
 */
const Header = React.memo<HeaderProps>(function Header({
  className,
  showSearchForm = true,
  showSupportMessage = true,
}: HeaderProps) {
  const { pathname, navLinks, isActiveLink } = useNavigation();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu(pathname);
  const { language, toggleLanguage } = useLanguage();
  const {
    searchForm,
    handleLocationChange,
    handleStartTimeChange,
    handleCategoryChange,
    handleSubmit,
  } = useSearchForm();

  return (
    <div className={cn("items-start bg-[var(--color-text-white)] w-full relative z-[10001]", className)} data-header>
      <div className={cn("bg-[var(--color-text-white)] w-full max-w-[1440px] mx-auto pt-2 relative z-[10001]")}>
        {/* Top Support Message */}
        {showSupportMessage && <SupportMessage />}

        {/* Main Navigation Bar */}
        <div className="flex w-full md:mb-6 mx-2 sm:mx-4 md:mx-[5px]">
          <div
            className={cn(
              "grid grid-cols-[auto,1fr,auto] items-center w-full",
              "px-2 sm:px-4 md:px-0",
              HEADER_SPACING.navPadding.desktop
            )}
          >
            {/* Logo */}
            <div className="col-[1]">
              <Logo />
            </div>

            {/* Desktop Navigation Links - centered and non-overlapping */}
            <div className="col-[2] min-w-0 px-2">
              <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 2xl:gap-10">
                <NavigationLinks
                  links={navLinks}
                  isActiveLink={isActiveLink}
                  variant="desktop"
                />
              </nav>
            </div>

            {/* Right controls */}
            <div className="col-[3] flex items-center justify-end pl-2">
              {/* Language Selector - Desktop */}
              <LanguageSelector
                language={language}
                onToggle={toggleLanguage}
                variant="desktop"
              />
              {/* Desktop Auth Buttons */}
              <AuthButtons />
              {/* Mobile: Language Selector */}
              <LanguageSelector
                language={language}
                onToggle={toggleLanguage}
                variant="mobile"
              />
              {/* Mobile: Auth Buttons */}
              <AuthButtons variant="mobile" />
              {/* Mobile Menu Button */}
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onToggle={toggleMobileMenu}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu - Positioned below navigation bar, fixed with header */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          navLinks={navLinks}
          isActiveLink={isActiveLink}
          onLinkClick={closeMobileMenu}
        />

        {/* Search Form */}
        {showSearchForm && (
          <SearchForm
            searchForm={searchForm}
            onLocationChange={handleLocationChange}
            onStartTimeChange={handleStartTimeChange}
            onCategoryChange={handleCategoryChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
});

export default Header;

