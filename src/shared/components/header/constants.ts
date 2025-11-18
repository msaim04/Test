/**
 * Header constants and configuration
 * Centralized configuration values for header feature
 */
import type { NavLink, SupportedLanguage } from "./types/header.types";
import { MEDIA } from "@/shared/constants/media";

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", exact: true },
  { href: "/customer/services", label: "Services" },
  { href: "/support/report-issue", label: "Contact Us" },
  { href: "/provider", label: "For Pro" },
  { href: "/customer/services", label: "Quick find" },
  { href: "/provider/bids", label: "Bidding" },
] as const;

export const SUPPORT_MESSAGE = "For customer service, please ask our support assistant";

export const LOGO_CONFIG = {
  src: MEDIA.logos.servisca.src,
  alt: MEDIA.logos.servisca.alt,
  width: MEDIA.logos.servisca.width,
  height: MEDIA.logos.servisca.height,
} as const;

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "ar"] as const;

