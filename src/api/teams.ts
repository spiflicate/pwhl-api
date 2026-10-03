/**
 * @module api/teams
 * @description Teams and rosters
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type {
   Roster,
   RosterPlayer,
   RosterStaff,
   Team,
   TeamGoalieStatsRow,
   TeamSkaterStats,
} from '#/types/index.ts';
import { SeasonId, TeamId, validate } from '#/utils/schemas.ts';
import { label, teamPaths as p } from './paths.ts';

/**
 * Teams that played in a season
 * @param seasonId - Season id
 */
export async function bySeason(
   seasonId: number | string,
): Promise<APIResult<Team[]>> {
   const v = validate(SeasonId, seasonId, label(p.bySeason));
   if (!v.ok) return v.result;
   return get(p.bySeason, { season_id: v.value });
}

const RosterParams = type({ teamId: TeamId, seasonId: SeasonId });

/**
 * Team roster for a season, split into players and staff
 * @param teamId - Team id
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await teams.roster(3, 8);
 * if (result.success) console.log(result.data.players.length);
 * ```
 */
export async function roster(
   teamId: number | string,
   seasonId: number | string,
): Promise<APIResult<Roster>> {
   const v = validate(RosterParams, { teamId, seasonId }, label(p.roster));
   if (!v.ok) return v.result;
   const result = await get<unknown[]>(p.roster, {
      team_id: v.value.teamId,
      season_id: v.value.seasonId,
   });
   if (!result.success) return result;
   return { success: true, data: splitRoster(result.data) };
}

const StatsParams = type({ teamId: TeamId, seasonId: SeasonId });

async function teamStats<T>(
   kind: 'skaters' | 'goalies',
   teamId: number | string,
   seasonId: number | string,
): Promise<APIResult<T[]>> {
   const v = validate(
      StatsParams,
      { teamId, seasonId },
      label(p.stats, kind),
   );
   if (!v.ok) return v.result;
   return get(p.stats, {
      type: kind,
      league_id: 1,
      team_id: v.value.teamId,
      season_id: v.value.seasonId,
   });
}

/**
 * Season stats for every skater on a team, with bio columns
 * @param teamId - Team id
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await teams.skaterStats(3, 8);
 * ```
 */
export async function skaterStats(
   teamId: number | string,
   seasonId: number | string,
): Promise<APIResult<TeamSkaterStats[]>> {
   return teamStats('skaters', teamId, seasonId);
}

/**
 * Season stats for a team's goalies, followed by an "Empty Net " row and
 * a "Totals " row. Tell them apart by `name`.
 * @param teamId - Team id
 * @param seasonId - Season id
 */
export async function goalieStats(
   teamId: number | string,
   seasonId: number | string,
): Promise<APIResult<TeamGoalieStatsRow[]>> {
   return teamStats('goalies', teamId, seasonId);
}

/**
 * The feed returns players followed by one nested array of staff
 * (coaches, managers): `[player, player, ..., [staff, staff]]`.
 */
export function splitRoster(rows: unknown[]): Roster {
   const players: RosterPlayer[] = [];
   const staff: RosterStaff[] = [];
   for (const row of rows) {
      if (Array.isArray(row)) {
         staff.push(...(row.filter(isObject) as unknown as RosterStaff[]));
      } else if (isObject(row)) {
         if (typeof row.role === 'string' || !row.player_id) {
            staff.push(row as unknown as RosterStaff);
         } else {
            players.push(row as unknown as RosterPlayer);
         }
      }
   }
   return { players, staff };
}

function isObject(value: unknown): value is Record<string, unknown> {
   return (
      typeof value === 'object' && value !== null && !Array.isArray(value)
   );
}
