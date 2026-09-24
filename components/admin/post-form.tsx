"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { createPost, updatePost, type ActionResult } from "@/app/admin/actions";
import type { AiMetadata, PhotoMetadata, Post } from "@/lib/posts";

type Category = "AI Generated" | "Photoshoot";

const AI_DEFAULTS: AiMetadata = {
  prompt: "",
  negativePrompt: "",
  model: "",
  platform: "",
  seed: 0,
};

const PHOTO_DEFAULTS: PhotoMetadata = {
  body: "",
  lens: "",
  aperture: "",
  shutterSpeed: "",
  iso: 100,
};

function initialCategory(post?: Post): Category {
  return post?.category ?? "AI Generated";
}

const inputClass =
  "border-brutal-thin w-full bg-canvas px-3 py-2 font-mono text-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent";

const labelClass =
  "mb-1 block font-mono text-[10px] font-bold uppercase tracking-wide";

export function PostForm({
  post,
  onDone,
  onCancel,
}: {
  post?: Post;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<Category>(initialCategory(post));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = post?.category === "AI Generated" ? post.metadata : AI_DEFAULTS;
  const photo =
    post?.category === "Photoshoot" ? post.photoMetadata : PHOTO_DEFAULTS;

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result: ActionResult = post
      ? await updatePost(post.id, formData)
      : await createPost(formData);

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    onDone();
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <fieldset className="border-brutal bg-canvas p-4 sm:p-5">
        <legend className="px-1 font-display text-sm font-bold uppercase tracking-wide">
          Category
        </legend>

        <div className="flex flex-wrap gap-2">
          {(["AI Generated", "Photoshoot"] as const).map((option) => {
            const active = category === option;
            return (
              <label
                key={option}
                className={`border-brutal-thin cursor-pointer px-4 py-2 font-display text-sm font-bold brutal-press ${
                  active ? "bg-accent text-on-accent" : "bg-canvas"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={option}
                  checked={active}
                  onChange={() => setCategory(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={post?.title ?? ""}
            maxLength={120}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Conceptual description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={post?.description ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="imgurId" className={labelClass}>
            Imgur URL or id
          </label>
          <input
            id="imgurId"
            name="imgurId"
            placeholder="https://i.imgur.com/abc123.jpg"
            defaultValue={post?.imgurId ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="width" className={labelClass}>
            Width (px)
          </label>
          <input
            id="width"
            name="width"
            type="number"
            min={1}
            defaultValue={post?.width ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="height" className={labelClass}>
            Height (px)
          </label>
          <input
            id="height"
            name="height"
            type="number"
            min={1}
            defaultValue={post?.height ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tags" className={labelClass}>
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="cinematic, night, wide"
            defaultValue={post?.tags.join(", ") ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      {category === "AI Generated" ? (
        <fieldset className="border-brutal bg-canvas p-4 sm:p-5">
          <legend className="px-1 font-display text-sm font-bold uppercase tracking-wide">
            AI Metadata
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="prompt" className={labelClass}>
                Prompt
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={3}
                defaultValue={ai.prompt}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="negativePrompt" className={labelClass}>
                Negative prompt
              </label>
              <textarea
                id="negativePrompt"
                name="negativePrompt"
                rows={2}
                defaultValue={ai.negativePrompt}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="model" className={labelClass}>
                Model
              </label>
              <input
                id="model"
                name="model"
                defaultValue={ai.model}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="platform" className={labelClass}>
                Platforms
              </label>
              <input
                id="platform"
                name="platform"
                defaultValue={ai.platform}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="seed" className={labelClass}>
                Seed
              </label>
              <input
                id="seed"
                name="seed"
                type="number"
                defaultValue={ai.seed}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>
      ) : (
        <fieldset className="border-brutal bg-canvas p-4 sm:p-5">
          <legend className="px-1 font-display text-sm font-bold uppercase tracking-wide">
            Camera
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="body" className={labelClass}>
                Body
              </label>
              <input
                id="body"
                name="body"
                defaultValue={photo.body}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="lens" className={labelClass}>
                Lens
              </label>
              <input
                id="lens"
                name="lens"
                defaultValue={photo.lens}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="aperture" className={labelClass}>
                Aperture
              </label>
              <input
                id="aperture"
                name="aperture"
                placeholder="f/1.8"
                defaultValue={photo.aperture}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="shutterSpeed" className={labelClass}>
                Shutter speed
              </label>
              <input
                id="shutterSpeed"
                name="shutterSpeed"
                placeholder="1/250s"
                defaultValue={photo.shutterSpeed}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="iso" className={labelClass}>
                ISO
              </label>
              <input
                id="iso"
                name="iso"
                type="number"
                min={1}
                defaultValue={photo.iso}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>
      )}

      {error && (
        <p
          role="alert"
          className="border-brutal-thin bg-canvas px-3 py-2 font-mono text-xs leading-relaxed"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {post ? "Save changes" : "Create post"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="border-brutal-thin px-4 py-2 font-display text-sm font-bold brutal-press"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
