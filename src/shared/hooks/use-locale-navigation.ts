import { useLocale } from "next-intl";
import { useCallback } from "react";
import { locales, type Locale } from "@/i18n/request";

/**
 * Hook for locale management and navigation
 * Provides utilities for switching languages and getting current locale
 */
export function useLocaleNavigation() {
  const locale = useLocale() as Locale;

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return;

      // Set locale cookie (next-intl reads this when localePrefix is "never")
      // The cookie name used by next-intl middleware
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Reload the page to apply the new locale (middleware will read the cookie)
      window.location.reload();
    },
    [locale]
  );

  return {
    locale,
    switchLocale,
    locales,
  };
}

