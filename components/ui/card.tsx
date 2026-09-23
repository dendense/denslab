import type { ComponentProps } from "react";

/**
 * Static card shell. Deliberately has no hover lift: `.kilo/grid.md` requires
 * the card position to stay fixed on hover.
 */
export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`border-brutal bg-canvas shadow-brutal-sm ${className}`}
      {...props}
    />
  );
}
