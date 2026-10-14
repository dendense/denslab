import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional class-name joiner used by the ObsidianUI-derived components.
 * `clsx` resolves the conditionals; `twMerge` drops conflicting Tailwind
 * utilities so a caller's `className` can override a component default.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
