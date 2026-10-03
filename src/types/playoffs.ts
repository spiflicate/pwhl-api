import type {
   GameStatus,
   NumericBoolean,
   NumericString,
} from './common.ts';

/** A team in the bracket's `teams` map */
export interface BracketTeam {
   id: NumericString;
   city: string;
   team_code: string;
   name: string;
   division_long_name: string;
   division_short_name: string;
   conf_id: NumericString;
   logo: string;
}

/** A game in a playoff series */
export interface BracketGame {
   game_id: NumericString;
   home_team: NumericString;
   home_goal_count: NumericString;
   visiting_team: NumericString;
   visiting_goal_count: NumericString;
   status: GameStatus;
   /** e.g. "Final OT" */
   game_status: string;
   /** "YYYY-MM-DD hh:mm:ss" */
   date_time: string;
   date_tbd: NumericBoolean;
   time_tbd: NumericBoolean;
   GameDateISO8601: string;
   if_necessary: NumericBoolean;
   game_notes: string;
   flo_hockey_url: string;
   flo_core_event_id: string;
   flo_live_event_id: string;
}

/** One series in a playoff round */
export interface BracketMatchup {
   series_letter: string;
   series_name: string;
   series_logo: string;
   round: NumericString;
   active: NumericBoolean;
   /** "N/A" when unset */
   feeder_series1: string;
   /** "N/A" when unset */
   feeder_series2: string;
   team1: NumericString;
   team2: NumericString;
   content_en: string;
   content_fr: string;
   /** Winning team id, "" while the series is open */
   winner: string;
   games: BracketGame[];
   /** Wins are numbers; everything else is a string */
   team1_wins: number;
   team2_wins: number;
   ties: number;
}

export interface BracketRound {
   round: NumericString;
   round_name: string;
   season_id: NumericString;
   round_type_id: NumericString;
   round_type_name: string;
   matchups: BracketMatchup[];
}

/** modulekit `brackets` */
export interface Bracket {
   /** Keyed by team id */
   teams: Record<string, BracketTeam>;
   rounds: BracketRound[];
   logo: string;
   show_ties: boolean;
}
