import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldX } from "lucide-react";
import { PostManager } from "@/components/admin/post-manager";
import { getViewer } from "@/lib/auth/viewer";
import { fetchPosts } from "@/lib/posts-repository";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage denslab posts.",
};

/**
 * Guarded by the `role` column in `profiles`, read per request.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const viewer = await getViewer();

  if (!viewer) redirect("/login");

  if (!viewer.isAdmin) {
    return (
      <main className="w-full flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
        <section className="mx-auto w-full max-w-md border-brutal bg-canvas p-6 shadow-brutal sm:p-8">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center border-brutal-thin bg-accent text-on-accent"
            >
              <ShieldX className="h-4 w-4" />
            </span>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">Admins only</h1>
              <p className="font-mono text-xs leading-relaxed sm:text-sm">
                This account does not have the admin role. Signed in as{" "}
                {viewer.email ?? "your account"}.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="border-brutal-thin mt-6 inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to gallery
          </Link>
        </section>
      </main>
    );
  }

  const posts = await fetchPosts();

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
        <header className="space-y-2 border-b-brutal pb-6">
          <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
            Admin
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Manage posts
          </h1>
          <p className="font-mono text-xs leading-relaxed sm:text-sm">
            {posts.length} {posts.length === 1 ? "post" : "posts"} in the
            gallery.
          </p>
        </header>

        <PostManager
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            category: post.category,
            tags: post.tags,
          }))}
        />
      </div>
    </main>
  );
}
