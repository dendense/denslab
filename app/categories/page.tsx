import { redirect } from "next/navigation";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/posts";

/**
 * `/categories` has no page of its own; send visitors to the first category.
 */
export default function CategoriesIndexPage() {
  redirect(`/categories/${CATEGORY_SLUGS[CATEGORIES[0]]}`);
}
