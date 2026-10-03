/**
 * @module api/stats
 * @description League-wide player stats tables and leader lists
 */
import { type } from 'arktype';
import { get } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';
import type {
   GoalieCategoryLeaders,
   GoalieStatRow,
   GoalieTeamSplit,
   Leaders,
   PlayerStatsTable,
   PointStreak,
   SkaterCategoryLeaders,
   SkaterExpandedStatRow,
   SkaterExpandedTeamSplit,
   SkaterStatRow,
   SkaterTeamSplit,
   StatEntry,
   TopGoalie,
   TopScorer,
} from '#/types/index.ts';
import {
   Limit,
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
   /** Sort column, e.g. 'points', 'goals', 'gaa'. Default 'points' */
   sort?: string;
   /** Offset of the first row. Default 0 */
   first?: number;
   /** Maximum rows. Default 100 */
   limit?: number;
   /** Goalies: only those meeting the minimum-games rule. Default false */
   qualified?: boolean;
}

export interface SkaterStatsOptions extends PlayerStatsOptions {
   /** Column set. 'expanded' adds goal types. Default 'standard' */
   statsType?: 'standard' | 'expanded';
}

const Options = type({
   seasonId: SeasonId,
   teamId: OptionalTeamId,
   rookies: 'boolean',
   statsType: StatsType,
   sort: 'string > 0',
   first: 'number.integer >= 0',
   limit: Limit,
   qualified: 'boolean',
});

async function playerTable<Row, Split>(
   position: 'skaters' | 'goalies',
   options: SkaterStatsOptions,
): Promise<APIResult<StatEntry<Row, Split>[]>> {
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
      label(p.players, position),
   );
   if (!v.ok) return v.result;
   const o = v.value;
   const result = await get<PlayerStatsTable<Row, Split>>(p.players, {
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
 * Skater stats for a season, the table behind thepwhl.com's stats page.
 * The row type follows `statsType`.
 * @example
 * ```ts
 * const result = await stats.skaters({ seasonId: 8, limit: 10 });
 * if (result.success) console.log(result.data[0]?.row.name);
 * ```
 */
export async function skaters(
   options: PlayerStatsOptions & { statsType?: 'standard' },
): Promise<APIResult<StatEntry<SkaterStatRow, SkaterTeamSplit>[]>>;
export async function skaters(
   options: PlayerStatsOptions & { statsType: 'expanded' },
): Promise<
   APIResult<StatEntry<SkaterExpandedStatRow, SkaterExpandedTeamSplit>[]>
>;
export async function skaters(
   options: SkaterStatsOptions,
): Promise<
   APIResult<
      StatEntry<
         SkaterStatRow | SkaterExpandedStatRow,
         SkaterTeamSplit | SkaterExpandedTeamSplit
      >[]
   >
> {
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
): Promise<APIResult<StatEntry<GoalieStatRow, GoalieTeamSplit>[]>> {
   return playerTable('goalies', { ...options, statsType: 'standard' });
}

export interface TopPlayersOptions {
   /** Sort column, e.g. 'points', 'goals', 'gaa'. Default 'points' or 'gaa' */
   sort?: string;
   /** Offset of the first row. Default 0 */
   first?: number;
   /** Maximum rows. Default 100 */
   limit?: number;
   /** Only players meeting the minimum-games rule. Default false */
   qualified?: boolean;
}

const TopParams = type({
   seasonId: SeasonId,
   sort: 'string > 0',
   first: 'number.integer >= 0',
   limit: Limit,
   qualified: 'boolean',
});

async function top<T>(
   kind: 'topscorers' | 'topgoalies',
   seasonId: number | string,
   options: TopPlayersOptions,
): Promise<APIResult<T[]>> {
   const v = validate(
      TopParams,
      {
         seasonId,
         sort: options.sort ?? (kind === 'topgoalies' ? 'gaa' : 'points'),
         first: options.first ?? 0,
         limit: options.limit ?? 100,
         qualified: options.qualified ?? false,
      },
      label(p.statviewtype, kind),
   );
   if (!v.ok) return v.result;
   return get(p.statviewtype, {
      type: kind,
      season_id: v.value.seasonId,
      sort: v.value.sort,
      first: v.value.first,
      limit: v.value.limit,
      stat: 'all',
      qualified: v.value.qualified ? 'qualified' : 'all',
   });
}

/**
 * League scoring leaders with full bio and stat columns
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await stats.topScorers(8, { sort: 'goals', limit: 5 });
 * ```
 */
export async function topScorers(
   seasonId: number | string,
   options: TopPlayersOptions = {},
): Promise<APIResult<TopScorer[]>> {
   return top('topscorers', seasonId, options);
}

/**
 * League goalie leaders with full bio and stat columns
 * @param seasonId - Season id
 */
export async function topGoalies(
   seasonId: number | string,
   options: TopPlayersOptions = {},
): Promise<APIResult<TopGoalie[]>> {
   return top('topgoalies', seasonId, options);
}

/**
 * The leader cards on thepwhl.com's stats page: top skaters by points,
 * goals and assists, and top goalies by wins, save percentage and GAA
 * @param seasonId - Season id
 */
export async function leaders(
   seasonId: number | string,
): Promise<APIResult<Leaders>> {
   const v = validate(SeasonId, seasonId, label(p.leaders));
   if (!v.ok) return v.result;
   return get(p.leaders, {
      season_id: v.value,
      team_id: 0,
      playerTypes: 'skaters,goalies',
      skaterStatTypes: 'points,goals,assists',
      goalieStatTypes: 'wins,save_percentage,goals_against_average',
      activeOnly: 0,
   });
}

export interface CategoryLeadersOptions {
   /** Players per category. Default 10 */
   limit?: number;
   /** Only players meeting the minimum-games rule. Default false */
   qualified?: boolean;
}

const CategoryParams = type({
   seasonId: SeasonId,
   limit: Limit,
   qualified: 'boolean',
});

async function categoryLeaders<T>(
   kind: 'skaters' | 'goalies',
   seasonId: number | string,
   options: CategoryLeadersOptions,
): Promise<APIResult<T>> {
   const v = validate(
      CategoryParams,
      {
         seasonId,
         limit: options.limit ?? 10,
         qualified: options.qualified ?? false,
      },
      label(p.categoryLeaders, kind),
   );
   if (!v.ok) return v.result;
   return get(p.categoryLeaders, {
      type: kind,
      season_id: v.value.seasonId,
      return_amount: v.value.limit,
      qualified: v.value.qualified ? 'qualified' : 'all',
   });
}

/**
 * Top skaters in each stat category (goals, assists, points, and so on)
 * @param seasonId - Season id
 * @example
 * ```ts
 * const result = await stats.skaterCategoryLeaders(8, { limit: 3 });
 * if (result.success) console.log(result.data.goals[0]?.name);
 * ```
 */
export async function skaterCategoryLeaders(
   seasonId: number | string,
   options: CategoryLeadersOptions = {},
): Promise<APIResult<SkaterCategoryLeaders>> {
   return categoryLeaders('skaters', seasonId, options);
}

/**
 * Top goalies in each stat category (GAA, save percentage, wins, shutouts)
 * @param seasonId - Season id
 */
export async function goalieCategoryLeaders(
   seasonId: number | string,
   options: CategoryLeadersOptions = {},
): Promise<APIResult<GoalieCategoryLeaders>> {
   return categoryLeaders('goalies', seasonId, options);
}

/**
 * Longest point streaks of a season, including ones still running
 * @param seasonId - Season id
 */
export async function streaks(
   seasonId: number | string,
): Promise<APIResult<PointStreak[]>> {
   const v = validate(SeasonId, seasonId, label(p.statviewtype, 'streaks'));
   if (!v.ok) return v.result;
   return get(p.statviewtype, { type: 'streaks', season_id: v.value });
}
