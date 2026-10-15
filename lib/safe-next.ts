/**
 * Validation for the `?next=` return path used by /login.
 *
 * A `next` value arrives from the URL, so it is attacker-controlled: without
 * validation `/login?next=https://evil.com` turns the login page into an open
 * redirect. Only same-origin absolute paths are accepted, everything else
 * falls back to `/`.
 *
 * Lives in one place because two call sites need the same answer: the
 * already-signed-in `redirect()` and the "Back to gallery" link. Duplicating
 * the rules there would let them drift apart.
 */

/** Where a request goes when `next` is missing or rejected. */
export const DEFAULT_NEXT = "/";

/**
 * Accept only a path that stays on this origin.
 *
 * Rejected, with the reason it can escape the origin:
 * - `https://evil.com`, `javascript:…` — a scheme makes it an absolute URL.
 *   Any `:` before the first `/` is a scheme, or a same-origin path that is
 *   ambiguous enough not to be worth guessing at (`/a:b`).
 * - `//evil.com` — protocol-relative, browsers resolve it against the scheme.
 * - `/\evil.com` — browsers normalise the backslash to `/`, so it becomes the
 *   protocol-relative form above.
 * - anything not starting with `/`.
 *
 * `\` is rejected anywhere in the string: some browsers treat it as a path
 * separator, which is how `/\evil.com` becomes `//evil.com`. The percent-encoded
 * form matters just as much — the browser decodes `%5C` to `\` while resolving
 * the URL, so `/%5C/evil.com` lands on `//evil.com` even though the raw string
 * contains no backslash. `%` is not decoded here, so that case is caught by the
 * escape check below.
 */
export function safeNextPath(
  value: string | string[] | null | undefined,
  fallback: string = DEFAULT_NEXT,
): string {
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== "string") return fallback;

  const candidate = raw.trim();

  if (candidate.length === 0) return fallback;
  // Must be an absolute path on this origin.
  if (!candidate.startsWith("/")) return fallback;
  // `//host` (protocol-relative) and `/\host` (normalised to `//host`).
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;
  // `\` anywhere: treated as a separator by some browsers.
  if (candidate.includes("\\")) return fallback;
  // Percent-encoded `\` (`%5c`): decoded to `\` by the browser during
  // resolution, so it becomes the protocol-relative form above.
  if (/%5c/i.test(candidate)) return fallback;
  // A scheme (`https:`, `javascript:`, `data:`) or `scheme:/host`.
  const firstSlash = candidate.indexOf("/", 1);
  const beforePath = firstSlash === -1 ? candidate.slice(1) : candidate.slice(1, firstSlash);
  if (beforePath.includes(":")) return fallback;

  return candidate;
}
