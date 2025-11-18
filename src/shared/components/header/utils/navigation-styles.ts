import { cn } from "./cn";
import { HEADER_STYLES } from "./styles";

/**
 * Utility function to get navigation link classes based on variant and state
 * DRY: Centralized logic for link styling eliminates duplication
 * Responsive: Adapts text size and spacing for different screen sizes
 */
export function getNavigationLinkClasses(
  variant: "desktop" | "mobile",
  isActive: boolean
): string {
  const baseClasses =
    variant === "desktop"
      ? "text-[16px] whitespace-nowrap"
      : "px-4 py-3 text-[16px]";

  const stateClasses = isActive
    ? variant === "desktop"
      ? HEADER_STYLES.link.active
      : `${HEADER_STYLES.link.active} bg-[var(--color-primary)]/10`
    : variant === "desktop"
      ? HEADER_STYLES.link.inactive
      : "text-[var(--color-text-dark-blue)] hover:bg-gray-50 font-[500]";

  return cn(baseClasses, stateClasses);
}

