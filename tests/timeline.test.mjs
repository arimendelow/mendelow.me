// Each era's heading on the timelines links to that era's own place on the page, so a person can share it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('every timeline era has an id, and its heading links to it', () => {
  const beats = [...html.matchAll(/<li class="beat"([^>]*)>\s*<h3 class="beat-when">([\s\S]*?)<\/h3>/g)];
  assert.ok(beats.length >= 10, 'the timelines render their eras');
  const ids = new Set();
  for (const [, attrs, heading] of beats) {
    const id = attrs.match(/id="([^"]+)"/)?.[1];
    assert.ok(id, `an era has no id: ${heading.slice(0, 60)}`);
    assert.ok(!ids.has(id), `${id} is used twice`);
    ids.add(id);
    assert.match(heading, new RegExp(`href="#${id}"`), `${id}'s heading does not link to it`);
  }
});
