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
 * replaced them: the anchor carries the text as a single text node. Keep it
 * that way — the `aria-label` below is the only attribute this anchor needs.
 *
 * The accessible name is set explicitly with `aria-label` rather than left to
 * the visible text. The visible text is `denslab.` — trailing period included —
 * which a screen reader may announce as "denslab period", and a period-free
 * "denslab" is a single word that some readers spell out letter by letter. An
 * explicit label removes that guesswork. Deny: "Pakai aria-label — kembali ke
 * `denslab — home`".
 *
 * The label is an em dash (U+2014) between the two words, matching the visual
 * voice of the rest of the site.
 *
 * WCAG 2.5.3 "Label in Name": the accessible name must contain the visible
 * text. This label satisfies it. The label-in-name algorithm (W3C ACT rule
 * 2ee8b8) replaces every character that is not a letter or digit — terminal
 * punctuation included — with a space, then case-folds and compares words. So
 * the visible `denslab.` tokenizes to ["denslab"] and the accessible name
 * `denslab — home` tokenizes to ["denslab", "home"]; the former is a subset of
 * the latter. The trailing period is discarded by the algorithm, so the name
 * contains the visible text. No trade-off, no exception.
 */
export function DenslabWordmarkLink({ className }: DenslabWordmarkLinkProps) {
  return (
    <Link
      href="/"
      aria-label="denslab — home"
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
