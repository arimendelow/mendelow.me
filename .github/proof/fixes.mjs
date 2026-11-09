// Proof for Ouro HX v1.3.10, shot in CI: before (live) and after (this build), the first screen, the foot and the open
// phone menu, with where the bar, wordmark and footer text start. Deleted before merge.
//
//   node .github/proof/fixes.mjs <before|after> <url | built folder> <outDir>
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const [label, target, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

let url = target;
let server;
if (!/^https?:/.test(target)) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".json": "application/json" };
  server = http.createServer((req, res) => {
    let file = path.join(target, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404, { "content-type": "text/html" }); res.end(fs.readFileSync(path.join(target, "404.html"))); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  url = `http://127.0.0.1:${server.address().port}/`;
}

const notes = [];
const browser = await chromium.launch({ headless: true });
async function open(options, fn) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), size: e.size, el: e.element ? `${e.element.tagName.toLowerCase()} ${e.element.currentSrc || e.element.className || ""}`.slice(0, 120) : null });
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  const page = await context.newPage();
  await page.route(/cloudflareinsights|youtube/, route => route.abort());
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(500);
  try { await fn(page); } finally { await context.close(); }
}

const sizes = [
  ["phone", { width: 390, height: 844 }, 2, true],
  ["laptop", { width: 1440, height: 900 }, 1, false],
  ["4k", { width: 3840, height: 2160 }, 1, false],
];

for (const [name, viewport, dpr, touch] of sizes) {
  for (const theme of ["light", "dark"]) {
    await open({ viewport, deviceScaleFactor: dpr, hasTouch: touch, isMobile: touch, colorScheme: theme }, async page => {
      const tag = `${name}-${theme}`;
      await page.screenshot({ path: `${out}/${tag}-top.png` });
      // Where the family bar's first link, the wordmark and the page's first text start: one column edge.
      const edges = await page.evaluate(() => {
        const x = sel => { const el = document.querySelector(sel); if (!el) return null; const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return Math.round(b.left * 10) / 10; };
        return { bar: x('nav[aria-label="Sites"] li:first-child a'), wordmark: x(".wordmark"), heading: x("#hero-heading"), footer: x('nav[aria-label="All sites"] li:first-child a') };
      });
      notes.push(`## ${label} ${tag}\n- text edges: ${JSON.stringify(edges)}`);
      const foot = page.locator("footer").last();
      await foot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await foot.screenshot({ path: `${out}/${tag}-foot.png` });
      if (touch) {
        await page.evaluate(() => window.scrollTo(0, 0));
        const button = page.locator("header button[aria-expanded]").first();
        if (await button.count()) {
          await button.click();
          await page.waitForTimeout(800);
          await page.screenshot({ path: `${out}/${tag}-menu.png` });
        }
      }
    });
  }
}
await browser.close();
fs.writeFileSync(`${out}/notes.md`, notes.join("\n") + "\n");
console.log(notes.join("\n"));
server?.close();
