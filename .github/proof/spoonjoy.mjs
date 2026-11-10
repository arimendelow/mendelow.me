// The Spoonjoy card at phone, laptop and 4K, light and dark, with its picture's drawn size. Deleted before merge.
//   node .github/proof/spoonjoy.mjs <url | built folder> <outDir>
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const [target, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
let url = target;
let server;
if (!/^https?:/.test(target)) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  server = http.createServer((req, res) => {
    let file = path.join(target, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  url = `http://127.0.0.1:${server.address().port}/`;
}
const browser = await chromium.launch({ headless: true });
const notes = [];
for (const [name, viewport, dpr, touch] of [["phone", { width: 390, height: 844 }, 2, true], ["laptop", { width: 1440, height: 900 }, 2, false], ["4k", { width: 3840, height: 2160 }, 1, false]]) {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: dpr, hasTouch: touch, isMobile: touch, colorScheme: theme });
    const page = await context.newPage();
    await page.route(/cloudflareinsights|youtube/, (route) => route.abort());
    await page.goto(url, { waitUntil: "load" });
    // The sticky navbar would sit over the crop.
    await page.addStyleTag({ content: "header{position:static!important}" });
    const card = page.locator("#spoonjoy");
    await card.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForFunction(() => document.querySelector("#spoonjoy img")?.complete);
    await page.waitForTimeout(400);
    await card.screenshot({ path: `${out}/${name}-${theme}.png` });
    const m = await page.evaluate(() => { const i = document.querySelector("#spoonjoy img"); const r = i.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), filter: getComputedStyle(i.parentElement).filter }; });
    notes.push(`${name}-${theme}: picture ${m.w}x${m.h}, frame filter ${m.filter}`);
    await context.close();
  }
}
await browser.close();
server?.close();
fs.writeFileSync(`${out}/notes.md`, notes.join("\n") + "\n");
console.log(notes.join("\n"));
