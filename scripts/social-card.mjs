// Renders assets/social-card.png (1200x630) from the built page: the name, the
// hero headline and the portrait, in the site's own palette and serif. Run by
// build-site.mjs on every deploy; there is no hand-made card to keep in sync.
//
// Needs a Chrome or Chromium binary (CHROME=/path overrides the search). The
// card is set in Charter (macOS) or Charis SIL, its open-licence twin (Linux CI
// installs fonts-sil-charis), so it looks the same wherever it is built.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const CARD = { width: 1200, height: 630 };

const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&rsquo;|&#8217;/g, '\u2019').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const text = s => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function cardContent(html) {
  const meta = name => html.match(new RegExp(`<meta[^>]+property="${name}"[^>]+content="([^"]*)"`))?.[1];
  const name = meta('og:site_name');
  const headline = text(html.match(/<h1[^>]*id="hero-heading"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
  const domain = new URL(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? 'https://invalid/').hostname;
  if (!name || !headline || domain === 'invalid') throw new Error('social card: page is missing og:site_name, the hero h1 or the canonical link');
  return { name: decode(name), headline, domain };
}

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(mac)) return mac;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [bin], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new Error('social card: no Chrome or Chromium found (set CHROME)');
}

function template({ name, headline, domain }, portraitUrl) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  :root { --bg: #f6f2ea; --ink: #211f1b; --ink-soft: #37342d; --muted: #6f6659; --line: #e2dccf; --accent: #a8431f;
    --serif: "Charter", "Charis SIL", "Iowan Old Style", Georgia, serif; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${CARD.width}px; height: ${CARD.height}px; overflow: hidden; background: var(--bg); }
  body { display: grid; grid-template-columns: 1fr 470px; font-family: var(--serif); -webkit-font-smoothing: antialiased; }
  .text { display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 0 64px 0 80px; position: relative; }
  .name { font-size: 96px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
  .headline { font-size: 40px; line-height: 1.22; color: var(--ink-soft); text-wrap: balance; }
  .domain { position: absolute; left: 80px; bottom: 56px; font-size: 30px; font-style: italic; color: var(--muted); }
  .photo { border-left: 3px solid var(--line); background: url("${portraitUrl}") center 12% / cover no-repeat; }
  </style></head><body>
  <div class="text"><div class="name">${escape(name)}</div><div class="headline">${escape(headline)}</div><div class="domain">${escape(domain)}</div></div>
  <div class="photo"></div></body></html>`;
}

export async function renderSocialCard({ html, assets, out }) {
  const content = cardContent(fs.readFileSync(html, 'utf8'));
  const portrait = path.join(assets, 'ari-portrait-wide.jpg');
  if (!fs.existsSync(portrait)) throw new Error(`social card: missing ${portrait}`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'social-card-'));
  const page = path.join(work, 'card.html');
  fs.writeFileSync(page, template(content, pathToFileURL(portrait).href));

  // Our own headless browser on a random port, read back from its own profile.
  const profile = path.join(work, 'profile');
  const proc = spawn(findChrome(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--allow-file-access-from-files', `--user-data-dir=${profile}`,
    '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' });
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 600 && !fs.existsSync(portFile); i++) await new Promise(r => setTimeout(r, 100));
    if (!fs.existsSync(portFile)) throw new Error('social card: Chrome did not start');
    const [port, wsPath] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
    const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
    let id = 0; const pending = new Map(); const events = [];
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m.method);
    };
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    const send = (method, params = {}, sessionId) => new Promise((r, j) => {
      const i = ++id; pending.set(i, m => (m.error ? j(new Error(`${method}: ${m.error.message}`)) : r(m.result)));
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s('Emulation.setDeviceMetricsOverride', { width: CARD.width, height: CARD.height, deviceScaleFactor: 1, mobile: false });
    await s('Page.enable');
    await s('Page.navigate', { url: pathToFileURL(page).href });
    for (let i = 0; i < 300 && !events.includes('Page.loadEventFired'); i++) await new Promise(r => setTimeout(r, 50));
    const probe = await s('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
      await document.fonts.ready;
      const img = new Image(); img.src = getComputedStyle(document.querySelector('.photo')).backgroundImage.slice(5, -2);
      await img.decode();
      const t = document.querySelector('.text').getBoundingClientRect(), n = document.querySelector('.name');
      return { overflow: n.scrollWidth > n.clientWidth || document.querySelector('.headline').getBoundingClientRect().bottom > ${CARD.height} - 110,
        fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family) };
    })()` });
    if (probe.result?.value?.overflow) throw new Error(`social card: "${content.headline}" does not fit the card; shorten it or adjust the template`);
    const shot = await s('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, ...CARD, scale: 1 } });
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    await send('Browser.close').catch(() => {});
    ws.close();
  } finally {
    proc.kill();
  }
  console.log(`social card: ${path.relative(process.cwd(), out)} (${content.name}: ${content.headline})`);
  return content;
}
