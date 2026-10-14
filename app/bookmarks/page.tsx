import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Search } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { getViewer } from "@/lib/auth/viewer";
import { fetchBookmarkedPosts } from "@/lib/bookmarks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <Badge>Saved</Badge>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
          Bookmarks
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {posts.length === 0
            ? "Nothing saved yet. Open any post and use Save to keep it here."
            : `${posts.length} ${posts.length === 1 ? "post" : "posts"} saved, newest first.`}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            >
              <Bookmark className="h-4 w-4" />
            </span>
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                Your saved posts will appear here.
              </p>
              <p className="text-muted-foreground text-sm">
                Bookmarks are private — only you can see this list.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild>
                  <Link href="/">
                    <Search aria-hidden="true" />
                    Browse the gallery
                  </Link>
                </Button>
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
