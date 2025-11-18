/**
 * Header types
 * Type definitions for header feature
 */

export interface NavLink {
  href: string;
  label: string;
  exact?: boolean; // If true, only match exact path (for home route)
}

export type SupportedLanguage = "en" | "ar";

export interface HeaderState {
  // Mobile menu state
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Language state
  language: string;
  setLanguage: (lang: string) => void;

  // Search form state (persisted)
  searchForm: {
    location: string;
    startTime: string;
    category: string;
  };
  setSearchForm: (form: Partial<HeaderState["searchForm"]>) => void;
  resetSearchForm: () => void;
}

export interface HeaderProps {
  className?: string;
  showSearchForm?: boolean;
  showSupportMessage?: boolean;
}

export interface NavigationLinksProps {
  links: NavLink[];
  isActiveLink: (link: NavLink) => boolean;
  variant?: "desktop" | "mobile";
  onLinkClick?: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  navLinks: NavLink[];
  isActiveLink: (link: NavLink) => boolean;
  onLinkClick: () => void;
}

export interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface SearchFormProps {
  searchForm: {
    location: string;
    startTime: string;
    category: string;
  };
  onLocationChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
}

export interface SearchFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

