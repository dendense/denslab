export type PostCategory = "AI Generated" | "Conceptual Photo";

export type PostOrientation = "landscape" | "portrait" | "square";

/**
 * Generation metadata shown on the detail page. Gated behind auth, so it is
 * typed separately from the always-public gallery fields.
 */
export type PostMetadata = {
  prompt: string;
  negativePrompt: string;
  model: string;
  sampler: string;
  seed: number;
  steps: number;
  cfgScale: number;
  aspectRatio: string;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  imgurId: string;
  width: number;
  height: number;
  orientation: PostOrientation;
  category: PostCategory;
  tags: string[];
  metadata: PostMetadata;
};

function orientationOf(width: number, height: number): PostOrientation {
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

/**
 * Dummy data for layout work only. Replaced by Supabase rows later.
 * `width`/`height` are used for the aspect ratio so the grid does not shift.
 */
const rawPosts: Omit<Post, "orientation">[] = [
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
      sampler: "DPM++ 2M Karras",
      seed: 884201337,
      steps: 34,
      cfgScale: 4.5,
      aspectRatio: "16:9",
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
    category: "Conceptual Photo",
    tags: ["still life", "texture", "monochrome"],
    metadata: {
      prompt:
        "hand-folded white paper arranged as ocean waves, raking side light from a single window, high contrast monochrome, shallow depth of field, 85mm macro, studio still life",
      negativePrompt: "color, glare, dust, fingerprints, cluttered background",
      model: "Conceptual Photography",
      sampler: "N/A — analog capture",
      seed: 102,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "5:7",
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
      sampler: "Euler a",
      seed: 5930142,
      steps: 40,
      cfgScale: 6.5,
      aspectRatio: "1:1",
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
      sampler: "Euler",
      seed: 77120945,
      steps: 12,
      cfgScale: 1.0,
      aspectRatio: "4:5",
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
    category: "Conceptual Photo",
    tags: ["motion blur", "film", "portrait"],
    metadata: {
      prompt:
        "long exposure portrait of a figure walking out of frame, deliberate motion blur dissolving the body into the shutter, tungsten street light, 1/4s handheld, 35mm film, warm highlights",
      negativePrompt: "tripod stability, sharp focus, studio lighting, digital clarity",
      model: "Conceptual Photography",
      sampler: "N/A — analog capture",
      seed: 51,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "3:2",
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
    category: "Conceptual Photo",
    tags: ["landscape", "golden hour", "minimal"],
    metadata: {
      prompt:
        "minimal landscape at golden hour with two distinct suns low on the horizon, flat gradient sky, single horizon line, no foreground detail, deliberate optical impossibility",
      negativePrompt: "clouds, birds, trees, people, lens flare, hdr tonemapping",
      model: "Conceptual Photography",
      sampler: "N/A — composited double exposure",
      seed: 62,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "3:2",
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
      sampler: "DPM++ SDE Karras",
      seed: 331877604,
      steps: 30,
      cfgScale: 3.8,
      aspectRatio: "9:16",
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
    category: "Conceptual Photo",
    tags: ["rain", "window", "bokeh"],
    metadata: {
      prompt:
        "raindrops on an uncleaned window, city lights reduced to soft bokeh behind the glass, long exposure of eleven minutes, cool blue cast, heavy condensation in the corners",
      negativePrompt: "clean glass, sharp background, direct flash, reflections of the photographer",
      model: "Conceptual Photography",
      sampler: "N/A — analog capture",
      seed: 88,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "17:11",
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
      sampler: "UniPC",
      seed: 44109227,
      steps: 38,
      cfgScale: 7.0,
      aspectRatio: "2:3",
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
    category: "Conceptual Photo",
    tags: ["coastline", "wide", "minimal"],
    metadata: {
      prompt:
        "wide empty coastline, flat sea, one clearly impossible object placed on the tideline, everything else photographed exactly as found, centred composition, overcast flat light, no post grade",
      negativePrompt: "extra objects, people, boats, dramatic sky, color grading, grain",
      model: "Conceptual Photography",
      sampler: "N/A — single composite insert",
      seed: 104,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "19:10.5",
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
      sampler: "DPM++ 2M SDE",
      seed: 209948173,
      steps: 32,
      cfgScale: 5.0,
      aspectRatio: "11:15",
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
    category: "Conceptual Photo",
    tags: ["night", "street", "long exposure"],
    metadata: {
      prompt:
        "empty city street at 3am, no traffic and no pedestrians, one sodium street lamp burning steady, long exposure smoothing the asphalt, deep shadows, muted amber against cold blue",
      negativePrompt: "cars, people, lit windows, neon signs, lens flare, handheld shake",
      model: "Conceptual Photography",
      sampler: "N/A — analog capture",
      seed: 121,
      steps: 0,
      cfgScale: 0,
      aspectRatio: "9:5",
    },
  },
];

export const posts: Post[] = rawPosts.map((post) => ({
  ...post,
  orientation: orientationOf(post.width, post.height),
}));

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
  "Conceptual Photo": "conceptual-photo",
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

/** Gallery grid uses Imgur's medium thumbnail; the detail page uses full size. */
export function imgurThumbUrl(imgurId: string) {
  return `https://i.imgur.com/${imgurId}m.jpg`;
}

export function imgurFullUrl(imgurId: string) {
  return `https://i.imgur.com/${imgurId}.jpg`;
}
