"use client";

import { Bookmark, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { shortenUsername } from "@/lib/format-username";
import { useEffect } from "react";

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

/** Nav item shared by the desktop row and the mobile drawer. */
const navLink = "border-brutal-thin font-display text-base font-bold";

export function SiteHeader() {
  const pathname = usePathname();
  const user = useSessionUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = (
    <>
      <li>
        <Link
          href={categoryLink.href}
          aria-current={pathname.startsWith(categoryLink.href) ? "page" : undefined}
          className={`${navLink} block px-4 py-1.5 brutal-press ${
            pathname.startsWith(categoryLink.href) ? "bg-accent text-on-accent" : ""
          }`}
        >
          {categoryLink.label}
        </Link>
      </li>
      <li>
        <Link
          href={aboutLink.href}
          aria-current={pathname === aboutLink.href ? "page" : undefined}
          className={`${navLink} block px-4 py-1.5 brutal-press ${
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
            className={`${navLink} flex items-center gap-1.5 px-4 py-1.5 brutal-press ${
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
            className={`${navLink} flex items-center gap-1.5 px-4 py-1.5 brutal-press ${
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
          <AccountMenu user={user} />
        ) : (
          <Button
            asChild
            className="border-brutal-thin h-auto rounded-none bg-accent px-4 py-1.5 font-display text-base font-bold text-on-accent shadow-none brutal-press hover:bg-accent"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </li>
      {/* The mobile drawer already carries its own toggle in the trigger row,
          so this one is desktop-only to avoid rendering two. */}
      <li className="hidden md:block">
        <ThemeToggle />
      </li>
    </>
  );

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
        <ul className="hidden items-center gap-2 md:flex lg:gap-3">{items}</ul>

        {/* Mobile trigger. Theme toggle stays reachable without opening the menu. */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="border-brutal-thin h-9 w-9 rounded-none bg-canvas text-ink shadow-none brutal-press hover:bg-canvas sm:h-10 sm:w-10"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="border-l-brutal w-72 bg-canvas text-ink sm:max-w-xs"
            >
              <SheetHeader className="border-b-brutal">
                <SheetTitle className="font-display text-base font-bold uppercase tracking-wide">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <ul
                className="flex flex-col gap-2 px-4 pb-4"
                onClick={() => setMobileOpen(false)}
              >
                {items}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

/**
 * Signed-in state for the nav: one compact box with the username and a sign
 * out button. A plain form POST to /auth/signout keeps sign-out working
 * without an extra client component.
 */
function AccountMenu({ user }: { user: SessionUser }) {
  const onSettings = usePathname() === "/settings";

  return (
    <div className="border-brutal-thin flex items-center gap-2 bg-canvas px-2 py-1.5">
      <Link
        href="/settings"
        title={user.displayName}
        aria-current={onSettings ? "page" : undefined}
        className="max-w-[6rem] truncate font-display text-sm font-bold underline-offset-4 brutal-fade hover:underline"
      >
        {user.username}
      </Link>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="border-brutal-thin px-2 py-0.5 font-display text-xs font-bold brutal-fade"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
