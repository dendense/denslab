"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Scroll distance (px) after which the button appears. */
const SHOW_AFTER = 600;

/**
 * Floating "back to top" control. Long galleries on a phone otherwise need a
 * long thumb-scroll to reach the nav and search again.
 *
 * Sits bottom-right, lifted by the iOS home-indicator inset so a gesture bar
 * never covers it. Hidden from the tab order and the accessibility tree while
 * invisible, and the smooth scroll falls back to instant for reduced motion.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <Button
      type="button"
      size="icon"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 h-11 w-11 shadow-md transition-[opacity,transform] duration-200 sm:right-6 motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
