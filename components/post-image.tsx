"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { imgurFullUrl, imgurThumbUrl } from "@/lib/posts";

/**
 * Post image with a Neobrutalist fallback.
 *
 * A post can point at an Imgur id that no longer resolves — Imgur then serves
 * its own "removed" placeholder, which looks like a broken third-party asset
 * rather than part of the design. This component detects that case and swaps in
 * a branded placeholder instead.
 *
 * Two failure modes are handled:
 * 1. The image fails to load at all (`onError`).
 * 2. The image loads but is Imgur's tiny `removed.png` fallback, detected by its
 *    known dimensions. A load event alone cannot tell these apart.
 */
export function PostImage({
  imgurId,
  alt,
  width,
  height,
  sizes,
  quality,
  priority = false,
  className = "",
  onSettled,
  /** Detail page uses the full-resolution Imgur file instead of a thumbnail. */
  fullSize = false,
}: {
  imgurId: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  quality?: number;
  priority?: boolean;
  className?: string;
  /**
   * Called once the image has either loaded or definitively failed, so the
   * caller can drop its loading skeleton either way.
   */
  onSettled?: () => void;
  fullSize?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !imgurId) {
    return (
      <Placeholder
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  function markFailed() {
    setFailed(true);
    onSettled?.();
  }

  return (
    <Image
      src={fullSize ? imgurFullUrl(imgurId) : imgurThumbUrl(imgurId)}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={markFailed}
      onLoad={(event) => {
        // Imgur's removed.png is 161x81. A real photo is never that small, so a
        // successful load event alone cannot be trusted here.
        const img = event.currentTarget;
        if (img.naturalWidth <= 200 && img.naturalHeight <= 200) {
          markFailed();
          return;
        }
        onSettled?.();
      }}
      className={className}
    />
  );
}

/**
 * Branded stand-in that keeps the post's aspect ratio, so the masonry grid does
 * not reflow when an image is missing.
 */
export function Placeholder({
  alt,
  width,
  height,
  className = "",
}: {
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const ratio = height > 0 ? `${width} / ${height}` : "4 / 3";

  return (
    <div
      role="img"
      aria-label={`${alt} — image unavailable`}
      style={{ aspectRatio: ratio }}
      className={`brutal-placeholder flex flex-col items-center justify-center gap-2 border-b-brutal bg-canvas p-4 text-center ${className}`}
    >
      <ImageOff className="h-6 w-6" aria-hidden="true" />
      <span className="font-display text-xs font-bold uppercase tracking-wide sm:text-sm">
        Image unavailable
      </span>
    </div>
  );
}
