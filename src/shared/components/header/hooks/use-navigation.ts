import { usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";
import { NAV_LINKS } from "../constants";
import type { NavLink } from "../types/header.types";

/**
 * Custom hook for navigation logic
 * Handles active link detection and navigation state
 */
export function useNavigation() {
  const pathname = usePathname();

  const isActiveLink = useCallback(
    (link: NavLink) => {
      // Pathname no longer includes locale prefix (localePrefix: "never")
      const linkHref = link.href;

      if (link.exact) {
        // For exact matches, check if paths match exactly
        // Handle home route: "/" matches "/"
        if (linkHref === "/") {
          return pathname === "/";
        }
        return pathname === linkHref;
      }
      // For non-exact matches, check if pathname starts with the link href
      return pathname.startsWith(linkHref);
    },
    [pathname]
  );

  const navLinks = useMemo(() => NAV_LINKS, []);

  return {
    pathname,
    navLinks,
    isActiveLink,
  };
}

