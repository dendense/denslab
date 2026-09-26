import { checkImgurImages } from "@/lib/imgur-check";
import { createClient } from "@/lib/supabase/server";
import type { PostCardData } from "@/lib/posts-repository";

/**
 * Whether the signed-in user has bookmarked a post. Returns false for guests
 * and when Supabase is not configured, so callers can render the "not saved"
 * state without extra branching.
 */
export async function isBookmarked(postId: string): Promise<boolean> {
  const supabase = await createClient();

  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (error) return false;

  return Boolean(data);
}

type BookmarkRow = {
  created_at: string;
  posts: {
    id: string;
    title: string;
    description: string;
    imgur_id: string;
    width: number;
    height: number;
    category: PostCardData["category"];
    tags: string[] | null;
  } | null;
};

function orientationOf(width: number, height: number) {
  if (width === height) return "square" as const;
  return width > height ? ("landscape" as const) : ("portrait" as const);
}

/**
 * The signed-in user's bookmarked posts, newest bookmark first.
 *
 * Reads through the join so one round trip returns both the bookmark order and
 * the post fields the cards need. RLS limits rows to the current user.
 */
export async function fetchBookmarkedPosts(): Promise<PostCardData[]> {
  const supabase = await createClient();

  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      "created_at, posts (id, title, description, imgur_id, width, height, category, tags)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = (data as unknown as BookmarkRow[])
    .map((row) => row.posts)
    .filter((post): post is NonNullable<BookmarkRow["posts"]> => post !== null);

  // One batch check for every saved post, so cards know whether to show an image
  // or the placeholder without probing Imgur from the browser.
  const availability = await checkImgurImages(
    rows.map((post) => post.imgur_id),
  );

  return rows.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    imgurId: post.imgur_id,
    width: post.width,
    height: post.height,
    orientation: orientationOf(post.width, post.height),
    category: post.category,
    tags: post.tags ?? [],
    imageAvailable: availability[post.imgur_id] ?? true,
  }));
}

/** How many posts the signed-in user has bookmarked. */
export async function countBookmarks(): Promise<number> {
  const supabase = await createClient();

  if (!supabase) return 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("bookmarks")
    .select("post_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}
