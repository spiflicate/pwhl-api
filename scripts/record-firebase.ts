/**
 * Record LeagueStat's Firebase live feed for the PWHL to a JSONL file.
 *
 *    bun scripts/record-firebase.ts --game 353 --out firebase.jsonl
 *    bun scripts/record-firebase.ts --path svf/pwhl/runningclock --max-min 300
 *
 * Opens a Firebase REST event stream on each path and writes every event
 * with the time it arrived. --game <id> (repeatable) adds that game in every
 * section LeagueStat's game centre reads, in English (1) and French (2);
 * --path <path> (repeatable) adds any other path. The running clock of every
 * game (svf/pwhl/runningclock) is always recorded.
 * Every --snapshot-s seconds (default 60) it also writes a full read of each
 * path, so a dropped stream loses at most that much. Reconnects on errors.
 * Stops after --max-min minutes (default 300) or on Ctrl-C.
 *
 * Each line: {"at": ISO time, "kind": "event"|"snapshot"|"error", "path",
 * "event"?, "data"}.
 */
import { appendFileSync } from 'node:fs';
import { bootstrap } from '../src/api/seasons.ts';

const args = process.argv.slice(2);
const option = (name: string) => {
   const i = args.indexOf(name);
   return i >= 0 ? args[i + 1] : undefined;
};
const SECTIONS = [
   'publishedclock',
   'goalssummary',
   'penaltiessummary',
   'shotssummary',
   'goals',
];
const after = (name: string) =>
   args.flatMap((a, i) => (args[i - 1] === name ? [a] : []));
const paths = ['svf/pwhl/runningclock', ...after('--path')];
for (const game of after('--game')) {
   for (const section of SECTIONS) {
      for (const lang of [1, 2]) {
         paths.push(`svf/pwhl/${section}/${lang}/games/${game}`);
      }
   }
}
const out = option('--out') ?? 'firebase.jsonl';
const snapshotMs = Number(option('--snapshot-s') ?? 60) * 1000;
const deadline = Date.now() + Number(option('--max-min') ?? 300) * 60_000;

const config = await bootstrap();
const host = config.success
   ? config.data.firebaseUrl
   : 'leaguestat-b9523.firebaseio.com';
const base = `https://${host}`;

function write(line: Record<string, unknown>) {
   appendFileSync(
      out,
      `${JSON.stringify({ at: new Date().toISOString(), ...line })}\n`,
   );
}

async function stream(path: string, signal: AbortSignal) {
   while (!signal.aborted) {
      try {
         const res = await fetch(`${base}/${path}.json`, {
            headers: { Accept: 'text/event-stream' },
            signal,
         });
         if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
         const decoder = new TextDecoder();
         let buffer = '';
         for await (const chunk of res.body) {
            buffer += decoder.decode(chunk as Uint8Array, { stream: true });
            let end = buffer.indexOf('\n\n');
            while (end >= 0) {
               const block = buffer.slice(0, end);
               buffer = buffer.slice(end + 2);
               end = buffer.indexOf('\n\n');
               let event = '';
               let data = '';
               for (const line of block.split('\n')) {
                  if (line.startsWith('event:'))
                     event = line.slice(6).trim();
                  else if (line.startsWith('data:'))
                     data += line.slice(5).trim();
               }
               if (event === 'keep-alive') continue;
               let parsed: unknown = data;
               try {
                  parsed = JSON.parse(data);
               } catch {}
               write({ kind: 'event', path, event, data: parsed });
            }
         }
         throw new Error('stream ended');
      } catch (error) {
         if (signal.aborted) return;
         write({ kind: 'error', path, data: String(error) });
         await Bun.sleep(5000);
      }
   }
}

async function snapshots(signal: AbortSignal) {
   while (!signal.aborted) {
      for (const path of paths) {
         try {
            const res = await fetch(`${base}/${path}.json`, { signal });
            write({ kind: 'snapshot', path, data: await res.json() });
         } catch (error) {
            if (!signal.aborted)
               write({ kind: 'error', path, data: String(error) });
         }
      }
      await Bun.sleep(snapshotMs);
   }
}

const controller = new AbortController();
process.on('SIGINT', () => controller.abort());
process.on('SIGTERM', () => controller.abort());
setTimeout(() => controller.abort(), deadline - Date.now());
console.log(`Recording ${paths.join(', ')} from ${base} to ${out}`);
await Promise.all([
   ...paths.map((p) => stream(p, controller.signal)),
   snapshots(controller.signal),
]);
console.log('Done.');
process.exit(0);
