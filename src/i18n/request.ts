/**
 * Minimal i18n configuration - English only for now
 * Will be expanded later when language switching is needed
 */

import { getRequestConfig } from 'next-intl/server';

export const locales = ["en"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: (await import(`./messages/${defaultLocale}.json`)).default
  };
});

