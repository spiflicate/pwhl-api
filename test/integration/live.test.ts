/**
 * Live checks against the real feed. Skipped unless PWHL_LIVE=1, since
 * lscluster.hockeytech.com must be reachable.
 *
 *    PWHL_LIVE=1 bun test test/integration
 */
import { describe, expect, test } from 'bun:test';
import { games, schedule, seasons, stats, teams } from '#/api/index.ts';

const live = process.env.PWHL_LIVE === '1';
const SEASON = 8; // 2025-26 regular season
const TEAM = 3; // Montréal Victoire
const GAME = 210;

describe.skipIf(!live)('live feed', () => {
   test('seasons.list', async () => {
      const r = await seasons.list();
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.length).toBeGreaterThan(0);
   });

   test('seasons.current', async () => {
      const r = await seasons.current();
      expect(r.success).toBeTrue();
   });

   test('schedule.season', async () => {
      const r = await schedule.season(SEASON);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data[0]?.game_id).toBeString();
   });

   test('teams.roster', async () => {
      const r = await teams.roster(TEAM, SEASON);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.players.length).toBeGreaterThan(15);
   });

   test('stats.skaters', async () => {
      const r = await stats.skaters({ seasonId: SEASON, limit: 5 });
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data).toHaveLength(5);
   });

   test('games.summary', async () => {
      const r = await games.summary(GAME);
      expect(r.success).toBeTrue();
      if (r.success) expect(r.data.meta.id).toBe(String(GAME));
   });

   test('unknown game is not found', async () => {
      const r = await games.summary(99999999);
      expect(r.success).toBeFalse();
   });
});
