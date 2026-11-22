// node scripts/check-swatches.mjs <built folder | https://address>: opens the page in light and dark, chooses each look
// in the header's theme picker, and checks that every dot previews its own look in the current scheme, whatever look
// is chosen: its --background and --primary are the ones the page shows when that look is chosen, and the five dots
// differ. Needs Playwright's Chromium.
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { serve } from "./ouro/check/serve.ts";

const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/check-swatches.mjs <built folder | https://address>");
  process.exit(2);
}
const server = /^https?:\/\//.test(target) ? null : await serve(target);
const origin = server ? server.origin : target.replace(/\/$/, "");
const picker = '[data-ouro="theme-picker"]:visible';
const browser = await chromium.launch();

// The colours a dot paints with (its page colour and its primary), as the page resolves them on an element.
const tokens = `window.lookOf = (element) => {
  const style = getComputedStyle(element);
  return { background: style.getPropertyValue("--background").trim(), primary: style.getPropertyValue("--primary").trim() };
};`;

try {
  for (const scheme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    await context.addInitScript(tokens);
    const page = await context.newPage();
    await page.goto(`${origin}/`);
    // The navigation hydrates on load; the islands further down wait until they are seen.
    await page.waitForFunction(() => {
      const nav = document.querySelector('astro-island[component-url*="SiteNav"]');
      return nav && !nav.hasAttribute("ssr");
    });
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), scheme === "dark", `the page is ${scheme}`);
    const dots = page.locator(`${picker} [data-ouro-part="preset"]`);
    const names = await dots.locator("span[data-theme]").evaluateAll((spans) => spans.map((span) => span.dataset.theme));
    assert.equal(names.length, 5, `${scheme}: the header offers five looks`);

    // What each look paints the page with in this scheme, read off <html> with that look set.
    const expected = await page.evaluate((names) => {
      const root = document.documentElement;
      const before = root.getAttribute("data-theme");
      const looks = {};
      for (const name of names) {
        root.setAttribute("data-theme", name);
        looks[name] = window.lookOf(root);
      }
      root.setAttribute("data-theme", before);
      return looks;
    }, names);
    const backgrounds = new Set(Object.values(expected).map((look) => look.background));
    assert.equal(backgrounds.size, names.length, `${scheme}: the five looks have five page colours (${[...backgrounds].join(", ")})`);

    for (const chosen of names) {
      await dots.filter({ has: page.locator(`span[data-theme="${chosen}"]`) }).click();
      await page.waitForFunction((name) => document.documentElement.getAttribute("data-theme") === name, chosen);
      const painted = await page.evaluate(() => window.lookOf(document.documentElement));
      assert.deepEqual(painted, expected[chosen], `${scheme}: choosing ${chosen} paints the page with ${chosen}`);
      const shown = await dots
        .locator("span[data-theme]")
        .evaluateAll((spans) => Object.fromEntries(spans.map((span) => [span.dataset.theme, window.lookOf(span)])));
      for (const name of names) {
        assert.deepEqual(shown[name], expected[name], `${scheme}, ${chosen} chosen: the ${name} dot shows ${name}, not ${JSON.stringify(shown[name])}`);
      }
    }
    // The choice is kept for the next visit.
    assert.equal(await page.evaluate(() => localStorage.getItem("ouro-theme-preset")), names.at(-1));
    await context.close();
  }
  console.log("PASS: in light and dark, every theme dot previews its own look whichever look is chosen.");
} finally {
  await browser.close();
  await server?.close();
}
