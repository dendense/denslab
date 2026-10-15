import type { PostCategory } from "@/lib/posts";

/**
 * One-line introduction per category, shown under the category name on
 * `/categories`.
 *
 * Kept in code (not the database) because the copy is editorial: it changes when
 * the wording changes, not when a post is added. The entry count next to it is
 * still read from the live data in `fetchCategoryCounts`, so this map never
 * holds a number that can go stale.
 *
 * Typed as `Record<PostCategory, string>`, so adding a third category to
 * `CATEGORY_SLUGS` is a compile error here until its copy is written.
 */
export const CATEGORY_DESCRIPTIONS: Record<PostCategory, string> = {
  "AI Generated":
    "Original AI artworks created by me, each shared with the exact prompt behind it. Explore the images, borrow the prompts, and see how a few words become a finished piece.",
  Photoshoot:
    "Photos from my street-hunting sessions and conceptual studio shoots, each with notes on the story and the camera and lighting settings used. A behind-the-scenes look at how every frame was made.",
};
