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
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Visual stories from the edge of reality &amp; imagination.
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:mt-4 sm:text-sm">
          {search
            ? `${total} ${total === 1 ? "result" : "results"} for “${search}”`
            : `${total} ${total === 1 ? "entry" : "entries"} — AI-generated work and photographs, with the prompt or the camera settings behind each one.`}
        </p>

        <div className="mt-5">
          <SearchBox action="/" defaultValue={search} />
        </div>
      </header>

      <section aria-label="Photo gallery">
        {search && posts.length === 0 ? (
          <div className="border-brutal bg-canvas p-5 shadow-brutal-sm sm:p-6">
            <p className="font-display text-base font-bold sm:text-lg">
              Nothing matched “{search}”.
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed sm:text-sm">
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
