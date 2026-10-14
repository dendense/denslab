import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";
import { fetchPostPage } from "@/lib/posts-repository";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  const page = Number.parseInt(first(params.page) ?? "1", 10) || 1;
  const search = (first(params.q) ?? "").trim();

  const { posts, total, pageCount } = await fetchPostPage(page, undefined, search);

  // Kept on pagination links so moving between pages does not drop the term.
  const preserved = search ? new URLSearchParams({ q: search }).toString() : "";

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
          Visual stories from the edge of reality &amp; imagination.
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {search ? (
            `${total} ${total === 1 ? "result" : "results"} for “${search}”`
          ) : (
            <>
              {`${total} ${total === 1 ? "entry" : "entries"} — AI-generated work and photographs, with the prompt or the camera settings`}{" "}
              <span className="block">behind each one.</span>
            </>
          )}
        </p>

        <div className="mt-5">
          <SearchBox action="/" defaultValue={search} />
        </div>

        <div className="mt-6">
          <Button asChild>
            <Link href="/categories">
              Explore categories
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section aria-label="Photo gallery">
        {search && posts.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold">
              Nothing matched “{search}”.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try a shorter word, or search by tag such as “neon”, “night”, or
              “portrait”.
            </p>
          </div>
        ) : (
          <GalleryGrid posts={posts} />
        )}
      </section>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/"
        query={preserved}
      />
    </main>
  );
}
