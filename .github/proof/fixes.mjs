// Proof for the Ouro check fixes, shot in CI: before (live) and after (this build), one crop per fix, and the largest
// content each page draws first, read before anything scrolls. Deleted before merge.
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
      // The first content, before the page is scrolled at all.
      const first = await page.evaluate(() => window.__lcp);
      const hero = await page.evaluate(() => {
        const img = document.querySelector(".hero-pic img");
        if (!img) return null;
        const r = img.getBoundingClientRect();
        const res = performance.getEntriesByName(img.currentSrc)[0];
        return { src: img.currentSrc, shown: `${Math.round(r.width)}x${Math.round(r.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}`, bytes: res?.encodedBodySize ?? res?.transferSize ?? null, ms: res ? Math.round(res.responseEnd) : null, loading: img.loading, priority: img.getAttribute("fetchpriority") };
      });
      const textSizes = await page.evaluate(() => {
        const seen = new Map();
        for (const el of document.querySelectorAll("body *")) {
          const s = getComputedStyle(el);
          if (s.display === "none" || s.visibility === "hidden") continue;
          if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const px = Math.round(parseFloat(s.fontSize) * 2) / 2;
          if (!seen.has(px)) seen.set(px, `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")}`);
        }
        return [...seen].sort((a, b) => a[0] - b[0]).map(([px, el]) => `${px} (${el})`);
      });
      notes.push(`## ${label} ${tag}\n- first content (no scroll): ${JSON.stringify(first.at(-1))}\n- hero portrait: ${JSON.stringify(hero)}\n- text sizes (${textSizes.length}): ${textSizes.join(", ")}`);
      await page.screenshot({ path: `${out}/${tag}-first-screen.png` });
      // The Spoonjoy 2023 capture in its frame.
      const shot = page.locator('figure:has(img[src*="spoonjoy-2023"])');
      if (await shot.count()) {
        await shot.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await shot.screenshot({ path: `${out}/${tag}-spoonjoy-2023.png` });
      }
      // The largest content after a scroll through the page, as the Ouro check reads it.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      notes.push(`- largest content after a scroll: ${JSON.stringify((await page.evaluate(() => window.__lcp)).at(-1))}`);
      for (const [id, sel] of [["work", "#work"], ["story", "#spoonjoy-story"]]) {
        const el = page.locator(sel);
        if (!(await el.count())) continue;
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${out}/${tag}-${id}.png` });
      }
    });
  }
}
await browser.close();
fs.writeFileSync(`${out}/notes.md`, notes.join("\n") + "\n");
console.log(notes.join("\n"));
server?.close();
