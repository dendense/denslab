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
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search title, description, or tag"
          aria-label="Search posts"
          maxLength={80}
          className="pl-9"
        />
      </div>

      <Button type="submit" className="shrink-0">
        Search
      </Button>

      {defaultValue && (
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href={action} aria-label="Clear search" title="Clear search">
            <X aria-hidden="true" />
          </Link>
        </Button>
      )}
    </form>
  );
}
