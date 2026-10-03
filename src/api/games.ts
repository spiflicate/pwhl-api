/**
 * @module api/games
 * @description Box scores, play-by-play and live game state
 */
import { get } from '#/client/index.ts';
import type { APIResult, Endpoint } from '#/client/types.ts';
import type {
   GameClock,
   GamePreview,
   GameSummary,
   PlayByPlayEvent,
} from '#/types/index.ts';
import { GameId, validate } from '#/utils/schemas.ts';
import { label, gamePaths as p } from './paths.ts';

async function game<T>(
   endpoint: Endpoint,
   gameId: number | string,
): Promise<APIResult<T>> {
   const v = validate(GameId, gameId, label(endpoint));
   if (!v.ok) return v.result;
   return get(endpoint, { game_id: v.value });
}

/**
 * Full box score: goals, penalties, lineups, three stars and totals
 * @param gameId - Game id
 * @example
 * ```ts
 * const result = await games.summary(210);
 * ```
 */
export async function summary(
   gameId: number | string,
): Promise<APIResult<GameSummary>> {
   return game(p.summary, gameId);
}

/**
 * Play-by-play events, discriminated on `event`
 * @param gameId - Game id
 * @example
 * ```ts
 * const result = await games.playByPlay(210);
 * if (result.success) {
 *    const goals = result.data.filter((e) => e.event === 'goal');
 * }
 * ```
 */
export async function playByPlay(
   gameId: number | string,
): Promise<APIResult<PlayByPlayEvent[]>> {
   return game(p.playByPlay, gameId);
}

/**
 * Compact game state: period, clock, score and shots. Suited to polling
 * during live games.
 * @param gameId - Game id
 */
export async function clock(
   gameId: number | string,
): Promise<APIResult<GameClock>> {
   return game(p.clock, gameId);
}

/**
 * Pre-game preview: head-to-head records, recent form and lineups
 * @param gameId - Game id
 */
export async function preview(
   gameId: number | string,
): Promise<APIResult<GamePreview>> {
   return game(p.preview, gameId);
}
