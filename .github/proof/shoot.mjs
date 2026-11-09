// Proof screenshots for the Ouro HX v1.3.9 upgrade, shot in CI: phone 390x844 with touch, and laptop 1440x900,
// light and dark, the top, the foot, and on the phone the open menu. One headless browser per shot set, closed after.
//
//   node .github/proof/shoot.mjs <before|after> <url | built folder> <outDir>
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const [label, target, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

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

async function withPage(viewport, scheme, phone, fn) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: "reduce", isMobile: phone, hasTouch: phone });
    const page = await context.newPage();
    await page.route(/cloudflareinsights|youtube/, route => route.abort());
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    await page.waitForTimeout(1200);
    return await fn(page);
  } finally {
    await browser.close();
  }
}

const sizes = [["phone", { width: 390, height: 844 }, true], ["laptop", { width: 1440, height: 900 }, false]];
for (const [name, viewport, phone] of sizes) {
  for (const scheme of ["light", "dark"]) {
    await withPage(viewport, scheme, phone, async page => {
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-top.png`) });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-foot.png`) });
      if (phone) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const button = page.locator("[data-ouro-navbar-menu], #menu-toggle").first();
        await button.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-menu.png`) });
        const landmarks = await page.evaluate(() => [...document.querySelectorAll("nav")].filter(n => n.offsetParent !== null || n.getClientRects().length).map(n => n.getAttribute("aria-label")));
        fs.writeFileSync(path.join(out, `${label}-${name}-${scheme}-menu-landmarks.json`), JSON.stringify(landmarks));
      }
    });
    console.log(`shot ${name} ${scheme}`);
  }
}
server?.close();
