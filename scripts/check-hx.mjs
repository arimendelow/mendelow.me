import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const html = read('index.html');
const card = html.match(/<article\b[^>]*id="ouro-ui"[\s\S]*?<\/article>/)?.[0];
assert.ok(card, 'Missing Ouro UI selected-work entry');
assert.match(card, /<h3\b[^>]*>Ouro UI<\/h3>/);
assert.match(card, /<h4\b[^>]*>Ouro HX<\/h4>/);
assert.ok(card.includes('Under construction'));
assert.ok(card.includes('Ouro AX is still being defined.'));
assert.ok(card.includes('https://ourostack.github.io/ouro-ui/docs/'));
assert.match(card, /src="\/assets\/ouro-hx-render\.webp"/);
assert.doesNotMatch(card, /<video|<iframe|src="https?:|href="[^"]*ouro-ax/);
assert.match(html, /rel="icon" href="\/favicon.ico"/);
const provenance = JSON.parse(read('assets/hx-media-provenance.json'));
for (const asset of provenance.assets.filter(asset => asset.file.endsWith('.webp'))) {
  assert.ok(card.includes(asset.file));
  const bytes = fs.readFileSync(new URL(`assets/${asset.file}`, root));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256);
}
assert.ok(read('styles.css').includes('.hx-theme-light'));
assert.ok(read('styles.css').includes(':root[data-theme="dark"] .hx-theme-light'));
console.log('PASS: personal-site parent/HX hierarchy, construction status, real media hashes, docs destination and unchanged favicon.');
