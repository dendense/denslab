# Third-party notice — ObsidianUI

Parts of this project's UI are adapted from **ObsidianUI**
(<https://www.obsidianui.dev>), a React component library.

- **License:** MIT (the project's source code is published under the MIT License).
- **What was adapted (files copied into this repo, then adjusted):**
  - `components/block/discover-button.tsx`
  - `components/block/discover-button.css`
  - `lib/utils.ts` (`cn()` helper — the shadcn/`clsx`+`tailwind-merge` convention)
- **What was only imitated (no code copied):** the visual language of the scoped
  `.theme-obsidian` theme in `app/globals.css` (palette, soft radius, layered
  shadows). Per the ObsidianUI terms, the *visual style* is not licensed content;
  only its source code is, and that code is MIT.

## MIT License (ObsidianUI)

> MIT License
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

Copyright (c) ObsidianUI / Atharv.
