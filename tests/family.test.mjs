// src/family.json is a byte-for-byte copy of the family's canonical link list, ourostack/.github brand/family.json.
// When the network is reachable the copy must match it; offline, the test says so and skips.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const CANONICAL = 'https://raw.githubusercontent.com/ourostack/.github/main/brand/family.json';
const copy = fs.readFileSync(new URL('../src/family.json', import.meta.url));

test('src/family.json lists the family in order, with mendelow.me among them', () => {
  const { links } = JSON.parse(copy.toString('utf8'));
  assert.deepEqual(links.map(link => link.id), ['ouro', 'ouro-ui', 'ouro-md', 'desk', 'apps', 'ari', 'github']);
  assert.equal(links.find(link => link.id === 'ari').href, 'https://mendelow.me/');
});

test('src/family.json matches the canonical file byte for byte', async t => {
  let response;
  try {
    response = await fetch(CANONICAL, { signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    t.skip(`the network is unreachable (${error.message})`);
    return;
  }
  assert.ok(response.ok, `${CANONICAL} answered HTTP ${response.status}`);
  const canonical = Buffer.from(await response.arrayBuffer());
  assert.ok(copy.equals(canonical), `src/family.json differs from ${CANONICAL}; copy it again`);
});
