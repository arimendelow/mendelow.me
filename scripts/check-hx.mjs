import assert from 'node:assert/strict';
import fs from 'node:fs';

// Ouro on the personal site: a description, then every tool in it as one list,
// each row linking to its own section on ouroboros.bot. Ouro HX is one of those
// rows and keeps its construction status; Ouro AX is not claimed.
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const html = read('index.html');
const section = html.match(/<article\b[^>]*id="ouro"[\s\S]*?<\/article>/)?.[0];
assert.ok(section, 'Missing the Ouro selected-work section');
assert.doesNotMatch(html, /id="ouro-ui"/, 'Ouro HX is a row in the Ouro list, not its own card');
const list = section.match(/<ul class="ouro-tools"[\s\S]*?<\/ul>/)?.[0];
assert.ok(list, 'Missing the list of Ouro tools');
const rows = [...list.matchAll(/<li><a href="([^"]+)">[\s\S]*?<strong>([^<]+)<\/strong>:([^<]+)<\/span>/g)].map(([, href, name, summary]) => ({ href, name, summary: summary.trim() }));
assert.deepEqual(rows.map(row => row.name), ['Ouroboros', 'Desk', 'Ouro MD', 'Ouro HX', 'Ouro Shepherd', 'Ouro Butler', 'Friends', 'The factory']);
for (const row of rows) assert.match(row.href, /^https:\/\/ouroboros\.bot\/#[a-z-]+$/, `${row.name} links to its section on ouroboros.bot`);
const hx = rows.find(row => row.name === 'Ouro HX');
assert.equal(hx.href, 'https://ouroboros.bot/#ouro-ui');
assert.match(hx.summary, /under construction$/);
assert.match(list, /src="\/assets\/ouro-hx-render-128\.webp"/);
assert.doesNotMatch(html, /href="[^"]*ouro-ax/);
for (const file of [...list.matchAll(/src="\/assets\/([^"]+)"/g)].map(([, file]) => file)) assert.ok(fs.existsSync(new URL(`assets/${file}`, root)), `assets/${file} exists`);
assert.match(html, /rel="icon" href="\/favicon.ico"/);
console.log('PASS: Ouro section lists every tool with a link to its section, Ouro HX keeps its construction status, and the favicon is unchanged.');

// Ari, 2026-10-20: text flows to the full width of its column. Nothing caps a line length;
// the only width limit is the page container (.wrap).
const css = read('styles.css');
const caps = [...css.matchAll(/^[^@\n]*\{[^}]*max-width:\s*[\d.]+(?:ch|rem|em)\b[^}]*\}/gm)].map(([rule]) => rule.trim());
assert.deepEqual(caps, [], 'No text has its own max-width');
console.log('PASS: no text has its own max-width.');
