/**
 * @module api/schedule
 * @description Season schedules and the live scorebar
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type { ScheduleGame, ScorebarGame } from '#/types/index.ts';
import {
   DayCount,
   OptionalTeamId,
   SeasonId,
   validate,
} from '#/utils/schemas.ts';
import { label, schedulePaths as p } from './paths.ts';

const SeasonParams = type({ seasonId: SeasonId, teamId: OptionalTeamId });

/**
 * Full schedule for a season, optionally for one team
 * @param seasonId - Season id (see `seasons.list()`)
 * @param teamId - Optional team id
 * @example
 * ```ts
 * const result = await schedule.season(8);
 * ```
 */
export async function season(
   seasonId: number | string,
   teamId?: number | string,
): Promise<APIResult<ScheduleGame[]>> {
   const v = validate(SeasonParams, { seasonId, teamId }, label(p.season));
   if (!v.ok) return v.result;
   return get(p.season, {
      season_id: v.value.seasonId,
      team_id: v.value.teamId,
   });
}

export interface ScorebarOptions {
   /** Days before today to include. Default 3 */
   daysBack?: number;
   /** Days after today to include. Default 3 */
   daysAhead?: number;
}

const ScorebarParams = type({ daysBack: DayCount, daysAhead: DayCount });

/**
 * Recent and upcoming games, as shown in thepwhl.com's score ticker
 * @example
 * ```ts
 * const result = await schedule.scorebar({ daysBack: 1, daysAhead: 7 });
 * ```
 */
export async function scorebar(
   options: ScorebarOptions = {},
): Promise<APIResult<ScorebarGame[]>> {
   const v = validate(
      ScorebarParams,
      {
         daysBack: options.daysBack ?? 3,
         daysAhead: options.daysAhead ?? 3,
      },
      label(p.scorebar),
   );
   if (!v.ok) return v.result;
   return get(p.scorebar, {
      numberofdaysback: v.value.daysBack,
      numberofdaysahead: v.value.daysAhead,
   });
}
