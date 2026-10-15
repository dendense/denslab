"use client";

import { Check, Copy, Lock } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
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

/** A field counts as present when it holds text or a finite number. */
function hasValue(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

/**
 * Long prompt text, clamped to five lines until the reader asks for the rest.
 * A real <button> with aria-expanded/aria-controls rather than <details>, so the
 * toggle stays keyboard-reachable and keeps the shadcn button styling. The label
 * always renders: deciding "does this overflow five lines?" in JS would need a
 * measurement pass and would get the answer wrong before layout settles.
 */
function PromptText({ label, text }: { label: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium leading-none font-mono">{label}</p>
      <p
        id={contentId}
        className={`break-words font-mono text-xs leading-relaxed ${
          expanded ? "line-clamp-none" : "line-clamp-5"
        }`}
      >
        {text}
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? "Show less" : "Show more"}
        <span className="sr-only"> {label.toLowerCase()}</span>
      </Button>
    </div>
  );
}

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

  const prompt = isAi ? post.metadata.prompt : "";
  const negativePrompt = isAi ? post.metadata.negativePrompt : "";

  const fields = (isAi ? AI_FIELDS : PHOTO_FIELDS).filter(({ key }) =>
    isAi
      ? hasValue(post.metadata[key as keyof AiMetadata])
      : hasValue(post.photoMetadata[key as keyof PhotoMetadata]),
  );

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

  // Nothing to show would mean a panel with a heading and no content.
  if (!hasValue(prompt) && !hasValue(negativePrompt) && fields.length === 0) {
    return null;
  }

  return (
    <Card aria-labelledby="details-heading" className="overflow-hidden">
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

      <CardContent>
        <div aria-hidden={!isAuthenticated} className="space-y-4 select-none blur-[6px]">
          {hasValue(prompt) && <PromptText label="Positive prompt" text={prompt} />}

          {hasValue(negativePrompt) && (
            <PromptText
              label="Negative prompt"
              text={negativePrompt}
            />
          )}

          {fields.length > 0 && (
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {fields.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <dt className="text-sm font-medium leading-none font-mono">{label}</dt>
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
          )}
        </div>

        {!isAuthenticated && (
          <div className="bg-background mt-4 flex flex-col items-center gap-3 border-t pt-5 text-center sm:pt-6">
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
