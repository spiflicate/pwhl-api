/**
 * @module api/standings
 * @description League standings
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type {
   SpecialTeamsRow,
   StandingsHeading,
   StandingsTable,
   StandingsTableProp,
   StandingsTableRow,
   StandingsTeam,
} from '#/types/index.ts';
import { SeasonId, validate } from '#/utils/schemas.ts';
import { label, standingsPaths as p } from './paths.ts';

export interface StandingsOptions {
   /** Grouping. Default 'conference' */
   groupBy?: 'conference' | 'division';
}

const SeasonParams = type({
   seasonId: SeasonId,
   groupBy: "'conference' | 'division'",
});

/**
 * Standings with every column the feed has: records, goals, special teams,
 * streaks and clinch marks. Heading rows are removed; use
 * `conference_name` or `division_name` to group.
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await standings.season(8);
 * if (result.success) console.log(result.data[0]?.name);
 * ```
 */
export async function season(
   seasonId: number | string,
   options: StandingsOptions = {},
): Promise<APIResult<StandingsTeam[]>> {
   const v = validate(
      SeasonParams,
      { seasonId, groupBy: options.groupBy ?? 'conference' },
      label(p.season, 'standings'),
   );
   if (!v.ok) return v.result;
   const result = await get<Array<StandingsTeam | StandingsHeading>>(
      p.season,
      {
         type: 'standings',
         stat: v.value.groupBy,
         season_id: v.value.seasonId,
      },
   );
   if (!result.success) return result;
   return { success: true, data: result.data.filter(isTeam) };
}

function isTeam(
   row: StandingsTeam | StandingsHeading,
): row is StandingsTeam {
   return 'team_id' in row;
}

/** One team in a standings table, with its link ids */
export interface StandingsEntry<Row> {
   row: Row;
   prop: StandingsTableProp;
   /** Group heading, "" when the table is not grouped */
   group: string;
}

export interface StandingsTableOptions {
   /** Games counted. Default 'overall' */
   context?: 'overall' | 'home' | 'visiting';
}

const TableParams = type({
   seasonId: SeasonId,
   context: "'overall' | 'home' | 'visiting'",
});

async function tableRows<Row>(
   seasonId: number | string,
   context: string,
   special: boolean,
): Promise<APIResult<StandingsEntry<Row>[]>> {
   const v = validate(
      TableParams,
      { seasonId, context },
      label(p.table, special ? 'special' : context),
   );
   if (!v.ok) return v.result;
   const result = await get<StandingsTable<Row>>(p.table, {
      season: v.value.seasonId,
      context: v.value.context,
      special: String(special),
      sort: special ? 'power_play_pct' : 'points',
      groupTeamsBy: 'division',
   });
   if (!result.success) return result;
   const sections = result.data[0]?.sections ?? [];
   return {
      success: true,
      data: sections.flatMap((s) =>
         s.data.map((d) => ({ row: d.row, prop: d.prop, group: s.title })),
      ),
   };
}

/**
 * The standings table from thepwhl.com, overall or for home or road games
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await standings.table(8, { context: 'home' });
 * ```
 */
export async function table(
   seasonId: number | string,
   options: StandingsTableOptions = {},
): Promise<APIResult<StandingsEntry<StandingsTableRow>[]>> {
   return tableRows(seasonId, options.context ?? 'overall', false);
}

/**
 * Special teams standings: power play and penalty kill, plus overtime and
 * shootout records
 * @param seasonId - Season id
 */
export async function specialTeams(
   seasonId: number | string,
): Promise<APIResult<StandingsEntry<SpecialTeamsRow>[]>> {
   return tableRows(seasonId, 'overall', true);
}
