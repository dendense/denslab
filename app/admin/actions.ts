"use server";

import { revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getViewer } from "@/lib/auth/viewer";
import { POSTS_CACHE_TAG } from "@/lib/posts-repository";
import { createClient } from "@/lib/supabase/server";
import { num, parseImgurId, parseTags, str } from "@/app/admin/form-utils";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Shared guard: every mutation re-checks the admin role server-side. */
async function requireAdmin(): Promise<
  { supabase: SupabaseClient } | { error: string }
> {
  const viewer = await getViewer();

  if (!viewer) return { error: "You must be signed in." };
  if (!viewer.isAdmin) return { error: "Admin role required." };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  return { supabase };
}

type PostFields = {
  title: string;
  description: string;
  imgur_id: string;
  width: number;
  height: number;
  category: "AI Generated" | "Photoshoot";
  tags: string[];
  metadata: Record<string, unknown> | null;
  photo_metadata: Record<string, unknown> | null;
};

/**
 * Validates the form and shapes the row. The category decides which payload is
 * built, and the other is forced to null, matching the CHECK constraint in
 * supabase/schema.sql.
 */
function buildFields(formData: FormData): PostFields | { error: string } {
  const category = str(formData.get("category"));
  const imgurId = parseImgurId(str(formData.get("imgurId")));
  const title = str(formData.get("title"));
  const description = str(formData.get("description"));
  const width = num(formData.get("width"));
  const height = num(formData.get("height"));

  if (category !== "AI Generated" && category !== "Photoshoot") {
    return { error: "Pick a category." };
  }
  if (!imgurId) {
    return {
      error: "Enter a valid Imgur URL like https://i.imgur.com/abc123.jpg",
    };
  }
  if (title.length < 1 || title.length > 120) {
    return { error: "Title must be 1 to 120 characters." };
  }
  if (!description) return { error: "Description is required." };
  if (!Number.isInteger(width) || width <= 0) {
    return { error: "Width must be a positive whole number." };
  }
  if (!Number.isInteger(height) || height <= 0) {
    return { error: "Height must be a positive whole number." };
  }

  const base = {
    title,
    description,
    imgur_id: imgurId,
    width,
    height,
    tags: parseTags(formData.get("tags")),
  } satisfies Omit<PostFields, "category" | "metadata" | "photo_metadata">;

  if (category === "AI Generated") {
    const prompt = str(formData.get("prompt"));
    const model = str(formData.get("model"));
    const platform = str(formData.get("platform"));
    const seed = num(formData.get("seed"));

    if (!prompt) return { error: "Prompt is required for AI posts." };
    if (!model) return { error: "Model is required for AI posts." };
    if (!platform) return { error: "Platform is required for AI posts." };
    if (!Number.isInteger(seed)) return { error: "Seed must be a whole number." };

    return {
      ...base,
      category,
      metadata: {
        prompt,
        negativePrompt: str(formData.get("negativePrompt")),
        model,
        platform,
        seed,
      },
      photo_metadata: null,
    };
  }

  const body = str(formData.get("body"));
  const lens = str(formData.get("lens"));
  const aperture = str(formData.get("aperture"));
  const shutterSpeed = str(formData.get("shutterSpeed"));
  const iso = num(formData.get("iso"));

  if (!body) return { error: "Camera body is required for Photoshoot posts." };
  if (!lens) return { error: "Lens is required for Photoshoot posts." };
  if (!aperture) return { error: "Aperture is required for Photoshoot posts." };
  if (!shutterSpeed) {
    return { error: "Shutter speed is required for Photoshoot posts." };
  }
  if (!Number.isInteger(iso) || iso <= 0) {
    return { error: "ISO must be a positive whole number." };
  }

  return {
    ...base,
    category,
    metadata: null,
    photo_metadata: { body, lens, aperture, shutterSpeed, iso },
  };
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const fields = buildFields(formData);
  if ("error" in fields) return { ok: false, error: fields.error };

  const { error } = await guard.supabase.from("posts").insert(fields);

  if (error) return { ok: false, error: error.message };

  revalidateTag(POSTS_CACHE_TAG, "max");
  return { ok: true };
}

export async function updatePost(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const fields = buildFields(formData);
  if ("error" in fields) return { ok: false, error: fields.error };

  const { error } = await guard.supabase
    .from("posts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateTag(POSTS_CACHE_TAG, "max");
  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const { error } = await guard.supabase.from("posts").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateTag(POSTS_CACHE_TAG, "max");
  return { ok: true };
}
