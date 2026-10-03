/**
 * @module api/players
 * @description Player profiles, career stats and game logs
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import { NotFoundError } from '#/errors/index.ts';
import type {
   PlayerCategory,
   PlayerGameByGame,
   PlayerMedia,
   PlayerPage,
   PlayerProfile,
   PlayerRecentStats,
   PlayerSearchResult,
   PlayerSeasonStats,
   Transactions,
} from '#/types/index.ts';
import {
   Limit,
   PlayerId,
   SearchTerm,
   SeasonId,
   validate,
} from '#/utils/schemas.ts';
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
   const result = await player<PlayerSeasonStats | false>(
      'seasonstats',
      playerId,
      seasonId,
   );
   if (!result.success) return result;
   // The feed sends `false` for a player with no games
   return { success: true, data: result.data || {} };
}

/**
 * Totals for the player's most recent season, or null when there is none
 * @param playerId - Player id
 */
export async function recentStats(
   playerId: number | string,
): Promise<APIResult<PlayerRecentStats>> {
   const result = await player<PlayerRecentStats | '' | []>(
      'mostrecentseasonstats',
      playerId,
   );
   if (!result.success) return result;
   // The feed sends "" or [] when there is no recent season
   const data = result.data;
   return {
      success: true,
      data: data === '' || Array.isArray(data) ? null : data,
   };
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

/**
 * Find players by name. Matches anywhere in the first or last name.
 * @param term - At least two characters
 * @example
 * ```ts
 * const result = await players.search('poulin');
 * ```
 */
export async function search(
   term: string,
): Promise<APIResult<PlayerSearchResult[]>> {
   const v = validate(SearchTerm, term, label(p.search));
   if (!v.ok) return v.result;
   return get(p.search, { search_term: v.value });
}

/**
 * Everything on a thepwhl.com player page: bio, career and current-season
 * stats, game log and shot locations. Discriminate on `info.position`.
 * @param playerId - Player id
 * @param seasonId - Season for the game log. Default: the current season
 */
export async function page(
   playerId: number | string,
   seasonId?: number | string,
): Promise<APIResult<PlayerPage>> {
   const v = validate(Params, { playerId, seasonId }, label(p.page));
   if (!v.ok) return v.result;
   const result = await get<PlayerPage | []>(p.page, {
      player_id: v.value.playerId,
      season_id: v.value.seasonId,
      statsType: 'standard',
   });
   if (!result.success) return result;
   // An unknown player comes back as []
   if (Array.isArray(result.data)) {
      return {
         success: false,
         error: new NotFoundError('No such player', {
            endpoint: label(p.page),
         }),
      };
   }
   return { success: true, data: result.data };
}

export interface TransactionsOptions {
   /** Offset of the first row. Default 0 */
   first?: number;
   /** Maximum rows. Default 100 */
   limit?: number;
}

const TransactionParams = type({
   seasonId: SeasonId,
   first: 'number.integer >= 0',
   limit: Limit,
});

/**
 * Signings, trades and releases in a season. `num_results`
 * is the total, for paging with `first`.
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await players.transactions(10, { limit: 20 });
 * ```
 */
export async function transactions(
   seasonId: number | string,
   options: TransactionsOptions = {},
): Promise<APIResult<Transactions>> {
   const v = validate(
      TransactionParams,
      { seasonId, first: options.first ?? 0, limit: options.limit ?? 100 },
      label(p.transactions, 'transactions'),
   );
   if (!v.ok) return v.result;
   return get(p.transactions, {
      type: 'transactions',
      season_id: v.value.seasonId,
      first: v.value.first,
      limit: v.value.limit,
   });
}
