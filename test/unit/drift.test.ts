/**
 * The feed drift check (scripts/check-drift.ts): shape diffing, coverage
 * of every public function, and agreement between the drift baseline and
 * the type-checked fixtures.
 */
import { describe, expect, test } from 'bun:test';
import * as api from '#/api/index.ts';
import { splitRoster } from '#/api/teams.ts';
import baseline from '../../scripts/drift/baseline.json' with {
   type: 'json',
};
import { checks } from '../../scripts/drift/checks.ts';
import { diffShapes, shapeOf } from '../../scripts/drift/shape.ts';
import clock from '../fixtures/gc-clock.ts';
import summary from '../fixtures/gc-gamesummary.ts';
import preview from '../fixtures/gc-preview.ts';
import ticker from '../fixtures/gc-pxp.ts';
import pxp from '../fixtures/gc-pxpverbose.ts';
import brackets from '../fixtures/modulekit-brackets.ts';
import combinedGoalies from '../fixtures/modulekit-combinedplayers-goalies.ts';
import combinedSkaters from '../fixtures/modulekit-combinedplayers-skaters.ts';
import gamesByDate from '../fixtures/modulekit-gamesbydate.ts';
import gamesPerDay from '../fixtures/modulekit-gamesperday.ts';
import goalieGameByGame from '../fixtures/modulekit-goalie-gamebygame.ts';
import goalieSeason from '../fixtures/modulekit-goalie-seasonstats.ts';
import gameByGame from '../fixtures/modulekit-player-gamebygame.ts';
import media from '../fixtures/modulekit-player-media.ts';
import recent from '../fixtures/modulekit-player-mostrecentseasonstats.ts';
import profile from '../fixtures/modulekit-player-profile.ts';
import playerSeason from '../fixtures/modulekit-player-seasonstats.ts';
import roster from '../fixtures/modulekit-roster.ts';
import schedule from '../fixtures/modulekit-schedule.ts';
import search from '../fixtures/modulekit-searchplayers.ts';
import seasons from '../fixtures/modulekit-seasons.ts';
import standingsConference from '../fixtures/modulekit-standings-conference.ts';
import standingsDivision from '../fixtures/modulekit-standings-division.ts';
import streaks from '../fixtures/modulekit-streaks.ts';
import teamGoalies from '../fixtures/modulekit-team-goalies.ts';
import teamSkaters from '../fixtures/modulekit-team-skaters.ts';
import teams from '../fixtures/modulekit-teamsbyseason.ts';
import topGoalies from '../fixtures/modulekit-topgoalies.ts';
import topScorers from '../fixtures/modulekit-topscorers.ts';
import transactions from '../fixtures/modulekit-transactions.ts';
import bootstrap from '../fixtures/statview-bootstrap.ts';
import boxScore from '../fixtures/statview-gamesummary.ts';
import goaliePage from '../fixtures/statview-goalie.ts';
import leaders from '../fixtures/statview-leaders.ts';
import events from '../fixtures/statview-playbyplay.ts';
import playerPage from '../fixtures/statview-player.ts';
import goalies from '../fixtures/statview-players-goalies-standard.ts';
import skatersExpanded from '../fixtures/statview-players-skaters-expanded.ts';
import skaters from '../fixtures/statview-players-skaters-standard.ts';
import matchup from '../fixtures/statview-preview.ts';
import standingsHome from '../fixtures/statview-standings-home.ts';
import standingsOverall from '../fixtures/statview-standings-overall.ts';
import standingsSpecial from '../fixtures/statview-standings-special.ts';

describe('shapeOf', () => {
   test('merges array items and id-keyed entries', () => {
      expect(
         shapeOf({
            games: [{ id: '1' }, { id: '2', note: null }],
            teams: { 3: { name: 'A' }, 4: { name: 'B' } },
         }),
      ).toEqual({
         $: 'object',
         '$.games': 'array',
         '$.games[]': 'object',
         '$.games[].id': 'string',
         '$.games[].note': 'null',
         '$.teams': 'object',
         '$.teams.{id}': 'object',
         '$.teams.{id}.name': 'string',
      });
   });

   test('records every kind seen at a path', () => {
      expect(shapeOf([1, 'a', 2])['$[]']).toBe('number|string');
   });
});

describe('diffShapes', () => {
   const base = shapeOf({ list: [{ a: '1', b: '2' }], meta: { c: 1 } });

   test('no changes for the same structure with other data', () => {
      const live = shapeOf({
         list: [{ a: 'x', b: 'y' }, { a: 'z' }],
         meta: { c: 9 },
      });
      expect(diffShapes(base, live)).toEqual([]);
   });

   test('reports an added field once, at its top', () => {
      const live = shapeOf({
         list: [{ a: '1', b: '2', extra: { deep: 1 } }],
         meta: { c: 1 },
      });
      expect(diffShapes(base, live)).toEqual([
         { kind: 'added', path: '$.list[].extra', live: 'object' },
      ]);
   });

   test('reports a removed field when its parent is present', () => {
      const live = shapeOf({ list: [{ a: '1' }], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([
         { kind: 'removed', path: '$.list[].b', baseline: 'string' },
      ]);
   });

   test('an empty list removes nothing', () => {
      const live = shapeOf({ list: [], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([]);
   });

   test('reports a changed kind, but tolerates null', () => {
      const live = shapeOf({ list: [{ a: 1, b: null }], meta: { c: 1 } });
      expect(diffShapes(base, live)).toEqual([
         {
            kind: 'changed',
            path: '$.list[].a',
            baseline: 'string',
            live: 'number',
         },
      ]);
   });

   test('children of a retyped field are part of that change', () => {
      const live = shapeOf({ list: [{ a: '1', b: '2' }], meta: [1] });
      expect(diffShapes(base, live).map((c) => c.path)).toEqual(['$.meta']);
   });
});

describe('drift checks', () => {
   const names = checks.map((c) => c.name);

   test('cover every public function', () => {
      const helpers = new Set(['teams.splitRoster']);
      const functions = Object.entries(api).flatMap(([ns, mod]) =>
         Object.keys(mod).map((fn) => `${ns}.${fn}`),
      );
      const covered = new Set(names.map((n) => n.split(' ')[0]));
      const missing = functions.filter(
         (f) => !helpers.has(f) && !covered.has(f),
      );
      expect(missing).toEqual([]);
   });

   test('have unique names', () => {
      expect(new Set(names).size).toBe(names.length);
   });

   test('each data check has a baseline', () => {
      const shapes: Record<string, unknown> = baseline;
      const missing = checks
         .filter((c) => !c.expectError && !shapes[c.name])
         .map((c) => c.name);
      expect(missing).toEqual([]);
   });
});

/**
 * The fixtures are checked against the response types by tsc, so a
 * baseline that agrees with them means the types were reviewed against
 * the same feed shape. Fixtures are trimmed, so only fields they have
 * and the baseline lacks (or retypes) count.
 */
/** Rows of a statviewfeed table, flattened as the library returns them */
const entries = (
   table: readonly {
      sections: readonly { title: string; data: readonly object[] }[];
   }[],
) => table[0]?.sections.flatMap((s) => s.data) ?? [];

/** Standings tables as `standings.table` returns them */
const standingsEntries = (
   table: readonly {
      sections: readonly {
         title: string;
         data: readonly { row: unknown; prop: unknown }[];
      }[];
   }[],
) =>
   table[0]?.sections.flatMap((s) =>
      s.data.map((d) => ({ row: d.row, prop: d.prop, group: s.title })),
   ) ?? [];

/** Standings without the heading rows, as `standings.season` returns them */
const standingsTeams = (rows: readonly object[]) =>
   rows.filter((r) => 'team_id' in r);

describe('baseline agrees with the fixtures', () => {
   const shapes: Record<string, Record<string, string>> = baseline;
   const fixtures: Record<string, unknown> = {
      'seasons.list': seasons.SiteKit.Seasons,
      'seasons.bootstrap': bootstrap,
      'schedule.season': schedule.SiteKit.Schedule,
      'schedule.day': gamesByDate.SiteKit.Gamesbydate,
      'schedule.gameDays': gamesPerDay.SiteKit.Gamesperday,
      'teams.bySeason': teams.SiteKit.Teamsbyseason,
      'teams.roster': splitRoster([...roster.SiteKit.Roster]),
      'teams.skaterStats': teamSkaters.SiteKit.Statviewtype,
      'teams.goalieStats': teamGoalies.SiteKit.Statviewtype,
      'players.profile': profile.SiteKit.Player,
      'players.seasonStats': playerSeason.SiteKit.Player,
      'players.seasonStats (goalie)': goalieSeason.SiteKit.Player,
      'players.gameByGame': gameByGame.SiteKit.Player,
      'players.gameByGame (goalie)': goalieGameByGame.SiteKit.Player,
      'players.media': media.SiteKit.Player,
      'players.recentStats': recent.SiteKit.Player,
      'players.search': search.SiteKit.Searchplayers,
      'players.page': playerPage,
      'players.page (goalie)': goaliePage,
      'players.transactions': transactions.SiteKit.Statviewtype,
      'stats.skaters': entries(skaters),
      'stats.skaters (expanded)': entries(skatersExpanded),
      'stats.goalies': entries(goalies),
      'stats.topScorers': topScorers.SiteKit.Statviewtype,
      'stats.topGoalies': topGoalies.SiteKit.Statviewtype,
      'stats.leaders': leaders,
      'stats.skaterCategoryLeaders':
         combinedSkaters.SiteKit.Combinedplayers,
      'stats.goalieCategoryLeaders':
         combinedGoalies.SiteKit.Combinedplayers,
      'stats.streaks': streaks.SiteKit.Statviewtype,
      'standings.season': standingsTeams(
         standingsConference.SiteKit.Statviewtype,
      ),
      'standings.season (division)': standingsTeams(
         standingsDivision.SiteKit.Statviewtype,
      ),
      'standings.table': standingsEntries(standingsOverall),
      'standings.table (home)': standingsEntries(standingsHome),
      'standings.specialTeams': standingsEntries(standingsSpecial),
      'playoffs.bracket': brackets.SiteKit.Brackets,
      'games.summary': summary.GC.Gamesummary,
      'games.playByPlay': pxp.GC.Pxpverbose,
      'games.clock': clock.GC.Clock,
      'games.preview': preview.GC.Preview,
      'games.ticker': ticker.GC.Pxp,
      'games.boxScore': boxScore,
      'games.events': events,
      'games.matchup': matchup,
   };

   for (const [name, data] of Object.entries(fixtures)) {
      test(name, () => {
         const changes = diffShapes(
            shapes[name] ?? {},
            shapeOf(data),
         ).filter((c) => c.kind !== 'removed');
         expect(changes).toEqual([]);
      });
   }
});
