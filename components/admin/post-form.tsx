"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { createPost, updatePost, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  "border-brutal-thin h-auto w-full rounded-none bg-canvas px-3 py-2 font-mono text-sm shadow-none focus-visible:ring-0";

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

        <RadioGroup
          name="category"
          value={category}
          onValueChange={(value) => setCategory(value as Category)}
          className="flex flex-wrap gap-2"
        >
          {(["AI Generated", "Photoshoot"] as const).map((option) => {
            const active = category === option;
            return (
              <Label
                key={option}
                htmlFor={`category-${option}`}
                className={`border-brutal-thin cursor-pointer rounded-none px-4 py-2 font-display text-sm font-bold brutal-press ${
                  active ? "bg-accent text-on-accent" : "bg-canvas"
                }`}
              >
                <RadioGroupItem
                  id={`category-${option}`}
                  value={option}
                  className="sr-only"
                />
                {option}
              </Label>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title" className={labelClass}>
            Title
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={post?.title ?? ""}
            maxLength={120}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description" className={labelClass}>
            Conceptual description
          </Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={post?.description ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="imgurId" className={labelClass}>
            Imgur URL or id
          </Label>
          <Input
            id="imgurId"
            name="imgurId"
            placeholder="https://i.imgur.com/abc123.jpg"
            defaultValue={post?.imgurId ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="width" className={labelClass}>
            Width (px)
          </Label>
          <Input
            id="width"
            name="width"
            type="number"
            min={1}
            defaultValue={post?.width ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="height" className={labelClass}>
            Height (px)
          </Label>
          <Input
            id="height"
            name="height"
            type="number"
            min={1}
            defaultValue={post?.height ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="tags" className={labelClass}>
            Tags (comma separated)
          </Label>
          <Input
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
              <Label htmlFor="prompt" className={labelClass}>
                Prompt
              </Label>
              <textarea
                id="prompt"
                name="prompt"
                rows={3}
                defaultValue={ai.prompt}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="negativePrompt" className={labelClass}>
                Negative prompt
              </Label>
              <textarea
                id="negativePrompt"
                name="negativePrompt"
                rows={2}
                defaultValue={ai.negativePrompt}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="model" className={labelClass}>
                Model
              </Label>
              <Input
                id="model"
                name="model"
                defaultValue={ai.model}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="platform" className={labelClass}>
                Platforms
              </Label>
              <Input
                id="platform"
                name="platform"
                defaultValue={ai.platform}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="seed" className={labelClass}>
                Seed
              </Label>
              <Input
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
              <Label htmlFor="body" className={labelClass}>
                Body
              </Label>
              <Input
                id="body"
                name="body"
                defaultValue={photo.body}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="lens" className={labelClass}>
                Lens
              </Label>
              <Input
                id="lens"
                name="lens"
                defaultValue={photo.lens}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="aperture" className={labelClass}>
                Aperture
              </Label>
              <Input
                id="aperture"
                name="aperture"
                placeholder="f/1.8"
                defaultValue={photo.aperture}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="shutterSpeed" className={labelClass}>
                Shutter speed
              </Label>
              <Input
                id="shutterSpeed"
                name="shutterSpeed"
                placeholder="1/250s"
                defaultValue={photo.shutterSpeed}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="iso" className={labelClass}>
                ISO
              </Label>
              <Input
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
        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="border-brutal-thin h-auto gap-2 rounded-none bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {post ? "Save changes" : "Create post"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-brutal-thin h-auto rounded-none bg-canvas px-4 py-2 font-display text-sm font-bold shadow-none brutal-press hover:bg-canvas"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
