import { describe, expect, test } from 'bun:test';
import {
   games,
   players,
   playoffs,
   schedule,
   seasons,
   standings,
   stats,
   teams,
} from '#/api/index.ts';
import { ValidationError } from '#/errors/index.ts';
import { gc, jsonp, mockFetch, siteKit } from './helpers.ts';

const fetch = mockFetch();

/** Query params of the most recent request */
const lastQuery = () =>
   Object.fromEntries(
      fetch.calls[fetch.calls.length - 1]?.searchParams ?? [],
   );

describe('seasons', () => {
   test('list', async () => {
      fetch.respond(siteKit('Seasons', [{ season_id: '8' }]));
      const r = await seasons.list();
      expect(r.success).toBeTrue();
      expect(lastQuery()).toMatchObject({
         feed: 'modulekit',
         view: 'seasons',
      });
   });

   test('current reads bootstrap.current_season_id', async () => {
      fetch.respond(jsonp({ current_season_id: '11' }));
      const r = await seasons.current();
      expect(r).toEqual({ success: true, data: 11 });
      expect(lastQuery()).toMatchObject({
         feed: 'statviewfeed',
         view: 'bootstrap',
         season: 'latest',
      });
   });
});

describe('schedule', () => {
   test('season with team', async () => {
      fetch.respond(siteKit('Schedule', []));
      const r = await schedule.season(8, '3');
      expect(r).toEqual({ success: true, data: [] });
      expect(lastQuery()).toMatchObject({
         view: 'schedule',
         season_id: '8',
         team_id: '3',
      });
   });

   test('season without team omits team_id', async () => {
      fetch.respond(siteKit('Schedule', []));
      await schedule.season(8);
      expect(lastQuery()).not.toHaveProperty('team_id');
   });

   test('season rejects a bad id without fetching', async () => {
      const r = await schedule.season(0);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(ValidationError);
      expect(fetch.calls).toHaveLength(0);
   });

   test('scorebar defaults to 3 days each way', async () => {
      fetch.respond(siteKit('Scorebar', []));
      await schedule.scorebar();
      expect(lastQuery()).toMatchObject({
         view: 'scorebar',
         numberofdaysback: '3',
         numberofdaysahead: '3',
      });
   });

   test('scorebar rejects negative days', async () => {
      const r = await schedule.scorebar({ daysBack: -1 });
      expect(r.success).toBeFalse();
   });

   test('day sends fetch_date', async () => {
      fetch.respond(siteKit('Gamesbydate', []));
      await schedule.day('2026-01-10');
      expect(lastQuery()).toMatchObject({
         view: 'gamesbydate',
         fetch_date: '2026-01-10',
      });
   });

   test('day rejects a malformed date', async () => {
      const r = await schedule.day('Jan 10');
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
   });

   test('gameDays sends the range', async () => {
      fetch.respond(siteKit('Gamesperday', []));
      await schedule.gameDays('2026-12-01', '2026-12-31');
      expect(lastQuery()).toMatchObject({
         view: 'gamesperday',
         start_date: '2026-12-01',
         end_date: '2026-12-31',
      });
   });
});

describe('teams', () => {
   test('bySeason', async () => {
      fetch.respond(siteKit('Teamsbyseason', [{ id: '1' }]));
      const r = await teams.bySeason(8);
      expect(r.success).toBeTrue();
      expect(lastQuery()).toMatchObject({
         view: 'teamsbyseason',
         season_id: '8',
      });
   });

   test('roster splits players from staff', async () => {
      fetch.respond(
         siteKit('Roster', [
            { player_id: '21', position: 'F', name: 'Forward' },
            { player_id: '22', position: 'D', name: 'Defender' },
            { player_id: '23', position: 'G', name: 'Goalie' },
            [{ person_id: '900', name: 'Coach', role: 'Head Coach' }],
         ]),
      );
      const r = await teams.roster(3, 8);
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data.players.map((p) => p.player_id)).toEqual([
            '21',
            '22',
            '23',
         ]);
         expect(r.data.staff).toHaveLength(1);
      }
      expect(lastQuery()).toMatchObject({
         view: 'roster',
         team_id: '3',
         season_id: '8',
      });
   });

   test.each([
      ['skaterStats', 'skaters'],
      ['goalieStats', 'goalies'],
   ] as const)('%s uses statviewtype %s', async (fn, type) => {
      fetch.respond(siteKit('Statviewtype', []));
      await teams[fn](3, 8);
      expect(lastQuery()).toMatchObject({
         view: 'statviewtype',
         type,
         team_id: '3',
         season_id: '8',
         league_id: '1',
      });
   });
});

describe('players', () => {
   test('profile', async () => {
      fetch.respond(siteKit('Player', { first_name: 'Marie-Philip' }));
      const r = await players.profile(21);
      expect(r.success).toBeTrue();
      expect(lastQuery()).toMatchObject({
         view: 'player',
         player_id: '21',
         category: 'profile',
      });
      expect(lastQuery()).not.toHaveProperty('season_id');
   });

   test('gameByGame sends the season', async () => {
      fetch.respond(siteKit('Player', { games: [], seasons_played: [] }));
      await players.gameByGame(21, 8);
      expect(lastQuery()).toMatchObject({
         category: 'gamebygame',
         season_id: '8',
      });
   });

   test('seasonStats and media use their categories', async () => {
      fetch.respond(siteKit('Player', {}));
      await players.seasonStats(21);
      expect(lastQuery().category).toBe('seasonstats');
      fetch.respond(siteKit('Player', []));
      await players.media(21);
      expect(lastQuery().category).toBe('media');
   });

   test('unknown player is a not-found error', async () => {
      fetch.respond(
         siteKit('Player', { error: 'no such person/player found' }),
      );
      const r = await players.profile(999999);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error.name).toBe('NotFoundError');
   });

   test('seasonStats turns false into {}', async () => {
      fetch.respond(siteKit('Player', false));
      const r = await players.seasonStats(21);
      expect(r).toEqual({ success: true, data: {} });
   });

   test.each([[''], [[]]])(
      'recentStats turns %p into null',
      async (raw) => {
         fetch.respond(siteKit('Player', raw));
         const r = await players.recentStats(21);
         expect(r).toEqual({ success: true, data: null });
         expect(lastQuery().category).toBe('mostrecentseasonstats');
      },
   );

   test('search trims the term', async () => {
      fetch.respond(siteKit('Searchplayers', []));
      await players.search('  poulin ');
      expect(lastQuery()).toMatchObject({
         view: 'searchplayers',
         search_term: 'poulin',
      });
   });

   test('search rejects a one-letter term', async () => {
      const r = await players.search('p');
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
   });

   test('page of an unknown player is a not-found error', async () => {
      fetch.respond(jsonp([]));
      const r = await players.page(999999, 8);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error.name).toBe('NotFoundError');
      expect(lastQuery()).toMatchObject({
         feed: 'statviewfeed',
         view: 'player',
         player_id: '999999',
         season_id: '8',
      });
   });

   test('transactions pages with first and limit', async () => {
      fetch.respond(
         siteKit('Statviewtype', { transactions: [], num_results: 0 }),
      );
      await players.transactions(10, { first: 20, limit: 20 });
      expect(lastQuery()).toMatchObject({
         type: 'transactions',
         season_id: '10',
         first: '20',
         limit: '20',
      });
   });
});

describe('stats', () => {
   const table = [
      {
         sections: [
            {
               title: '',
               headers: {},
               data: [
                  { row: { name: 'A', rank: 1 }, prop: {} },
                  { row: { name: 'B', rank: 2 }, prop: {} },
               ],
            },
         ],
      },
   ];

   test('skaters flattens rows and sets defaults', async () => {
      fetch.respond(jsonp(table));
      const r = await stats.skaters({ seasonId: 8 });
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data.map((e) => e.row.name)).toEqual(['A', 'B']);
      }
      expect(lastQuery()).toMatchObject({
         feed: 'statviewfeed',
         view: 'players',
         season: '8',
         position: 'skaters',
         team: 'all',
         rookies: '0',
         statsType: 'standard',
         sort: 'points',
         qualified: 'all',
      });
   });

   test('goalies passes options through', async () => {
      fetch.respond(jsonp(table));
      await stats.goalies({
         seasonId: 8,
         teamId: 3,
         qualified: true,
         limit: 5,
      });
      expect(lastQuery()).toMatchObject({
         position: 'goalies',
         team: '3',
         qualified: 'qualified',
         sort: 'gaa',
         limit: '5',
      });
   });

   test('skaters sends statsType expanded', async () => {
      fetch.respond(jsonp(table));
      await stats.skaters({ seasonId: 8, statsType: 'expanded' });
      expect(lastQuery().statsType).toBe('expanded');
   });

   test.each([
      ['topScorers', 'topscorers', 'points'],
      ['topGoalies', 'topgoalies', 'gaa'],
   ] as const)('%s uses statviewtype %s', async (fn, type, sort) => {
      fetch.respond(siteKit('Statviewtype', []));
      await stats[fn](8, { limit: 5 });
      expect(lastQuery()).toMatchObject({
         type,
         season_id: '8',
         sort,
         first: '0',
         limit: '5',
         qualified: 'all',
      });
   });

   test.each([
      ['skaterCategoryLeaders', 'skaters'],
      ['goalieCategoryLeaders', 'goalies'],
   ] as const)('%s uses combinedplayers %s', async (fn, type) => {
      fetch.respond(siteKit('Combinedplayers', {}));
      await stats[fn](8, { qualified: true });
      expect(lastQuery()).toMatchObject({
         view: 'combinedplayers',
         type,
         return_amount: '10',
         qualified: 'qualified',
      });
   });

   test('leaders and streaks', async () => {
      fetch.respond(jsonp({ skaters: {}, goalies: {} }));
      await stats.leaders(8);
      expect(lastQuery()).toMatchObject({
         view: 'leadersExtended',
         season_id: '8',
      });
      fetch.respond(siteKit('Statviewtype', []));
      await stats.streaks(8);
      expect(lastQuery()).toMatchObject({
         type: 'streaks',
         season_id: '8',
      });
   });

   test('rejects an invalid statsType', async () => {
      const r = await stats.skaters({
         seasonId: 8,
         statsType: 'nope' as 'standard',
      });
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
   });
});

describe('standings', () => {
   test('season drops heading rows', async () => {
      fetch.respond(
         siteKit('Statviewtype', [
            { repeatheader: 1, name: 'Team' },
            { label: 'Eastern' },
            { team_id: '3', name: 'x - Montréal' },
         ]),
      );
      const r = await standings.season(8, { groupBy: 'division' });
      expect(r).toEqual({
         success: true,
         data: [{ team_id: '3', name: 'x - Montréal' } as never],
      });
      expect(lastQuery()).toMatchObject({
         type: 'standings',
         stat: 'division',
         season_id: '8',
      });
   });

   test('table flattens sections with their titles', async () => {
      fetch.respond(
         jsonp([
            {
               sections: [
                  {
                     title: 'A',
                     headers: {},
                     data: [{ row: { rank: 1 }, prop: {} }],
                  },
               ],
            },
         ]),
      );
      const r = await standings.table(8, { context: 'home' });
      expect(r.success && r.data[0]?.group).toBe('A');
      expect(lastQuery()).toMatchObject({
         view: 'teams',
         season: '8',
         context: 'home',
         special: 'false',
      });
   });

   test('specialTeams asks for the special table', async () => {
      fetch.respond(jsonp([{ sections: [] }]));
      const r = await standings.specialTeams(8);
      expect(r).toEqual({ success: true, data: [] });
      expect(lastQuery()).toMatchObject({
         special: 'true',
         sort: 'power_play_pct',
      });
   });
});

describe('playoffs', () => {
   test('bracket', async () => {
      fetch.respond(siteKit('Brackets', { teams: {}, rounds: [] }));
      const r = await playoffs.bracket(9);
      expect(r.success).toBeTrue();
      expect(lastQuery()).toMatchObject({
         view: 'brackets',
         season_id: '9',
      });
   });
});

describe('games', () => {
   test.each([
      ['summary', 'gamesummary', 'Gamesummary'],
      ['playByPlay', 'pxpverbose', 'Pxpverbose'],
      ['clock', 'clock', 'Clock'],
      ['preview', 'preview', 'Preview'],
      ['ticker', 'pxp', 'Pxp'],
   ] as const)('%s uses gc tab %s', async (fn, tab, key) => {
      fetch.respond(gc(key, { ok: true }));
      const r = await games[fn](210);
      expect(r).toEqual({ success: true, data: { ok: true } as never });
      expect(lastQuery()).toMatchObject({
         feed: 'gc',
         tab,
         game_id: '210',
      });
   });

   test.each([
      ['boxScore', 'gameSummary'],
      ['events', 'gameCenterPlayByPlay'],
      ['matchup', 'gameCenterPreview'],
   ] as const)('%s uses statviewfeed %s', async (fn, view) => {
      fetch.respond(jsonp({ ok: true }));
      const r = await games[fn](210);
      expect(r).toEqual({ success: true, data: { ok: true } as never });
      expect(lastQuery()).toMatchObject({
         feed: 'statviewfeed',
         view,
         game_id: '210',
      });
   });

   test('rejects a non-numeric game id', async () => {
      const r = await games.summary('abc');
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
   });
});
