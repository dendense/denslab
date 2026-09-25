"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BookmarkResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

/** Paths whose bookmark state should refresh after a change. */
const AFFECTED_PATHS = ["/bookmarks", "/photo"];

function revalidateBookmarkViews() {
  for (const path of AFFECTED_PATHS) {
    // "page" covers the path and its dynamic children (e.g. /photo/[id]).
    revalidatePath(path, "page");
  }
}

/**
 * Adds or removes a bookmark for the signed-in user.
 *
 * The user id comes from the session, never from the client, and RLS enforces
 * the same rule in the database. A duplicate insert is treated as success
 * because the desired end state (bookmarked) is already true.
 */
export async function toggleBookmark(
  postId: string,
): Promise<BookmarkResult> {
  const supabase = await createClient();

  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: existing, error: readError } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) return { ok: false, error: error.message };

    revalidateBookmarkViews();
    return { ok: true, bookmarked: false };
  }

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, post_id: postId });

  if (error) {
    // 23505 = unique violation, meaning a double-click raced. The end state is
    // already what the user wanted, so this is not reported as a failure.
    if (error.code === "23505") return { ok: true, bookmarked: true };
    return { ok: false, error: error.message };
  }

  revalidateBookmarkViews();
  return { ok: true, bookmarked: true };
}
