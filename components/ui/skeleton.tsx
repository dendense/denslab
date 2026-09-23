import type { ComponentProps } from "react";

/**
 * Neobrutalist loading placeholder: flat block, hard border, no rounding.
 * The diagonal stripe pattern moves, so it reads as "loading" without a spinner.
 */
export function Skeleton({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={`brutal-skeleton border-brutal-thin bg-canvas ${className}`}
      {...props}
    />
  );
}
