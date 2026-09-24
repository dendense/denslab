"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PostCard, cardVariants } from "@/components/post-card";
import type { Post } from "@/lib/posts";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export function GalleryGrid({ posts }: { posts: Post[] }) {
  const shouldReduceMotion = useReducedMotion();

  if (posts.length === 0) {
    return (
      <p className="border-brutal bg-canvas px-4 py-6 font-mono text-sm shadow-brutal-sm">
        No posts in this category yet.
      </p>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 lg:gap-6 xl:columns-4"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </motion.div>
  );
}

export { cardVariants };
