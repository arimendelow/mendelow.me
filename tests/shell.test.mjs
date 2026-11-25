import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the page column and section rhythm are Ouro's PageShell and PageSection, not hand-rolled classes", () => {
  const css = read("src/styles/site.css");
  assert.doesNotMatch(css, /^\.wrap\s*\{/m);
  assert.doesNotMatch(css, /^\.section\s*\{/m);
  for (const path of ["src/components/sections.tsx", "src/pages/index.astro", "src/pages/404.astro"]) {
    assert.doesNotMatch(read(path), /(class|className)="(wrap|section)\b/, `${path} still hand-rolls the shell`);
  }
});

test("the theme choice is applied before paint and offered in the footer, never the header", () => {
  assert.match(read("src/layouts/Base.astro"), /themePresetScript\(presetNames, /);
  assert.doesNotMatch(read("src/components/SiteNav.tsx"), /ThemePicker/);
  assert.match(read("src/components/FooterTheme.tsx"), /<ThemePicker /);
});

test("a light look beats :root, so choosing it changes the page", () => {
  assert.doesNotMatch(read("src/styles/themes.css"), /^\[data-theme=/m);
});

test("the tea hand-off is Ouro's AgentHandoff, with no hand-rolled copy of it", () => {
  const tea = read("src/components/OuroShowcase.tsx");
  const css = read("src/styles/site.css");
  assert.match(tea, /<AgentHandoff /);
  assert.doesNotMatch(css, /\.showcase-handoff/);
});
