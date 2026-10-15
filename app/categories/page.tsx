import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/posts";
import { CATEGORY_DESCRIPTIONS } from "@/lib/categories";
import { fetchCategoryCounts } from "@/lib/posts-repository";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse denslab posts by category.",
};

export default async function CategoriesPage() {
  const counts = await fetchCategoryCounts();

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
          <span>Categories</span>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl font-mono">
          Browse by category
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Two ways of making an image: generated with a model, or captured with
          a camera.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {CATEGORIES.map((category) => {
          const count = counts[category] ?? 0;

          return (
            <li key={category}>
              <Link
                href={`/categories/${CATEGORY_SLUGS[category]}`}
                className="bg-card text-card-foreground flex h-full flex-col justify-between gap-6 rounded-xl border p-6 transition-colors"
              >
                <div className="space-y-2">
                  <Badge>Category</Badge>
                  <h2 className="text-2xl font-semibold leading-tight sm:text-3xl font-mono">
                    {category}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                  <p className="text-muted-foreground font-mono text-sm">
                    {count} {count === 1 ? "entry" : "entries"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-bold sm:text-base">
                  View posts
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
