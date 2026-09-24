import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, CATEGORY_SLUGS, postsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse denslab posts by category.",
};

export default function CategoriesPage() {
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
          <span>Categories</span>
        </nav>

        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Browse by category
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:text-sm">
          Two ways of making an image: generated with a model, or captured with
          a camera.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {CATEGORIES.map((category) => {
          const count = postsByCategory(category).length;

          return (
            <li key={category}>
              <Link
                href={`/categories/${CATEGORY_SLUGS[category]}`}
                className="border-brutal flex h-full flex-col justify-between gap-6 bg-canvas p-5 shadow-brutal-sm brutal-press sm:p-6"
              >
                <div className="space-y-2">
                  <span className="border-brutal-thin inline-block bg-accent px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-accent sm:text-[11px]">
                    Category
                  </span>
                  <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                    {category}
                  </h2>
                  <p className="font-mono text-xs leading-relaxed sm:text-sm">
                    {count} {count === 1 ? "entry" : "entries"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 font-display text-sm font-bold sm:text-base">
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
