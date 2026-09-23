"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Gallery" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // Panel closes on navigation without an effect: state records which path the
  // panel was opened on, and a different pathname renders it closed.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  function togglePanel() {
    setOpenedOn(open ? null : pathname);
  }

  function closePanel() {
    setOpenedOn(null);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenedOn(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-brutal bg-canvas">
      <nav
        aria-label="Main navigation"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10"
      >
        <Link
          href="/"
          className="border-brutal bg-accent px-3 py-1 font-display text-lg font-bold tracking-tight text-on-accent shadow-brutal-sm brutal-press sm:text-xl"
        >
          denslab.
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-2 md:flex lg:gap-3">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-brutal-thin block px-4 py-1.5 font-display text-base font-bold brutal-press"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/login"
              className="border-brutal-thin block bg-accent px-4 py-1.5 font-display text-base font-bold text-on-accent brutal-press"
            >
              Login
            </Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile trigger. Theme toggle stays reachable without opening the menu. */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={togglePanel}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            className="border-brutal-thin flex h-9 w-9 items-center justify-center bg-canvas text-ink brutal-press sm:h-10 sm:w-10"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Collapsible panel: shows only below `md`. */}
      <div
        id="mobile-nav-panel"
        hidden={!open}
        className="border-t-brutal bg-canvas md:hidden"
      >
        <ul className="flex flex-col gap-2 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closePanel}
                className="border-brutal-thin block w-full px-4 py-2.5 font-display text-base font-bold brutal-press"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/login"
              onClick={closePanel}
              className="border-brutal-thin block w-full bg-accent px-4 py-2.5 font-display text-base font-bold text-on-accent brutal-press"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
