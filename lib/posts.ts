export type PostCategory = "AI Generated" | "Photoshoot";

export type PostOrientation = "landscape" | "portrait" | "square";

/**
 * Generation settings for AI posts. Gated behind auth on the detail page, so
 * it is typed separately from the always-public gallery fields.
 */
export type AiMetadata = {
  prompt: string;
  negativePrompt: string;
  model: string;
  platform: string;
  seed: number;
};

/**
 * Capture settings for posts shot on a mirrorless camera. Aperture and shutter
 * speed stay strings: values like `f/1.8` and `1/250s` are read as written, not
 * computed with.
 */
export type PhotoMetadata = {
  body: string;
  lens: string;
  aperture: string;
  shutterSpeed: string;
  iso: number;
};

type PostBase = {
  id: string;
  title: string;
  description: string;
  imgurId: string;
  width: number;
  height: number;
  orientation: PostOrientation;
  tags: string[];
};

/**
 * Posts are a discriminated union on `category`, so TypeScript rejects reading
 * `metadata` off a Photoshoot and `photoMetadata` off an AI post.
 */
export type AiPost = PostBase & {
  category: "AI Generated";
  metadata: AiMetadata;
};

export type PhotoPost = PostBase & {
  category: "Photoshoot";
  photoMetadata: PhotoMetadata;
};

export type Post = AiPost | PhotoPost;

function orientationOf(width: number, height: number): PostOrientation {
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

/**
 * Dummy data for layout work only. Replaced by Supabase rows later.
 * `width`/`height` are used for the aspect ratio so the grid does not shift.
 */
const rawPosts: (Omit<AiPost, "orientation"> | Omit<PhotoPost, "orientation">)[] = [
  {
    id: "1",
    title: "Neon Cathedral",
    description:
      "A cathedral rebuilt from memory, lit only by the signs of a city that never existed.",
    imgurId: "K8Qy0oH",
    width: 1600,
    height: 900,
    category: "AI Generated",
    tags: ["architecture", "neon", "dreamscape"],
    metadata: {
      prompt:
        "weathered gothic cathedral at midnight, rebuilt from half-remembered photographs, dense kanji and neon signage bleeding across the stone, wet asphalt reflections, cinematic wide shot, volumetric fog, 35mm anamorphic",
      negativePrompt:
        "text, watermark, signature, blurry, lowres, oversaturated, deformed architecture, duplicated spires",
      model: "Flux.1 Dev",
      platform: "Stable Diffusion",
      seed: 884201337,
    },
  },
  {
    id: "2",
    title: "Paper Ocean",
    description:
      "Folded paper standing in for water, photographed until it forgot what it was.",
    imgurId: "Z9m4sK1",
    width: 1000,
    height: 1400,
    category: "Photoshoot",
    tags: ["still life", "texture", "monochrome"],
    photoMetadata: {
      body: "Sony A7 IV",
      lens: "FE 90mm f/2.8 Macro",
      aperture: "f/8",
      shutterSpeed: "1/125s",
      iso: 200,
    },
  },
  {
    id: "3",
    title: "The Cartographer's Lie",
    description:
      "A map of a country that was never surveyed. Every border was invented by the model.",
    imgurId: "c8r2Xp5",
    width: 1400,
    height: 1400,
    category: "AI Generated",
    tags: ["maps", "surreal", "ink"],
    metadata: {
      prompt:
        "antique survey map of an imaginary country, hand-inked coastlines, invented borders, compass rose, aged paper texture, top-down flat lay, muted sepia with a single accent wash",
      negativePrompt:
        "real geography, legible country names, modern typography, folds, tears, glossy sheen",
      model: "SDXL 1.0 + custom cartography LoRA",
      platform: "ComfyUI",
      seed: 5930142,
    },
  },
  {
    id: "4",
    title: "Static Bloom",
    description:
      "Noise, coaxed into the shape of a flower. The stem is the part the algorithm gave up on.",
    imgurId: "B4n7Lq2",
    width: 1200,
    height: 1500,
    category: "AI Generated",
    tags: ["botanical", "glitch", "grain"],
    metadata: {
      prompt:
        "single flower grown out of television static, monochrome noise resolving into petals, stem dissolving into horizontal scan lines, macro focus, heavy analogue grain, dark background",
      negativePrompt:
        "clean vector lines, cartoon, saturated color, legible text, smooth gradients",
      model: "Flux.1 Schnell",
      platform: "Midjourney",
      seed: 77120945,
    },
  },
  {
    id: "5",
    title: "Long Exposure, Long Goodbye",
    description:
      "A figure dissolving into the shutter. Shot on film, developed with an apology.",
    imgurId: "M6t1Rv8",
    width: 1600,
    height: 1067,
    category: "Photoshoot",
    tags: ["motion blur", "film", "portrait"],
    photoMetadata: {
      body: "Fujifilm X-T5",
      lens: "XF 35mm f/1.4",
      aperture: "f/4",
      shutterSpeed: "1/4s",
      iso: 400,
    },
  },
  {
    id: "6",
    title: "Second Sun",
    description:
      "Two light sources, one sky. Photographed as evidence of a mistake nobody wants to correct.",
    imgurId: "w5h3Dk9",
    width: 1500,
    height: 1000,
    category: "Photoshoot",
    tags: ["landscape", "golden hour", "minimal"],
    photoMetadata: {
      body: "Canon EOS R6 II",
      lens: "RF 24-70mm f/2.8",
      aperture: "f/11",
      shutterSpeed: "1/500s",
      iso: 100,
    },
  },
  {
    id: "7",
    title: "Telephone to Nowhere",
    description:
      "A handset off the hook in a field with no signal. The conversation was always one-sided.",
    imgurId: "q2Vd8nP",
    width: 900,
    height: 1600,
    category: "AI Generated",
    tags: ["abandoned", "field", "analog"],
    metadata: {
      prompt:
        "vintage rotary telephone handset off the hook, resting in tall overgrown grass, overcast daylight, no buildings in sight, muted greens and oxidized plastic, documentary framing, 50mm",
      negativePrompt:
        "people, power lines, buildings, modern devices, glossy product lighting, text",
      model: "Flux.1 Dev",
      platform: "Stable Diffusion",
      seed: 331877604,
    },
  },
  {
    id: "8",
    title: "Eleven Minutes of Rain",
    description:
      "The exact length of a downpour, recorded on a window that was never cleaned.",
    imgurId: "j7Kp3Lw",
    width: 1700,
    height: 1100,
    category: "Photoshoot",
    tags: ["rain", "window", "bokeh"],
    photoMetadata: {
      body: "Nikon Z6 II",
      lens: "NIKKOR Z 50mm f/1.8",
      aperture: "f/2.8",
      shutterSpeed: "1/60s",
      iso: 800,
    },
  },
  {
    id: "9",
    title: "The Understudy",
    description:
      "A duplicate that learned the part better than the original. It is waiting backstage.",
    imgurId: "t4Rx9Yc",
    width: 1000,
    height: 1550,
    category: "AI Generated",
    tags: ["theatre", "duality", "low light"],
    metadata: {
      prompt:
        "two identical performers backstage, one in full costume under a bare bulb, one half-lit in shadow copying the pose, velvet curtains, dust in the air, low-key lighting, 85mm portrait",
      negativePrompt:
        "three figures, mirrored faces, bright daylight, modern clothing, visible text on props",
      model: "SDXL 1.0",
      platform: "Automatic1111",
      seed: 44109227,
    },
  },
  {
    id: "10",
    title: "Horizon, Interrupted",
    description:
      "A coastline with one misplaced detail. Everything else is exactly as photographed.",
    imgurId: "n6Bm2Fq",
    width: 1900,
    height: 1050,
    category: "Photoshoot",
    tags: ["coastline", "wide", "minimal"],
    photoMetadata: {
      body: "Sony A7R V",
      lens: "FE 16-35mm f/2.8 GM",
      aperture: "f/8",
      shutterSpeed: "1/250s",
      iso: 100,
    },
  },
  {
    id: "11",
    title: "Gravity Practice",
    description:
      "A study of objects deciding, one at a time, not to fall. Shot over nine attempts.",
    imgurId: "h3Ts5Zk",
    width: 1100,
    height: 1500,
    category: "AI Generated",
    tags: ["physics", "still life", "studio"],
    metadata: {
      prompt:
        "studio still life of ordinary objects hovering at different heights mid-fall, flour dust suspended in the air, single hard key light, seamless grey backdrop, high-speed capture aesthetic",
      negativePrompt:
        "motion blur, visible strings, hands, clutter, warm color cast, soft shadows",
      model: "Flux.1 Dev",
      platform: "ComfyUI",
      seed: 209948173,
    },
  },
  {
    id: "12",
    title: "Nocturne for Empty Streets",
    description:
      "The hour when a city stops performing. One lamp kept its promise all night.",
    imgurId: "y8Gd4Rv",
    width: 1800,
    height: 1000,
    category: "Photoshoot",
    tags: ["night", "street", "long exposure"],
    photoMetadata: {
      body: "Panasonic Lumix S5 II",
      lens: "S 20-60mm f/3.5-5.6",
      aperture: "f/5.6",
      shutterSpeed: "8s",
      iso: 200,
    },
  },
];

/**
 * Local dataset used for the demo build and as a fallback while the Supabase
 * `posts` table is being set up. Live reads go through lib/posts-repository.ts.
 */
export const demoPosts: Post[] = rawPosts.map((post) => ({
  ...post,
  orientation: orientationOf(post.width, post.height),
}));

/** @deprecated Use fetchPosts() from lib/posts-repository for live data. */
export const posts = demoPosts;

/** Posts filtered by aspect orientation, for future curation features. */
export function postsByOrientation(orientation: PostOrientation) {
  return posts.filter((post) => post.orientation === orientation);
}

/** Posts in one category, in gallery order. */
export function postsByCategory(category: PostCategory) {
  return posts.filter((post) => post.category === category);
}

/**
 * URL-safe slug per category. Kept explicit rather than auto-generated so the
 * route segment stays stable if a display label is ever reworded.
 */
export const CATEGORY_SLUGS: Record<PostCategory, string> = {
  "AI Generated": "ai-generated",
  Photoshoot: "photoshoot",
};

export const CATEGORIES = Object.keys(CATEGORY_SLUGS) as PostCategory[];

export function categoryFromSlug(slug: string): PostCategory | undefined {
  const match = CATEGORIES.find((category) => CATEGORY_SLUGS[category] === slug);
  return match;
}

/** Single post for the detail route, or `undefined` when the id is unknown. */
export function getPostById(id: string) {
  return posts.find((post) => post.id === id);
}

/**
 * Grid thumbnail source.
 *
 * `h` is Imgur's "huge" variant (~1024px on the long edge). The previous `m`
 * variant (~320px) was smaller than the widths `next/image` requests for a card
 * on a wide screen, so the optimizer upscaled a low-resolution source and the
 * result looked soft. `h` covers the largest card box and is still downscaled
 * by the optimizer for small viewports.
 */
export function imgurThumbUrl(imgurId: string) {
  return `https://i.imgur.com/${imgurId}h.jpg`;
}

/** Detail page source: Imgur serves the original at the bare id. */
export function imgurFullUrl(imgurId: string) {
  return `https://i.imgur.com/${imgurId}.jpg`;
}
