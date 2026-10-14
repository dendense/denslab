/**
 * Frosted-glass surface preset. The CSS in globals.css picks the background,
 * blur, and saturate off this attribute, so switching between solid / frosted /
 * frosted-thin is editing this one string — the navbar and the footer both read
 * it, and neither carries blur utilities of its own.
 *
 * Keep in sync with the `[data-surface="..."]` blocks in globals.css.
 */
export const navSurface = "frosted";

/**
 * Borderless frosted footer. Separation comes from the blur plus the full-bleed
 * gradient wash, not a border: a hairline reads as "cut here" once the surface
 * behind it is translucent. The footer is static (not fixed), so its blur costs
 * far less than the navbar's, which re-paints while it slides.
 */
export function SiteFooter() {
  return (
    <footer data-surface={navSurface} className="mt-auto shadow-sm">
      {/* Full-bleed wash. The surface is borderless and translucent, so this is
          what keeps the text legible when bright content passes underneath. */}
      <div
        aria-hidden="true"
        className="bg-gradient-to-b from-transparent to-black/5 dark:to-black/30"
      >
        {/* `text-muted-foreground` was the original footer tone; it is now
            `text-foreground/80` for the same reason as the navbar links — the
            surface behind it is translucent, so the muted token loses the
            4.5:1 floor against bright content. Same shadcn token, no new hex. */}
        <div className="text-foreground/80 flex w-full flex-col items-center justify-between gap-2 px-4 py-6 text-center text-sm sm:flex-row sm:gap-3 sm:px-6 sm:text-left lg:px-10">
          <p className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            denslab.
            <span className="text-xs">AI &amp; conceptual photography lab.</span>
          </p>

          <p className="text-xs">© {new Date().getFullYear()} denslab</p>
        </div>
      </div>
    </footer>
  );
}
