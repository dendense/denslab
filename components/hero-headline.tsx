/*
 * Hero headline: the final word types itself in, then a caret blinks.
 *
 * Server and client render the SAME markup, always, with the full sentence in
 * the DOM. The whole effect is CSS: no state, no `useEffect`, no timer, and
 * therefore no hydration mismatch and no React re-render per character. Screen
 * readers and crawlers see the complete sentence on first paint. CSS animations
 * restart on every page load by themselves, which is exactly the "every reload"
 * behaviour that was asked for — no `sessionStorage`, no JS at all.
 *
 * Structure, and why it is shaped this way:
 *
 *   span.denslab-hero-wrap        relative, inline-block — sizes to the full
 *     span.denslab-hero-type        the word; clip-path reveals it left to right
 *     span.denslab-hero-caret       absolute, aria-hidden — the blinking caret
 *
 * 1. `inline-block` on the WRAPPER is what buys zero layout shift. Its
 *    intrinsic width is the width of the complete word from the very first
 *    frame, so the line box is final before the animation starts and only the
 *    visible slice changes.
 * 2. The caret is `position: absolute`, so it occupies no inline space and
 *    cannot widen the line. That matters because the word sits at a line end:
 *    an in-flow caret would push it onto the next line. Because `clip-path` on
 *    the word would also clip a nested caret, the caret is a SIBLING of the
 *    clipped span, not a child of it.
 * 3. The caret is `aria-hidden="true"` — it is pure decoration, and a screen
 *    reader announcing it would be noise.
 */
export function HeroHeadline() {
  return (
    <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
      Visual stories from the edge of reality &amp;{" "}
      <span className="denslab-hero-wrap">
        <span className="denslab-hero-type">imagination.</span>
        <span className="denslab-hero-caret" aria-hidden="true" />
      </span>
    </h1>
  );
}
