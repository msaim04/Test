/**
 * Header styling constants
 * Centralized style values for DRY principle
 * Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
 */

import { THEME } from "@/shared/constants/theme";

export const HEADER_COLORS = {
  primary: THEME.colors.primary,
  primaryText: THEME.colors.primary,
  text: THEME.colors.text.darkBlue,
  border: THEME.colors.text.darkBlue,
  background: THEME.colors.text.white,
  borderLight: `${THEME.colors.text.darkBlue}33`,
  backgroundLight: `${THEME.colors.text.white}1A`,
} as const;

export const HEADER_SPACING = {
  containerMaxWidth: "1440px",
  navPadding: {
    mobile: "px-2 sm:px-4",
    desktop: "lg:ml-[71px] lg:mr-[85px] mb-4",
  },
  searchFormMargin: {
    md: "md:mr-[50px]",
    lg: "lg:mr-[200px]",
    xl: "xl:mr-[333px]",
  },
} as const;

export const HEADER_TYPOGRAPHY = {
  textXs: "text-xs",
  textSm: "text-sm",
  textBase: "text-[13px]",
  fontWeightBold: "font-bold",
} as const;

export const HEADER_RADIUS = {
  button: "rounded-[9999px]",
  card: "rounded-[50px]",
  input: "rounded-lg md:rounded-none",
} as const;

export const HEADER_Z_INDEX = {
  header: 10001,
  mobileMenu: 10000,
} as const;

export const HEADER_STYLES = {
  link: {
    base: "text-[16px]",
    active: "text-[var(--color-primary)] font-bold",
    inactive: "text-[var(--color-text-dark-blue)] hover:text-[var(--color-primary)] transition-colors font-[500]",
  },
  button: {
    base: "border border-solid border-[var(--color-text-dark-blue)] no-underline hover:opacity-80 transition-opacity",
    mobile: "flex-1 flex items-center justify-center py-2 rounded-[50px] border border-solid border-[var(--color-text-dark-blue)] text-[var(--color-text-dark-blue)] text-sm font-medium hover:bg-gray-50",
  },
  input: {
    base: "flex flex-col items-start w-full bg-[var(--color-text-white)] border-0 text-[var(--color-text-dark-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20",
  },
} as const;

