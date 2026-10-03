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
   const result = await get<Array<Record<string, unknown>>>(p.roster, {
      team_id: v.value.teamId,
      season_id: v.value.seasonId,
   });
   if (!result.success) return result;
   return { success: true, data: splitRoster(result.data) };
}

/**
 * The feed returns players and staff in one array, staff last. Player
 * rows have a skater or goalie position; staff rows do not.
 */
export function splitRoster(rows: Array<Record<string, unknown>>): Roster {
   const players: RosterPlayer[] = [];
   const staff: RosterStaff[] = [];
   for (const row of rows) {
      if (isPlayerRow(row)) players.push(row as RosterPlayer);
      else staff.push(row);
   }
   return { players, staff };
}

const PLAYER_POSITIONS = new Set(['F', 'C', 'LW', 'RW', 'D', 'G']);

function isPlayerRow(row: Record<string, unknown>): boolean {
   return (
      typeof row.player_id === 'string' &&
      row.player_id !== '' &&
      typeof row.position === 'string' &&
      PLAYER_POSITIONS.has(row.position.toUpperCase())
   );
}
