"use client";

import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleBookmark } from "@/app/bookmarks/actions";

/**
 * Bookmark control for the detail page.
 *
 * Guests get a link to /login instead of a button, so the intent is clear
 * before they are asked to sign in. Signed-in users toggle immediately, with an
 * optimistic update so the icon responds without waiting for the round trip.
 */
export function BookmarkButton({
  postId,
  initialBookmarked,
  isAuthenticated,
}: {
  postId: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="border-brutal-thin inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
      >
        <Bookmark className="h-4 w-4" aria-hidden="true" />
        Save to bookmarks
      </Link>
    );
  }

  async function onClick() {
    const next = !bookmarked;

    setBookmarked(next);
    setPending(true);
    setError(null);

    const result = await toggleBookmark(postId);

    if (!result.ok) {
      // Revert the optimistic change so the icon never lies about the state.
      setBookmarked(!next);
      setError(result.error);
      setPending(false);
      return;
    }

    setBookmarked(result.bookmarked);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={bookmarked}
        title={bookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
        className={`border-brutal-thin inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press disabled:cursor-not-allowed disabled:opacity-60 ${
          bookmarked ? "bg-accent text-on-accent" : "bg-canvas"
        }`}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Bookmark
            className="h-4 w-4"
            fill={bookmarked ? "currentColor" : "none"}
            aria-hidden="true"
          />
        )}
        {bookmarked ? "Saved" : "Save"}
      </button>

      {error && (
        <p role="alert" className="font-mono text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
