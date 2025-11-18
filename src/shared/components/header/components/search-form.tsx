import React from "react";
import { cn } from "../utils/cn";
import type { SearchFormProps } from "../types/header.types";

interface SearchFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

/**
 * Reusable search form field component
 * DRY: Single component for all form fields, uses utility functions
 */
const SearchFormField = React.memo<SearchFormFieldProps>(
  function SearchFormField({ label, value, onChange, placeholder, className }) {
    return (
      <div className={cn("flex flex-col items-start gap-2 md:gap-[9px] w-full", className)}>
        <span className="text-[var(--color-text-dark-blue)] text-xs font-bold">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent border-0 outline-none text-[var(--color-text-dark-blue)]",
            "py-2 md:py-0.5 pl-2 md:pl-0 pr-2 md:pr-10 rounded-lg md:rounded-none text-[13px]",
            "placeholder:opacity-60 focus:outline-none"
          )}
        />
      </div>
    );
  }
);

/**
 * Search form component - Memoized for performance
 * DRY: Uses reusable SearchFormField component to avoid duplication
 * Responsive: Adapts layout for mobile, tablet, and desktop
 */
export const SearchForm = React.memo<SearchFormProps>(function SearchForm({
  searchForm,
  onLocationChange,
  onStartTimeChange,
  onCategoryChange,
  onSubmit,
}) {
  return (
    <div className="flex flex-col items-center md:items-end w-full mb-4 md:mb-6 px-2 sm:px-4 md:px-0">
      <div
        className={cn(
          "flex flex-col md:flex-row items-stretch md:items-center",
          "bg-white py-3 md:py-[11px] w-full",
          "md:w-auto md:max-w-[900px] lg:max-w-none",
          "md:mr-[50px] lg:mr-[200px] xl:mr-[333px]",
          "rounded-[2rem]",
          "border border-solid border-gray-200",
          "gap-3 md:gap-0 px-4 md:px-0"
        )}
      >
        <SearchFormField
          label="Location"
          value={searchForm.location}
          onChange={onLocationChange}
          placeholder="Enter your address"
          className="w-full sm:w-[200px] md:w-[151px] md:ml-[31px]"
        />

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-12 bg-gray-200 md:mx-6"></div>

        <SearchFormField
          label="Start time"
          value={searchForm.startTime}
          onChange={onStartTimeChange}
          placeholder="Add dates"
          className="w-full sm:w-[200px] md:w-[151px]"
        />

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-12 bg-gray-200 md:mx-6"></div>

        <SearchFormField
          label="Find help today"
          value={searchForm.category}
          onChange={onCategoryChange}
          placeholder="Select category"
          className="w-full sm:w-[200px] md:w-[151px]"
        />

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-12 bg-gray-200 md:mx-6"></div>

        <button
          onClick={onSubmit}
          className={cn(
            "flex items-center justify-center bg-[var(--color-primary)]",
            "w-[80%] sm:w-[200px] md:w-[120px]",
            "py-3 md:py-3 md:mr-[11px] rounded-[9999px] border-0 cursor-pointer",
            "hover:bg-[var(--color-primary)]/90 transition-colors mt-2 md:mt-0"
          )}
        >
          <span className="text-[var(--color-text-white)] text-sm font-bold">
            Submit
          </span>
        </button>
      </div>
    </div>
  );
});

