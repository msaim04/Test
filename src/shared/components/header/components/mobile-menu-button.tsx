import React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../utils/cn";
import type { MobileMenuButtonProps } from "../types/header.types";

/**
 * Mobile menu toggle button component
 * Separated for better organization
 */
export const MobileMenuButton = React.memo<MobileMenuButtonProps>(
  function MobileMenuButton({ isOpen, onToggle }) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "lg:hidden flex items-center justify-center w-10 h-10",
          "text-[var(--color-text-dark-blue)] hover:bg-gray-100 rounded-lg transition-colors"
        )}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    );
  }
);

