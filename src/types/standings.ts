import type {
   NumericBoolean,
   NumericString,
   StatviewTable,
} from './common.ts';

/**
 * A team row from modulekit `statviewtype&type=standings`. Records are
 * "W-L-OTL-SOL" strings, e.g. "8-1-0-3".
 */
export interface StandingsTeam {
   team_id: NumericString;
   /** Prefixed with the clinch mark, e.g. "x - PWHL Toronto" */
   name: string;
   nickname: string;
   city: string;
   team_code: string;
   placeholder: NumericBoolean;
   division_id: NumericString;
   wins: NumericString;
   losses: NumericString;
   ties: NumericString;
   ot_losses: NumericString;
   reg_ot_losses: NumericString;
   reg_losses: NumericString;
   /** "" in seasons that did not track it */
   ot_wins: NumericString;
   shootout_wins: NumericString;
   non_reg_wins: NumericString;
   shootout_losses: NumericString;
   non_reg_losses: NumericString;
   regulation_wins: NumericString;
   /** Regulation and overtime wins */
   row: NumericString;
   points: NumericString;
   bench_minutes: NumericString;
   penalty_minutes: NumericString;
   past_10_wins: NumericString;
   past_10_losses: NumericString;
   past_10_ties: NumericString;
   past_10_ot_losses: NumericString;
   past_10_shootout_losses: NumericString;
   past_10_ot_wins: NumericString;
   past_10_shootout_wins: NumericString;
   goals_for: NumericString;
   goals_against: NumericString;
   goals_diff: NumericString;
   power_play_goals: NumericString;
   power_play_goals_against: NumericString;
   shootout_goals: NumericString;
   shootout_goals_against: NumericString;
   shootout_attempts: NumericString;
   shootout_attempts_against: NumericString;
   short_handed_goals_for: NumericString;
   short_handed_goals_against: NumericString;
   /** Points percentage, e.g. "0.979" */
   percentage: NumericString;
   percentage_full: NumericString;
   clinched_playoff_spot: NumericBoolean;
   clinched_group_title: NumericBoolean;
   overall_rank: NumericString;
   shootout_games_played: NumericString;
   games_played: NumericString;
   shootout_pct: NumericString;
   /** e.g. "15.7" */
   power_play_pct: NumericString;
   shootout_pct_goals_for: NumericString;
   shootout_pct_goals_against: NumericString;
   penalty_kill_pct: NumericString;
   pim_pg: NumericString;
   power_plays: NumericString;
   win_percentage: NumericString;
   times_short_handed: NumericString;
   divisname: string;
   games_remaining: NumericString;
   conference_name: string;
   /** Current streak as a record, e.g. "4-0-0-0" */
   streak: string;
   /** e.g. "1W" */
   streak_wl: string;
   rank: number;
   /** e.g. "2-0" */
   shootout_record: string;
   home_record: string;
   visiting_record: string;
   past_10: string;
   /** Clinch mark, e.g. "x", or "" */
   clinched: string;
   team_name: string;
   teamname: string;
   division_name: string;
}

/** Heading rows modulekit mixes into standings ahead of each group */
export type StandingsHeading =
   | { label: string }
   | { repeatheader: number; name: string };

export interface StandingsTableProp {
   team_code: { teamLink: NumericString };
   name: { teamLink: NumericString };
}

/** statviewfeed `teams` row (the site's standings page) */
export interface StandingsTableRow {
   /** Prefixed with the clinch mark, e.g. "x - BOS" */
   team_code: string;
   /** e.g. "x - Boston Fleet" */
   name: string;
   rank: number;
   games_played: NumericString;
   points: number;
   losses: NumericString;
   regulation_wins: NumericString;
   non_reg_wins: NumericString;
   non_reg_losses: NumericString;
   goals_for: NumericString;
   goals_against: NumericString;
   games_remaining: NumericString;
   percentage: NumericString;
   overall_rank: NumericString;
   /** e.g. "1L"; absent in home and visiting tables */
   streak_wl?: string;
}

/** statviewfeed `teams&special=true` row (special teams standings) */
export interface SpecialTeamsRow {
   team_code: string;
   name: string;
   rank: number;
   games_played: NumericString;
   ot_losses: NumericString;
   ot_wins: NumericString;
   shootout_wins: NumericString;
   shootout_losses: NumericString;
   power_play_goals: NumericString;
   power_play_goals_against: NumericString;
   short_handed_goals_for: NumericString;
   short_handed_goals_against: NumericString;
   /** With a percent sign, e.g. "23.0%" */
   power_play_pct: string;
   penalty_kill_pct: string;
   power_plays: NumericString;
   times_short_handed: NumericString;
}

/** Raw statviewfeed `teams` response */
export type StandingsTable<Row> = Array<
   StatviewTable<Row, StandingsTableProp>
>;
