import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  type AiPost,
  type AiMetadata,
  type PhotoMetadata,
  type PhotoPost,
  type Post,
  type PostCategory,
  demoPosts,
} from "@/lib/posts";

/** Cache tag for post lists. Admin mutations call revalidateTag on it. */
export const POSTS_CACHE_TAG = "posts";

/** Posts per page. Kept here so the gallery and the count agree. */
export const POSTS_PER_PAGE = 24;

type Orientation = "landscape" | "portrait" | "square";

/**
 * Card fields only. `metadata` and `photo_metadata` are deliberately excluded:
 * prompt text is long and is only needed on the detail page, so pulling it for
 * every card would waste bandwidth and cache memory.
 */
export type PostCardData = {
  id: string;
  title: string;
  description: string;
  imgurId: string;
  width: number;
  height: number;
  orientation: Orientation;
  category: PostCategory;
  tags: string[];
};

type CardRow = {
  id: string;
  title: string;
  description: string;
  imgur_id: string;
  width: number;
  height: number;
  category: PostCategory;
  tags: string[] | null;
};

type FullRow = CardRow & {
  metadata: AiMetadata | null;
  photo_metadata: PhotoMetadata | null;
};

export type PostPage = {
  posts: PostCardData[];
  total: number;
  page: number;
  pageCount: number;
};

const CARD_COLUMNS =
  "id, title, description, imgur_id, width, height, category, tags";

const FULL_COLUMNS = `${CARD_COLUMNS}, metadata, photo_metadata`;

function orientationOf(width: number, height: number): Orientation {
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

function toCard(row: CardRow): PostCardData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imgurId: row.imgur_id,
    width: row.width,
    height: row.height,
    orientation: orientationOf(row.width, row.height),
    category: row.category,
    tags: row.tags ?? [],
  };
}

/** Local fallback uses the demo dataset until the table is seeded. */
function demoCards(): PostCardData[] {
  return demoPosts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    imgurId: post.imgurId,
    width: post.width,
    height: post.height,
    orientation: post.orientation,
    category: post.category,
    tags: post.tags,
  }));
}

/**
 * Paged list for the gallery and category pages. Uses `count: "exact"` so the
 * pagination control knows the page count without a second query.
 */
async function readPostPage(
  page: number,
  category?: PostCategory,
): Promise<PostPage> {
  const supabase = createPublicClient();

  if (!supabase) {
    const all = demoCards().filter(
      (post) => !category || post.category === category,
    );
    return paginate(all, page);
  }

  const from = (page - 1) * POSTS_PER_PAGE;

  let query = supabase
    .from("posts")
    .select(CARD_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + POSTS_PER_PAGE - 1);

  if (category) query = query.eq("category", category);

  const { data, error, count } = await query;

  if (error || !data) {
    const all = demoCards().filter(
      (post) => !category || post.category === category,
    );
    return paginate(all, page);
  }

  const total = count ?? data.length;

  // An empty table usually means the seed has not run yet during setup.
  if (total === 0) {
    const all = demoCards().filter(
      (post) => !category || post.category === category,
    );
    return paginate(all, page);
  }

  return {
    posts: (data as CardRow[]).map(toCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
  };
}

function paginate(all: PostCardData[], page: number): PostPage {
  const from = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: all.slice(from, from + POSTS_PER_PAGE),
    total: all.length,
    page,
    pageCount: Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE)),
  };
}

/**
 * Cached page read, keyed by page and category so each combination is stored
 * separately and invalidated together by tag.
 */
export async function fetchPostPage(
  page: number,
  category?: PostCategory,
): Promise<PostPage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;

  return unstable_cache(
    () => readPostPage(safePage, category),
    ["posts-page", String(safePage), category ?? "all"],
    { tags: [POSTS_CACHE_TAG] },
  )();
}

/**
 * Counts per category for the category picker.
 *
 * Uses three cheap count-only queries rather than downloading every row just to
 * measure it.
 */
async function readCategoryCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();

  if (!supabase) {
    return demoCards().reduce<Record<string, number>>((acc, post) => {
      acc[post.category] = (acc[post.category] ?? 0) + 1;
      return acc;
    }, {});
  }

  const categories: PostCategory[] = ["AI Generated", "Photoshoot"];
  const entries = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("category", category);
      return [category, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  return unstable_cache(readCategoryCounts, ["category-counts"], {
    tags: [POSTS_CACHE_TAG],
  })();
}

/**
 * Reads one post by id, including its metadata. No demo fallback: ids are
 * database UUIDs, so a miss means the post genuinely does not exist.
 */
async function readPostById(id: string): Promise<Post | undefined> {
  const supabase = createPublicClient();

  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("posts")
    .select(FULL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return undefined;

  const row = data as FullRow;
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
    if (!row.metadata) return undefined;
    return {
      ...base,
      category: "AI Generated",
      metadata: row.metadata,
    } satisfies AiPost;
  }

  if (!row.photo_metadata) return undefined;
  return {
    ...base,
    category: "Photoshoot",
    photoMetadata: row.photo_metadata,
  } satisfies PhotoPost;
}

/**
 * Cached per-id read, used by the public detail page.
 */
export async function fetchPostById(id: string): Promise<Post | undefined> {
  return unstable_cache(() => readPostById(id), ["post", id], {
    tags: [POSTS_CACHE_TAG],
  })();
}

/**
 * Uncached per-id read, for the admin edit form where a stale cache entry would
 * mean editing outdated values right after a save.
 */
export async function fetchPostByIdFresh(
  id: string,
): Promise<Post | undefined> {
  return readPostById(id);
}

/**
 * Full card list for the admin table. Uncached so the admin always sees the
 * current state right after a mutation, including before revalidation settles.
 */
export async function fetchAllCards(): Promise<PostCardData[]> {
  const supabase = createPublicClient();

  if (!supabase) return demoCards();

  const { data, error } = await supabase
    .from("posts")
    .select(CARD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error || !data) return demoCards();

  const cards = (data as CardRow[]).map(toCard);
  return cards.length > 0 ? cards : demoCards();
}

export { orientationOf, toCard };
