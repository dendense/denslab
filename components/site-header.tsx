"use client";

import { Bookmark, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DenslabWordmarkLink } from "@/components/denslab-wordmark-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { shortenUsername } from "@/lib/format-username";
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
      {/*
       * Portfolio is an outbound link (Deny will point it at another site
       * later), so it is a plain <a> — not next/link's <Link>, which is for
       * in-app navigation and would prefetch a route that does not exist.
       * href="#" is a deliberate placeholder until Deny supplies the real URL.
       * rel="noopener noreferrer" pairs with target="_blank" so the opened
       * page cannot reach back through window.opener.
       *
       * Class list is copied verbatim from NavItem's inactive branch rather
       * than reusing NavItem itself, because NavItem only renders <Link>.
       * Same h-11 row height, so the bar does not grow.
       */}
      <li>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            navLink,
            "rounded-md px-4 transition-colors",
            "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
          )}
        >
          Portfolio
        </a>
      </li>
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
   * Full-bleed bar, in normal document flow (`static`).
   *
   * Was `fixed` + `translateY` auto-hide: that took the bar out of the flow and
   * forced a spacer div to reserve its height (Deny: "jangan jadikan floating").
   * `static` is the literal reading of "not floating": the bar occupies its own
   * space in the document, so no spacer and no compensation math. Nothing can
   * slide it away any more, so the translate classes, the transition, and
   * `useScrollDirection` are gone with it.
   *
   * No `sticky` either: the bar is a plain block at the top of the document and
   * Deny did not ask for it to remain pinned while scrolling.
   *
   * No container: the old `px-2 py-2 sm:px-4 sm:py-3` on this element was what
   * made the bar read as a floating card (inset 8/16px from the sides, 8/12px
   * from the top), and the previous `rounded-xl shadow-sm` sat on top of that.
   * Dropping the radius and shadow but keeping that padding would still have
   * left a detached box, so the padding goes too — the bar now sits flush.
   * `py-2 sm:py-3` stays because that is vertical breathing room *inside* the
   * bar, not a gap to the viewport edge.
   *
   * `bg-background` is the separator now that the frosted surface is gone: the
   * bar is opaque and page-coloured, so what separates it from the content is a
   * `border-b border-border` hairline. Without it the nav and `<main>` would be
   * the same colour with no seam (the old gradient wash only existed to keep a
   * translucent surface readable and is meaningless over an opaque one).
   * z-40 stays: the Sheet still has to slide over the bar.
   */
  return (
    <header className="z-40 border-b border-border bg-background py-2 sm:py-3">
      <nav
        aria-label="Main navigation"
        className="relative flex w-full items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-10"
      >
          <DenslabWordmarkLink />

          {/* Desktop navigation */}
          <ul className="hidden items-center gap-2 md:flex lg:gap-3">{items}</ul>

          {/* Mobile trigger. Theme toggle stays reachable without opening the menu. */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                {/* Mobile menu trigger. `default` is the nearest fit: the
                    trigger sits beside `ThemeToggle` with no other filled
                    control, so `ghost` would leave a bare glyph. Size stays
                    `h-11 w-11` (44x44, WCAG 2.5.8), label stays, and
                    `rounded-none` comes from the Button base. Only this trigger
                    changes; Login/Donate/ThemeToggle/Search keep their own. */}
                <Button
                  variant="default"
                  size="icon"
                  className="h-11 w-11"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>

              {/*
                Fullscreen SOLID menu (Deny: "fullscreen warna solid, nol blur").

                Everything here is call-site `className` — `components/ui/sheet.tsx`
                is shared and is NOT modified. `cn()` in that file is tailwind-merge,
                so the later call-site classes win their groups over the `side`
                variant's `inset-y-0 right-0 h-full w-3/4 sm:max-w-sm` and
                `border-l`:
                  - `inset-0` beats `inset-y-0` + `right-0` (parent group wins)
                  - `w-full` beats `w-3/4`, `max-w-none` beats `sm:max-w-sm`
                  - `border-0` beats `border-l`
                The panel keeps `bg-background` from sheetVariants, which IS the
                solid palette token — hence `backdrop-filter` is never set here
                and never needed.

                `p-0` drops the variant's `p-6` so `flex flex-col` can own the
                layout: header / scrollable items / close button pinned to the
                bottom. `[&>[data-sheet-close]]:hidden` removes the stock
                top-right X that sheet.tsx renders as its first child — the
                close control Deny asked for is a labelled button at the bottom
                instead. See the report: the hidden node is `display:none`, so it
                is not focusable and there is exactly ONE reachable close button.
              */}
              <SheetContent
                side="right"
                className="inset-0 flex h-full w-full max-w-none flex-col gap-0 border-0 p-0 sm:max-w-none [&>[data-sheet-close]]:hidden"
              >
                <SheetHeader className="px-6 pt-6 pb-2 text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                {/* `min-h-0` + `overflow-y-auto` is what keeps the close button
                    reachable on a short screen (320x568): the list scrolls, the
                    footer does not. */}
                <ul
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
                  onClick={() => setMobileOpen(false)}
                >
                  {items}
                  {/* The shared `items` marks ThemeToggle `hidden md:block` to
                      stop the *header* row rendering two toggles, which also
                      removed it from this drawer (a <768px drawer showed no
                      toggle at all). Deny wants it in the menu, so the drawer
                      carries its own row. */}
                  <li className="px-4 py-1">
                    <ThemeToggle />
                  </li>
                </ul>

                {/* Close control, moved from the top-right X to the bottom.
                    Background is the sheet's own `bg-background` (Deny: "warna
                    latar sama dengan menu solid") — `ghost` adds no fill, so the
                    button is exactly the menu colour and only the label is drawn.
                    Label is `--foreground`, measured 15.19:1 light / 16.75:1 dark
                    against `--background`, well clear of the 4.5:1 text floor.

                    Extra spacing (Deny asked for "sedikit tambahan jarak"):
                    `pb-[calc(1.5rem+env(safe-area-inset-bottom))]` = 24px + the
                    iPhone home-indicator inset. 24px rather than the 16px (`pb-4`)
                    used elsewhere so the button does not sit flush against the
                    bottom edge, and the `env()` term is what keeps it from being
                    covered by the gesture bar on a notched iPhone. The `pt-4` puts
                    16px between the divider and the button. */}
                <div className="border-t border-border px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="h-11 w-full justify-center px-4"
                    >
                      Close
                    </Button>
                  </SheetClose>
                </div>
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
