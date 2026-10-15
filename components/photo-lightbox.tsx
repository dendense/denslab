"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ZoomIn } from "lucide-react";
import { useState } from "react";
import { PostImage } from "@/components/post-image";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Portrait photos can be opened full screen.
 *
 * Why not `DialogContent`: it hard-codes `<DialogOverlay />` with no className
 * hook, so the `bg-background/80` backdrop could only be replaced by editing
 * `components/ui/dialog.tsx` — a shared file. It also always renders its own
 * close button, and hiding that globally would remove the X from every other
 * dialog in the repo. Composing the parts this repo already exports (root,
 * portal, overlay) plus the Radix content primitive keeps both changes local:
 * the `black/90` backdrop Deny asked for, and exactly one close button — ours,
 * sitting outside the photo rather than floating on top of it.
 *
 * Radix supplies the behaviour: focus trap, Escape to close, body scroll lock,
 * modality (the rest of the page is `aria-hidden`), and pointer-down-outside
 * closing. Clicking the photo itself does not close, because the photo sits
 * inside the content, not outside it.
 *
 * The card view is capped at `max-h-[80vh]`; the full-screen view is
 * deliberately larger (`85vh`) — that is the point of opening it.
 */
export function PhotoLightbox({
  imgurId,
  alt,
  width,
  height,
  imageAvailable,
  sizes,
}: {
  imgurId: string;
  alt: string;
  width: number;
  height: number;
  imageAvailable: boolean;
  sizes: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* A real button, so the zoom affordance is reachable by Tab and
          activatable with Enter/Space. */}
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`View ${alt} full screen`}
          className="group block w-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {/* The chip is positioned against this wrapper, which shrinks to the
              photo's own box — anchoring it to the full-width button would park
              the icon out on the card background beside a narrow portrait. */}
          <span className="relative mx-auto block w-fit">
            <PostImage
              imgurId={imgurId}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              fullSize
              priority
              imageAvailable={imageAvailable}
              className="h-auto max-h-[80vh] w-auto object-contain"
            />

            {/* Always visible rather than hover-only: hover is unavailable on
                touch, where the affordance would silently disappear. The chip is
                a dark plate so the white glyph keeps its contrast over a photo
                of any brightness. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </span>
          </span>
        </button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="bg-black/90" />

        {/* Column layout: the photo, then the close control beneath it, so the
            button never covers any part of the image. */}
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex w-max max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 focus:outline-none">
          <DialogPrimitive.Title className="sr-only">
            {alt} — full screen
          </DialogPrimitive.Title>

          {/* `priority` matters here: without it the image is lazy, and a lazy
              image whose box is still 0×0 (width is auto, so nothing sizes it
              before the bytes arrive) never enters the viewport to trigger the
              load — the dialog opens empty. */}
          <PostImage
            imgurId={imgurId}
            alt={alt}
            width={width}
            height={height}
            sizes="95vw"
            fullSize
            priority
            imageAvailable={imageAvailable}
            className="h-auto max-h-[85vh] w-auto max-w-[95vw] object-contain"
          />

          {/* `DialogClose` closes the dialog itself, so this click is not also
              read as a backdrop click. No plate: on a black/90 backdrop a
              black/70 chip measured 1.11:1 and effectively vanished, while a
              plain white glyph reads ~17:1 against it. No shadow, per Deny. */}
          <DialogPrimitive.Close
            data-dialog-close=""
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
