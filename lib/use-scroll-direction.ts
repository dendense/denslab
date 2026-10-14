"use client";

import { useEffect, useState } from "react";

/** Pixels scrolled before the header reacts at all — absorbs micro-scroll jitter. */
const REACT_THRESHOLD = 10;

/** Distance from the top where the header is pinned visible regardless of direction. */
const ALWAYS_VISIBLE_TOP = 100;

/**
 * Floating-navbar visibility, derived from scroll direction.
 *
 * - within {@link ALWAYS_VISIBLE_TOP}px of the top → always shown
 * - scrolling down → hidden (only after {@link REACT_THRESHOLD}px of movement)
 * - scrolling up → shown
 * - `prefers-reduced-motion: reduce` → never hides, never animates
 *
 * Reads are throttled with `requestAnimationFrame` and the listener is passive,
 * so scroll stays off the main-thread layout path. Listener and any pending
 * frame are removed on unmount.
 */
export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;

      if (y <= ALWAYS_VISIBLE_TOP) {
        setHidden(false);
      } else if (Math.abs(delta) >= REACT_THRESHOLD) {
        // Reacting to a full threshold step keeps sub-10px jitter inert, so the
        // header cannot flicker on trackpad momentum.
        setHidden(delta > 0);
      }

      // Remember the last reacted position only when we actually move: for the
      // pinned-top branch this resets the baseline, which is what we want.
      lastY = y;
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    function applyMotionPreference() {
      if (motionQuery.matches) {
        setHidden(false);
        window.removeEventListener("scroll", onScroll);
      } else {
        lastY = window.scrollY;
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    }

    applyMotionPreference();
    motionQuery.addEventListener("change", applyMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", applyMotionPreference);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}
