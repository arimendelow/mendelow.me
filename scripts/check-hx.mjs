// Checks the built home page against the decisions it carries. Run after the build:
//
//   node scripts/check-hx.mjs <built folder>
//
// Ouro UI leads the work, Ouro is a description and then every tool in it as one list, the family bar and footer
// carry the family's links in the family's order, every link and button is an Ouro HX component, nothing caps a
// line of text, every section reads top to bottom, and the favicon is unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const dir = path.resolve(process.argv[2] ?? 'dist');
const doc = parse(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'));
const family = JSON.parse(read('src/family.json'));
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
const hrefs = el => el.querySelectorAll('a[href]').map(a => a.getAttribute('href'));
const served = src => fs.existsSync(path.join(dir, decodeURIComponent(src.replace(/^\//, ''))));

// The producer's decision, 2026-11-08: Ouro UI is one of Ari's biggest things, so it leads Selected work, with its
// art and both halves named. Readiness matches ouroboros.bot (Ouro HX: Use today, Ari's ruling of 2026-10-30) and Ouro AX gets no mark.
const work = doc.querySelector('#work');
assert.ok(work, 'Missing the Selected work section');
assert.deepEqual(work.querySelectorAll('.cards > article').map(a => a.id), ['ouro-ui', 'agent-experience', 'ouro', 'spoonjoy'], 'Ouro UI leads Selected work');
const lead = doc.querySelector('#ouro-ui');
assert.equal(text(lead.querySelector('h3')), 'Ouro UI');
for (const href of ['https://ui.ouroboros.bot/', 'https://github.com/ourostack/ouro-ui']) assert.ok(hrefs(lead).includes(href), `Ouro UI links to ${href}`);
const leadArt = lead.querySelector('figure img');
assert.ok(leadArt?.getAttribute('alt'), 'Ouro UI shows its art, described');
for (const src of [leadArt.getAttribute('src'), ...lead.querySelectorAll('source').flatMap(s => s.getAttribute('srcset').split(',').map(c => c.trim().split(' ')[0]))]) assert.ok(served(src), `${src} is served`);
assert.match(text(lead), /Ouro HX/);
assert.match(text(lead), /Ouro AX/);
assert.match(text(lead), /use today/);
assert.doesNotMatch(text(doc.querySelector('main')), /under construction/i, 'Ouro HX is no longer labelled under construction');
assert.doesNotMatch(text(doc.querySelector('main')), /\b(stable|production[- ]ready)\b/i, 'Nothing is called stable or production-ready');
assert.equal(doc.querySelectorAll('img').filter(img => /ouro[ -]?ax/i.test(`${img.getAttribute('src')} ${img.getAttribute('alt')}`)).length, 0, 'Ouro AX has no mark');
assert.equal(hrefs(doc).filter(href => /ouro-ax/.test(href)).length, 0);
console.log('PASS: Ouro UI leads Selected work with its art, both halves and its links, and readiness stays honest.');

// Ouro on the personal site: a description, then every tool in it as one list, each row linking to its own section
// on ouroboros.bot. Ouro HX carries the same readiness as on ouroboros.bot.
const list = doc.querySelector('#ouro #ouro-tools');
assert.ok(list, 'Missing the list of Ouro tools');
const rows = list.querySelectorAll('li').map(li => ({ href: li.querySelector('a[href]')?.getAttribute('href'), name: text(li.querySelector('a[href]')), summary: text(li).slice(text(li.querySelector('a[href]')).length).trim(), img: li.querySelector('img')?.getAttribute('src') }));
assert.deepEqual(rows.map(row => row.name), ['Ouroboros', 'Desk', 'Ouro MD', 'Ouro HX', 'Ouro Shepherd', 'Ouro Butler', 'Friends', 'The factory']);
for (const row of rows) {
  assert.match(row.href, /^https:\/\/ouroboros\.bot\/#[a-z-]+$/, `${row.name} links to its section on ouroboros.bot`);
  assert.ok(row.img && served(row.img), `${row.name} shows its art`);
}
const hx = rows.find(row => row.name === 'Ouro HX');
assert.equal(hx.href, 'https://ouroboros.bot/#ouro-ui');
assert.match(hx.summary, /ready to use today$/);
assert.equal(hx.img, '/assets/ouro-hx-render-128.webp');
console.log('PASS: Ouro lists every tool with a link to its section, and Ouro HX is ready to use today.');

// The family: the same links in the same order at the top and the foot of the page, with this site marked current
// (aria-current="true"), and the site's own navigation under the family bar.
const anchors = doc.querySelectorAll('a[href]');
const familyHrefs = family.links.map(link => link.href);
const runs = [];
for (let i = 0; i + familyHrefs.length <= anchors.length; i++) {
  const run = anchors.slice(i, i + familyHrefs.length);
  if (run.every((a, j) => a.getAttribute('href') === familyHrefs[j])) runs.push({ at: i, run });
}
assert.equal(runs.length, 2, 'The family links appear twice, in the family order: the bar and the footer');
for (const { run } of runs) {
  assert.deepEqual(run.map(text), family.links.map(link => link.label));
  assert.deepEqual(run.map(a => a.getAttribute('aria-current') ?? null), family.links.map(link => (link.id === 'ari' ? 'true' : null)), 'Ari Mendelow is the current site');
}
const navbar = doc.querySelector('[data-ouro="navbar"]');
assert.ok(navbar, 'Missing the site navigation');
const navLinks = navbar.querySelectorAll('nav a[href]').map(a => [text(a), a.getAttribute('href')]);
assert.deepEqual(navLinks, [['Work', '/#work'], ['About', '/#about'], ['Earlier', '/#earlier'], ['Contact', '/#contact']]);
assert.ok(anchors.indexOf(runs[0].run[0]) < anchors.indexOf(navbar.querySelector('a[href]')), 'The family bar sits above the site navigation');
assert.ok(doc.querySelector('footer')?.querySelectorAll('a[href]').some(a => a === runs[1].run[0]), 'The family footer is the page footer');
// The same landmarks on every family site: the bar "Sites", the footer "All sites", the site's own nav "Primary".
assert.deepEqual(doc.querySelectorAll('nav[aria-label]').map(nav => nav.getAttribute('aria-label')), ['Sites', 'Primary', 'All sites'], 'Landmark names are Sites, Primary and All sites');
// Below 40rem the bar hides with no script (a wrapper and a media query), and the phone menu lists the family under a
// heading, with this site marked, instead of a second "Sites" landmark. The menu mounts in the browser, so its source
// is checked here and its rendering in the CI screenshots.
assert.ok(runs[0].run[0].closest('.family-bar-wrap'), 'The family bar sits in .family-bar-wrap');
assert.match(read('src/styles/site.css'), /@media \(width < 40rem\) \{ \.family-bar-wrap \{ display: none; \} \}/, 'The family bar hides below 40rem');
const siteNav = read('src/components/SiteNav.tsx');
assert.match(siteNav, /menu=\{<PhoneMenu \/>\}/, 'The phone menu is the site menu with the family');
assert.match(siteNav, /family\.links\.map/, 'The phone menu lists every family link');
assert.match(siteNav, /<h3 id=\{heading\}[\s\S]*?Ouro family/, 'The family links sit under a heading');
assert.match(siteNav, /aria-labelledby=\{heading\}/);
assert.match(siteNav, /site\.id === "ari"[\s\S]*?aria-current=\{here \? "true"/, 'Ari Mendelow is marked current in the phone menu');
assert.doesNotMatch(siteNav, /<nav\b/, 'The phone menu adds no landmark of its own');
// One name, one place: the footer's own GitHub link is Ari's, and says so.
const footerLinks = doc.querySelector('footer').querySelectorAll('a[href]').map(a => [text(a), a.getAttribute('href')]);
assert.deepEqual(footerLinks.filter(([label]) => /github/i.test(label)), [['GitHub', 'https://github.com/ourostack'], ['My GitHub', 'https://github.com/arimendelow']], 'The footer names its two GitHub links apart');
console.log("PASS: the family bar and footer carry the family links in order, with Ari Mendelow current, above the site navigation, with the same landmark names as the family's other sites.");

// Every link and button is an Ouro HX component. The one exception is the wordmark in the navbar's brand slot,
// the site's own content there, as on ui.ouroboros.bot.
const isOuro = el => Object.keys(el.attributes).some(name => name.startsWith('data-ouro'));
const handmade = doc.querySelectorAll('a[href], button').filter(el => !isOuro(el) && el.getAttribute('data-site-brand') === undefined);
assert.deepEqual(handmade.map(el => el.toString().slice(0, 120)), [], 'Every link and button is an Ouro HX component');
console.log('PASS: every link and button is an Ouro HX component.');

// Pictures end on hard edges: no inline style fades one.
assert.equal(doc.querySelectorAll('[style]').filter(el => /mask|gradient/i.test(el.getAttribute('style'))).length, 0, 'No inline style fades a picture');

// The favicon is unchanged.
assert.ok(doc.querySelector('head link[rel="icon"][href="/favicon.ico"]'), 'The page links /favicon.ico');
assert.ok(served('/favicon.ico'), '/favicon.ico is served');
console.log('PASS: /favicon.ico is linked and served.');

// Ari, 2026-10-20: text flows to the full width of its column. Nothing caps a line length; the only width limit is
// the page container (.wrap). Our own stylesheets and our own markup, not Ouro HX's internals.
const ownCss = fs.readdirSync(new URL('src/styles/', root)).filter(f => f.endsWith('.css')).map(f => read(`src/styles/${f}`)).join('\n');
const caps = [...ownCss.matchAll(/^[^@\n]*\{[^}]*max-width:\s*[\d.]+(?:ch|rem|em|px)\b[^}]*\}/gm)].map(([rule]) => rule.trim());
assert.deepEqual(caps, [], 'No text has its own max-width');
const ownMarkup = [...fs.readdirSync(new URL('src/components/', root)).filter(f => /\.(tsx|astro)$/.test(f)).map(f => `src/components/${f}`), ...fs.readdirSync(new URL('src/pages/', root)).map(f => `src/pages/${f}`), ...fs.readdirSync(new URL('src/layouts/', root)).map(f => `src/layouts/${f}`)];
const capClasses = ownMarkup.flatMap(file => [...read(file).matchAll(/\bmax-w-[\w[\]().-]+/g)].map(([cls]) => `${file}: ${cls}`));
assert.deepEqual(capClasses, [], 'No text has its own max-width class');
console.log('PASS: no text has its own max-width.');

// The family has no italics (ouroboros.bot's first rule).
assert.doesNotMatch(ownCss, /font-style:\s*italic/, 'No italics');

// Ari, 2026-10-20: every section reads top to bottom. Only copy beside its own pictures (the Spoonjoy card and the
// RAPID story) may use the split columns.
const splitRules = [...ownCss.matchAll(/([^{}]*)\{[^{}]*grid-template-columns:\s*var\(--split-cols(?:-wide)?\)[^{}]*\}/g)].map(([, selector]) => selector.trim());
const sideBySide = splitRules.filter(selector => !/^\.(card-split|about-grid)$/.test(selector));
assert.deepEqual(sideBySide, [], 'Only copy beside its own pictures sits in columns');
console.log('PASS: every section reads top to bottom, except copy beside its own pictures.');
