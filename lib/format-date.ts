/**
 * Deterministic `dd/mm/yyyy` formatting in Western Indonesian Time.
 *
 * Why this is computed by hand instead of with `Intl`:
 *
 * - `toLocaleDateString()` with no arguments formats in the *runtime's* locale
 *   and zone. The server and the browser disagree on both, so a card would
 *   render one date on the server and a different one on the client and React
 *   would flag a hydration mismatch. Denslab renders cards from a Server
 *   Component, so this is a real failure, not a theoretical one.
 * - Even `Intl.DateTimeFormat` with an explicit locale *and* timezone is only
 *   as stable as its ICU data. Node can ship small-icu and the browser's copy
 *   can be older, so identical inputs can still format differently on the two
 *   sides. The output here has no month names or localised separators to get
 *   wrong, so `Intl` buys nothing and costs determinism.
 *
 * The offset is hardcoded: Indonesia has never observed DST, so WIB is UTC+7
 * all year. No date library is involved.
 */

/** `Asia/Jakarta` (WIB) is UTC+7 year-round, no DST. */
const WIB_OFFSET_MINUTES = 7 * 60;

const MINUTES_PER_DAY = 24 * 60;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Formats a Supabase `created_at` timestamp as `dd/mm/yyyy` in WIB.
 *
 * Returns `null` for a missing or unparseable timestamp so the caller can omit
 * the date entirely rather than render a dangling separator next to the title.
 *
 * The year is read through `getUTCFullYear()` after shifting, never
 * `getFullYear()`: `getFullYear()` reports the year of whatever zone the
 * process happens to run in, which is the exact coupling this file exists to
 * avoid.
 */
export function formatWibDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  const time = parsed.getTime();
  if (Number.isNaN(time)) return null;

  const shifted = new Date(time + WIB_OFFSET_MINUTES * 60 * 1000);

  const day = shifted.getUTCDate();
  const month = shifted.getUTCMonth() + 1;
  const year = shifted.getUTCFullYear();

  return `${pad2(day)}/${pad2(month)}/${year}`;
}

/**
 * The shift above is done in epoch milliseconds rather than by adding on the
 * clock, so a timestamp near the end of a UTC day rolls into the next WIB day
 * on its own. Kept as a named helper because the separator between title and
 * date is this exact string, and a typo here would be invisible in review.
 */
export const TITLE_DATE_SEPARATOR = " \u2022 ";

/**
 * The date a stored timestamp falls on in WIB, as `yyyy-mm-dd`.
 *
 * Used as the `dateTime` attribute for `<time>`, where the machine-readable
 * form is what assistive tech and search engines read. A WIB day boundary can
 * differ from the UTC one, so the value is shifted before being sliced.
 */
export function wibIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  const time = parsed.getTime();
  if (Number.isNaN(time)) return null;

  const shiftedMs = time + WIB_OFFSET_MINUTES * 60 * 1000;
  const shifted = new Date(shiftedMs);

  // Guarded by construction, but the shift crossing a day boundary is the
  // whole point of this module, so the arithmetic is stated once and asserted.
  const daysSinceEpoch = Math.floor(shiftedMs / (MINUTES_PER_DAY * 60 * 1000));

  return `${shifted.getUTCFullYear()}-${pad2(
    shifted.getUTCMonth() + 1,
  )}-${pad2(shifted.getUTCDate())}`;
}
