import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/posts";
import { fetchPostPage } from "@/lib/posts-repository";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse denslab posts by category.",
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: CATEGORY_SLUGS[category] }));
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categories/[category]">) {
  const { category: slug } = await params;
  const category = CATEGORIES.find((name) => CATEGORY_SLUGS[name] === slug);

  if (!category) notFound();

  const query = await searchParams;
  const page = Number.parseInt(first(query.page) ?? "1", 10) || 1;
  const search = (first(query.q) ?? "").trim();

  const { posts, total, pageCount } = await fetchPostPage(
    page,
    category,
    search,
  );

  const preserved = search ? new URLSearchParams({ q: search }).toString() : "";

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
          {search
            ? `${total} ${total === 1 ? "result" : "results"} for “${search}” in ${category}.`
            : `${total} ${total === 1 ? "entry" : "entries"} in this category.`}
        </p>

        <div className="mt-5">
          <SearchBox
            action={`/categories/${slug}`}
            defaultValue={search}
          />
        </div>

        <Link
          href="/categories"
          className="border-brutal-thin mt-5 inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All categories
        </Link>
      </header>

      <section aria-label={`${category} gallery`}>
        {search && posts.length === 0 ? (
          <div className="border-brutal bg-canvas p-5 shadow-brutal-sm sm:p-6">
            <p className="font-display text-base font-bold sm:text-lg">
              Nothing matched “{search}” in {category}.
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed sm:text-sm">
              Try a shorter word, or search the whole gallery instead.
            </p>
            <Link
              href="/"
              className="border-brutal-thin mt-4 inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press"
            >
              Search all posts
            </Link>
          </div>
        ) : (
          <GalleryGrid posts={posts} />
        )}
      </section>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={`/categories/${slug}`}
        query={preserved}
      />
    </main>
  );
}
