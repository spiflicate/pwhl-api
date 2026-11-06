/**
 * The live-game drift check (scripts/check-drift-live.ts) and the game
 * status value check shared with `bun run drift`.
 */
import { describe, expect, test } from 'bun:test';
import { LIVE_CHECKS } from '../../scripts/check-drift-live.ts';
import baseline from '../../scripts/drift/baseline.json' with {
   type: 'json',
};
import { checks } from '../../scripts/drift/checks.ts';
import {
   describeTransition,
   hasStarted,
   LiveRun,
   LOCATORS,
   liveOnly,
   liveReport,
   selectGames,
   withLive,
} from '../../scripts/drift/live.ts';
import liveBaseline from '../../scripts/drift/live-baseline.json' with {
   type: 'json',
};
import { mergeShapes, shapeOf } from '../../scripts/drift/shape.ts';
import {
   STATUS_PATHS,
   unknownValuesFor,
   valuesAt,
} from '../../scripts/drift/values.ts';

const day = [
   {
      id: '360',
      status: '1',
      period: '1',
      game_clock: '00:00:00',
      intermission: '0',
      visiting_team_code: 'DET',
      home_team_code: 'OTT',
   },
   {
      id: '361',
      status: '4',
      visiting_team_code: 'TOR',
      home_team_code: 'HAM',
   },
];
const OTT = { id: 360, label: 'DET@OTT' };
const at = (s: number) => new Date(Date.UTC(2026, 10, 24, 0, 0, s));

describe('selectGames', () => {
   test('watches every game that is not final by default', () => {
      expect(selectGames(day)).toEqual([OTT]);
   });

   test('watches the games asked for', () => {
      expect(selectGames(day, [361, 999])).toEqual([
         { id: 361, label: 'TOR@HAM' },
         { id: 999, label: '999' },
      ]);
   });

   test('copes with a response that is not a list', () => {
      expect(selectGames(null)).toEqual([]);
   });
});

describe('LOCATORS', () => {
   test('read each endpoint’s status, period and clock', () => {
      expect(LOCATORS['schedule.day']?.(day, 360)).toEqual({
         status: '1',
         moment: 'P1 00:00:00',
      });
      expect(
         LOCATORS['schedule.scorebar']?.(
            [
               {
                  ID: '360',
                  GameStatus: '2',
                  PeriodNameShort: '2',
                  GameClock: '12:10',
                  Intermission: '1',
               },
            ],
            360,
         ),
      ).toEqual({ status: '2', moment: 'P2 INT 12:10' });
      expect(
         LOCATORS['games.summary']?.(
            { meta: { status: '3', period: '3', game_clock: '00:00:00' } },
            360,
         ),
      ).toEqual({ status: '3', moment: 'P3 00:00:00' });
      expect(
         LOCATORS['games.boxScore']?.(
            { details: { status: 'Final SO' } },
            1,
         ),
      ).toEqual({ status: 'Final SO' });
      expect(LOCATORS['schedule.day']?.(day, 42)).toBeUndefined();
   });
});

test('hasStarted', () => {
   expect(['1', '2', '3', '4'].filter(hasStarted)).toEqual(['2', '3', '4']);
   expect(hasStarted(undefined)).toBeFalse();
});

describe('LiveRun', () => {
   const base = {
      'games.clock': shapeOf({ status: '4', period: '4', venue: 'x' }),
   };

   test('records status changes and the furthest status', () => {
      const run = new LiveRun([OTT], base, at(0));
      run.observe('games.clock', { status: '2', period: '3' }, at(1), OTT);
      expect(
         run.observe(
            'games.clock',
            { status: '3', period: '3' },
            at(2),
            OTT,
         ),
      ).toEqual([OTT]);
      run.observe('schedule.day', [{ ...day[0], status: '2' }], at(3));
      expect(run.latest.get(360)).toBe('3');
      expect(describeTransition(run.transitions[1] as never)).toBe(
         '00:00:02 360 DET@OTT [games.clock] 2 -> 3  (P3)',
      );
   });

   test('reports added fields and unknown statuses, notes missing ones', () => {
      const run = new LiveRun([OTT], base);
      run.observe(
         'games.clock',
         { status: '5', period: '2', power_play: '1' },
         at(1),
         OTT,
      );
      expect([...run.findings.values()].map((f) => f.text).sort()).toEqual([
         'added `$.power_play` (string)',
         'unknown game status `5` at `$.status`',
      ]);
      expect(
         run
            .unseen()
            .get('games.clock')
            ?.map((c) => c.path),
      ).toEqual(['$.venue']);
      expect(run.unknownValues).toHaveLength(1);
   });

   test('counts only errors a later poll cannot fix as failing', () => {
      const run = new LiveRun([OTT], base);
      run.fail('games.events', 'NotFoundError: 404', true, at(1));
      expect(run.failing()).toBe(0);
      run.fail('games.events', 'ParseError: bad', false, at(2));
      expect(run.failing()).toBe(1);
   });

   test('merges live shapes into the baseline for --update', () => {
      const run = new LiveRun([OTT], base);
      run.observe('games.clock', { status: '2', extra: 1 }, at(1), OTT);
      expect(run.updatedBaseline()['games.clock']).toEqual({
         $: 'object',
         '$.extra': 'number',
         '$.period': 'string',
         '$.status': 'string',
         '$.venue': 'string',
      });
   });
});

test('liveReport shows coverage and the timeline', () => {
   const run = new LiveRun([OTT], {}, new Date('2026-11-24T00:00:00Z'));
   run.ticks = 1;
   run.observe(
      'games.boxScore',
      { details: { status: 'Final' } },
      new Date('2026-11-24T00:00:05Z'),
      OTT,
   );
   const text = liveReport(run, new Date('2026-11-24T00:01:00Z'), {
      date: '2026-11-23',
   });
   expect(text).toContain(
      'Watched 1 game from 00:00:00 to 00:01:00 UTC, games of 2026-11-23: 1 polls, 1 requests.',
   );
   expect(text).toContain(
      '| `games.boxScore` | 1 | 0 |  |  |  |  | Final |',
   );
   expect(text).toContain('- no baseline for this check');
});

describe('status values', () => {
   test('valuesAt follows shape paths', () => {
      expect(
         valuesAt(
            { rounds: [{ m: [{ s: '1' }, { s: '2' }] }] },
            '$.rounds[].m[].s',
         ),
      ).toEqual(['1', '2']);
      expect(valuesAt([{ a: 1 }], '$[].a')).toEqual([1]);
   });

   test('flags codes outside GameStatus only at status paths', () => {
      expect(
         unknownValuesFor('games.summary', {
            meta: { status: '9' },
            home_team_lineup: { players: [{ status: 'A' }] },
         }),
      ).toEqual([{ kind: 'status', path: '$.meta.status', value: '9' }]);
      expect(unknownValuesFor('games.clock', { status: '4' })).toEqual([]);
   });

   test('every status path is in the baseline', () => {
      const b = baseline as Record<string, Record<string, string>>;
      for (const [check, paths] of Object.entries(STATUS_PATHS)) {
         for (const path of paths) expect(b[check]?.[path]).toBe('string');
      }
   });
});

test('mergeShapes keeps every kind', () => {
   expect(mergeShapes({ $: 'object' }, { $: 'array' })).toEqual({
      $: 'array|object',
   });
});

test('every live endpoint has a daily check and a baseline', () => {
   const names = new Set(checks.map((c) => c.name));
   for (const name of LIVE_CHECKS) {
      expect(names.has(name)).toBeTrue();
      expect(name in baseline).toBeTrue();
   }
});

describe('live baseline', () => {
   const daily = {
      'games.clock': { $: 'object', '$.a': 'string', '$.b': 'number' },
   };
   const merged = {
      'games.clock': {
         $: 'object',
         '$.a': 'string',
         '$.b': 'number|string',
         '$.power_play': 'string',
      },
   };

   test('liveOnly keeps what the daily baseline lacks', () => {
      expect(liveOnly(daily, merged)).toEqual({
         'games.clock': {
            '$.b': 'number|string',
            '$.power_play': 'string',
         },
      });
      expect(liveOnly(daily, daily)).toEqual({});
   });

   test('withLive restores the merged shapes', () => {
      expect(withLive(daily, liveOnly(daily, merged))).toEqual(merged);
   });

   test('only names checks that are polled live', () => {
      for (const check of Object.keys(liveBaseline)) {
         expect(LIVE_CHECKS).toContain(check);
      }
   });
});
