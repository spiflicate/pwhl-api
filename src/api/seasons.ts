/**
 * @module api/seasons
 * @description Seasons and current-season discovery
 */
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type { Bootstrap, Season } from '#/types/index.ts';
import { seasonPaths as p } from './paths.ts';

/**
 * List every season (preseason, regular season and playoffs)
 * @example
 * ```ts
 * const result = await seasons.list();
 * if (result.success) console.log(result.data.map((s) => s.season_name));
 * ```
 */
export async function list(): Promise<APIResult<Season[]>> {
   return get(p.list);
}

/**
 * Page config used by thepwhl.com's stats pages. `current_season_id` is
 * the reliable way to find the current season.
 * @param season - `'latest'` (default) or a season id
 */
export async function bootstrap(
   season: 'latest' | number = 'latest',
): Promise<APIResult<Bootstrap>> {
   return get(p.bootstrap, { season, pageName: 'scorebar' });
}

/**
 * Resolve the current season id from `bootstrap`
 * @example
 * ```ts
 * const result = await seasons.current();
 * if (result.success) console.log(result.data); // 11
 * ```
 */
export async function current(): Promise<APIResult<number>> {
   const result = await bootstrap();
   if (!result.success) return result;
   return { success: true, data: Number(result.data.current_season_id) };
}
