import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

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
 * Numbered pagination. Rendered through the shadcn Pagination primitives
 * (`PaginationLink` already applies the shadcn button styles), kept as links
 * with real hrefs rather than client buttons, so each page stays cacheable and
 * works without JavaScript.
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

  return (
    <PaginationRoot className="mt-8 sm:mt-10">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          {page > 1 ? (
            <PaginationLink
              href={hrefFor(basePath, query, page - 1)}
              rel="prev"
              aria-label="Previous page"
              className="h-10 w-10 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </PaginationLink>
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center sm:h-9 sm:w-9"
              aria-hidden="true"
            >
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </PaginationItem>

        {items.map((item, index) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center sm:h-9 sm:w-9"
              >
                …
              </span>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                className="h-10 w-10 sm:h-9 sm:w-9"
                href={hrefFor(basePath, query, item)}
                aria-label={
                  item === page ? `Page ${item}, current page` : `Page ${item}`
                }
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {page < pageCount ? (
            <PaginationLink
              href={hrefFor(basePath, query, page + 1)}
              rel="next"
              aria-label="Next page"
              className="h-10 w-10 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </PaginationLink>
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center sm:h-9 sm:w-9"
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
