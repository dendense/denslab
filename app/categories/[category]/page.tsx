import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/gallery-grid";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/posts";
import { fetchPostPage } from "@/lib/posts-repository";
import { Badge } from "@/components/ui/badge";

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
          className="text-muted-foreground mb-3 text-sm"
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

        <Badge>Category</Badge>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
          {category}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
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
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All categories
        </Link>
      </header>

      <section aria-label={`${category} gallery`}>
        {search && posts.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold">
              Nothing matched “{search}” in {category}.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try a shorter word, or search the whole gallery instead.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
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
