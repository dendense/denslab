"use client";

import { Bookmark, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { shortenUsername } from "@/lib/format-username";

const aboutLink = { href: "/about", label: "About" };

/** One nav entry for browsing; the picker lives on the category page itself. */
const categoryLink = { href: "/categories", label: "Category" };

type SessionUser = {
  id: string;
  email: string | null;
  displayName: string;
  /** Shortened for the fixed-width account box. */
  username: string;
  isAdmin: boolean;
};

function toSessionUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Omit<SessionUser, "isAdmin"> {
  const email = user.email ?? null;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email ??
    "Member";

  return {
    id: user.id,
    email,
    displayName: name,
    username: shortenUsername(name),
  };
}

/**
 * Reads the session in the browser instead of the root layout. Calling
 * `cookies()` in a layout forces every route to render dynamically, which would
 * give up static prerendering for the whole site just to label the nav.
 *
 * The admin flag comes from `profiles.role`, not from user metadata, so it
 * reflects the database rather than a claim the client could edit. The nav link
 * is only a convenience; /admin re-checks the role server-side.
 */
function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase!.auth.getUser();

      if (!active || !authUser) {
        if (active) setUser(null);
        return;
      }

      const { data: profile } = await supabase!
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!active) return;

      setUser({
        ...toSessionUser(authUser),
        isAdmin: profile?.role === "admin",
      });
    }

    load();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event) => {
        // Re-run on sign-in, sign-out, and token refresh so the admin link
        // does not linger after the session changes.
        if (event === "SIGNED_OUT") setUser(null);
        else load();
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
          <li>
            <Link
              href={categoryLink.href}
              aria-current={
                pathname.startsWith(categoryLink.href) ? "page" : undefined
              }
              className={`border-brutal-thin block px-4 py-1.5 font-display text-base font-bold brutal-press ${
                pathname.startsWith(categoryLink.href)
                  ? "bg-accent text-on-accent"
                  : ""
              }`}
            >
              {categoryLink.label}
            </Link>
          </li>
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
          {user && (
            <li>
              <Link
                href="/bookmarks"
                aria-current={pathname === "/bookmarks" ? "page" : undefined}
                className={`border-brutal-thin flex items-center gap-1.5 px-4 py-1.5 font-display text-base font-bold brutal-press ${
                  pathname === "/bookmarks" ? "bg-accent text-on-accent" : ""
                }`}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Saved
              </Link>
            </li>
          )}
          {user?.isAdmin && (
            <li>
              <Link
                href="/admin"
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                className={`border-brutal-thin flex items-center gap-1.5 px-4 py-1.5 font-display text-base font-bold brutal-press ${
                  pathname.startsWith("/admin") ? "bg-accent text-on-accent" : ""
                }`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Admin
              </Link>
            </li>
          )}
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
          <li>
            <Link
              href={categoryLink.href}
              onClick={closePanel}
              aria-current={
                pathname.startsWith(categoryLink.href) ? "page" : undefined
              }
              className={`border-brutal-thin block w-full px-4 py-2.5 font-display text-base font-bold brutal-press ${
                pathname.startsWith(categoryLink.href)
                  ? "bg-accent text-on-accent"
                  : ""
              }`}
            >
              {categoryLink.label}
            </Link>
          </li>
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
          {user && (
            <li>
              <Link
                href="/bookmarks"
                onClick={closePanel}
                aria-current={pathname === "/bookmarks" ? "page" : undefined}
                className={`border-brutal-thin flex w-full items-center gap-2 px-4 py-2.5 font-display text-base font-bold brutal-press ${
                  pathname === "/bookmarks" ? "bg-accent text-on-accent" : ""
                }`}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Saved
              </Link>
            </li>
          )}
          {user?.isAdmin && (
            <li>
              <Link
                href="/admin"
                onClick={closePanel}
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                className={`border-brutal-thin flex w-full items-center gap-2 px-4 py-2.5 font-display text-base font-bold brutal-press ${
                  pathname.startsWith("/admin") ? "bg-accent text-on-accent" : ""
                }`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Admin
              </Link>
            </li>
          )}
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
