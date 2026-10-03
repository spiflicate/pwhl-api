import type { StatviewTable } from './common.ts';

interface StatRowBase {
   player_id: string;
   name: string;
   team_code: string;
   rookie: string;
   active: string;
   /** The only numeric value in a row */
   rank: number;
   games_played: string;
   [key: string]: unknown;
}

/** statviewfeed `players` row for skaters */
export interface SkaterStatRow extends StatRowBase {
   position: string;
   goals: string;
   assists: string;
   points: string;
   points_per_game: string;
   plus_minus: string;
   penalty_minutes: string;
   power_play_goals: string;
   power_play_assists: string;
   short_handed_goals: string;
   short_handed_assists: string;
   shots: string;
   shooting_percentage: string;
   hits: string;
   faceoff_wins: string;
   faceoff_attempts: string;
   faceoff_pct: string;
   /** Total ice time, "mmm:ss" */
   ice_time_minutes_seconds: string;
   /** Average ice time, "mm:ss" */
   ice_time_per_game_avg: string;
}

/** statviewfeed `players` row for goalies */
export interface GoalieStatRow extends StatRowBase {
   /** "mmmm:ss" */
   minutes_played: string;
   wins: string;
   losses: string;
   ot_losses: string;
   shootout_losses: string;
   shots: string;
   saves: string;
   goals_against: string;
   goals_against_average: string;
   /** e.g. "0.955" */
   save_percentage: string;
   shutouts: string;
}

/** Link ids that accompany each row */
export interface StatRowProp {
   name?: { playerLink?: string };
   team_code?: { teamLink?: string };
   [key: string]: unknown;
}

export type PlayerStatsTable<Row> = StatviewTable<Row, StatRowProp>[];
