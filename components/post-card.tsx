"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { imgurThumbUrl } from "@/lib/posts";
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

  return (
    <motion.article
      variants={cardVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group border-brutal mb-4 break-inside-avoid bg-canvas shadow-brutal-sm sm:mb-5 lg:mb-6"
    >
      <Link href={`/photo/${post.id}`} className="block">
        <div className="relative">
          {!loaded && <Skeleton className="h-full w-full" />}

          <Image
            src={imgurThumbUrl(post.imgurId)}
            alt={post.title}
            width={post.width}
            height={post.height}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={85}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setLoaded(true)}
            className={`w-full border-b-brutal object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "absolute inset-0 h-0 opacity-0"
            }`}
          />

          {/*
            Hover-revealed on pointer devices; always visible on touch, where
            there is no hover state to reveal it.
          */}
          <Badge className="pointer-events-none absolute left-2 top-2 shadow-brutal-sm transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 motion-reduce:transition-none sm:left-2.5 sm:top-2.5">
            {post.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 sm:gap-3 sm:p-4">
          <h2 className="font-display text-base font-bold leading-snug sm:text-lg lg:text-xl">
            {post.title}
          </h2>

          <span className="border-brutal-thin flex shrink-0 items-center gap-1 bg-accent px-1.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:px-2">
            Details
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
