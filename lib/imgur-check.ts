/**
 * Server-side check for whether an Imgur id resolves to a real image.
 *
 * Why this lives on the server:
 * - Imgur answers a dead id with a redirect to `removed.png`, and sends no CORS
 *   headers, so the browser cannot read that redirect.
 * - `next/image` masks the upstream URL behind the optimizer, so the rendered
 *   `<img>` cannot reveal it either.
 * - Deciding from the rendered element's dimensions does not work: the served
 *   size depends on viewport width, so a small mobile variant of a real photo
 *   looks like the removed placeholder. That caused images to disappear on
 *   phones while showing fine on desktop.
 *
 * A HEAD request is used so no image bytes are transferred.
 */

/** Per-process memo, so a warm instance does not re-probe on every request. */
const cache = new Map<string, boolean>();

/** How long a stored verdict stays usable. */
const TTL_MS = 1000 * 60 * 60; // 1 hour
const checkedAt = new Map<string, number>();

export async function isImgurImageAvailable(imgurId: string): Promise<boolean> {
  if (!imgurId) return false;

  const cached = cache.get(imgurId);
  const when = checkedAt.get(imgurId) ?? 0;

  if (cached !== undefined && Date.now() - when < TTL_MS) return cached;

  try {
    const response = await fetch(`https://i.imgur.com/${imgurId}h.jpg`, {
      method: "HEAD",
      redirect: "follow",
      // Stored in Next's fetch cache so repeat checks are cheap.
      next: { revalidate: 3600, tags: ["imgur-check"] },
    });

    // A live image ends at `<id>h.jpg`; a dead one ends at `removed.png`.
    const landedOnRemoved = response.url.includes("removed");
    const ok = response.ok && !landedOnRemoved;

    cache.set(imgurId, ok);
    checkedAt.set(imgurId, Date.now());

    return ok;
  } catch {
    // A network failure is not proof the image is gone. Assume it is fine and
    // let the client's onError handle a genuine load failure, so a transient
    // blip never hides a working image.
    return true;
  }
}

/**
 * Availability for many ids at once, so a gallery does not await checks
 * sequentially.
 */
export async function checkImgurImages(
  imgurIds: string[],
): Promise<Record<string, boolean>> {
  const unique = [...new Set(imgurIds)];

  const entries = await Promise.all(
    unique.map(async (id) => [id, await isImgurImageAvailable(id)] as const),
  );

  return Object.fromEntries(entries);
}
