-- denslab: seed the posts table with the 12 entries from lib/posts.ts.
-- Run this AFTER schema.sql. Safe to re-run: it clears the table first.
--
-- `metadata` uses the AiMetadata shape, `photo_metadata` the PhotoMetadata
-- shape. Keep them in step with lib/posts.ts.

truncate table public.posts;

insert into public.posts
  (title, description, imgur_id, width, height, category, tags, metadata, photo_metadata)
values
  (
    'Neon Cathedral',
    'A cathedral rebuilt from memory, lit only by the signs of a city that never existed.',
    'K8Qy0oH', 1600, 900, 'AI Generated',
    array['architecture', 'neon', 'dreamscape'],
    jsonb_build_object(
      'prompt', 'weathered gothic cathedral at midnight, rebuilt from half-remembered photographs, dense kanji and neon signage bleeding across the stone, wet asphalt reflections, cinematic wide shot, volumetric fog, 35mm anamorphic',
      'negativePrompt', 'text, watermark, signature, blurry, lowres, oversaturated, deformed architecture, duplicated spires',
      'model', 'Flux.1 Dev',
      'platform', 'Stable Diffusion',
      'seed', 884201337
    ),
    null
  ),
  (
    'Paper Ocean',
    'Folded paper standing in for water, photographed until it forgot what it was.',
    'Z9m4sK1', 1000, 1400, 'Photoshoot',
    array['still life', 'texture', 'monochrome'],
    null,
    jsonb_build_object('body', 'Sony A7 IV', 'lens', 'FE 90mm f/2.8 Macro', 'aperture', 'f/8', 'shutterSpeed', '1/125s', 'iso', 200)
  ),
  (
    'The Cartographer''s Lie',
    'A map of a country that was never surveyed. Every border was invented by the model.',
    'c8r2Xp5', 1400, 1400, 'AI Generated',
    array['maps', 'surreal', 'ink'],
    jsonb_build_object(
      'prompt', 'antique survey map of an imaginary country, hand-inked coastlines, invented borders, compass rose, aged paper texture, top-down flat lay, muted sepia with a single accent wash',
      'negativePrompt', 'real geography, legible country names, modern typography, folds, tears, glossy sheen',
      'model', 'SDXL 1.0 + custom cartography LoRA',
      'platform', 'ComfyUI',
      'seed', 5930142
    ),
    null
  ),
  (
    'Static Bloom',
    'Noise, coaxed into the shape of a flower. The stem is the part the algorithm gave up on.',
    'B4n7Lq2', 1200, 1500, 'AI Generated',
    array['botanical', 'glitch', 'grain'],
    jsonb_build_object(
      'prompt', 'single flower grown out of television static, monochrome noise resolving into petals, stem dissolving into horizontal scan lines, macro focus, heavy analogue grain, dark background',
      'negativePrompt', 'clean vector lines, cartoon, saturated color, legible text, smooth gradients',
      'model', 'Flux.1 Schnell',
      'platform', 'Midjourney',
      'seed', 77120945
    ),
    null
  ),
  (
    'Long Exposure, Long Goodbye',
    'A figure dissolving into the shutter. Shot on film, developed with an apology.',
    'M6t1Rv8', 1600, 1067, 'Photoshoot',
    array['motion blur', 'film', 'portrait'],
    null,
    jsonb_build_object('body', 'Fujifilm X-T5', 'lens', 'XF 35mm f/1.4', 'aperture', 'f/4', 'shutterSpeed', '1/4s', 'iso', 400)
  ),
  (
    'Second Sun',
    'Two light sources, one sky. Photographed as evidence of a mistake nobody wants to correct.',
    'w5h3Dk9', 1500, 1000, 'Photoshoot',
    array['landscape', 'golden hour', 'minimal'],
    null,
    jsonb_build_object('body', 'Canon EOS R6 II', 'lens', 'RF 24-70mm f/2.8', 'aperture', 'f/11', 'shutterSpeed', '1/500s', 'iso', 100)
  ),
  (
    'Telephone to Nowhere',
    'A handset off the hook in a field with no signal. The conversation was always one-sided.',
    'q2Vd8nP', 900, 1600, 'AI Generated',
    array['abandoned', 'field', 'analog'],
    jsonb_build_object(
      'prompt', 'vintage rotary telephone handset off the hook, resting in tall overgrown grass, overcast daylight, no buildings in sight, muted greens and oxidized plastic, documentary framing, 50mm',
      'negativePrompt', 'people, power lines, buildings, modern devices, glossy product lighting, text',
      'model', 'Flux.1 Dev',
      'platform', 'Stable Diffusion',
      'seed', 331877604
    ),
    null
  ),
  (
    'Eleven Minutes of Rain',
    'The exact length of a downpour, recorded on a window that was never cleaned.',
    'j7Kp3Lw', 1700, 1100, 'Photoshoot',
    array['rain', 'window', 'bokeh'],
    null,
    jsonb_build_object('body', 'Nikon Z6 II', 'lens', 'NIKKOR Z 50mm f/1.8', 'aperture', 'f/2.8', 'shutterSpeed', '1/60s', 'iso', 800)
  ),
  (
    'The Understudy',
    'A duplicate that learned the part better than the original. It is waiting backstage.',
    't4Rx9Yc', 1000, 1550, 'AI Generated',
    array['theatre', 'duality', 'low light'],
    jsonb_build_object(
      'prompt', 'two identical performers backstage, one in full costume under a bare bulb, one half-lit in shadow copying the pose, velvet curtains, dust in the air, low-key lighting, 85mm portrait',
      'negativePrompt', 'three figures, mirrored faces, bright daylight, modern clothing, visible text on props',
      'model', 'SDXL 1.0',
      'platform', 'Automatic1111',
      'seed', 44109227
    ),
    null
  ),
  (
    'Horizon, Interrupted',
    'A coastline with one misplaced detail. Everything else is exactly as photographed.',
    'n6Bm2Fq', 1900, 1050, 'Photoshoot',
    array['coastline', 'wide', 'minimal'],
    null,
    jsonb_build_object('body', 'Sony A7R V', 'lens', 'FE 16-35mm f/2.8 GM', 'aperture', 'f/8', 'shutterSpeed', '1/250s', 'iso', 100)
  ),
  (
    'Gravity Practice',
    'A study of objects deciding, one at a time, not to fall. Shot over nine attempts.',
    'h3Ts5Zk', 1100, 1500, 'AI Generated',
    array['physics', 'still life', 'studio'],
    jsonb_build_object(
      'prompt', 'studio still life of ordinary objects hovering at different heights mid-fall, flour dust suspended in the air, single hard key light, seamless grey backdrop, high-speed capture aesthetic',
      'negativePrompt', 'motion blur, visible strings, hands, clutter, warm color cast, soft shadows',
      'model', 'Flux.1 Dev',
      'platform', 'ComfyUI',
      'seed', 209948173
    ),
    null
  ),
  (
    'Nocturne for Empty Streets',
    'The hour when a city stops performing. One lamp kept its promise all night.',
    'y8Gd4Rv', 1800, 1000, 'Photoshoot',
    array['night', 'street', 'long exposure'],
    null,
    jsonb_build_object('body', 'Panasonic Lumix S5 II', 'lens', 'S 20-60mm f/3.5-5.6', 'aperture', 'f/5.6', 'shutterSpeed', '8s', 'iso', 200)
  );

-- Verify: should be 12 rows, 6 per category.
select category, count(*) from public.posts group by category order by category;
