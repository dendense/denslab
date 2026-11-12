import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import { HeroHeadline } from "@/components/hero-headline";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";
import { fetchPostPage } from "@/lib/posts-repository";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  const requested = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const search = (first(params.q) ?? "").trim();

  // Kept on pagination links so moving between pages does not drop the term.
  const preserved = search ? new URLSearchParams({ q: search }).toString() : "";

  const { posts, total, pageCount } = await fetchPostPage(page, undefined, search);

  // Past the last page: send the reader to the last one instead of an empty grid.
  if (page > pageCount) {
    redirect(
      pageCount > 1
        ? `/?${new URLSearchParams({
            ...(search ? { q: search } : {}),
            page: String(pageCount),
          })}`
        : preserved
          ? `/?${preserved}`
          : "/",
    );
  }

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <HeroHeadline />
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
          <div className="bg-card text-card-foreground rounded-xl border p-5 sm:p-6">
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
