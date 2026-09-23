"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PostCard, cardVariants } from "@/components/post-card";
import { posts } from "@/lib/posts";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export function GalleryGrid() {
  const shouldReduceMotion = useReducedMotion();

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
