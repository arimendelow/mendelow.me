// node scripts/check-tea.mjs <built folder>: plays the Ouro UI entry's tea in a real browser. The scene follows the steps
// done in turn: the line under the tea says where the pot is, the cups stay empty until the water is poured, and the
// finished pot ends on the hand-off, the line to paste into a coding agent with Copy beside it. Needs Playwright's
// Chromium (npx playwright install chromium).
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { serve } from "./ouro/check/serve.ts";

const folder = process.argv[2];
if (!folder) {
  console.error("usage: node scripts/check-tea.mjs <built folder>");
  process.exit(2);
}
const server = await serve(folder);
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  await page.goto(`${server.origin}/#ouro-ui`);
  const tea = page.locator("#ouro-ui");
  await tea.locator(".showcase").scrollIntoViewIfNeeded();
  const slide = tea.locator(".showcase-slide").first();
  const line = slide.locator(".showcase-tea-line");
  const tick = async (label) => {
    await tea.getByRole("checkbox", { name: label }).click();
  };
  // Hydrated: the steps answer a press.
  await assert.doesNotReject(tea.getByRole("checkbox", { name: "Boil the water" }).waitFor());
  await page.waitForFunction(() => document.querySelector('#ouro-ui astro-island[component-export="OuroShowcase"]')?.hasAttribute("ssr") === false);
  assert.equal(await line.textContent(), "Malty and bold");
  assert.equal(await slide.locator(".showcase-tea-surface").count(), 0, "The cups start empty");

  // A step ticked too early moves nothing on.
  await tick("Add the leaves");
  assert.equal(await line.textContent(), "Malty and bold", "A step out of turn leaves the pot where it was");
  await tick("Add the leaves");

  const stages = [
    ["Boil the water", "The kettle's on."],
    ["Warm the pot", "The pot is warm."],
    ["Add the leaves", "Leaves in. Water next."],
    ["Pour on the water", "Poured. Now let it steep."],
    ["Let it steep", "Fresh from the pot."],
  ];
  for (const [step, said] of stages) {
    await tick(step);
    await assert.doesNotReject(line.filter({ hasText: said }).waitFor({ timeout: 10_000 }), `After "${step}" the line reads "${said}"`);
    const filled = await slide.locator(".showcase-tea-surface").count();
    if (step === "Boil the water" || step === "Warm the pot" || step === "Add the leaves") assert.equal(filled, 0, `The cups are still empty after "${step}"`);
    else assert.equal(filled, 2, `Both cups hold tea after "${step}"`);
  }
  const handOff = tea.getByRole("group", { name: "Like the tea? Hand Ouro UI to your coding agent." });
  await assert.doesNotReject(handOff.waitFor({ timeout: 10_000 }), "The finished pot ends on the hand-off");
  assert.match(await handOff.textContent(), /Build this app's interface with Ouro UI\. Read https:\/\/ui\.ouroboros\.bot\/llms\.txt first and follow it\./);
  assert.ok(await handOff.getByRole("button", { name: "Copy" }).isVisible(), "Copy sits beside the line");
  await tea.getByRole("button", { name: "Start over" }).click();
  await assert.doesNotReject(handOff.waitFor({ state: "detached", timeout: 10_000 }), "Start over puts the hand-off away");
  // "Show me the parts" turns on X-ray over the whole page: an outline and a tag on every Ouro HX component, the
  // Checklist pointed out first, and the button turns it off again.
  await page.waitForFunction(() => document.querySelector('#ouro-ui astro-island[component-export="XrayToggle"]')?.hasAttribute("ssr") === false);
  const showMe = tea.getByRole("button", { name: "Show me the parts" });
  await showMe.click();
  await assert.doesNotReject(page.locator('[data-ouro="inspector"]').first().waitFor({ timeout: 10_000 }), "X-ray turns on");
  await page.waitForFunction(() => document.querySelectorAll('[data-ouro="inspector"] [data-ouro-part="tag"]').length > 5, null, { timeout: 10_000 });
  const tags = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-ouro="inspector"] [data-ouro-part="tag"]')].map((link) => new URL(link.href).pathname))]);
  for (const item of ["/docs/checklist/", "/docs/carousel/", "/docs/button/", "/docs/link/", "/docs/navbar/"]) assert.ok(tags.includes(item), `X-ray tags ${item} (tags: ${tags.join(", ")})`);
  await tea.getByRole("button", { name: "Hide the parts" }).click();
  await assert.doesNotReject(page.locator('[data-ouro="inspector"]').waitFor({ state: "detached", timeout: 10_000 }), "X-ray turns off");
  // Say hello!'s address copies with one press, for someone whose mail lives in a browser, and Copy says so on itself.
  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#contact astro-island[component-export="CopyEmail"]')?.hasAttribute("ssr") === false);
  await contact.getByRole("button", { name: "Copy address" }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "hello@mendelow.me");
  await assert.doesNotReject(contact.getByRole("button", { name: /Copied/ }).waitFor({ timeout: 10_000 }), "Copy says Copied on itself");
  console.log("PASS: the tea follows the steps done in turn, fills when poured, and ends on the hand-off; Show me the parts X-rays the page; the email address copies.");
} finally {
  await browser.close();
  await server.close();
}
