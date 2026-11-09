// No picture fades into the page or into nothing (Ari, 2026-11-08: "none of this 'fade to nothingness' tho for an
// image"). Runs Ouro check's fade check over the site's source: it fails on any gradient mask that is not marked
// `fade-ok: <reason>` on the same or the previous line.
//
//   node scripts/check-fades.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = spawnSync(process.execPath, ['lib/ouro/check/fades.ts', 'src'], { cwd: root, stdio: 'inherit' });
process.exit(run.status ?? 1);
