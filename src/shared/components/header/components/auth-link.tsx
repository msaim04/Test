import React from "react";
import Link from "next/link";
import { HEADER_STYLES } from "../utils/styles";

interface AuthLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}

/**
 * Reusable auth link component
 * DRY: Single component for both desktop and mobile auth links
 * Eliminates code duplication between mobile menu and desktop buttons
 */
export const AuthLink = React.memo<AuthLinkProps>(function AuthLink({
  href,
  label,
  onClick,
  variant = "desktop",
}) {
  const className =
    variant === "desktop"
      ? HEADER_STYLES.button.base
      : HEADER_STYLES.button.mobile;

  return (
    <Link href={href} onClick={onClick} className={className}>
      {variant === "desktop" ? (
        <div className="flex items-center justify-center w-full py-1.5 rounded-[50px] border border-solid border-[var(--color-text-dark-blue)]">
          <span className="text-[var(--color-text-black)] text-[12px] xl:text-[13px] mr-1 xl:mr-2">
            {label}
          </span>
        </div>
      ) : (
        label
      )}
    </Link>
  );
});

