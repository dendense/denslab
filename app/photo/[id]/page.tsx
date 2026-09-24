import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PromptPanel } from "@/components/prompt-panel";
import { Badge } from "@/components/ui/badge";
import { getPostById, imgurFullUrl, posts } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";

/**
 * The prompt panel depends on the request session, so this route must render
 * per request. Without this, Next prerenders the guest (locked) variant once
 * and serves it to signed-in users too.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/photo/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = getPostById(id);

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
  const post = getPostById(id);

  if (!post) notFound();

  const authenticated = await hasSession();

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <Link
        href="/"
        className="border-brutal-thin mb-6 inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to gallery
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <figure className="border-brutal bg-canvas shadow-brutal">
            <Image
              src={imgurFullUrl(post.imgurId)}
              alt={post.title}
              width={post.width}
              height={post.height}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </figure>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{post.category}</Badge>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="font-mono text-xs leading-relaxed sm:text-sm">
              {post.description}
            </p>

            <ul className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-brutal-thin px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-2 gap-2 border-t-brutal-thin pt-4 font-mono text-xs">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide">
                  Resolution
                </dt>
                <dd>
                  {post.width} × {post.height}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide">
                  Orientation
                </dt>
                <dd className="capitalize">{post.orientation}</dd>
              </div>
            </dl>
          </div>

          <PromptPanel
            metadata={post.metadata}
            isAuthenticated={authenticated}
          />
        </div>
      </div>
    </main>
  );
}
