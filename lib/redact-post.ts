import type { Post } from "@/lib/posts";

/** Filler shown (blurred) in place of the real prompt for signed-out readers. */
const FILLER_PROMPT =
  "Sign in to read the full prompt. This placeholder text stands in for the real prompt so the panel keeps its shape while it is locked.";

/**
 * Strips gated details from a post before it crosses into a client component.
 *
 * The prompt panel only blurs content with CSS, and props passed to a client
 * component are serialized into the page, so a blurred value is still readable
 * in the HTML. Guests therefore receive filler of the same shape instead of the
 * real values, and the real ones never leave the server.
 */
export function redactPost(post: Post): Post {
  if (post.category === "AI Generated") {
    return {
      ...post,
      metadata: {
        prompt: FILLER_PROMPT,
        negativePrompt: post.metadata.negativePrompt ? FILLER_PROMPT : "",
        model: "Locked",
        platform: "Locked",
        seed: 0,
      },
    };
  }

  return {
    ...post,
    photoMetadata: {
      body: "Locked",
      lens: "Locked",
      aperture: "Locked",
      shutterSpeed: "Locked",
      iso: 0,
    },
  };
}
