import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_NEXT, safeNextPath } from "@/lib/safe-next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to denslab with your Google account.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const supabase = await createClient();

  // Where to send the reader after signing in: back to the post they came
  // from when the detail page passed a valid `?next=`, home otherwise.
  const { next } = await searchParams;
  const safeNext = safeNextPath(next);

  // Already signed in: no reason to show the login screen again.
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect(safeNext);
  }

  return (
    <main className="w-full flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link
          href={safeNext}
          className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {/*
            The label tracks the destination: with a `next` the reader returns
            to the post they were reading, and "Back to gallery" would be a
            lie. `next` is only ever set by the post detail page.
          */}
          {safeNext === DEFAULT_NEXT ? "Back to gallery" : "Back to post"}
        </Link>

        <section className="bg-card text-card-foreground rounded-xl border p-6 sm:p-8">
          <header className="mb-6 space-y-2">
            <Badge>denslab account</Badge>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl font-mono">
              Sign in to unlock prompts
            </h1>
            <p className="text-muted-foreground text-sm">
              Members can read the full prompt and generation metadata behind
              every image in the gallery.
            </p>
          </header>

          {/*
            Pass `next` only when it differs from the default: with a plain
            /login the OAuth callback URL stays clean.
          */}
          <GoogleSignInButton next={safeNext === DEFAULT_NEXT ? undefined : safeNext} />

          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed">
            By continuing you agree to keep the work and prompts you find here
            respectful of the artists who made them.
          </p>
        </section>
      </div>
    </main>
  );
}
