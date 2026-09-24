import Link from "next/link";
import { Search, X } from "lucide-react";

/**
 * Search form for the gallery.
 *
 * A plain GET form rather than a client component: the query lives in the URL,
 * so results are shareable and bookmarkable, pagination keeps the term, and the
 * page still works without JavaScript. Submitting resets `page` because the
 * form only carries the fields it declares.
 */
export function SearchBox({
  action = "/",
  defaultValue = "",
  /** Hidden fields preserved on submit, e.g. the current category. */
  preserve = {},
}: {
  action?: string;
  defaultValue?: string;
  preserve?: Record<string, string>;
}) {
  return (
    <form action={action} role="search" className="flex w-full max-w-xl gap-2">
      {Object.entries(preserve).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search title, description, or tag"
          aria-label="Search posts"
          maxLength={80}
          className="border-brutal-thin h-11 w-full bg-canvas pl-9 pr-3 font-mono text-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>

      <button
        type="submit"
        className="border-brutal-thin h-11 shrink-0 bg-accent px-4 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press"
      >
        Search
      </button>

      {defaultValue && (
        <Link
          href={action}
          aria-label="Clear search"
          title="Clear search"
          className="border-brutal-thin flex h-11 w-11 shrink-0 items-center justify-center brutal-press"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </form>
  );
}
