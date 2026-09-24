import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { CATEGORIES, CATEGORY_SLUGS, postsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse denslab posts by category.",
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: CATEGORY_SLUGS[category] }));
}

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[category]">) {
  const { category: slug } = await params;
  const category = CATEGORIES.find((name) => CATEGORY_SLUGS[name] === slug);

  if (!category) notFound();

  const categoryPosts = postsByCategory(category);

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 font-mono text-xs uppercase tracking-wide"
        >
          <Link href="/" className="underline underline-offset-4">
            Gallery
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href="/categories" className="underline underline-offset-4">
            Categories
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span>{category}</span>
        </nav>

        <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
          Category
        </span>

        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {category}
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:text-sm">
          {categoryPosts.length}{" "}
          {categoryPosts.length === 1 ? "entry" : "entries"} in this category.
        </p>

        <Link
          href="/categories"
          className="border-brutal-thin mt-5 inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All categories
        </Link>
      </header>

      <section aria-label={`${category} gallery`}>
        <GalleryGrid posts={categoryPosts} />
      </section>
    </main>
  );
}
