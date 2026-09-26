"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { imgurFullUrl, imgurThumbUrl } from "@/lib/posts";

/**
 * Post image with a Neobrutalist fallback.
 *
 * Whether the Imgur id is valid is decided on the server and passed in as
 * `imageAvailable`. It cannot be decided here: Imgur sends no CORS headers, the
 * optimizer hides the upstream URL, and the served dimensions depend on viewport
 * width, so a small mobile variant of a real photo is indistinguishable from
 * Imgur's `removed.png` by size alone.
 *
 * `onError` stays as a second line of defence for network failures after load.
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
  fullSize = false,
  imageAvailable,
}: {
  imgurId: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  quality?: number;
  priority?: boolean;
  className?: string;
  /** Called once the image is shown or replaced, so a skeleton can be cleared. */
  onSettled?: () => void;
  /** Detail page uses the full-resolution Imgur file instead of a thumbnail. */
  fullSize?: boolean;
  /** Server-side verdict on whether the Imgur id resolves. */
  imageAvailable: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!imageAvailable || failed || !imgurId) {
    return (
      <Placeholder
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
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
      onLoad={() => onSettled?.()}
      onError={() => {
        setFailed(true);
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
