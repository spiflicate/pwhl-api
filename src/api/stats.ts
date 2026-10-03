/**
 * @module api/stats
 * @description League-wide player stats tables
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type {
   GoalieStatRow,
   PlayerStatsTable,
   SkaterStatRow,
   StatRowProp,
} from '#/types/index.ts';
import {
   OptionalTeamId,
   SeasonId,
   StatsType,
   validate,
} from '#/utils/schemas.ts';
import { label, statsPaths as p } from './paths.ts';

export interface PlayerStatsOptions {
   /** Season id */
   seasonId: number | string;
   /** Team id. Default: all teams */
   teamId?: number | string;
   /** Rookies only. Default false */
   rookies?: boolean;
   /** Column set. Default 'standard' */
   statsType?: 'standard' | 'bio' | 'extended';
   /** Sort column, e.g. 'points', 'goals', 'gaa'. Default 'points' */
   sort?: string;
   /** Offset of the first row. Default 0 */
   first?: number;
   /** Maximum rows. Default 100 */
   limit?: number;
   /** Goalies: only those meeting the minimum-games rule. Default false */
   qualified?: boolean;
}

/** A stats row with its link ids */
export interface StatEntry<Row> {
   row: Row;
   prop: StatRowProp;
}

const Options = type({
   seasonId: SeasonId,
   teamId: OptionalTeamId,
   rookies: 'boolean',
   statsType: StatsType,
   sort: 'string > 0',
   first: 'number.integer >= 0',
   limit: '0 < number.integer <= 1000',
   qualified: 'boolean',
});

async function playerTable<Row>(
   position: 'skaters' | 'goalies',
   options: PlayerStatsOptions,
): Promise<APIResult<StatEntry<Row>[]>> {
   const v = validate(
      Options,
      {
         seasonId: options.seasonId,
         teamId: options.teamId,
         rookies: options.rookies ?? false,
         statsType: options.statsType ?? 'standard',
         sort: options.sort ?? (position === 'goalies' ? 'gaa' : 'points'),
         first: options.first ?? 0,
         limit: options.limit ?? 100,
         qualified: options.qualified ?? false,
      },
      label(p.players),
   );
   if (!v.ok) return v.result;
   const o = v.value;
   const result = await get<PlayerStatsTable<Row>>(p.players, {
      season: o.seasonId,
      position,
      team: o.teamId ?? 'all',
      rookies: o.rookies ? 1 : 0,
      statsType: o.statsType,
      sort: o.sort,
      first: o.first,
      limit: o.limit,
      qualified: o.qualified ? 'qualified' : 'all',
   });
   if (!result.success) return result;
   const rows = result.data[0]?.sections.flatMap((s) => s.data) ?? [];
   return { success: true, data: rows };
}

/**
 * Skater stats for a season, the table behind thepwhl.com's stats page
 * @example
 * ```ts
 * const result = await stats.skaters({ seasonId: 8, limit: 10 });
 * if (result.success) console.log(result.data[0]?.row.name);
 * ```
 */
export async function skaters(
   options: PlayerStatsOptions,
): Promise<APIResult<StatEntry<SkaterStatRow>[]>> {
   return playerTable('skaters', options);
}

/**
 * Goalie stats for a season
 * @example
 * ```ts
 * const result = await stats.goalies({ seasonId: 8, qualified: true });
 * ```
 */
export async function goalies(
   options: PlayerStatsOptions,
): Promise<APIResult<StatEntry<GoalieStatRow>[]>> {
   return playerTable('goalies', options);
}
