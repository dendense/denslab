"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Label htmlFor="display-name">Display name</Label>

      <Input
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
      />

      <p className="text-muted-foreground text-sm">
        {tooShort
          ? "Use at least 2 characters."
          : tooLong
            ? "Keep it under 32 characters."
            : "Shown on your posts and in the navigation."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={disabled} aria-busy={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          Save name
        </Button>

        {saved && (
          <Badge variant="secondary" role="status">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </Badge>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}
    </form>
  );
}
