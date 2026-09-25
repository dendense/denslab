import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Search } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { getViewer } from "@/lib/auth/viewer";
import { fetchBookmarkedPosts } from "@/lib/bookmarks";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Posts you saved on denslab.",
};

/**
 * Reads the session and the user's saved posts, so it renders per request.
 */
export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const viewer = await getViewer();

  if (!viewer) redirect("/login");

  const posts = await fetchBookmarkedPosts();

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
          Saved
        </span>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Bookmarks
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:text-sm">
          {posts.length === 0
            ? "Nothing saved yet. Open any post and use Save to keep it here."
            : `${posts.length} ${posts.length === 1 ? "post" : "posts"} saved, newest first.`}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="border-brutal bg-canvas p-5 shadow-brutal-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center border-brutal-thin bg-accent text-on-accent"
            >
              <Bookmark className="h-4 w-4" />
            </span>
            <div className="space-y-2">
              <p className="font-display text-base font-bold sm:text-lg">
                Your saved posts will appear here.
              </p>
              <p className="font-mono text-xs leading-relaxed sm:text-sm">
                Bookmarks are private — only you can see this list.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/"
                  className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-3 py-1.5 font-display text-sm font-bold text-on-accent brutal-press"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Browse the gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section aria-label="Bookmarked posts">
          <GalleryGrid posts={posts} />
        </section>
      )}
    </main>
  );
}
