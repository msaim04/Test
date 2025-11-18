import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * DRY: Centralized className merging utility
 * Combines clsx and tailwind-merge for optimal className handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

