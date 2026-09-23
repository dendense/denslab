import type { ComponentProps } from "react";

/**
 * Neobrutalist category pill: accent fill, hard border, no rounding.
 */
export function Badge({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      className={`border-brutal-thin inline-flex items-center gap-1 bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px] ${className}`}
      {...props}
    />
  );
}
