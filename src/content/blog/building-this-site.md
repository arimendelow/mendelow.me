---
title: "Building This Site"
description: "A placeholder post for testing the new writing-first layout and typography."
pubDate: "Feb 24 2026"
---

I rebuilt this site because the previous version looked polished but made writing feel heavy. Each new post turned into a layout task, and that extra friction slowed publishing more than I wanted to admit.

This version is intentionally small: one homepage, one about page, and straightforward post pages. The homepage is the blog, so there is no extra click before reading.

I also wanted the layout to stay close to plain text. No cards, no hero blocks, and no visual noise competing with the writing. Each entry is just title, date, reading time, and one short description.

## What Changed

The biggest change was reducing the number of decisions required to publish. Fewer visual options means less context switching and more writing.

Current structure choices:

- Typography uses Inter at a comfortable reading size.
- Content width is narrow enough to keep line length sane on large screens.
- Navigation is only two links: home and about.
- Post metadata includes reading time, calculated from word count.

## Why This Matters

The goal is not to make the prettiest blog in the category. The goal is to make publishing feel light enough that I keep doing it.

When publishing is easy, I can write short notes the same day I learn something. Those notes become references later, and over time they form a better map of how I work.

> A good personal site should reduce friction, not add ceremony.

I also care about keeping the site durable. A plain content structure, lightweight styling, and small component surface area make future changes easier without a full redesign every six months.

## Working Notes

Here is a small utility I use to estimate reading time:

```ts
const WORDS_PER_MINUTE = 200;
const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
```

It is simple and intentionally opinionated. Most posts here are short, so this gives a quick expectation without overthinking precision.

## What Comes Next

Next I want to publish shorter build notes more often, then add longer essays once the cadence is steady.

The immediate checklist:

1. Ship one post per week for a month.
2. Keep the about page updated with active projects.
3. Improve post metadata when I have a clear need.

Consistency matters more than polish for this version.
