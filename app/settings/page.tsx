import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark, Sparkles } from "lucide-react";
import { ComingSoonCard } from "@/components/settings/coming-soon-card";
import { UsernameForm } from "@/components/settings/username-form";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6 sm:space-y-8">
        <header className="space-y-2 border-b-brutal pb-6">
          <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
            Account
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Settings
          </h1>
          <p className="font-mono text-xs leading-relaxed sm:text-sm">
            Signed in as {user.email ?? "your account"}.
          </p>
        </header>

        <section className="border-brutal bg-canvas p-4 shadow-brutal-sm sm:p-6">
          <h2 className="mb-4 font-display text-lg font-bold sm:text-xl">
            Profile
          </h2>
          <UsernameForm initialName={displayNameOf(user)} />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold sm:text-xl">
            Upcoming
          </h2>

          <ComingSoonCard
            icon={Sparkles}
            title="Subscription"
            description="Support the laboratory and unlock early access to new collections and higher-resolution downloads."
          />

          <ComingSoonCard
            icon={Bookmark}
            title="Bookmarks"
            description="Save posts to a private collection so the prompts and references you like are easy to find again."
          />
        </section>
      </div>
    </main>
  );
}
