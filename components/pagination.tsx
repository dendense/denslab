import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Builds a page list with ellipses, e.g. 1 … 4 5 6 … 20.
 * Kept as a plain function so the window logic is easy to reason about.
 */
export function pageWindow(current: number, count: number): (number | "gap")[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, count, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= count).sort(
    (a, b) => a - b,
  );

  const out: (number | "gap")[] = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }

  return out;
}

function hrefFor(basePath: string, query: string, page: number) {
  const params = new URLSearchParams(query);
  if (page === 1) params.delete("page");
  else params.set("page", String(page));

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

/**
 * Numbered pagination. Links rather than client buttons, so each page stays
 * cacheable and works without JavaScript.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  query = "",
}: {
  page: number;
  pageCount: number;
  basePath: string;
  query?: string;
}) {
  if (pageCount <= 1) return null;

  const items = pageWindow(page, pageCount);

  const cell =
    "border-brutal-thin flex h-10 min-w-10 items-center justify-center px-3 font-display text-sm font-bold";
  const disabled = `${cell} cursor-not-allowed opacity-40`;
  const active = `${cell} bg-accent text-on-accent`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(basePath, query, page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={`${cell} brutal-press`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabled} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {items.map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 font-display text-sm font-bold"
          >
            …
          </span>
        ) : item === page ? (
          <span key={item} className={active} aria-current="page">
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(basePath, query, item)}
            aria-label={`Page ${item}`}
            className={`${cell} brutal-press`}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefFor(basePath, query, page + 1)}
          rel="next"
          aria-label="Next page"
          className={`${cell} brutal-press`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabled} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
