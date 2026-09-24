"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { shortenUsername } from "@/lib/format-username";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/posts";

const categoryLinks = CATEGORIES.map((category) => ({
  href: `/categories/${CATEGORY_SLUGS[category]}`,
  label: category,
}));

const aboutLink = { href: "/about", label: "About" };

type SessionUser = {
  email: string | null;
  displayName: string;
  /** Shortened for the fixed-width account box. */
  username: string;
};

function toSessionUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): SessionUser {
  const email = user.email ?? null;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email ??
    "Member";

  return {
    email,
    displayName: name,
    username: shortenUsername(name),
  };
}

/**
 * Reads the session in the browser instead of the root layout. Calling
 * `cookies()` in a layout forces every route to render dynamically, which would
 * give up static prerendering for the whole site just to label the nav.
 */
function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) setUser(toSessionUser(data.user));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toSessionUser(session.user) : null);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return user;
}

export function SiteHeader() {
  const pathname = usePathname();
  const user = useSessionUser();
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
          {categoryLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-brutal-thin block px-4 py-1.5 font-display text-base font-bold brutal-press ${
                    active ? "bg-accent text-on-accent" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={aboutLink.href}
              aria-current={pathname === aboutLink.href ? "page" : undefined}
              className={`border-brutal-thin block px-4 py-1.5 font-display text-base font-bold brutal-press ${
                pathname === aboutLink.href ? "bg-accent text-on-accent" : ""
              }`}
            >
              {aboutLink.label}
            </Link>
          </li>
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
          {categoryLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closePanel}
                  aria-current={active ? "page" : undefined}
                  className={`border-brutal-thin block w-full px-4 py-2.5 font-display text-base font-bold brutal-press ${
                    active ? "bg-accent text-on-accent" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={aboutLink.href}
              onClick={closePanel}
              aria-current={pathname === aboutLink.href ? "page" : undefined}
              className={`border-brutal-thin block w-full px-4 py-2.5 font-display text-base font-bold brutal-press ${
                pathname === aboutLink.href ? "bg-accent text-on-accent" : ""
              }`}
            >
              {aboutLink.label}
            </Link>
          </li>
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
 * Signed-in state for the nav: one compact box with the username and a sign
 * out button. A plain form POST to /auth/signout keeps sign-out working
 * without an extra client component.
 */
function AccountMenu({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate: () => void;
}) {
  const onSettings = usePathname() === "/settings";

  return (
    <div className="border-brutal-thin flex items-center gap-2 bg-canvas px-2 py-1.5">
      <Link
        href="/settings"
        onClick={onNavigate}
        title={user.displayName}
        aria-current={onSettings ? "page" : undefined}
        className="max-w-[6rem] truncate font-display text-sm font-bold underline-offset-4 brutal-fade hover:underline"
      >
        {user.username}
      </Link>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          onClick={onNavigate}
          className="border-brutal-thin px-2 py-0.5 font-display text-xs font-bold brutal-fade"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
