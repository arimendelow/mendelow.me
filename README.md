# mendelow.me

Simple Astro blog scaffold with Tailwind + MDX and Cloudflare-ready config.

## Stack
- Astro
- Tailwind CSS (via `@tailwindcss/vite`)
- MDX (`@astrojs/mdx`)
- Cloudflare adapter (`@astrojs/cloudflare`)

## Commands
Run from `/Users/arimendelow/Projects/mendelow.me`:

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server (`http://localhost:4321`) |
| `npm run check` | Run Astro type/content checks |
| `npm test` | Alias for `npm run check` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

## Content Workflow
1. Create a `.md` or `.mdx` file in `src/content/blog/`.
2. Add required frontmatter: `title`, `description`, `pubDate` (optional `updatedDate`, `heroImage`).
3. Start dev server and view at `/blog`.

## Cloudflare Notes
- Adapter is configured in `astro.config.mjs`.
- `wrangler.jsonc` is scaffolded and can be expanded for deployment settings.
- This repo is scaffolded for Cloudflare compatibility; production deployment wiring can be done in a follow-up task.
