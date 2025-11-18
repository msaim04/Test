import React from "react";
import { cn } from "../utils/cn";

interface LanguageSelectorProps {
  language: string;
  onToggle: () => void;
  variant?: "desktop" | "mobile";
}

/**
 * Language selector component - Memoized
 * Responsive: Adapts for desktop and mobile views
 */
export const LanguageSelector = React.memo<LanguageSelectorProps>(
  function LanguageSelector({ language, onToggle, variant = "desktop" }) {
    if (variant === "desktop") {
      return (
        <button
          onClick={onToggle}
          className={cn(
            "hidden lg:inline-block text-[var(--color-text-dark-blue)] text-sm font-[500]",
            "ml-3 md:ml-4 mr-3 xl:mr-4 2xl:mr-[25px]",
            "hover:text-[var(--color-primary)] transition-colors cursor-pointer uppercase"
          )}
        >
          {language?.toUpperCase?.() ?? language}
        </button>
      );
    }

    // Mobile variant - inline before menu button
    return (
      <button
        onClick={onToggle}
        className={cn(
          "lg:hidden inline-block text-[var(--color-text-dark-blue)] text-sm font-[500]",
          "mr-2 xl:mr-4",
          "hover:text-[var(--color-primary)] transition-colors cursor-pointer uppercase"
        )}
      >
        {language?.toUpperCase?.() ?? language}
      </button>
    );
  }
);

