import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to denslab with your Google account.",
};

export default async function LoginPage() {
  const supabase = await createClient();

  // Already signed in: no reason to show the login screen again.
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect("/");
  }

  return (
    <main className="w-full flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link
          href="/"
          className="border-brutal-thin inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to gallery
        </Link>

        <section className="border-brutal bg-canvas p-6 shadow-brutal sm:p-8">
          <header className="mb-6 space-y-2">
            <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
              denslab account
            </span>
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              Sign in to unlock prompts
            </h1>
            <p className="font-mono text-xs leading-relaxed sm:text-sm">
              Members can read the full prompt and generation metadata behind
              every image in the gallery.
            </p>
          </header>

          <GoogleSignInButton />

          <p className="mt-6 border-t-brutal-thin pt-4 font-mono text-xs leading-relaxed">
            By continuing you agree to keep the work and prompts you find here
            respectful of the artists who made them.
          </p>
        </section>
      </div>
    </main>
  );
}
