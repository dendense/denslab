/**
 * Self-check for lib/format-date.ts.
 *
 * Run: `node --experimental-strip-types lib/format-date.selfcheck.ts`
 *
 * The `.ts` extension in the import below is required by Node's
 * `--experimental-strip-types`, which does no specifier resolution. TypeScript
 * rejects the same import, so this file is excluded from tsconfig and never
 * reaches the app bundle; only Node runs it.
 *
 * Nothing here needs a test framework. The cross-day case is the reason this
 * file exists: a 02:00 WIB upload is stored as 19:00 UTC on the *previous*
 * calendar day, so a formatter that forgets the offset reports the wrong date
 * and looks perfectly fine on every other input.
 */
import assert from "node:assert/strict";
import {
  TITLE_DATE_SEPARATOR,
  formatWibDate,
  wibIsoDate,
} from "./format-date.ts";

// Format: zero-padded dd/mm/yyyy, not d/m/yyyy.
assert.equal(formatWibDate("2026-10-15T04:21:34.896927+00:00"), "15/10/2026");
assert.equal(formatWibDate("2026-01-05T00:00:00.000Z"), "05/01/2026");

// Cross-day: 15 Oct 19:00 UTC is 16 Oct 02:00 WIB.
assert.equal(formatWibDate("2026-10-15T19:00:00.000Z"), "16/10/2026");
// The naive UTC answer would have been 15/10/2026 - that is the bug this
// guards against, so assert the wrong answer is not produced.
assert.notEqual(formatWibDate("2026-10-15T19:00:00.000Z"), "15/10/2026");

// Cross-month and cross-year, both rolling forward.
assert.equal(formatWibDate("2026-10-31T18:00:00.000Z"), "01/11/2026");
assert.equal(formatWibDate("2026-12-31T17:30:00.000Z"), "01/01/2027");
// Still the previous WIB day just before the boundary (16:59 UTC = 23:59 WIB).
assert.equal(formatWibDate("2026-12-31T16:59:00.000Z"), "31/12/2026");

// Day length varies by month, so 31 days is not a safe assumption either way.
assert.equal(formatWibDate("2026-01-31T20:00:00.000Z"), "01/02/2026");
assert.equal(formatWibDate("2024-02-28T20:00:00.000Z"), "29/02/2024");

// Missing or unusable values return null so no dangling separator is rendered.
assert.equal(formatWibDate(null), null);
assert.equal(formatWibDate(undefined), null);
assert.equal(formatWibDate(""), null);
assert.equal(formatWibDate("not a date"), null);

// Machine-readable WIB day for the `dateTime` attribute.
assert.equal(wibIsoDate("2026-10-15T19:00:00.000Z"), "2026-10-16");
assert.equal(wibIsoDate("2026-10-15T04:21:34.896927+00:00"), "2026-10-15");
assert.equal(wibIsoDate(null), null);

// The separator is U+2022 with a space either side, not a hyphen or a pipe.
assert.equal(TITLE_DATE_SEPARATOR, " \u2022 ");
assert.equal(TITLE_DATE_SEPARATOR.length, 3);
assert.equal(TITLE_DATE_SEPARATOR.codePointAt(1), 0x2022);

console.log("format-date selfcheck: all assertions passed");
