// Proof screenshots for the mendelow.me family pass: one headless Chrome per page, closed after each.
//
//   node shoot.mjs <before|after> <url> <outDir>
//
// Shoots phone 390x844 and laptop 1440x900, light and dark, the first screen and the full page, then measures
// sideways scroll at 320, 1280x800, 1920x1080 and 3840x2160 in both schemes.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const [label, target, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const chrome = process.env.CHROME || undefined;

// A built folder is served on a local port, as GitHub Pages serves it; a URL is used as it is.
let url = target;
let server;
if (!/^https?:/.test(target)) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon" };
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

async function withPage(viewport, scheme, fn) {
  const browser = await chromium.launch({ executablePath: chrome, headless: true });
  try {
    const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.width > 2000 ? 1 : 2, colorScheme: scheme, reducedMotion: "reduce", isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const page = await context.newPage();
    await page.route(/cloudflareinsights|youtube/, route => route.abort());
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map(img => (img.complete ? null : img.decode().catch(() => null))));
      await document.fonts.ready;
    });
    await page.waitForTimeout(400);
    return await fn(page);
  } finally {
    await browser.close();
  }
}

const results = [];
const only = process.env.ONLY;
for (const [name, viewport] of [["phone", { width: 390, height: 844 }], ["laptop", { width: 1440, height: 900 }]]) {
  if (only && only !== name) continue;
  for (const scheme of ["light", "dark"]) {
    await withPage(viewport, scheme, async page => {
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-first.png`) });
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-full.png`), fullPage: true });
    });
    console.log(`shot ${name} ${scheme}`);
  }
}
if (!only) {
  for (const viewport of [{ width: 320, height: 700 }, { width: 1280, height: 800 }, { width: 1920, height: 1080 }, { width: 3840, height: 2160 }]) {
    for (const scheme of ["light", "dark"]) {
      const r = await withPage(viewport, scheme, page => page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })));
      results.push({ ...viewport, scheme, ...r, sideways: r.scrollWidth > r.clientWidth });
    }
  }
  fs.writeFileSync(path.join(out, `${label}-widths.json`), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
}
// The phone menu and the colour scheme menu, open, for the critics.
if (process.env.MENUS) {
  await withPage({ width: 390, height: 844 }, "light", async page => {
    await page.waitForTimeout(1500);
    await page.click("[data-ouro-navbar-menu]");
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, `${label}-phone-light-menu.png`) });
  });
  await withPage({ width: 1440, height: 900 }, "dark", async page => {
    await page.waitForTimeout(1500);
    await page.click('[data-ouro="color-scheme-toggle"] button');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, `${label}-laptop-dark-scheme-menu.png`) });
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await page.screenshot({ path: path.join(out, `${label}-laptop-dark-focus.png`) });
  });
  await withPage({ width: 1440, height: 900 }, "light", async page => {
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.locator(".video-play").focus();
    await page.screenshot({ path: path.join(out, `${label}-laptop-light-video-focus.png`) });
  });
}
server?.close();
