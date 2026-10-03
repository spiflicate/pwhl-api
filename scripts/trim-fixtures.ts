/**
 * Turn captured feed responses into trimmed test fixtures.
 *
 *    bun scripts/trim-fixtures.ts <capture-dir>
 *
 * <capture-dir> holds raw/<name>.txt bodies from capture-fixtures.mjs.
 * Each fixture keeps the full envelope, with long lists cut down so the
 * files stay small. Output: test/fixtures/<name>.ts, `as const` so the
 * fixture types can be checked against the library's response types.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripJsonp } from '../src/client/index.ts';

const FIXTURES = [
   'modulekit-seasons',
   'modulekit-schedule',
   'modulekit-scorebar',
   'modulekit-teamsbyseason',
   'modulekit-roster',
   'modulekit-player-profile',
   'modulekit-player-seasonstats',
   'modulekit-goalie-seasonstats',
   'modulekit-player-gamebygame',
   'modulekit-player-media',
   'modulekit-brackets',
   'statview-bootstrap',
   'statview-players-skaters-standard',
   'statview-players-goalies-standard',
   'gc-gamesummary',
   'gc-pxpverbose',
   'gc-clock',
   'gc-preview',
   'error-unknown-view',
   'error-unknown-player',
   'error-unknown-game-gc',
];

const KEEP = 3;

/** Keep the first few items of an array */
const head = (items: unknown[]) => items.slice(0, KEEP);

/** Keep up to two events of each kind, in original order */
function sampleEvents(events: Array<{ event: string }>) {
   const seen = new Map<string, number>();
   return events.filter((e) => {
      const n = seen.get(e.event) ?? 0;
      seen.set(e.event, n + 1);
      return n < 2;
   });
}

// biome-ignore lint/suspicious/noExplicitAny: walking arbitrary JSON
function trim(name: string, body: any): unknown {
   const sk = body?.SiteKit;
   if (name === 'modulekit-roster') return body; // staff rows are at the end
   if (sk) {
      for (const k of Object.keys(sk)) {
         if (Array.isArray(sk[k])) sk[k] = head(sk[k]);
         else if (k === 'Player') {
            for (const g of ['regular', 'playoff', 'exhibition', 'games']) {
               const rows = sk.Player[g];
               if (Array.isArray(rows) && rows.length > KEEP + 1) {
                  // keep the trailing "Total" row of season lists
                  sk.Player[g] = [...head(rows), rows[rows.length - 1]];
               }
            }
         }
      }
   }
   if (body?.GC?.Pxpverbose) {
      body.GC.Pxpverbose = sampleEvents(body.GC.Pxpverbose);
   }
   if (name.startsWith('statview-players')) {
      for (const s of body[0].sections) s.data = head(s.data);
   }
   return body;
}

const src = process.argv[2];
if (!src) {
   console.error('usage: bun scripts/trim-fixtures.ts <capture-dir>');
   process.exit(1);
}
const out = join(import.meta.dir, '../test/fixtures');
mkdirSync(out, { recursive: true });

for (const name of FIXTURES) {
   const raw = readFileSync(join(src, 'raw', `${name}.txt`), 'utf8');
   const body = JSON.parse(stripJsonp(raw));
   const json = JSON.stringify(trim(name, body), null, 1);
   writeFileSync(
      join(out, `${name}.ts`),
      `// Captured from the live feed on 2026-10-03, trimmed by scripts/trim-fixtures.ts\nexport default ${json} as const;\n`,
   );
   console.log(name, json.length);
}
