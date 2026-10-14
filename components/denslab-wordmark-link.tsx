import Link from "next/link";

import { cn } from "@/lib/utils";

/** Display order; the tail `.` is decoration, not a flip target. */
const LETTERS = ["d", "e", "n", "s", "l", "a", "b"];
const STAGGER_MS = 45;
/** 7 letters x 45ms = 270ms until the last letter starts moving. */
const STAGGER_TOTAL_MS = LETTERS.length * STAGGER_MS;

/** Delay for letter `i` going in: 0, 45, 90 … ms. */
const delayIn = (i: number) => `${i * STAGGER_MS}ms`;
/** Delay for letter `i` coming back, reversed: 270, 225, 180 … ms. */
const delayOut = (i: number) => `${STAGGER_TOTAL_MS - i * STAGGER_MS}ms`;

export type DenslabWordmarkLinkProps = {
  className?: string;
};

/**
 * The header wordmark: a plain text logo that links home, with a per-letter flip
 * on hover. No button chrome — no background, no pill radius, no padding. The
 * text sits directly on the navbar surface and is sized as a wordmark, not a
 * control.
 *
 * The flip rules live in app/globals.css, keyed off `.denslab-wordmark-group` and
 * `.denslab-wordmark-letter`. They are plain CSS because Tailwind v4 emits no
 * rule at all for `transition-delay-[var(--x)]` — verified against the built
 * bundle, which contained zero `transition-delay` rules — so the stagger cannot
 * be expressed as a utility.
 *
 * Each letter carries its own incoming and outgoing delay. The outgoing value is
 * what a naive `inline` transitionDelay would have to be, and an inline
 * declaration would beat the `:hover` rule in the stylesheet regardless of
 * specificity; routing both through custom properties is what lets hover swap
 * them and reverse the sequence on the way out.
 *
 * Reduced motion is handled by the `@media (prefers-reduced-motion: reduce)` rule
 * for `.denslab-wordmark-letter` in app/globals.css, which collapses the duration.
 * The flip is a plain transition with no `@keyframes`, so the letters snap into
 * place with no animation: static text.
 *
 * Accessible name: splitting the word into <span>s would make a screen reader
 * spell "d e n s l a b", so the <a> carries `aria-label` and the letter wrapper is
 * `aria-hidden`. The word is announced once, as a word.
 */
export function DenslabWordmarkLink({ className }: DenslabWordmarkLinkProps) {
  return (
    <Link
      href="/"
      aria-label="denslab — home"
      className={cn(
        "denslab-wordmark-group inline-flex items-center",
        "text-xl leading-none font-semibold tracking-tight",
        "text-foreground transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex [perspective:420px]">
        {LETTERS.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="denslab-wordmark-letter"
            style={
              {
                "--denslab-delay-in": delayIn(index),
                "--denslab-delay-out": delayOut(index),
              } as React.CSSProperties
            }
          >
            {letter}
          </span>
        ))}
        {/* Decorative period: part of the wordmark, not a flip target. */}
        <span>.</span>
      </span>
    </Link>
  );
}
