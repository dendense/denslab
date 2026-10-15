import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Sparkles } from "lucide-react";
import { ComingSoonCard } from "@/components/settings/coming-soon-card";
import { UsernameForm } from "@/components/settings/username-form";
import { countBookmarks } from "@/lib/bookmarks";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your denslab account.",
};

/**
 * Reads the session, so this route renders per request rather than being
 * prerendered as a signed-out shell.
 */
export const dynamic = "force-dynamic";

function displayNameOf(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  return (
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.email ?? "").split("@")[0] ??
    ""
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();

  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const bookmarkCount = await countBookmarks();

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6 sm:space-y-8">
        <header className="space-y-2 border-b border-border pb-6">
          <Badge>Account</Badge>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl font-mono">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email ?? "your account"}.
          </p>
        </header>

        <section className="bg-card text-card-foreground rounded-xl border p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl font-mono">
            Profile
          </h2>
          <UsernameForm initialName={displayNameOf(user)} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold sm:text-xl font-mono">
            Upcoming
          </h2>

          <ComingSoonCard
            icon={Sparkles}
            title="Subscription"
            description="Support the laboratory and unlock early access to new collections and higher-resolution downloads."
          />

          <section className="bg-card text-card-foreground rounded-xl border p-6">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
              >
                <Bookmark className="h-4 w-4" />
              </span>

              <div className="min-w-0 space-y-1.5">
                <h3 className="text-lg font-semibold font-mono">
                  Bookmarks
                </h3>
                <p className="text-muted-foreground text-sm">
                  {bookmarkCount === 0
                    ? "You have not saved any posts yet."
                    : `${bookmarkCount} ${bookmarkCount === 1 ? "post" : "posts"} saved privately.`}
                </p>

                <Button asChild size="sm" className="mt-2">
                  <Link href="/bookmarks">Open bookmarks</Link>
                </Button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
