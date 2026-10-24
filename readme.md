# mendelow.me

Source for [mendelow.me](https://mendelow.me), a small, owned identity-and-proof hub.

Dependency-free static HTML and CSS. No framework, no package manager. Edit `index.html` and `styles.css` directly; images live in `assets/`.

## Deploys

The only build step is for deploys: `node scripts/build-site.mjs <outDir>` copies the site, generates `assets/social-card.png` from the page's own name, hero headline and portrait, and checks that every title, description and image tag agrees. The card is never edited by hand; change the hero and the next deploy redraws it. It needs Chrome or Chromium (`CHROME=/path` to choose one).

- **Production:** `.github/workflows/pages.yml` builds and deploys `master` to GitHub Pages. Pull requests build and check without deploying. Pages must be set to deploy from GitHub Actions (Settings → Pages → Source).
- **Preview:** `scripts/deploy-preview.sh` builds a noindex copy and deploys it to <https://mendelow-me-preview.mendelow-studio.workers.dev> (needs `npx wrangler login`).

`scripts/build-assets.sh` regenerates the favicons from `assets/favicon-source.jpg`.
