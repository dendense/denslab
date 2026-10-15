"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PostImage } from "@/components/post-image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TITLE_DATE_SEPARATOR,
  formatWibDate,
  wibIsoDate,
} from "@/lib/format-date";
import type { PostCardData } from "@/lib/posts-repository";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function PostCard({
  post,
  /**
   * First cards above the fold are the LCP element, so they load eagerly.
   * `priority` is not used because it also disables lazy loading for every
   * card, and only the first screenful needs to skip it.
   */
  priority = false,
}: {
  post: PostCardData;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  /*
   * Formatting runs inside the client component rather than on the server.
   *
   * Both sides call the same pure function on the same ISO string, and it reads
   * the zone offset from a constant instead of from the ambient locale, so the
   * two render passes cannot disagree. Doing it here also keeps the date with
   * the markup that shows it, so a future card variant cannot forget it.
   */
  const date = formatWibDate(post.createdAt);

  return (
    <motion.article
      variants={cardVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-card text-card-foreground group mb-4 block break-inside-avoid overflow-hidden rounded-xl border sm:mb-5 lg:mb-6"
    >
      <Link href={`/photo/${post.id}`} className="block">
        <div className="relative">
          {/*
            The skeleton only makes sense while a real image is loading. When the
            post has no usable image the placeholder renders immediately.
          */}
          {post.imageAvailable && !loaded && (
            <Skeleton className="absolute inset-0 h-full w-full" />
          )}

          {/* The image sits flush against the card edge; the container's
              overflow-hidden + rounded-xl clips it to the card radius. */}
          <PostImage
            imgurId={post.imgurId}
            alt={post.title}
            width={post.width}
            height={post.height}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={85}
            priority={priority}
            imageAvailable={post.imageAvailable}
            onSettled={() => setLoaded(true)}
            className="w-full object-cover"
          />

          {/*
            Hover-revealed on pointer devices; always visible on touch, where
            there is no hover state to reveal it.
          */}
          <Badge className="pointer-events-none absolute left-2 top-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 motion-reduce:transition-none">
            {post.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 sm:gap-3 sm:p-4">
          <h2 className="text-base font-semibold leading-snug sm:text-lg">
            {post.title}
            {/*
              The separator lives inside the date branch, so a post with no
              timestamp renders a bare title instead of a trailing bullet.
              No `font-mono` here: the card title is not monospace, so a
              monospace date would be the only monospace element in the card.
            */}
            {date && (
              <>
                <span aria-hidden="true">{TITLE_DATE_SEPARATOR}</span>
                {/*
                  `<time>` rather than a `<span>`: the visible text is
                  dd/mm/yyyy, which assistive tech reads as three bare numbers,
                  while `dateTime` carries the unambiguous WIB calendar day.
                */}
                <time
                  dateTime={wibIsoDate(post.createdAt) ?? undefined}
                  className="text-muted-foreground font-normal"
                >
                  {date}
                </time>
              </>
            )}
          </h2>

          {/*
            Wide screens have the narrowest column (280px at 1280) and the
            "Details" label alone costs 59px of it, which pushes the date onto
            a second line. Hiding just the label returns 24px to the title and
            benefits the four shorter titles; the arrow keeps the affordance
            and the accessible name keeps the meaning.

            Below `lg` the column is wider, so the label stays visible and
            mobile layout is untouched.
          */}
          <Badge className="shrink-0 lg:px-2" aria-label="Details">
            <span className="lg:sr-only">Details</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Badge>
        </div>
      </Link>
    </motion.article>
  );
}
