/**
 * @module api/playoffs
 * @description Playoff brackets
 */
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type { Bracket } from '#/types/index.ts';
import { SeasonId, validate } from '#/utils/schemas.ts';
import { label, playoffPaths as p } from './paths.ts';

/**
 * Playoff bracket: rounds, series and games
 * @param seasonId - A playoff season id (e.g. 9 for the 2026 playoffs)
 */
export async function bracket(
   seasonId: number | string,
): Promise<APIResult<Bracket>> {
   const v = validate(SeasonId, seasonId, label(p.bracket));
   if (!v.ok) return v.result;
   return get(p.bracket, { season_id: v.value });
}
