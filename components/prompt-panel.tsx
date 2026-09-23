"use client";

import { Check, Copy, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PostMetadata } from "@/lib/posts";

const META_LABELS: { key: keyof PostMetadata; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "sampler", label: "Sampler" },
  { key: "seed", label: "Seed" },
  { key: "steps", label: "Steps" },
  { key: "cfgScale", label: "CFG" },
  { key: "aspectRatio", label: "Ratio" },
];

/**
 * Prompt + generation metadata. Guests get a blurred, locked preview; signed-in
 * users get the real values and a copy button.
 */
export function PromptPanel({
  metadata,
  isAuthenticated,
}: {
  metadata: PostMetadata;
  isAuthenticated: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    const payload = metadata.negativePrompt
      ? `${metadata.prompt}\n\nNegative prompt: ${metadata.negativePrompt}`
      : metadata.prompt;

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
      aria-labelledby="prompt-heading"
      className="border-brutal bg-canvas shadow-brutal-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b-brutal px-4 py-3 sm:px-5">
        <h2
          id="prompt-heading"
          className="font-display text-base font-bold sm:text-lg"
        >
          Prompt &amp; Metadata
        </h2>

        {isAuthenticated ? (
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
        ) : (
          <span className="border-brutal-thin flex shrink-0 items-center gap-1 bg-canvas px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Locked
          </span>
        )}
      </header>

      <div className="relative">
        <div
          aria-hidden={!isAuthenticated}
          className={`space-y-4 p-4 sm:p-5 ${
            isAuthenticated ? "" : "select-none blur-[6px]"
          }`}
        >
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide">
              Positive prompt
            </p>
            <p className="break-words font-mono text-xs leading-relaxed">
              {metadata.prompt}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide">
              Negative prompt
            </p>
            <p className="break-words font-mono text-xs leading-relaxed">
              {metadata.negativePrompt || "—"}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-2 border-t-brutal-thin pt-4 sm:grid-cols-3">
            {META_LABELS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="break-all font-mono text-xs">
                  {String(metadata[key])}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {!isAuthenticated && (
          <div className="border-t-brutal absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-canvas p-5 text-center sm:p-6">
            <p className="max-w-xs font-display text-sm font-bold sm:text-base">
              Login or register to reveal the full prompt.
            </p>
            <Link
              href="/login"
              className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Login to reveal prompt
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
