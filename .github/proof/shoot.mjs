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
      // The entry with the page's gutter round it, so the crop shows where it sits on the page; the sticky header is
      // scrolled clear first.
      await page.evaluate(() => { const el = document.querySelector("#ouro-ui"); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120); });
      await page.waitForTimeout(1200);
      const box = await page.locator("#ouro-ui").boundingBox();
      await page.screenshot({ path: path.join(out, `${label}-${name}-${scheme}-ouro-ui.png`), clip: { x: 0, y: Math.max(0, box.y - 24), width: viewport.width, height: Math.min(box.height + 48, viewport.height - Math.max(0, box.y - 24)) } });
    });
    console.log(`shot ${label} ${name} ${scheme}`);
  }
}

if (play) {
  for (let [name, viewport, scale, phone, scheme] of [[...sizes[0], "light"], [...sizes[1], "light"], [...sizes[1], "dark"]]) {
    name = scheme === "dark" ? `${name}-dark` : name;
    const videoDir = path.join(out, `video-${name}`);
    await session({ viewport, deviceScaleFactor: scale, colorScheme: scheme, reducedMotion: "no-preference", isMobile: phone, hasTouch: phone, recordVideo: { dir: videoDir, size: viewport } }, async page => {
      const lead = page.locator("#ouro-ui .showcase");
      await lead.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.querySelector("#ouro-ui .showcase").scrollIntoView({ block: "center" }));
      await page.waitForFunction(() => !document.querySelector("#ouro-ui astro-island")?.hasAttribute("ssr"), null, { timeout: 15000 });
      await page.waitForTimeout(800);
      let n = 0;
      const frame = async what => { await page.waitForTimeout(700); await lead.screenshot({ path: path.join(out, `play-${name}-${String(n++).padStart(2, "0")}-${what}.png`) }); };
      const tap = locator => (phone ? locator.tap() : locator.click());
      await frame("start");
      for (let i = 0; i < 3; i++) { await tap(page.getByRole("button", { name: "Next slide" })); await page.waitForTimeout(500); }
      await frame("rooibos");
      const brew = page.getByRole("button", { name: /^Brew/ });
      // A first brew in the shuffled order: the tea comes out gently wrong, and says why.
      await tap(brew);
      await page.waitForTimeout(2500);
      await frame("brewing-wrong");
      await page.waitForFunction(() => /Not quite/.test(document.querySelector("#showcase-hint")?.textContent ?? ""), null, { timeout: 15000 });
      await page.waitForTimeout(900);
      await frame("not-quite");
      // Put the steps right: drag the first by pointer (or by keyboard on the phone), the rest by keyboard.
      const want = ["Boil the water", "Warm the pot", "Add the leaves", "Pour on the water", "Let it steep"];
      const rows = async () => page.locator('#ouro-ui [data-ouro="reorderable"] li').evaluateAll(lis => lis.map(li => li.querySelector("button")?.getAttribute("aria-label")?.replace(/^Reorder /, "")));
      for (let target = 0; target < want.length; target++) {
        const now = await rows();
        const from = now.indexOf(want[target]);
        if (from === target) continue;
        const handle = page.getByRole("button", { name: `Reorder ${want[target]}` });
        if (!phone && target === 0) {
          const box = await handle.boundingBox();
          const row = (await page.locator('#ouro-ui [data-ouro="reorderable"] li').first().boundingBox()).height;
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          const steps = 16;
          for (let i = 1; i <= steps; i++) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - (i / steps) * row * (from - target)); await page.waitForTimeout(25); }
          await page.mouse.up();
          await page.waitForTimeout(700);
          if (target === 0) await frame("dragged");
          continue;
        }
        await handle.focus();
        await page.keyboard.press("Space");
        for (let i = 0; i < from - target; i++) { await page.keyboard.press("ArrowUp"); await page.waitForTimeout(120); }
        await page.keyboard.press("Space");
        await page.waitForTimeout(400);
      }
      await frame("in-order");
      await tap(brew);
      await page.waitForTimeout(3000);
      await frame("brewing");
      await page.waitForFunction(() => document.querySelector("#ouro-ui .showcase")?.hasAttribute("data-ready"), null, { timeout: 15000 });
      await page.waitForTimeout(250);
      await frame("ready-burst");
      await page.waitForTimeout(1500);
      await frame("ready");
      await page.waitForTimeout(1200);
    });
    const [webm] = fs.readdirSync(videoDir);
    fs.renameSync(path.join(videoDir, webm), path.join(out, `play-${name}.webm`));
    fs.rmdirSync(videoDir);
    console.log(`played ${name}`);
  }
}
server?.close();
