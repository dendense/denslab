import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PromptPanel } from "@/components/prompt-panel";
import { BookmarkButton } from "@/components/bookmark-button";
import { DonateButton } from "@/components/donate-button";
import { PostImage } from "@/components/post-image";
import { Badge } from "@/components/ui/badge";
import { isBookmarked } from "@/lib/bookmarks";
import {
  fetchPostById,
  isPostImageAvailable,
} from "@/lib/posts-repository";
import { createClient } from "@/lib/supabase/server";

/**
 * The prompt panel depends on the request session, so this route must render
 * per request. Without this, Next prerenders the guest (locked) variant once
 * and serves it to signed-in users too.
 *
 * Post ids are database UUIDs, so there is no static param list to enumerate.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/photo/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) return { title: "Photo not found" };

  return {
    title: post.title,
    description: post.description,
  };
}

/**
 * Reads the session on the server. Guests (and the not-yet-configured case)
 * get `false`, which renders the locked prompt panel.
 */
async function hasSession() {
  const supabase = await createClient();

  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export default async function PhotoDetailPage({
  params,
}: PageProps<"/photo/[id]">) {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) notFound();

  const authenticated = await hasSession();
  const bookmarked = authenticated ? await isBookmarked(post.id) : false;
  const imageAvailable = await isPostImageAvailable(post.imgurId);

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to gallery
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <figure className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <PostImage
              imgurId={post.imgurId}
              alt={post.title}
              width={post.width}
              height={post.height}
              sizes="(min-width: 1024px) 66vw, 100vw"
              fullSize
              priority
              imageAvailable={imageAvailable}
              className="h-auto w-full object-contain"
            />
          </figure>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{post.category}</Badge>
            <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {post.description}
            </p>

            <ul className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 pt-2">
              <BookmarkButton
                postId={post.id}
                initialBookmarked={bookmarked}
                isAuthenticated={authenticated}
              />
              <DonateButton />
            </div>

            <dl className="grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
              <div>
                <dt className="text-xs font-medium">
                  Resolution
                </dt>
                <dd>
                  {post.width} × {post.height}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium">
                  Orientation
                </dt>
                <dd className="capitalize">{post.orientation}</dd>
              </div>
            </dl>
          </div>

          <PromptPanel post={post} isAuthenticated={authenticated} />
        </div>
      </div>
    </main>
  );
}
