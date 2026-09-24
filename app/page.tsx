import { GalleryGrid } from "@/components/gallery-grid";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Visual stories from the edge of reality &amp; imagination.
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed sm:mt-4 sm:text-sm">
          Placeholder entries for layout work. Real posts will come from
          Supabase.
        </p>
      </header>

      <section aria-label="Photo gallery">
        <GalleryGrid posts={posts} />
      </section>
    </main>
  );
}
