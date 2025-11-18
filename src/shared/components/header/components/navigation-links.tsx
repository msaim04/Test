import React from "react";
import Link from "next/link";
import { getNavigationLinkClasses } from "../utils/navigation-styles";
import type { NavigationLinksProps } from "../types/header.types";

/**
 * Navigation links component - Reusable for desktop and mobile
 * DRY: Uses utility function for consistent styling
 */
export const NavigationLinks = React.memo<NavigationLinksProps>(
  function NavigationLinks({ links, isActiveLink, variant = "desktop", onLinkClick }) {
    return (
      <>
        {links.map((link, index) => {
          const isActive = isActiveLink(link);
          const className = getNavigationLinkClasses(variant, isActive);

          return (
            <Link
              key={`${link.href}-${link.label}-${index}`}
              href={link.href}
              onClick={onLinkClick}
              className={className}
            >
              {link.label}
            </Link>
          );
        })}
      </>
    );
  }
);

