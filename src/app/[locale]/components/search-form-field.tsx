"use client";

import React from "react";
import { cn } from "@/shared/utils/format";

interface SearchFormFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  className?: string;
}

/**
 * Reusable Search Form Field Component
 * DRY: Single component for all search form fields
 * Responsive: Adapts spacing and sizing for different screen sizes
 */
export const SearchFormField = React.memo<SearchFormFieldProps>(function SearchFormField({
  label,
  placeholder,
  value,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-start w-full md:w-[151px] gap-2 md:gap-[9px]", className)}>
      <span className="text-[var(--color-text-dark-blue)] text-xs font-bold">
        {label}
      </span>
      <div className="flex flex-col items-center self-stretch bg-white py-0.5 pl-[1px] pr-4 md:pr-10 rounded-lg md:rounded-none overflow-hidden">
        <span className="text-[var(--color-text-dark-blue)] text-xs md:text-[13px]">
          {value || placeholder}
        </span>
      </div>
    </div>
  );
});

