import React from "react";
import { cn } from "@/shared/utils/format";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

/**
 * Reusable Button component following DRY principles
 * Supports multiple variants and sizes for consistent styling
 */
export const Button = React.memo<ButtonProps>(function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  const baseStyles = "flex items-center justify-center rounded-full border-0 cursor-pointer transition-colors font-bold";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-[var(--color-text-white)] hover:bg-[var(--color-primary)]/90",
    secondary: "bg-white text-[var(--color-text-dark-blue)] hover:bg-gray-50",
    outline: "bg-transparent border border-solid border-[var(--color-text-dark-blue)] text-[var(--color-text-dark-blue)] hover:bg-gray-50",
  };

  const sizes = {
    sm: "py-1.5 px-4 text-xs",
    md: "py-2.5 px-[22px] text-base",
    lg: "py-4 px-6 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

