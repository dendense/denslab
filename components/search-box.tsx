import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Search form for the gallery.
 *
 * A plain GET form rather than a client component: the query lives in the URL,
 * so results are shareable and bookmarkable, pagination keeps the term, and the
 * page still works without JavaScript. Submitting resets `page` because the
 * form only carries the fields it declares.
 *
 * shadcn Input/Button supply the shell; denslab's brutal utilities and the mono
 * type keep the site's own look.
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
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search title, description, or tag"
          aria-label="Search posts"
          maxLength={80}
          className="border-brutal-thin h-11 rounded-none bg-canvas pl-9 pr-3 font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <Button
        type="submit"
        className="border-brutal-thin h-11 shrink-0 rounded-none bg-accent px-4 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press hover:bg-accent"
      >
        Search
      </Button>

      {defaultValue && (
        <Button
          asChild
          variant="outline"
          className="border-brutal-thin h-11 w-11 shrink-0 rounded-none bg-canvas p-0 brutal-press hover:bg-canvas"
        >
          <Link href={action} aria-label="Clear search" title="Clear search">
            <X className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      )}
    </form>
  );
}
