/**
 * Poll games in progress and compare every response with the drift
 * baseline, recording each endpoint's game status changes.
 *
 *    bun scripts/check-drift-live.ts                  # today's games
 *    bun scripts/check-drift-live.ts --game 353       # (repeatable)
 *    bun scripts/check-drift-live.ts --report live.md --max-min 240
 *    bun scripts/check-drift-live.ts --update         # accept live shapes
 *
 * Options:
 *    --game <id>        watch this game; default: every game on the date
 *                       that isn't final (games that haven't started are
 *                       watched from the scorebar until they do)
 *    --date <date>      YYYY-MM-DD to read games from (default: today in
 *                       Toronto)
 *    --interval <s>     seconds between polls (default 10)
 *    --slow-every <n>   poll the heavier endpoints every n polls per game
 *                       (default 6), staggered across games
 *    --max-min <n>      stop after n minutes (default 300)
 *    --report <path>    write the Markdown report there, and keep it
 *                       current while running
 *    --samples <dir>    save each response that brings a new finding
 *    --update           merge every live shape into the baseline
 *
 * Every poll calls the scorebar and each started game's clock. The other
 * game endpoints and `schedule.day` run on the slow cadence, and right
 * after a game's status changes. Stops when every watched game is final
 * (after one last full poll of each), after --max-min, or on Ctrl-C.
 *
 * Fails when a response has a field the baseline lacks, a field of a new
 * type, or a game status `GameStatus` doesn't declare, or a call fails
 * in a way a later poll can't fix. Missing fields are fine: the baseline
 * is a finished game.
 */
import {
   appendFileSync,
   mkdirSync,
   readFileSync,
   writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { games as g, schedule } from '#/api/index.ts';
import type { APIResult } from '#/client/types.ts';
import { configure } from '#/config/index.ts';
import { ErrorCategory, PWHLError } from '#/errors/index.ts';
import { BASELINE_PATH } from './check-drift.ts';
import {
   describeTransition,
   hasStarted,
   LiveRun,
   liveReport,
   selectGames,
   type WatchedGame,
} from './drift/live.ts';
import type { Shape } from './drift/shape.ts';

const TRANSIENT = new Set<string>([
   ErrorCategory.NETWORK,
   ErrorCategory.SERVER,
   ErrorCategory.RATE_LIMIT,
]);

type Call = () => Promise<APIResult<unknown>>;

interface GameEndpoint {
   name: string;
   run: (id: number) => Promise<APIResult<unknown>>;
}

/** Polled every time, so the short unofficial-final status is caught */
const FAST: GameEndpoint[] = [
   { name: 'games.clock', run: (id) => g.clock(id) },
];

/** Polled on the slow cadence and after a status change */
const SLOW: GameEndpoint[] = [
   { name: 'games.summary', run: (id) => g.summary(id) },
   { name: 'games.playByPlay', run: (id) => g.playByPlay(id) },
   { name: 'games.ticker', run: (id) => g.ticker(id) },
   { name: 'games.boxScore', run: (id) => g.boxScore(id) },
   { name: 'games.events', run: (id) => g.events(id) },
   { name: 'games.matchup', run: (id) => g.matchup(id) },
   { name: 'games.preview', run: (id) => g.preview(id) },
];

const SCOREBAR = () => schedule.scorebar({ daysBack: 1, daysAhead: 1 });

/** Every live endpoint name, for the coverage test */
export const LIVE_CHECKS: readonly string[] = [
   'schedule.scorebar',
   'schedule.day',
   ...FAST.map((e) => e.name),
   ...SLOW.map((e) => e.name),
];

function option(args: string[], name: string): string | undefined {
   const at = args.indexOf(name);
   return at >= 0 ? args[at + 1] : undefined;
}

function number(args: string[], name: string, fallback: number): number {
   const value = option(args, name);
   if (value === undefined) return fallback;
   const n = Number(value);
   if (!Number.isFinite(n) || n <= 0) {
      throw new Error(`${name} needs a positive number, got ${value}`);
   }
   return n;
}

/** Today's date in the league's main time zone */
function today(): string {
   return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Toronto',
   });
}

async function attempt(run: Call): Promise<APIResult<unknown>> {
   try {
      return await run();
   } catch (error) {
      return {
         success: false,
         error:
            error instanceof PWHLError
               ? error
               : new PWHLError(String(error), ErrorCategory.NETWORK),
      };
   }
}

async function main() {
   const args = process.argv.slice(2);
   const ids = args.flatMap((a, i) =>
      args[i - 1] === '--game' ? [Number(a)] : [],
   );
   const date = option(args, '--date') ?? today();
   const interval = number(args, '--interval', 10) * 1000;
   const slowEvery = Math.round(number(args, '--slow-every', 6));
   const maxMs = number(args, '--max-min', 300) * 60_000;
   const reportPath = option(args, '--report');
   const samples = option(args, '--samples');
   const update = args.includes('--update');
   if (samples) mkdirSync(samples, { recursive: true });

   configure({ logLevel: 'silent', timeout: 15_000 });
   const baseline: Record<string, Shape> = JSON.parse(
      readFileSync(BASELINE_PATH, 'utf8'),
   );

   const first = await schedule.day(date);
   if (!first.success) {
      console.error(`schedule.day(${date}) failed: ${first.error.message}`);
      process.exit(1);
   }
   const watched = selectGames(first.data, ids);
   if (watched.length === 0) {
      console.log(`No games to watch on ${date}.`);
      return;
   }
   const run = new LiveRun(watched, baseline);
   console.log(
      `Watching ${watched.length} games on ${date}: ${watched.map((w) => `${w.id} ${w.label}`).join(', ')}`,
   );

   let printed = 0;
   let found = 0;
   const call = async (
      name: string,
      fn: Call,
      game?: WatchedGame,
   ): Promise<WatchedGame[]> => {
      const result = await attempt(fn);
      const at = new Date();
      if (!result.success) {
         run.fail(
            name,
            `${result.error.name}: ${result.error.message}`,
            TRANSIENT.has(result.error.category) ||
               result.error.name === 'NotFoundError',
            at,
         );
         return [];
      }
      const changed = run.observe(name, result.data, at, game);
      for (const t of run.transitions.slice(printed)) {
         console.log(describeTransition(t));
      }
      printed = run.transitions.length;
      if (run.findings.size > found) {
         for (const f of [...run.findings.values()].slice(found)) {
            console.log(`  ❌ ${f.check}: ${f.text}`);
         }
         found = run.findings.size;
         if (samples) {
            const stamp = at.toISOString().replace(/[-:.]/g, '');
            writeFileSync(
               join(samples, `${name}-${game?.id ?? 'date'}-${stamp}.json`),
               JSON.stringify(result.data, null, 1),
            );
         }
      }
      return changed;
   };

   const deadline = run.startedAt.getTime() + maxMs;
   let burst = new Set<number>();
   /** Games polled once more after going final */
   const finished = new Set<number>();
   let stopReason = 'time limit reached';
   let stopping = false;
   process.on('SIGINT', () => {
      stopReason = 'interrupted';
      stopping = true;
   });
   const write = (reason: string) => {
      const text = liveReport(run, new Date(), {
         updated: update,
         stopReason: reason,
         date,
      });
      if (reportPath) writeFileSync(reportPath, text);
      return text;
   };

   run.observe('schedule.day', first.data, new Date());
   for (const t of run.transitions) console.log(describeTransition(t));
   printed = run.transitions.length;

   for (let tick = 0; !stopping; tick++) {
      run.ticks++;
      const next = new Set<number>();
      const mark = (changed: WatchedGame[]) => {
         for (const c of changed) next.add(c.id);
      };
      mark(await call('schedule.scorebar', SCOREBAR));
      const active = watched.filter(
         (w) => hasStarted(run.latest.get(w.id)) && !finished.has(w.id),
      );
      for (const [i, game] of active.entries()) {
         const final = run.latest.get(game.id) === '4';
         const slow =
            burst.has(game.id) || (tick + i) % slowEvery === 0 || final;
         for (const e of FAST) {
            mark(await call(e.name, () => e.run(game.id), game));
         }
         if (!slow) continue;
         for (const e of SLOW) {
            mark(await call(e.name, () => e.run(game.id), game));
         }
         if (final) finished.add(game.id);
      }
      if (tick % slowEvery === 0 || next.size > 0) {
         mark(await call('schedule.day', () => schedule.day(date)));
      }
      burst = next;
      if (reportPath && tick % slowEvery === 0) write('still running');

      if (watched.every((w) => finished.has(w.id))) {
         stopReason = 'every game is final';
         break;
      }
      if (Date.now() >= deadline) break;
      // Nothing to poll closely until a game starts
      const wait = active.length === 0 ? interval * slowEvery : interval;
      const until = Date.now() + Math.min(wait, deadline - Date.now());
      while (!stopping && Date.now() < until) {
         await Bun.sleep(Math.min(1000, until - Date.now()));
      }
   }

   if (update) {
      if (run.unknownValues.length > 0) {
         write(stopReason);
         console.log(
            '\nNot updating: unknown game statuses need a type change.',
         );
         process.exit(1);
      }
      writeFileSync(
         BASELINE_PATH,
         `${JSON.stringify(run.updatedBaseline(), null, 3)}\n`,
      );
      console.log(`\nWrote ${BASELINE_PATH}`);
   }
   const text = write(stopReason);
   if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
   }
   console.log(
      `\n${run.ticks} polls, ${run.requests} requests, ${run.failing()} findings. Stopped: ${stopReason}.`,
   );
   if (run.failing() > 0 && !update) process.exit(1);
}

if (import.meta.main) await main();
