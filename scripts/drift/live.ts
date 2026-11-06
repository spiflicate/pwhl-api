/**
 * Live-game drift: the parts of `bun run drift:live` that don't touch
 * the network, so they can be tested against saved responses.
 *
 * The daily drift check compares finished games, so fields that only
 * exist while a game is on (clock, power plays, intermissions) and the
 * short `UnofficialFinal` status are never seen. The live check polls
 * games in progress, compares every response with the baseline the way
 * a `volatile` check does, and records each endpoint's status changes
 * so gaps in coverage are visible.
 */
import {
   type Change,
   diffShapes,
   mergeShapes,
   type Shape,
   shapeOf,
} from './shape.ts';
import {
   describeValue,
   GAME_STATUSES,
   type UnknownValue,
   unknownValuesFor,
} from './values.ts';

/** `GameStatus` codes in the order a game goes through them */
export const STATUS_ORDER: readonly string[] = [...GAME_STATUSES];

export const STATUS_NAMES: Readonly<Record<string, string>> = {
   '1': 'not started',
   '2': 'in progress',
   '3': 'unofficial final',
   '4': 'final',
};

export interface WatchedGame {
   id: number;
   /** e.g. `TOR@BOS` */
   label: string;
}

/** Where a game stood in one response */
export interface GameStatusSeen {
   /** A `GameStatus` code, or the text a response shows instead */
   status: string;
   /** e.g. `P2 12:10`, `P2 INT` */
   moment?: string;
}

type Row = Record<string, unknown>;
const isRow = (v: unknown): v is Row =>
   v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) =>
   typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;

function moment(
   period: unknown,
   clock: unknown,
   intermission: unknown,
): string | undefined {
   const parts = [
      str(period) && `P${str(period)}`,
      str(intermission) === '1' && 'INT',
      str(clock),
   ].filter(Boolean);
   return parts.length > 0 ? parts.join(' ') : undefined;
}

function seen(
   status: unknown,
   period?: unknown,
   clock?: unknown,
   intermission?: unknown,
): GameStatusSeen | undefined {
   const s = str(status);
   if (!s) return undefined;
   const m = moment(period, clock, intermission);
   return { status: s, ...(m ? { moment: m } : {}) };
}

/** A game's row in a date-scoped list, by `id` / `ID` / `game_id` */
function rowFor(data: unknown, id: number): Row | undefined {
   if (!Array.isArray(data)) return undefined;
   return data.find(
      (r): r is Row =>
         isRow(r) &&
         [r.id, r.ID, r.game_id].some((v) => str(v) === String(id)),
   );
}

/**
 * How each endpoint reports a game's status. Game-scoped endpoints
 * describe their own game; date-scoped ones list several.
 */
export const LOCATORS: Readonly<
   Record<string, (data: unknown, id: number) => GameStatusSeen | undefined>
> = {
   'games.clock': (d) =>
      isRow(d) ? seen(d.status, d.period, d.game_clock) : undefined,
   'games.summary': (d) => {
      const meta = isRow(d) ? d.meta : undefined;
      return isRow(meta)
         ? seen(meta.status, meta.period, meta.game_clock)
         : undefined;
   },
   // Free text, e.g. "Final SO"
   'games.boxScore': (d) => {
      const details = isRow(d) ? d.details : undefined;
      return isRow(details) ? seen(details.status) : undefined;
   },
   'schedule.scorebar': (d, id) => {
      const r = rowFor(d, id);
      return r
         ? seen(
              r.GameStatus,
              r.PeriodNameShort,
              r.GameClock,
              r.Intermission,
           )
         : undefined;
   },
   'schedule.day': (d, id) => {
      const r = rowFor(d, id);
      return r
         ? seen(r.status, r.period, r.game_clock, r.intermission)
         : undefined;
   },
};

/** Date-scoped endpoints: their responses list every game */
export const DATE_SCOPED = new Set(['schedule.scorebar', 'schedule.day']);

/**
 * The games a live run watches, from a `schedule.day` response: the ones
 * listed in `ids`, or else every game that isn't final yet.
 */
export function selectGames(
   day: unknown,
   ids: readonly number[] = [],
): WatchedGame[] {
   const rows = (Array.isArray(day) ? day : []).filter(isRow);
   const label = (r: Row) =>
      `${str(r.visiting_team_code) ?? '?'}@${str(r.home_team_code) ?? '?'}`;
   if (ids.length > 0) {
      return ids.map((id) => {
         const r = rowFor(rows, id);
         return { id, label: r ? label(r) : String(id) };
      });
   }
   return rows
      .filter((r) => str(r.status) !== '4' && str(r.id) !== undefined)
      .map((r) => ({ id: Number(str(r.id)), label: label(r) }));
}

/** Whether a game in this status has started */
export function hasStarted(status: string | undefined): boolean {
   return status === '2' || status === '3' || status === '4';
}

/** One status change of one game, as one endpoint reported it */
export interface Transition {
   at: Date;
   game: WatchedGame;
   endpoint: string;
   from?: string;
   to: string;
   moment?: string;
}

/** A field or value no baseline or type accepts, seen during the run */
export interface LiveFinding {
   check: string;
   text: string;
   count: number;
   firstSeen: Date;
   game?: WatchedGame;
   status?: GameStatusSeen;
}

/** An endpoint call that failed */
export interface LiveError {
   check: string;
   text: string;
   count: number;
   firstSeen: Date;
   /** Network, server, rate-limit and not-found errors */
   transient: boolean;
}

interface Coverage {
   responses: number;
   errors: number;
   statuses: Set<string>;
}

/** Everything a live run has seen */
export class LiveRun {
   readonly startedAt: Date;
   readonly transitions: Transition[] = [];
   readonly findings = new Map<string, LiveFinding>();
   readonly errors = new Map<string, LiveError>();
   readonly coverage = new Map<string, Coverage>();
   readonly shapes = new Map<string, Shape>();
   readonly unknownValues: UnknownValue[] = [];
   /** Furthest `GameStatus` code per game, from any endpoint */
   readonly latest = new Map<number, string>();
   requests = 0;
   ticks = 0;
   private readonly last = new Map<string, string>();

   constructor(
      readonly games: readonly WatchedGame[],
      private readonly baseline: Readonly<Record<string, Shape>>,
      now = new Date(),
   ) {
      this.startedAt = now;
   }

   private cover(check: string): Coverage {
      let c = this.coverage.get(check);
      if (!c) {
         c = { responses: 0, errors: 0, statuses: new Set() };
         this.coverage.set(check, c);
      }
      return c;
   }

   /**
    * Record a successful response. `game` is the game a game-scoped call
    * was for; date-scoped responses are searched for every watched game.
    * Returns the games whose status changed.
    */
   observe(
      check: string,
      data: unknown,
      at: Date,
      game?: WatchedGame,
   ): WatchedGame[] {
      this.requests++;
      const coverage = this.cover(check);
      coverage.responses++;
      const locate = LOCATORS[check];

      const changed: WatchedGame[] = [];
      let first: { game: WatchedGame; status: GameStatusSeen } | undefined;
      for (const g of game ? [game] : this.games) {
         const status = locate?.(data, g.id);
         if (!status) continue;
         first ??= { game: g, status };
         coverage.statuses.add(status.status);
         const key = `${g.id}|${check}`;
         const from = this.last.get(key);
         if (from !== status.status) {
            this.last.set(key, status.status);
            this.transitions.push({
               at,
               game: g,
               endpoint: check,
               ...(from ? { from } : {}),
               to: status.status,
               ...(status.moment ? { moment: status.moment } : {}),
            });
            if (from !== undefined) changed.push(g);
         }
         const rank = STATUS_ORDER.indexOf(status.status);
         const before = this.latest.get(g.id);
         if (
            rank >= 0 &&
            (before === undefined || rank > STATUS_ORDER.indexOf(before))
         ) {
            this.latest.set(g.id, status.status);
         }
      }

      const shape = shapeOf(data);
      const merged = this.shapes.get(check);
      this.shapes.set(check, merged ? mergeShapes(merged, shape) : shape);

      const expected = this.baseline[check];
      const texts = expected
         ? diffShapes(expected, shape)
              .filter((c) => c.kind !== 'removed')
              .map(describeChange)
         : ['no baseline for this check'];
      for (const v of unknownValuesFor(check, data)) {
         texts.push(describeValue(v));
         if (
            !this.unknownValues.some(
               (u) => u.path === v.path && u.value === v.value,
            )
         ) {
            this.unknownValues.push(v);
         }
      }
      for (const text of texts) {
         const key = `${check}|${text}`;
         const prior = this.findings.get(key);
         if (prior) {
            prior.count++;
            continue;
         }
         const g = game ?? first?.game;
         this.findings.set(key, {
            check,
            text,
            count: 1,
            firstSeen: at,
            ...(g ? { game: g } : {}),
            ...(first ? { status: first.status } : {}),
         });
      }
      return changed;
   }

   /** Record a failed call */
   fail(check: string, text: string, transient: boolean, at: Date): void {
      this.requests++;
      this.cover(check).errors++;
      const key = `${check}|${text}`;
      const prior = this.errors.get(key);
      if (prior) prior.count++;
      else {
         this.errors.set(key, {
            check,
            text,
            count: 1,
            firstSeen: at,
            transient,
         });
      }
   }

   /** Baseline paths no live response showed, per endpoint */
   unseen(): Map<string, Change[]> {
      const out = new Map<string, Change[]>();
      for (const [check, shape] of this.shapes) {
         const expected = this.baseline[check];
         if (!expected) continue;
         const removed = diffShapes(expected, shape).filter(
            (c) => c.kind === 'removed',
         );
         if (removed.length > 0) out.set(check, removed);
      }
      return out;
   }

   /** Findings that fail the run: shape and status drift, hard errors */
   failing(): number {
      return (
         this.findings.size +
         [...this.errors.values()].filter((e) => !e.transient).length
      );
   }

   /** The baseline with every live shape merged in, for `--update` */
   updatedBaseline(): Record<string, Shape> {
      const next = { ...this.baseline };
      for (const [check, shape] of this.shapes) {
         const before = next[check];
         next[check] = before ? mergeShapes(before, shape) : shape;
      }
      return next;
   }
}

export function describeChange(c: Change): string {
   switch (c.kind) {
      case 'added':
         return `added \`${c.path}\` (${c.live})`;
      case 'removed':
         return `removed \`${c.path}\` (was ${c.baseline})`;
      case 'changed':
         return `changed \`${c.path}\`: ${c.baseline} → ${c.live}`;
   }
}

const time = (d: Date) => d.toISOString().slice(11, 19);

function where(game?: WatchedGame, status?: GameStatusSeen): string {
   if (!game) return '';
   const s = status
      ? ` status ${status.status}${status.moment ? ` ${status.moment}` : ''}`
      : '';
   return ` in ${game.id} ${game.label}${s}`;
}

/** One line of the status timeline */
export function describeTransition(t: Transition): string {
   const change = `${t.from ?? '…'} -> ${t.to}`;
   return `${time(t.at)} ${t.game.id} ${t.game.label.padEnd(7)} [${t.endpoint}] ${change}${t.moment ? `  (${t.moment})` : ''}`;
}

/** The Markdown report of a live run */
export function liveReport(
   run: LiveRun,
   endedAt: Date,
   options: { updated?: boolean; stopReason?: string; date?: string } = {},
): string {
   const failing = run.failing();
   const header = STATUS_ORDER.map((s) => `${s} ${STATUS_NAMES[s]}`);
   const lines = [
      '# PWHL live drift check',
      '',
      `Watched ${run.games.length} game${run.games.length === 1 ? '' : 's'} from ${time(run.startedAt)} to ${time(endedAt)} UTC${options.date ? `, games of ${options.date}` : ''}: ${run.ticks} polls, ${run.requests} requests.` +
         (options.stopReason ? ` Stopped: ${options.stopReason}.` : ''),
      '',
      options.updated
         ? 'Baseline updated with every live shape.'
         : failing === 0
           ? 'Every live response matches the baseline.'
           : `${failing} finding${failing === 1 ? '' : 's'}.`,
      '',
      '## Games',
      '',
      '| Game | Matchup | Furthest status |',
      '| --- | --- | --- |',
      ...run.games.map((g) => {
         const s = run.latest.get(g.id);
         return `| ${g.id} | ${g.label} | ${s ? `${s} ${STATUS_NAMES[s]}` : 'not seen'} |`;
      }),
      '',
      '## Coverage',
      '',
      'Game statuses each endpoint was seen in. A status an endpoint never showed is a gap in what this run compared.',
      '',
      `| Endpoint | Responses | Errors | ${header.join(' | ')} | Other |`,
      `| --- | --- | --- | ${header.map(() => '---').join(' | ')} | --- |`,
      ...[...run.coverage.entries()].map(([check, c]) => {
         const other = [...c.statuses].filter(
            (s) => !STATUS_ORDER.includes(s),
         );
         return `| \`${check}\` | ${c.responses} | ${c.errors} | ${STATUS_ORDER.map((s) => (c.statuses.has(s) ? '✅' : '')).join(' | ')} | ${other.join(', ')} |`;
      }),
   ];

   const byCheck = new Map<string, LiveFinding[]>();
   for (const f of run.findings.values()) {
      byCheck.set(f.check, [...(byCheck.get(f.check) ?? []), f]);
   }
   if (byCheck.size > 0) {
      lines.push('', '## Findings');
      for (const [check, findings] of byCheck) {
         lines.push('', `### \`${check}\``, '');
         for (const f of findings) {
            lines.push(
               `- ${f.text}: first seen ${time(f.firstSeen)}${where(f.game, f.status)}, ${f.count} response${f.count === 1 ? '' : 's'}`,
            );
         }
      }
   }

   if (run.errors.size > 0) {
      lines.push('', '## Errors', '');
      for (const e of run.errors.values()) {
         lines.push(
            `- \`${e.check}\`: ${e.text} (${e.count}×, first ${time(e.firstSeen)}${e.transient ? ', retried on later polls' : ''})`,
         );
      }
   }

   if (run.transitions.length > 0) {
      lines.push(
         '',
         '## Status timeline',
         '',
         '```text',
         ...run.transitions.map(describeTransition),
         '```',
      );
   }

   const unseen = run.unseen();
   if (unseen.size > 0) {
      lines.push(
         '',
         '<details>',
         '<summary>Baseline fields no live response showed (normal: the baseline is a finished game)</summary>',
         '',
      );
      for (const [check, changes] of unseen) {
         lines.push(
            `- \`${check}\`: ${changes.map((c) => `\`${c.path}\``).join(', ')}`,
         );
      }
      lines.push('', '</details>');
   }

   if (failing > 0 && !options.updated) {
      lines.push(
         '',
         '## Next steps',
         '',
         '- **added / changed**: check the types in `src/types/` cover the field (live-only fields are optional), then accept the live shapes with `bun run drift:live --update` during a game, or add the paths to `scripts/drift/baseline.json` by hand.',
         '- **unknown game status**: widen `GameStatus` and the list in `scripts/drift/values.ts`; `--update` won’t accept it.',
         '- **errors**: a call that fails only while a game is live may need different handling in the client.',
      );
   }
   return `${lines.join('\n')}\n`;
}
