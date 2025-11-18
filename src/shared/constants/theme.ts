/**
 * Global Theme Constants
 * Centralized theme configuration following DRY principles
 * Used across the entire application for consistent styling
 */

export const THEME = {
  colors: {
    primary: "#19317C",
    secondary: "#E0EEFF",
    social: {
      google: "#4285F4",
      facebook: "#1877F2",
      apple: "#000000",
    },
    divider: {
      primary: "#2B4A98", // Used in footer CTA divider
    },
    text: {
      darkBlue: "#080D26",
      black: "#000000",
      white: "#FFFFFF",
      grey: "#999999",
      lightGrey: "#666666",
    },
    border: {
      default: "rgba(0, 0, 0, 0.23)",
      hover: "rgba(0, 0, 0, 0.87)",
      social: "#E6E8F0",
    },
    background: {
      auth: "#E0EEFF",
      card: "#FFFFFF",
      socialHover: "#f5f5f5",
      placeholder: "#E6E8F0",
    },
  },
  fonts: {
    primary: "Baloo 2, sans-serif",
  },
  spacing: {
    auth: {
      containerPadding: { xs: 3, md: 5 },
      sectionGap: { xs: 4, md: 6 },
      fieldGap: 4,
    },
  },
  typography: {
    auth: {
      title: { xs: 28, md: 36 },
      body: { xs: 14, md: 16 },
      tagline: { xs: 14, md: 16 },
    },
  },
  borderRadius: {
    card: 3,
    field: 2,
    button: 12,
    image: 2,
  },
} as const;

export type ThemeColors = typeof THEME.colors;
export type ThemeTextColors = typeof THEME.colors.text;

