"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Updates the display name stored in the user's metadata. Google owns the
 * email and avatar, so the name is the only profile field we manage here.
 */
export function UsernameForm({ initialName }: { initialName: string }) {
  const [value, setValue] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const unchanged = trimmed === initialName;
  const tooShort = trimmed.length < 2;
  const tooLong = trimmed.length > 32;
  const disabled = pending || unchanged || tooShort || tooLong;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createClient();

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: trimmed, name: trimmed },
    });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    setSaved(true);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label
        htmlFor="display-name"
        className="block font-mono text-[10px] font-bold uppercase tracking-wide"
      >
        Display name
      </label>

      <input
        id="display-name"
        name="display-name"
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        autoComplete="nickname"
        maxLength={40}
        className="border-brutal w-full bg-canvas px-3 py-2 font-display text-sm font-bold outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
      />

      <p className="font-mono text-[11px] leading-relaxed">
        {tooShort
          ? "Use at least 2 characters."
          : tooLong
            ? "Keep it under 32 characters."
            : "Shown on your posts and in the navigation."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          aria-busy={pending}
          className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Save name
        </button>

        {saved && (
          <span
            role="status"
            className="border-brutal-thin inline-flex items-center gap-1.5 bg-canvas px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="border-brutal-thin bg-canvas px-3 py-2 font-mono text-xs leading-relaxed"
        >
          {error}
        </p>
      )}
    </form>
  );
}
