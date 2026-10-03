/**
 * @module api/players
 * @description Player profiles, career stats and game logs
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type {
   PlayerCategory,
   PlayerGameByGame,
   PlayerMedia,
   PlayerProfile,
   PlayerSeasonStats,
} from '#/types/index.ts';
import { PlayerId, SeasonId, validate } from '#/utils/schemas.ts';
import { label, playerPaths as p } from './paths.ts';

const Params = type({
   playerId: PlayerId,
   seasonId: SeasonId.or('undefined'),
});

async function player<T>(
   category: PlayerCategory,
   playerId: number | string,
   seasonId?: number | string,
): Promise<APIResult<T>> {
   const v = validate(Params, { playerId, seasonId }, label(p.player));
   if (!v.ok) return v.result;
   return get(p.player, {
      player_id: v.value.playerId,
      category,
      season_id: v.value.seasonId,
   });
}

/**
 * Player bio and current team
 * @param playerId - Player id
 * @example
 * ```ts
 * const result = await players.profile(21);
 * ```
 */
export async function profile(
   playerId: number | string,
): Promise<APIResult<PlayerProfile>> {
   return player('profile', playerId);
}

/**
 * Career stats by season, grouped into regular season, playoffs and
 * exhibition
 * @param playerId - Player id
 * @param seasonId - Optional season id to limit the rows
 */
export async function seasonStats(
   playerId: number | string,
   seasonId?: number | string,
): Promise<APIResult<PlayerSeasonStats>> {
   return player('seasonstats', playerId, seasonId);
}

/**
 * Game log for a season
 * @param playerId - Player id
 * @param seasonId - Season id
 */
export async function gameByGame(
   playerId: number | string,
   seasonId: number | string,
): Promise<APIResult<PlayerGameByGame>> {
   return player('gamebygame', playerId, seasonId);
}

/**
 * Photos and other media for a player
 * @param playerId - Player id
 */
export async function media(
   playerId: number | string,
): Promise<APIResult<PlayerMedia[]>> {
   return player('media', playerId);
}
