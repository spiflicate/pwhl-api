/**
 * Library functions run against responses captured from the live feed
 * (trimmed; see scripts/trim-fixtures.ts).
 */
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
import { APIError, NotFoundError } from '#/errors/index.ts';
import unknownGame from '../fixtures/error-unknown-game-gc.ts';
import unknownPlayer from '../fixtures/error-unknown-player.ts';
import unknownView from '../fixtures/error-unknown-view.ts';
import clock from '../fixtures/gc-clock.ts';
import summary from '../fixtures/gc-gamesummary.ts';
import pxp from '../fixtures/gc-pxpverbose.ts';
import brackets from '../fixtures/modulekit-brackets.ts';
import profile from '../fixtures/modulekit-player-profile.ts';
import playerSeason from '../fixtures/modulekit-player-seasonstats.ts';
import roster from '../fixtures/modulekit-roster.ts';
import scheduleFixture from '../fixtures/modulekit-schedule.ts';
import scorebar from '../fixtures/modulekit-scorebar.ts';
import seasonsFixture from '../fixtures/modulekit-seasons.ts';
import teamsFixture from '../fixtures/modulekit-teamsbyseason.ts';
import bootstrap from '../fixtures/statview-bootstrap.ts';
import goalies from '../fixtures/statview-players-goalies-standard.ts';
import skaters from '../fixtures/statview-players-skaters-standard.ts';
import { jsonp, mockFetch } from './helpers.ts';

const fetch = mockFetch();

describe('modulekit fixtures', () => {
   test('seasons.list', async () => {
      fetch.respond(seasonsFixture);
      const r = await seasons.list();
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data.length).toBe(3);
         expect(r.data[0]?.season_name).toBeString();
      }
   });

   test('schedule.season', async () => {
      fetch.respond(scheduleFixture);
      const r = await schedule.season(8);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data[0]?.game_id).toMatch(/^\d+$/);
   });

   test('schedule.scorebar', async () => {
      fetch.respond(scorebar);
      const r = await schedule.scorebar();
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data[0]?.HomeCode).toBeString();
   });

   test('teams.bySeason', async () => {
      fetch.respond(teamsFixture);
      const r = await teams.bySeason(8);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data[0]?.code).toBeString();
   });

   test('teams.roster splits the nested staff array', async () => {
      fetch.respond(roster);
      const r = await teams.roster(1, 8);
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data.players).toHaveLength(27);
         expect(r.data.players.every((p) => p.player_id !== '')).toBeTrue();
         expect(r.data.staff.length).toBeGreaterThan(0);
         expect(
            r.data.staff.every((s) => typeof s.role === 'string'),
         ).toBeTrue();
      }
   });

   test('players.profile', async () => {
      fetch.respond(profile);
      const r = await players.profile(52);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.last_name).toBeString();
   });

   test('players.seasonStats ends with a numeric Total row', async () => {
      fetch.respond(playerSeason);
      const r = await players.seasonStats(52);
      expect(r.success).toBeTrue();
      if (r.success) {
         const last = r.data.regular?.at(-1);
         expect(last?.season_name).toBe('Total');
         expect(last?.games_played).toBeNumber();
      }
   });

   test('playoffs.bracket', async () => {
      fetch.respond(brackets);
      const r = await playoffs.bracket(9);
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data.rounds.length).toBeGreaterThan(0);
         expect(r.data.rounds[0]?.matchups[0]?.team1_wins).toBeNumber();
      }
   });
});

describe('statviewfeed fixtures', () => {
   test('seasons.current reads bootstrap', async () => {
      fetch.respond(jsonp(bootstrap));
      const r = await seasons.current();
      expect(r).toEqual({
         success: true,
         data: Number(bootstrap.current_season_id),
      });
   });

   test('stats.skaters', async () => {
      fetch.respond(jsonp(skaters));
      const r = await stats.skaters({ seasonId: 8 });
      expect(r.success).toBeTrue();
      if (r.success) {
         expect(r.data).toHaveLength(3);
         expect(r.data[0]?.row.rank).toBeNumber();
         expect(r.data[0]?.row.points).toBeString();
      }
   });

   test('stats.goalies', async () => {
      fetch.respond(jsonp(goalies));
      const r = await stats.goalies({ seasonId: 8 });
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data[0]?.row.save_percentage).toBeString();
   });
});

describe('gc fixtures', () => {
   test('games.summary', async () => {
      fetch.respond(summary);
      const r = await games.summary(326);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.meta.id).toBe('326');
   });

   test('games.playByPlay', async () => {
      fetch.respond(pxp);
      const r = await games.playByPlay(326);
      expect(r.success).toBeTrue();
      if (r.success) {
         const kinds = new Set(r.data.map((e) => e.event));
         expect(kinds).toContain('goal');
         expect(kinds).toContain('shootout');
      }
   });

   test('games.clock', async () => {
      fetch.respond(clock);
      const r = await games.clock(326);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.period_name).toBeString();
   });
});

describe('error fixtures', () => {
   test('bad key', async () => {
      fetch.respond('Invalid key.');
      const r = await seasons.list();
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(APIError);
   });

   test('unknown view', async () => {
      fetch.respond(unknownView);
      const r = await seasons.list();
      expect(r.success).toBeFalse();
      if (!r.success) {
         expect(r.error).toBeInstanceOf(APIError);
         expect(r.error.message).toContain('Undefined Tab');
      }
   });

   test('unknown player', async () => {
      fetch.respond(unknownPlayer);
      const r = await players.profile(99999999);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(NotFoundError);
   });

   test('unknown game: 404 with an error body', async () => {
      fetch.respond(unknownGame, 404);
      const r = await games.summary(99999999);
      expect(r.success).toBeFalse();
      if (!r.success) {
         expect(r.error).toBeInstanceOf(NotFoundError);
         expect(r.error.message).toBe('No such game');
      }
   });
});
