/**
 * Form parsing helpers shared by the admin server actions.
 *
 * Kept out of app/admin/actions.ts because a `"use server"` module may only
 * export async functions, and these are plain synchronous helpers.
 */

/** Accepts a full Imgur page URL or a bare id, returns the bare id. */
export function parseImgurId(input: string): string | null {
  const value = input.trim();

  const urlMatch = value.match(
    /^https?:\/\/(?:www\.)?i\.imgur\.com\/([A-Za-z0-9]+)(?:\.(?:jpe?g|png|webp))?$/i,
  );

  if (urlMatch) return urlMatch[1];

  if (/^[A-Za-z0-9]{5,12}$/.test(value)) return value;

  return null;
}

export function parseTags(input: FormDataEntryValue | null): string[] {
  if (typeof input !== "string") return [];

  return Array.from(
    new Set(
      input
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

export function num(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
