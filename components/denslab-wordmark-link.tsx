import Link from "next/link";

import { cn } from "@/lib/utils";

export type DenslabWordmarkLinkProps = {
  className?: string;
};

/**
 * The header wordmark: a plain text logo that links home. No button chrome —
 * no background, no pill radius, no padding. The text sits directly on the
 * navbar surface and is sized as a wordmark, not a control.
 *
 * Deliberately static. This used to be one <span> per letter, driven by
 * `.denslab-wordmark-group` / `.denslab-wordmark-letter` rules in
 * app/globals.css that applied a staggered rotateX/rotateY hover flip (7
 * letters, 45ms apart, 200ms each). Deny: "hapus total — teks tanpa animasi
 * apapun", so the per-letter markup, the `[perspective:420px]` wrapper, the
 * custom-property delays, and the matching CSS block are all gone. Nothing
 * replaced them: the anchor carries the text as a single text node.
 *
 * The accessible name is the visible word itself, so no `aria-label` is needed
 * — and the letters are no longer split into separate elements that a screen
 * reader would spell out one by one.
 */
export function DenslabWordmarkLink({ className }: DenslabWordmarkLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center",
        "text-xl leading-none font-semibold tracking-tight",
        "text-foreground transition-opacity hover:opacity-80",
        className,
      )}
    >
      denslab.
    </Link>
  );
}
