/**
 * Game Center (gc feed) types. Field lists come from the hockeytech npm
 * types and a live capture of a finished game; they will be tightened
 * once fixtures are captured.
 */

import type {
   GameStatus,
   NumericBoolean,
   NumericString,
} from './common.ts';

/** Player reference embedded in gc events */
export interface PlayerInfo {
   player_id: NumericString;
   jersey_number: string;
   first_name: string;
   last_name: string;
   team_id?: NumericString;
   team_code?: string;
   [key: string]: unknown;
}

export interface GameMeta {
   id: NumericString;
   season_id: NumericString;
   home_team: NumericString;
   visiting_team: NumericString;
   date_played: string;
   status: GameStatus;
   period: NumericString;
   game_clock: string;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   attendance: NumericString;
   final: NumericBoolean;
   [key: string]: unknown;
}

export interface SummaryGoal {
   event: 'goal';
   time: string;
   period_id: NumericString;
   team_id: NumericString;
   power_play: NumericBoolean;
   empty_net: NumericBoolean;
   short_handed: NumericBoolean;
   penalty_shot: NumericBoolean;
   game_winning: NumericBoolean;
   goal_scorer: PlayerInfo;
   assist1_player: PlayerInfo;
   assist2_player: PlayerInfo;
   [key: string]: unknown;
}

export interface SummaryPenalty {
   event: 'penalty';
   period_id: NumericString;
   /** Long name, e.g. "1st" */
   period: string;
   time_off_formatted: string;
   team_id: NumericString;
   /** Decimal string, e.g. "2.00" */
   minutes: string | number;
   lang_penalty_description: string;
   player_penalized_info: PlayerInfo;
   [key: string]: unknown;
}

type HomeVisitor<T> = { home: T; visitor: T };

/** gc `gamesummary` */
export interface GameSummary {
   meta: GameMeta;
   game_date_iso_8601: string;
   home: Record<string, unknown>;
   visitor: Record<string, unknown>;
   periods: Record<string, Record<string, unknown>>;
   goals: SummaryGoal[];
   penalties: SummaryPenalty[];
   mvps: PlayerInfo[];
   goalies: HomeVisitor<Array<Record<string, unknown>>>;
   home_team_lineup: Record<string, unknown>;
   visitor_team_lineup: Record<string, unknown>;
   coaches: HomeVisitor<Array<Record<string, unknown>>>;
   officialsOnIce: Array<Record<string, unknown>>;
   totalGoals: HomeVisitor<number>;
   totalShots: HomeVisitor<number>;
   goalsByPeriod: HomeVisitor<Record<string, number>>;
   shotsByPeriod: HomeVisitor<Record<string, number>>;
   powerPlayGoals: HomeVisitor<number>;
   powerPlayCount: HomeVisitor<number>;
   [key: string]: unknown;
}

interface PbpBase {
   /** "mm:ss" into the period */
   time: string;
   /** Seconds into the period */
   s: number;
   [key: string]: unknown;
}

export interface PbpGoalieChange extends PbpBase {
   event: 'goalie_change';
   goalie_in_id: NumericString;
   goalie_out_id: NumericString;
   team_id: NumericString;
}

export interface PbpFaceoff extends PbpBase {
   event: 'faceoff';
   home_player_id: NumericString;
   visitor_player_id: NumericString;
   home_win: NumericBoolean;
   win_team_id: NumericString;
   x_location: number;
   y_location: number;
}

export interface PbpShot extends PbpBase {
   event: 'shot';
   player_id: NumericString;
   goalie_id: NumericString;
   team_id: NumericString;
   period_id: NumericString;
   x_location: number;
   y_location: number;
   shot_type: string;
   player: PlayerInfo;
   goalie: PlayerInfo;
}

export interface PbpBlockedShot extends Omit<PbpShot, 'event'> {
   event: 'blocked_shot';
   blocker_player_id: NumericString;
   blocker_team_id: NumericString;
}

export interface PbpHit extends PbpBase {
   event: 'hit';
   player_id: NumericString;
   team_id: NumericString;
   x_location: number;
   y_location: number;
}

export interface PbpPenalty extends PbpBase {
   event: 'penalty';
   player_id: NumericString;
   team_id: NumericString;
   period_id: NumericString;
   /** Decimal string, e.g. "2.00" */
   minutes: string;
   lang_penalty_description: string;
}

export interface PbpGoal extends PbpBase {
   event: 'goal';
   team_id: NumericString;
   period_id: NumericString;
   goal_player_id: NumericString;
   /** "" when absent */
   assist1_player_id: string;
   /** "" when absent */
   assist2_player_id: string;
   power_play: NumericBoolean;
   empty_net: NumericBoolean;
   short_handed: NumericBoolean;
   game_winning: NumericBoolean;
   x_location: number;
   y_location: number;
   goal_scorer: PlayerInfo;
}

/** gc `pxpverbose` event, discriminated on `event` */
export type PlayByPlayEvent =
   | PbpGoalieChange
   | PbpFaceoff
   | PbpShot
   | PbpBlockedShot
   | PbpHit
   | PbpPenalty
   | PbpGoal;

export interface ClockTeam {
   team_id: NumericString;
   name: string;
   team_code: string;
   team_nickname: string;
   team_city: string;
}

/** gc `clock`: compact live game state */
export interface GameClock {
   period: NumericString;
   /** e.g. "3rd" */
   period_name: string;
   /** "hh:mm:ss" */
   game_clock: string;
   status: GameStatus;
   started: NumericBoolean;
   final: NumericBoolean;
   /** e.g. "Final" */
   progress: string;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   home_team: ClockTeam;
   visiting_team: ClockTeam;
   /** Goals per period keyed "1", "2", "3" */
   scoring: Record<string, unknown>;
   /** Shots per period */
   shots_on_goal: Record<string, unknown>;
   season_id: NumericString;
   game_date_iso_8601: string;
   [key: string]: unknown;
}

/** gc `preview`: head-to-head records, recent form and lineups */
export interface GamePreview {
   current_season: Record<string, unknown>;
   last_season: Record<string, unknown>;
   HeadToHeadRecord: unknown;
   previous_meetings: unknown[];
   home_team: Record<string, unknown>;
   visitor_team: Record<string, unknown>;
   [key: string]: unknown;
}
