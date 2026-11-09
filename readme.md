# mendelow.me

Source for [mendelow.me](https://mendelow.me), a small, owned identity-and-proof hub, and one of the Ouro family of sites.

Built with [Astro](https://astro.build) and [Ouro HX](https://ui.ouroboros.bot/). Astro renders every page from React on the server to static HTML; only the controls that need script ship any, as islands: the navigation (its phone menu and the light or dark switch) and the RAPID video. Every link and button is an Ouro HX component, installed with shadcn from an Ouro UI release tag into `src/components/ouro/` and `src/lib/ouro/`.

- `src/pages/`: the home page and the 404 page. `src/layouts/Base.astro` is the shell: head and share metadata, the family bar, the site's navigation and the family footer.
- `src/components/sections.tsx`: the page's content. `SiteNav.tsx` and `RapidVideo.tsx` are the islands; `Family.tsx` is the family bar and footer.
- `src/family.json`: a byte-for-byte copy of [ourostack/.github `brand/family.json`](https://github.com/ourostack/.github/blob/main/brand/family.json), the family's links in their one order. `tests/family.test.mjs` compares the two.
- `src/styles/global.css`: the Ouro theme tokens, in ouroboros.bot's palette (its warm paper light theme and its night dark theme), and the family's faces, Cormorant Garamond and Outfit. `src/styles/site.css`: the site's own layout.
- `public/`: pictures, fonts, favicons, `robots.txt`, `sitemap.xml` and `CNAME`, served as they are.

## Working on it

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # into dist/, with the social card
npm run check      # the fade check, the family test and the page checks on dist/
```

To move Ouro HX to a newer release, add every installed item again at the new tag in one go, so all of them are on the same release: `npx shadcn@latest add ourostack/ouro-ui/<item>#vX.Y.Z --overwrite` for each item in `src/components/ouro/` and `lib/ouro/check/`.

## Checks

- `scripts/check-fades.mjs` runs Ouro check's fade check over `src/`: no picture fades into the page or into nothing, at any edge.
- `scripts/check-hx.mjs <built folder>`: Ouro UI leads Selected work, Ouro lists every tool, the family bar and footer carry the family's links in order, every link and button is an Ouro HX component, no text has its own width cap, every section reads top to bottom, and `/favicon.ico` is served.
- `scripts/check-site.mjs`, run by the build: every title, description and image tag agrees, and the card matches the page.
- Ouro check (`lib/ouro/check/check.ts`) opens the built site at a phone (390×844), a laptop (1440×900) and 4K (3840×2160), light and dark, and fails on any finding: sideways scroll, overlap, clipped text, blurry or giant pictures, a corner showing through its frame, more text sizes than a type scale holds, heading order, repaints at rest, slow first content and slow presses, among others. It runs in CI (`npm run check:screens` locally) and exits 3 on findings, so it gates the merge. A deliberate exception carries `data-ouro-allow="<rule>"` and its reason in `data-ouro-allow-why`.

## Deploys

`node scripts/build-site.mjs <outDir>` builds the site, generates `assets/social-card.png` from the page's own name, hero headline and portrait, and checks that every title, description and image tag agrees. The card is never edited by hand; change the hero and the next deploy redraws it. It needs Chrome or Chromium (`CHROME=/path` to choose one).

- **Production:** `.github/workflows/pages.yml` builds, checks and deploys `master` to GitHub Pages. Pull requests run every check without deploying. Pages must be set to deploy from GitHub Actions (Settings → Pages → Source).
- **Preview:** `scripts/deploy-preview.sh` builds a noindex copy and deploys it to <https://mendelow-me-preview.mendelow-studio.workers.dev> (needs `npx wrangler login`).

`scripts/build-assets.sh` regenerates the favicons from `public/assets/favicon-source.jpg`.
