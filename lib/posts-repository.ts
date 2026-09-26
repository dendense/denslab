import { unstable_cache } from "next/cache";
import { checkImgurImages, isImgurImageAvailable } from "@/lib/imgur-check";
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
  /**
   * Whether the Imgur id resolves, decided on the server. The browser cannot
   * determine this, so the card must not try to guess.
   */
  imageAvailable: boolean;
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
    // Replaced below once the Imgur verdict is known.
    imageAvailable: true,
  };
}

/**
 * Maps rows to cards, attaching the server-side Imgur verdict in one batch so a
 * gallery does not probe Imgur row by row.
 */
async function toCardsWithAvailability(
  rows: CardRow[],
): Promise<PostCardData[]> {
  const availability = await checkImgurImages(rows.map((row) => row.imgur_id));

  return rows.map((row) => ({
    ...toCard(row),
    imageAvailable: availability[row.imgur_id] ?? true,
  }));
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
    // Demo ids may not resolve; the client's onError catches any that do not.
    imageAvailable: true,
  }));
}

/**
 * Columns matched by search.
 *
 * `tags` is a `text[]` column, so it needs the array `cs` (contains) operator
 * rather than `ilike`. Mixing the two in one filter makes Postgres reject the
 * whole query with "operator does not exist: text[] ~~* unknown", which silently
 * disables search on every column, not just tags.
 *
 * `category` is included so typing "Photoshoot" finds those posts instead of
 * dead-ending; the dedicated category pages remain the better way to browse.
 */
const SEARCH_TEXT_COLUMNS = ["title", "description", "category"] as const;

/**
 * Builds a PostgREST `or` filter for a search term.
 *
 * The term is escaped for the PostgREST filter grammar: commas and parentheses
 * are structural there, so a raw term containing them would either error or
 * silently match something else. `%` and `_` are ILIKE wildcards and are
 * escaped so a search for "s_1" does not match "sx1".
 */
function buildSearchFilter(term: string): string {
  const escapedForLike = term
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  const escapedForOr = escapedForLike.replace(/,/g, "\\,").replace(/[()]/g, "");

  const textFilters = SEARCH_TEXT_COLUMNS.map(
    (column) => `${column}.ilike.%${escapedForOr}%`,
  );

  // Array containment needs the term wrapped in braces. Braces and quotes are
  // stripped from the term first so a value containing them cannot break the
  // array literal syntax.
  const arrayTerm = escapedForOr.replace(/[{}"\\]/g, "");
  const tagFilter = arrayTerm ? `tags.cs.{${arrayTerm}}` : null;

  return tagFilter ? [...textFilters, tagFilter].join(",") : textFilters.join(",");
}

/** Case-insensitive local match, mirroring the database behaviour. */
function matchesSearch(post: PostCardData, term: string): boolean {
  const needle = term.toLowerCase();
  return (
    post.title.toLowerCase().includes(needle) ||
    post.description.toLowerCase().includes(needle) ||
    post.category.toLowerCase().includes(needle) ||
    post.tags.some((tag) => tag.toLowerCase().includes(needle))
  );
}

/**
 * Paged list for the gallery and category pages. Uses `count: "exact"` so the
 * pagination control knows the page count without a second query.
 */
async function readPostPage(
  page: number,
  category?: PostCategory,
  search?: string,
): Promise<PostPage> {
  const supabase = createPublicClient();

  const term = search?.trim() ?? "";

  if (!supabase) {
    let all = demoCards();
    if (category) all = all.filter((post) => post.category === category);
    if (term) all = all.filter((post) => matchesSearch(post, term));
    return paginate(all, page);
  }

  const from = (page - 1) * POSTS_PER_PAGE;

  let query = supabase
    .from("posts")
    .select(CARD_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + POSTS_PER_PAGE - 1);

  if (category) query = query.eq("category", category);
  if (term) query = query.or(buildSearchFilter(term));

  const { data, error, count } = await query;

  if (error || !data) {
    // Logged rather than swallowed: silently falling back to demo data once hid
    // a broken search filter, making a real query bug look like "no results".
    console.error("[posts] list query failed:", error?.message ?? "no data");
    let all = demoCards();
    if (category) all = all.filter((post) => post.category === category);
    if (term) all = all.filter((post) => matchesSearch(post, term));
    return paginate(all, page);
  }

  const total = count ?? data.length;

  // An empty table usually means the seed has not run yet during setup. A
  // filtered search legitimately returns zero rows, so that case is excluded.
  if (total === 0 && !term) {
    let all = demoCards();
    if (category) all = all.filter((post) => post.category === category);
    return paginate(all, page);
  }

  return {
    posts: await toCardsWithAvailability(data as CardRow[]),
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
 * Cached page read.
 *
 * The cached function takes its inputs as real arguments. `unstable_cache`
 * memoizes on the arguments of the wrapped function, so closing over the term
 * instead would make every call look identical and serve the first result to
 * every search term.
 */
export async function fetchPostPage(
  page: number,
  category?: PostCategory,
  search?: string,
): Promise<PostPage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const term = (search ?? "").trim().toLowerCase().slice(0, 80);
  const key = category ?? "all";

  return unstable_cache(
    (p: number, c: PostCategory | "all", t: string) =>
      readPostPage(p, c === "all" ? undefined : c, t),
    ["posts-page"],
    { tags: [POSTS_CACHE_TAG] },
  )(safePage, key, term);
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
 *
 * The id is passed as an argument rather than closed over: `unstable_cache`
 * memoizes on function arguments, so a closure would make every post id resolve
 * to whichever one was cached first.
 */
export async function fetchPostById(id: string): Promise<Post | undefined> {
  return unstable_cache(
    (postId: string) => readPostById(postId),
    ["post"],
    { tags: [POSTS_CACHE_TAG] },
  )(id);
}

/**
 * Whether a post's image resolves. Kept out of `fetchPostById` so the cached
 * post payload does not carry a UI concern, and so the detail page can pass the
 * verdict straight to the image component.
 */
export async function isPostImageAvailable(imgurId: string): Promise<boolean> {
  return isImgurImageAvailable(imgurId);
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

  const cards = await toCardsWithAvailability(data as CardRow[]);
  return cards.length > 0 ? cards : demoCards();
}

export { orientationOf, toCard };
