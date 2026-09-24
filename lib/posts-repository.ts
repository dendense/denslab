import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  type AiPost,
  type AiMetadata,
  type PhotoMetadata,
  type PhotoPost,
  type Post,
  demoPosts,
} from "@/lib/posts";

/** Cache tag for the gallery list. Admin mutations call revalidateTag on it. */
export const POSTS_CACHE_TAG = "posts";

/** Raw shape of a row in `public.posts`. */
type PostRow = {
  id: string;
  title: string;
  description: string;
  imgur_id: string;
  width: number;
  height: number;
  category: "AI Generated" | "Photoshoot";
  tags: string[] | null;
  metadata: AiMetadata | null;
  photo_metadata: PhotoMetadata | null;
};

function orientationOf(width: number, height: number) {
  if (width === height) return "square" as const;
  return width > height ? ("landscape" as const) : ("portrait" as const);
}

/**
 * Maps a row to the discriminated union. Rows that violate the category /
 * payload pairing are rejected rather than coerced, so a bad row cannot render
 * as a half-filled post.
 */
function toPost(row: PostRow): Post | null {
  const base = {
    id: row.id,
    title: row.title,
    description: row.description,
    imgurId: row.imgur_id,
    width: row.width,
    height: row.height,
    orientation: orientationOf(row.width, row.height),
    tags: row.tags ?? [],
  };

  if (row.category === "AI Generated") {
    if (!row.metadata) return null;
    return { ...base, category: "AI Generated", metadata: row.metadata } satisfies AiPost;
  }

  if (!row.photo_metadata) return null;
  return {
    ...base,
    category: "Photoshoot",
    photoMetadata: row.photo_metadata,
  } satisfies PhotoPost;
}

/**
 * Reads posts from Supabase, cached and tagged so admin mutations can
 * invalidate it. Falls back to the local demo data when Supabase is
 * unreachable or the table has not been created yet, so the gallery keeps
 * working during setup.
 *
 * Uses the cookie-free public client: `cookies()` is not allowed inside a cache
 * scope, and gallery data is public anyway.
 */
async function readPosts(): Promise<Post[]> {
  const supabase = createPublicClient();

  if (!supabase) return demoPosts;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, description, imgur_id, width, height, category, tags, metadata, photo_metadata",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return demoPosts;

  const posts = (data as PostRow[])
    .map(toPost)
    .filter((post): post is Post => post !== null);

  // An empty table is a valid state, but during setup it usually means the seed
  // has not run yet, so keep the gallery populated.
  return posts.length > 0 ? posts : demoPosts;
}

/**
 * Cached read for the gallery. Tagged so `revalidateTag(POSTS_CACHE_TAG)`
 * after an admin mutation refreshes every page that lists posts.
 */
export async function fetchPosts(): Promise<Post[]> {
  return unstable_cache(readPosts, ["posts-list"], {
    tags: [POSTS_CACHE_TAG],
  })();
}

/**
 * Reads one post by id. No demo fallback: ids are database UUIDs, so a miss
 * means the post genuinely does not exist and the page should 404 rather than
 * resurface a stale local entry.
 */
export async function fetchPostById(id: string): Promise<Post | undefined> {
  const supabase = createPublicClient();

  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, description, imgur_id, width, height, category, tags, metadata, photo_metadata",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return undefined;

  return toPost(data as PostRow) ?? undefined;
}

export { toPost, orientationOf };
