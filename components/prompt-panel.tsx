"use client";

import { Check, Copy, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card aria-labelledby="details-heading">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle id="details-heading">{heading}</CardTitle>

        {!isAuthenticated ? (
          <Badge variant="secondary" className="shrink-0">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Locked
          </Badge>
        ) : isAi ? (
          <Button type="button" size="sm" onClick={copyPrompt} className="shrink-0">
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy Prompt"}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="relative">
        <div
          aria-hidden={!isAuthenticated}
          className={`space-y-4 ${
            isAuthenticated ? "" : "select-none blur-[6px]"
          }`}
        >
          {isAi && (
            <>
              <div className="space-y-1.5">
                <p className="text-sm font-medium leading-none">Positive prompt</p>
                <p className="break-words font-mono text-xs leading-relaxed">
                  {post.metadata.prompt}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium leading-none">Negative prompt</p>
                <p className="break-words font-mono text-xs leading-relaxed">
                  {post.metadata.negativePrompt || "—"}
                </p>
              </div>
            </>
          )}

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(isAi ? AI_FIELDS : PHOTO_FIELDS).map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <dt className="text-sm font-medium leading-none">{label}</dt>
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
          <div className="bg-background absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 border-t p-5 text-center sm:p-6">
            <p className="max-w-xs text-sm font-medium sm:text-base">{cta}</p>
            <Button asChild>
              <Link href="/login">
                <Lock aria-hidden="true" />
                {ctaButton}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
