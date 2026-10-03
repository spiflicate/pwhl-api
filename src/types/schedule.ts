import type {
   GameStatus,
   NumericBoolean,
   NumericString,
} from './common.ts';

/** modulekit `schedule` item */
export interface ScheduleGame {
   id: NumericString;
   game_id: NumericString;
   season_id: NumericString;
   game_number: NumericString;
   status: GameStatus;
   game_status: string;
   started: NumericBoolean;
   final: NumericBoolean;
   intermission: NumericBoolean;
   overtime: NumericBoolean;
   shootout: NumericBoolean;
   /** YYYY-MM-DD */
   date_played: string;
   GameDateISO8601: string;
   timezone: string;
   home_team: NumericString;
   home_team_code: string;
   home_team_name: string;
   home_goal_count: NumericString;
   visiting_team: NumericString;
   visiting_team_code: string;
   visiting_team_name: string;
   visiting_goal_count: NumericString;
   period: NumericString;
   game_clock: string;
   attendance: NumericString;
   venue_name: string;
   last_modified: string;
   [key: string]: unknown;
}

/** modulekit `scorebar` item (PascalCase, unlike the rest of modulekit) */
export interface ScorebarGame {
   ID: NumericString;
   SeasonID: NumericString;
   Date: string;
   GameDate: string;
   GameDateISO8601: string;
   ScheduledFormattedTime: string;
   Timezone: string;
   HomeID: NumericString;
   HomeCode: string;
   HomeLongName: string;
   HomeGoals: NumericString;
   HomeLogo: string;
   VisitorID: NumericString;
   VisitorCode: string;
   VisitorLongName: string;
   VisitorGoals: NumericString;
   VisitorLogo: string;
   Period: NumericString;
   PeriodNameShort: string;
   GameClock: string;
   GameStatus: GameStatus;
   GameStatusString: string;
   GameStatusStringLong: string;
   Intermission: string;
   venue_name: string;
   [key: string]: unknown;
}
