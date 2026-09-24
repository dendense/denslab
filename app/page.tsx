import { GalleryGrid } from "@/components/gallery-grid";
import { Pagination } from "@/components/pagination";
import { fetchPostPage } from "@/lib/posts-repository";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number.parseInt(rawPage ?? "1", 10) || 1;

  const { posts, total, pageCount } = await fetchPostPage(page);

  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Visual stories from the edge of reality &amp; imagination.
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:mt-4 sm:text-sm">
          {total} {total === 1 ? "entry" : "entries"} — AI-generated work and
          photographs, with the prompt or the camera settings behind each one.
        </p>
      </header>

      <section aria-label="Photo gallery">
        <GalleryGrid posts={posts} />
      </section>

      <Pagination page={page} pageCount={pageCount} basePath="/" />
    </main>
  );
}
