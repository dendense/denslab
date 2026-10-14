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
    <form
      action={action}
      role="search"
      className="flex w-full max-w-xl items-stretch gap-2"
    >
      {Object.entries(preserve).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="relative flex-1">
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search title, description, or tag"
          aria-label="Search posts"
          maxLength={80}
          className="h-full pl-3"
        />
      </div>

      <Button
        type="submit"
        size="icon"
        className="size-11 shrink-0 [&_svg]:size-5"
        aria-label="Search"
        title="Search"
      >
        <Search className="size-5" aria-hidden="true" />
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
