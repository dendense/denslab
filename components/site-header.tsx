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

type SessionUser = {
  email: string | null;
  displayName: string;
  initial: string;
};

export function SiteHeader({ user = null }: { user?: SessionUser | null }) {
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
            {user ? (
              <AccountMenu user={user} onNavigate={closePanel} />
            ) : (
              <Link
                href="/login"
                className="border-brutal-thin block bg-accent px-4 py-1.5 font-display text-base font-bold text-on-accent brutal-press"
              >
                Login
              </Link>
            )}
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
            {user ? (
              <AccountMenu user={user} onNavigate={closePanel} />
            ) : (
              <Link
                href="/login"
                onClick={closePanel}
                className="border-brutal-thin block w-full bg-accent px-4 py-2.5 font-display text-base font-bold text-on-accent brutal-press"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}

/**
 * Signed-in state for the nav. A plain form POST to /auth/signout keeps
 * sign-out working without an extra client component.
 */
function AccountMenu({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate: () => void;
}) {
  return (
    <div className="border-brutal-thin flex items-center gap-2 px-2 py-1">
      <span
        aria-hidden="true"
        title={user.email ?? undefined}
        className="flex h-6 w-6 items-center justify-center bg-accent font-display text-xs font-bold text-on-accent"
      >
        {user.initial}
      </span>
      <span className="max-w-[8rem] truncate font-mono text-xs">
        {user.displayName}
      </span>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          onClick={onNavigate}
          className="border-brutal-thin px-2 py-0.5 font-display text-xs font-bold brutal-press"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
