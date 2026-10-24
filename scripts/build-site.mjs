// Builds the publishable site into <outDir>, generating the social card from
// the page itself, then checks the result. Production (GitHub Pages) and the
// noindex preview Worker both deploy this output, so the card is never edited
// by hand and can never fall behind the page.
//
//   node scripts/build-site.mjs <outDir> [--preview]
//
// --preview adds noindex everywhere (meta, X-Robots-Tag, robots.txt).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSocialCard } from './social-card.mjs';
import { checkSite } from './check-site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outArg, ...flags] = process.argv.slice(2);
if (!outArg) { console.error('usage: node scripts/build-site.mjs <outDir> [--preview]'); process.exit(2); }
const out = path.resolve(outArg);
const preview = flags.includes('--preview');

// Everything a visitor can request. Sources such as scripts/ and readme.md stay out.
const PUBLISH = ['index.html', '404.html', 'styles.css', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'CNAME', 'assets'];

if (fs.existsSync(out) && fs.readdirSync(out).length) {
  console.error(`refusing to build into non-empty ${out}`);
  process.exit(2);
}
fs.mkdirSync(out, { recursive: true });
for (const entry of PUBLISH) fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });

await renderSocialCard({ html: path.join(out, 'index.html'), assets: path.join(out, 'assets'), out: path.join(out, 'assets', 'social-card.png') });

if (preview) {
  for (const page of ['index.html', '404.html']) {
    const file = path.join(out, page);
    const html = fs.readFileSync(file, 'utf8');
    const charset = '<meta charset="utf-8">';
    if (html.split(charset).length !== 2) throw new Error(`${page}: expected exactly one ${charset}`);
    fs.writeFileSync(file, html.replace(charset, `${charset}\n<meta name="robots" content="noindex, nofollow">`));
  }
  fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  fs.writeFileSync(path.join(out, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
  fs.rmSync(path.join(out, 'CNAME'));
}

checkSite(out);
console.log(`built ${preview ? 'preview' : 'production'} site in ${out}`);
