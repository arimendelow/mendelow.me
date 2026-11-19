// node scripts/check-lost.mjs <built folder>: opens addresses that don't exist, served the 404 page as GitHub Pages
// serves it, and checks the guess: an address that names a place on the home page (or misspells it) offers the way
// there, and one that names nothing offers only Go home. Needs Playwright's Chromium.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { serve } from "./ouro/check/serve.ts";

const folder = process.argv[2];
if (!folder) {
  console.error("usage: node scripts/check-lost.mjs <built folder>");
  process.exit(2);
}
const notFound = readFileSync(join(folder, "404.html"));
const server = await serve(folder);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // GitHub Pages answers a missing address with 404.html; the check's server answers with nothing.
  await page.route(`${server.origin}/lost/**`, (route) => route.fulfill({ status: 404, contentType: "text/html", body: notFound }));
  const cases = [
    ["/lost/spoonjoy", "Take me to Spoonjoy", "/#spoonjoy"],
    ["/lost/recipes/", "Take me to Spoonjoy", "/#spoonjoy"],
    ["/lost/spoonjoyy", "Take me to Spoonjoy", "/#spoonjoy"],
    ["/lost/tea", "Take me to the tea set", "/#ouro-ui"],
    ["/lost/Ouro-UI.html", "Take me to the tea set", "/#ouro-ui"],
    ["/lost/about", "Take me to About", "/#about"],
    ["/lost/qwxzv", null, null],
    ["/lost/team", null, null],
    ["/lost/100%", null, null],
  ];
  for (const [path, button, href] of cases) {
    await page.goto(`${server.origin}${path}`);
    await page.waitForFunction(() => [...document.querySelectorAll("astro-island")].every((island) => !island.hasAttribute("ssr")));
    const guess = page.locator("[data-lost-guess]");
    if (button) {
      const link = guess.getByRole("link", { name: button });
      await assert.doesNotReject(link.waitFor({ timeout: 10_000 }), `${path} offers "${button}"`);
      assert.equal(await link.getAttribute("href"), href);
    } else {
      assert.equal(await guess.count(), 0, `${path} names no place, so nothing is guessed`);
    }
    const home = page.getByRole("link", { name: "Go home" });
    assert.ok(await home.isVisible(), `${path} still offers Go home`);
    // Go home keeps its room under the line above it, guess or not.
    const gap = await home.evaluate((link) => link.getBoundingClientRect().top - document.querySelector(".hero-sub").getBoundingClientRect().bottom);
    assert.ok(gap >= 20, `${path}: Go home sits ${gap}px under the line above it`);
  }
  console.log("PASS: a lost address that names a place on the home page offers the way there, and one that names nothing offers Go home.");
} finally {
  await browser.close();
  await server.close();
}
