import React from "react";
import { cn } from "@/shared/utils/format";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable Input component following DRY principles
 * Includes label and error handling for consistent form styling
 */
export const Input = React.memo<InputProps>(function Input({
  label,
  error,
  className,
  ...props
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      {label && (
        <span className="text-[var(--color-text-dark-blue)] text-xs font-bold">
          {label}
        </span>
      )}
      <input
        className={cn(
          "bg-white py-0.5 pl-[1px] pr-10 rounded-lg text-[13px] text-[var(--color-text-dark-blue)]",
          "border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
});

