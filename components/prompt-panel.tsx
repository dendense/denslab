"use client";

import { Check, Copy, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AiMetadata, PhotoMetadata, Post } from "@/lib/posts";

const AI_FIELDS: { key: keyof AiMetadata; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "platform", label: "Platforms" },
  { key: "seed", label: "Seed" },
];

const PHOTO_FIELDS: { key: keyof PhotoMetadata; label: string }[] = [
  { key: "body", label: "Body" },
  { key: "lens", label: "Lens" },
  { key: "aperture", label: "Aperture" },
  { key: "shutterSpeed", label: "Shutter" },
  { key: "iso", label: "ISO" },
];

/**
 * Gated technical details, shaped by category: AI posts reveal the prompt and
 * generation settings, Photoshoot posts reveal capture settings. Guests get a
 * blurred preview and a login call to action in both cases.
 */
export function PromptPanel({
  post,
  isAuthenticated,
}: {
  post: Post;
  isAuthenticated: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const isAi = post.category === "AI Generated";
  const heading = isAi ? "Prompt & Metadata" : "Capture Settings";
  const cta = isAi
    ? "Login or register to reveal the full prompt."
    : "Login or register to reveal the capture settings.";
  const ctaButton = isAi ? "Login to reveal prompt" : "Login to reveal settings";

  async function copyPrompt() {
    if (!isAi) return;

    const payload = post.metadata.negativePrompt
      ? `${post.metadata.prompt}\n\nNegative prompt: ${post.metadata.negativePrompt}`
      : post.metadata.prompt;

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission).
    }
  }

  return (
    <section
      aria-labelledby="details-heading"
      className="border-brutal bg-canvas shadow-brutal-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b-brutal px-4 py-3 sm:px-5">
        <h2
          id="details-heading"
          className="font-display text-base font-bold sm:text-lg"
        >
          {heading}
        </h2>

        {!isAuthenticated ? (
          <span className="border-brutal-thin flex shrink-0 items-center gap-1 bg-canvas px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Locked
          </span>
        ) : isAi ? (
          <button
            type="button"
            onClick={copyPrompt}
            className="border-brutal-thin flex shrink-0 items-center gap-1.5 bg-accent px-2.5 py-1.5 font-display text-xs font-bold text-on-accent brutal-press sm:px-3 sm:text-sm"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy Prompt"}
          </button>
        ) : null}
      </header>

      <div className="relative">
        <div
          aria-hidden={!isAuthenticated}
          className={`space-y-4 p-4 sm:p-5 ${
            isAuthenticated ? "" : "select-none blur-[6px]"
          }`}
        >
          {isAi && (
            <>
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wide">
                  Positive prompt
                </p>
                <p className="break-words font-mono text-xs leading-relaxed">
                  {post.metadata.prompt}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wide">
                  Negative prompt
                </p>
                <p className="break-words font-mono text-xs leading-relaxed">
                  {post.metadata.negativePrompt || "—"}
                </p>
              </div>
            </>
          )}

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(isAi ? AI_FIELDS : PHOTO_FIELDS).map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="break-all font-mono text-xs">
                  {isAi
                    ? String(post.metadata[key as keyof AiMetadata])
                    : String(
                        post.photoMetadata[key as keyof PhotoMetadata],
                      )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {!isAuthenticated && (
          <div className="border-t-brutal absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-canvas p-5 text-center sm:p-6">
            <p className="max-w-xs font-display text-sm font-bold sm:text-base">
              {cta}
            </p>
            <Link
              href="/login"
              className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {ctaButton}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
