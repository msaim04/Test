import { useCallback } from "react";
import { useHeaderStore } from "../stores/header.store";
import { SUPPORTED_LANGUAGES } from "../constants";
import type { SupportedLanguage } from "../types/header.types";

/**
 * Custom hook for language management
 * Handles language switching logic
 */
export function useLanguage() {
  const { language, setLanguage } = useHeaderStore();

  const toggleLanguage = useCallback(() => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(language as SupportedLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    setLanguage(SUPPORTED_LANGUAGES[nextIndex]);
  }, [language, setLanguage]);

  return {
    language: language as SupportedLanguage,
    setLanguage,
    toggleLanguage,
  };
}

