"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "denslab-theme";

type Theme = "light" | "dark";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === "dark" ? "light" : "dark";

    // `color-scheme` follows the attribute in globals.css, so no inline style.
    root.dataset.theme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage can be unavailable (private mode, blocked storage).
    }
  }

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={theme === "dark"}
      className="border-brutal-thin flex h-9 w-9 items-center justify-center bg-accent text-on-accent outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-ink brutal-press sm:h-10 sm:w-10"
    >
      <Sun className="h-4 w-4 dark:hidden sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      <Moon
        className="hidden h-4 w-4 dark:block sm:h-[18px] sm:w-[18px]"
        aria-hidden="true"
      />
    </button>
  );
}
