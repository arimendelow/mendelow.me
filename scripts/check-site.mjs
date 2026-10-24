// Checks a built site's share metadata: every title, description and image
// tag agrees, the card exists at the advertised size, and its alt text says
// what the generated card says. Run by build-site.mjs; fails the deploy.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { cardContent, CARD } from './social-card.mjs';

const all = (html, re) => [...html.matchAll(re)].map(m => m[1]);
const one = (html, re, label) => {
  const found = all(html, re);
  assert.equal(found.length, 1, `${label}: expected exactly one, found ${found.length}`);
  return found[0];
};
const metaRe = (attr, name) => new RegExp(`<meta[^>]+${attr}="${name.replace(/[:.]/g, '\\$&')}"[^>]+content="([^"]*)"`, 'g');
const prop = (html, name) => one(html, metaRe('property', name), name);
const named = (html, name) => one(html, metaRe('name', name), name);

function pngSize(file) {
  const b = fs.readFileSync(file);
  assert.equal(b.toString('ascii', 1, 4), 'PNG', `${file} is not a PNG`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

export function checkSite(dir) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const { name, headline } = cardContent(html);
  const canonical = one(html, /<link rel="canonical" href="([^"]+)"/g, 'canonical');

  const title = one(html, /<title>([^<]*)<\/title>/g, 'title');
  assert.equal(prop(html, 'og:title'), title, 'og:title must match <title>');
  assert.equal(named(html, 'twitter:title'), title, 'twitter:title must match <title>');

  const description = named(html, 'description');
  assert.ok(description.length >= 50 && description.length <= 200, `description should be 50-200 characters, is ${description.length}`);
  assert.equal(prop(html, 'og:description'), description, 'og:description must match the meta description');
  assert.equal(named(html, 'twitter:description'), description, 'twitter:description must match the meta description');

  assert.equal(prop(html, 'og:url'), canonical, 'og:url must match the canonical link');
  const image = new URL('assets/social-card.png', canonical).href;
  assert.equal(prop(html, 'og:image'), image, `og:image must be ${image}`);
  assert.equal(named(html, 'twitter:image'), image, `twitter:image must be ${image}`);
  assert.equal(named(html, 'twitter:card'), 'summary_large_image');
  assert.equal(prop(html, 'og:image:width'), String(CARD.width));
  assert.equal(prop(html, 'og:image:height'), String(CARD.height));

  const alt = `${name}: ${headline}`;
  assert.equal(prop(html, 'og:image:alt'), alt, 'og:image:alt must describe the generated card');
  assert.equal(named(html, 'twitter:image:alt'), alt, 'twitter:image:alt must describe the generated card');

  const card = path.join(dir, 'assets', 'social-card.png');
  assert.ok(fs.existsSync(card), 'the build did not generate assets/social-card.png');
  assert.deepEqual(pngSize(card), CARD, 'social card has the wrong size');
  console.log('PASS: share metadata agrees and the generated card matches the page.');
}

if (import.meta.url === `file://${process.argv[1]}`) checkSite(path.resolve(process.argv[2] ?? '.'));
