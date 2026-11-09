// Round two proof, shot in CI: full pages at 390 (touch), 1440 and 3840, light and dark; a crop of the Ouro UI
// entry at each; and, for the branch, the showcase being played with, as frames and a recording.
//
//   node .github/proof/shoot.mjs <before|after> <url | built folder> <outDir> [play]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const [label, target, out, play] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

let url = target;
let server;
if (!/^https?:/.test(target)) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon" };
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

async function session(options, fn) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    await page.route(/cloudflareinsights|youtube/, route => route.abort());
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    await page.waitForTimeout(1500);
    await fn(page, context);
    await context.close();
  } finally {
    await browser.close();
  }
}

const sizes = [
  ["phone", { width: 390, height: 844 }, 2, true],
  ["laptop", { width: 1440, height: 900 }, 1, false],
  ["4k", { width: 3840, height: 2160 }, 1, false],
];
for (const [name, viewport, scale, phone] of sizes) {
  for (const scheme of ["light", "dark"]) {
    await session({ viewport, deviceScaleFactor: scale, colorScheme: scheme, reducedMotion: "reduce", isMobile: phone, hasTouch: phone }, async page => {
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-full.jpg`), fullPage: true, quality: 82, type: "jpeg" });
      const lead = page.locator("#ouro-ui");
      await lead.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      await lead.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-ouro-ui.png`) });
    });
    console.log(`shot ${label} ${name} ${scheme}`);
  }
}

if (play) {
  for (const [name, viewport, scale, phone] of sizes.slice(0, 2)) {
    const videoDir = path.join(out, `video-${name}`);
    await session({ viewport, deviceScaleFactor: scale, colorScheme: "light", reducedMotion: "no-preference", isMobile: phone, hasTouch: phone, recordVideo: { dir: videoDir, size: viewport } }, async page => {
      const lead = page.locator("#ouro-ui .showcase");
      await lead.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.querySelector("#ouro-ui .showcase").scrollIntoView({ block: "center" }));
      await page.waitForFunction(() => !document.querySelector("#ouro-ui astro-island")?.hasAttribute("ssr"), null, { timeout: 15000 });
      await page.waitForTimeout(800);
      let n = 0;
      const frame = async what => { await page.waitForTimeout(700); await lead.screenshot({ path: path.join(out, `play-${name}-${String(n++).padStart(2, "0")}-${what}.png`) }); };
      const tap = locator => (phone ? locator.tap() : locator.click());
      await frame("start");
      await tap(page.getByRole("radio", { name: "4" }));
      await frame("four-cups");
      await page.locator("#ouro-ui input[type=range]").focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await frame("stronger-keyboard");
      await tap(page.getByRole("button", { name: "Start" }));
      await page.waitForTimeout(3000);
      await frame("steeping");
      for (const step of ["Boil the water", "Add the leaves"]) await tap(page.getByRole("checkbox", { name: step }));
      await frame("steps");
      const steep = page.getByRole("checkbox", { name: "Steep" });
      for (let i = 0; i < 60 && !(await steep.isChecked()); i++) await page.waitForTimeout(250);
      await frame("steeped");
      await tap(page.getByRole("checkbox", { name: "Take out the leaves" }));
      await page.waitForTimeout(300);
      await frame("ready");
      await page.waitForTimeout(1500);
    });
    const [webm] = fs.readdirSync(videoDir);
    fs.renameSync(path.join(videoDir, webm), path.join(out, `play-${name}.webm`));
    fs.rmdirSync(videoDir);
    console.log(`played ${name}`);
  }
}
server?.close();
