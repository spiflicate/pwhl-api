import { describe, expect, test } from 'bun:test';
import {
   games,
   players,
   playoffs,
   schedule,
   seasons,
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

   test('rejects an invalid statsType', async () => {
      const r = await stats.skaters({
         seasonId: 8,
         statsType: 'nope' as 'standard',
      });
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
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

   test('rejects a non-numeric game id', async () => {
      const r = await games.summary('abc');
      expect(r.success).toBeFalse();
      expect(fetch.calls).toHaveLength(0);
   });
});
