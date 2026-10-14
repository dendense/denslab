"use client";

import { Bookmark, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DenslabWordmarkLink } from "@/components/denslab-wordmark-link";
import { navSurface } from "@/components/site-footer";
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
import { useScrollDirection } from "@/lib/use-scroll-direction";
import { cn } from "@/lib/utils";
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
/*
 * h-11 gives every nav link a 44px touch target (WCAG 2.5.8 AAA). The height
 * lives on the row, not on the text, so all links stay exactly level with the
 * buttons next to them.
 */
const navLink = "flex h-11 items-center text-sm font-medium";

/*
 * One nav entry. Active state is driven by the same `aria-current="page"` flag
 * the links already carried, so this is styling only — no new "which page am I
 * on" logic.
 *
 * Inactive entries are de-emphasised with a dimmed foreground rather than
 * `text-muted-foreground`. Reason: the bar is now a translucent frosted surface
 * over page content, and the muted token (#52525b / #a1a1aa) drops below the
 * 4.5:1 floor as soon as a bright image passes behind it (measured 3.52:1 light,
 * 3.00:1 dark at the old surface opacity). `text-foreground/80` is the same
 * shadcn token at 80% opacity, so no new hex enters the palette, and it keeps
 * the active/inactive distinction that the muted token was there to provide.
 * Hover still resolves to full `text-foreground` plus the accent background.
 */
function NavItem({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          navLink,
          "rounded-md px-4 transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
          className,
        )}
      >
        {children}
      </Link>
    </li>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const user = useSessionUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hidden = useScrollDirection();

  const items = (
    <>
      <NavItem
        href={categoryLink.href}
        active={pathname.startsWith(categoryLink.href)}
      >
        {categoryLink.label}
      </NavItem>
      <NavItem href={aboutLink.href} active={pathname === aboutLink.href}>
        {aboutLink.label}
      </NavItem>
      {user && (
        <NavItem href="/bookmarks" active={pathname === "/bookmarks"} className="gap-1.5">
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Saved
        </NavItem>
      )}
      {user?.isAdmin && (
        <NavItem href="/admin" active={pathname.startsWith("/admin")} className="gap-1.5">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Admin
        </NavItem>
      )}
      <li>
        {user ? (
          <AccountMenu user={user} />
        ) : (
          /* h-11/px-5 mirrors the nav-link and icon-button height so nothing in
             the row is a different size (Deny: one 44px control next to a 36px
             one reads as broken). WCAG 2.5.8 target size, AAA. */
          <Button asChild size="sm" className="h-11 px-5">
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

  /*
   * Floating navbar. `fixed` takes it out of the flow, so the spacer below
   * replaces the height it used to occupy — that is what keeps the page content
   * from shifting when the header slides away (`translate` never affects layout).
   * Spacer height mirrors the nav box exactly: gap (py-2/py-3) x2 + nav height.
   * z-40 keeps it under the z-50 Sheet/Dialog/Dropdown overlays; the inner box
   * must not create a stacking context (no z, no transform) or the header's own
   * translate would be trapped inside it and the Sheet would slide under the bar.
   */
  return (
    <>
      {/*
        Spacer height = header padding-top + nav box height (measured, not
        guessed): nav is h-11 (44px) + py-2 (16px) = 60px with no border. Header
        adds py-2 (8px) below 640px and py-3 (12px) from 640px up, so the
        reserved space is 68px / 72px. The old 70/74 still counted the 2px
        border the surface no longer has; leaving them would have shifted the
        page 2px down. Keep in sync if the nav box changes size or the content
        jumps by the difference when the bar slides away.
      */}
      <div
        aria-hidden="true"
        className="h-[68px] sm:h-[72px]"
      />
      <header
        className={`fixed inset-x-0 top-0 z-40 px-2 py-2 sm:px-4 sm:py-3 ${
          hidden ? "-translate-y-[150%]" : "translate-y-0"
        } focus-within:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none transition-transform duration-300 ease-out`}
      >
        <nav
          aria-label="Main navigation"
          data-surface={navSurface}
          className="relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 shadow-sm sm:px-4 lg:px-8"
        >
          {/* Gradient wash behind the translucent surface. The nav sits over
              page content, so this is what guarantees the labels stay readable
              when a bright image passes under it — same trade as
              shadcn/Radix's navigation-menu. `pointer-events-none` keeps it out
              of the way of the links above it. */}
          <div
            aria-hidden="true"
            className="bg-gradient-to-b from-transparent to-black/5 dark:to-black/30 pointer-events-none absolute inset-0 rounded-xl"
          />
          <DenslabWordmarkLink />

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
                  className="h-11 w-11"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
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
    </>
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
    <div className="flex items-center gap-2">
      <Link
        href="/settings"
        title={user.displayName}
        aria-current={onSettings ? "page" : undefined}
        className="flex h-11 max-w-[6rem] items-center truncate text-sm font-medium underline-offset-4 hover:underline"
      >
        {user.username}
      </Link>

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm" className="h-11 px-4">
          Sign out
        </Button>
      </form>
    </div>
  );
}
