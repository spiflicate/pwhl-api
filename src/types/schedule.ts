import type {
   GameStatus,
   NumericBoolean,
   NumericString,
   PhpArray,
} from './common.ts';

/** A broadcaster attached to a game */
export interface Broadcaster {
   broadcaster_id: NumericString;
   name: string;
   logo_url: string;
   /** "" when unset */
   url: string;
}

/**
 * Broadcasters by slot. The feed sends `[]` (not `{}`) when a game has
 * none, and only the slots that are filled.
 */
export type Broadcasters = PhpArray<{
   home_video?: Broadcaster[];
   home_video_fr?: Broadcaster[];
   home_webcast?: Broadcaster[];
   home_webcast_fr?: Broadcaster[];
   visiting_video?: Broadcaster[];
   visiting_video_fr?: Broadcaster[];
   visiting_webcast?: Broadcaster[];
   visiting_webcast_fr?: Broadcaster[];
}>;

/** modulekit `schedule` item */
export interface ScheduleGame {
   id: NumericString;
   game_id: NumericString;
   season_id: NumericString;
   quick_score: NumericBoolean;
   /** YYYY-MM-DD */
   date_played: string;
   date_tbd: NumericBoolean;
   /** e.g. "Apr. 30" */
   date: string;
   /** e.g. "Thu, Apr 30" */
   date_with_day: string;
   /** UTC, e.g. "2026-04-30T19:00:00Z" */
   date_time_played: string;
   /** Local time with offset, e.g. "2026-04-30T19:00:00-04:00" */
   GameDateISO8601: string;
   home_team: NumericString;
   visiting_team: NumericString;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   period: NumericString;
   overtime: NumericBoolean;
   /** "hh:mm:ss" local time */
   schedule_time: string;
   time_tbd: NumericBoolean;
   schedule_notes: string;
   /** "hh:mm:ss" */
   game_clock: string;
   /** IANA zone, e.g. "America/Toronto" */
   timezone: string;
   game_number: NumericString;
   /** "0" none; otherwise the number of shootout rounds */
   shootout: NumericString;
   /** "" when unknown */
   attendance: NumericString;
   status: GameStatus;
   /** Venue id */
   location: NumericString;
   /** e.g. "Final", "Final OT", "7:00 pm EST" */
   game_status: string;
   intermission: NumericBoolean;
   /** "", "Pre-Season" or "Regular Season" */
   game_type: string;
   /** Playoff game letter, "" outside the playoffs */
   game_letter: string;
   if_necessary: NumericBoolean;
   /** Period as shown, e.g. "3" or "OT2" */
   period_trans: string;
   started: NumericBoolean;
   final: NumericBoolean;
   tickets_url: string;
   home_audio_url: string;
   visiting_audio_url: string;
   /** Always null in captures */
   uses_spalk_rc: null;
   home_team_name: string;
   home_team_code: string;
   home_team_nickname: string;
   home_team_city: string;
   home_team_division_long: string;
   home_team_division_short: string;
   visiting_team_name: string;
   visiting_team_code: string;
   visiting_team_nickname: string;
   visiting_team_city: string;
   visiting_team_division_long: string;
   visiting_team_division_short: string;
   notes_text: string;
   use_shootouts: NumericBoolean;
   venue_name: string;
   venue_url: string;
   venue_location: string;
   /** "YYYY-MM-DD hh:mm:ss" */
   last_modified: string;
   flo_core_event_id: string;
   flo_live_event_id: string;
   htv_game_id: string;
   client_code: string;
   /** e.g. "7:00 pm EDT" */
   scheduled_time: string;
   broadcasters: Broadcasters;
   /** iCal link for the game */
   mobile_calendar: string;
}

/** modulekit `scorebar` item (PascalCase, unlike the rest of modulekit) */
export interface ScorebarGame {
   ID: NumericString;
   SeasonID: NumericString;
   league_id: NumericString;
   game_number: NumericString;
   game_letter: string;
   /** "" , "1" or "2" */
   game_type: NumericString;
   quick_score: NumericBoolean;
   /** YYYY-MM-DD */
   Date: string;
   FloCoreEventId: string;
   FloLiveEventId: string;
   /** e.g. "Mon, Dec 4" */
   GameDate: string;
   GameDateISO8601: string;
   /** "hh:mm:ss" local time */
   ScheduledTime: string;
   /** e.g. "1:00 pm" */
   ScheduledFormattedTime: string;
   Timezone: string;
   TicketUrl: string;
   HomeID: NumericString;
   HomeCode: string;
   HomeCity: string;
   HomeNickname: string;
   HomeLongName: string;
   HomeDivision: string;
   HomeGoals: NumericString;
   HomeAudioUrl: string;
   HomeVideoUrl: string;
   HomeWebcastUrl: string;
   VisitorID: NumericString;
   VisitorCode: string;
   VisitorCity: string;
   VisitorNickname: string;
   VisitorLongName: string;
   VisitingDivision: string;
   VisitorGoals: NumericString;
   VisitorAudioUrl: string;
   VisitorVideoUrl: string;
   VisitorWebcastUrl: string;
   Period: NumericString;
   /** e.g. "3", "OT1", "SO" */
   PeriodNameShort: string;
   /** e.g. "3rd", "1st OT", "SO" */
   PeriodNameLong: string;
   /** "mm:ss" */
   GameClock: string;
   /** The game id */
   GameSummaryUrl: NumericString;
   HomeWins: NumericString;
   HomeRegulationLosses: NumericString;
   HomeOTLosses: NumericString;
   HomeShootoutLosses: NumericString;
   VisitorWins: NumericString;
   VisitorRegulationLosses: NumericString;
   VisitorOTLosses: NumericString;
   VisitorShootoutLosses: NumericString;
   GameStatus: GameStatus;
   Intermission: NumericBoolean;
   /** e.g. "Final" */
   GameStatusString: string;
   /** e.g. "Final 1st OT" */
   GameStatusStringLong: string;
   /** Sort key, "YYYY-MM-DD hh:mm:ss.000000" */
   Ord: string;
   venue_name: string;
   venue_location: string;
   league_name: string;
   league_code: string;
   TimeTbd: NumericBoolean;
   DateTbd: NumericBoolean;
   /** e.g. "EST" */
   TimezoneShort: string;
   HomeLogo: string;
   VisitorLogo: string;
   FloHockeyUrl: string;
   /** Always null in captures */
   combined_client_code: null;
}

/** Team record attached to a `gamesbydate` game */
export interface GameByDateRecord {
   team_id?: NumericString;
   wins?: NumericString;
   losses?: NumericString;
   ties?: NumericString;
   ot_wins?: NumericString;
   ot_losses?: NumericString;
   shootout_wins?: NumericString;
   shootout_losses?: NumericString;
   /** Decimal string, e.g. "35.0" */
   points?: NumericString;
   use_shootouts?: NumericBoolean;
   /** "W-L-OTL-SOL", e.g. "8-4-3-9" */
   record: string;
}

export interface GameByDatePeriod {
   id: NumericString;
   short_name: string;
   long_name: string;
   /** Seconds */
   length: NumericString;
   mandatory: NumericBoolean;
}

export interface GameByDateGoal {
   /** Team code */
   code: string;
   player_id: NumericString;
   first_name: string;
   /** Abbreviated name, e.g. "A. Roque" */
   last_name: string;
   /** "hh:mm:ss" into the period */
   time: string;
   period_id: NumericString;
   short_name: string;
   long_name: string;
   game_goal_id: NumericString;
   power_play: NumericBoolean;
   empty_net: NumericBoolean;
   penalty_shot: NumericBoolean;
   short_handed: NumericBoolean;
   game_winning: NumericBoolean;
   insurance_goal: NumericBoolean;
   actual_last_name: string;
}

/** modulekit `gamesbydate` item: one game with its scoring summary */
export interface GameByDate {
   id: NumericString;
   game_id: NumericString;
   season_id: NumericString;
   league_id: NumericString;
   home_team: NumericString;
   visiting_team: NumericString;
   game_number: NumericString;
   game_letter: string;
   type_id: string;
   date_played: string;
   schedule_time: string;
   time_tbd: NumericBoolean;
   timezone: string;
   /** "hh:mm:ss" local time */
   start_time: string;
   end_time: string;
   shootout: NumericString;
   attendance: NumericString;
   location: NumericString;
   period: NumericString;
   game_clock: string;
   status: GameStatus;
   started: NumericBoolean;
   final: NumericBoolean;
   if_necessary: NumericBoolean;
   quick_score: NumericBoolean;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   home_goals_actual: NumericString;
   visiting_goals_actual: NumericString;
   schedule_notes: string;
   schedule_notes_fr: string;
   tickets_url: string;
   htv_game_id: string;
   flo_core_event_id: string;
   flo_live_event_id: string;
   home_audio_url: string;
   home_video_url: string;
   home_webcast_url: string;
   home_audio_url_fr: string;
   home_video_url_fr: string;
   home_webcast_url_fr: string;
   visiting_webcast_url: string;
   visiting_video_url: string;
   visiting_audio_url: string;
   visiting_webcast_url_fr: string;
   visiting_video_url_fr: string;
   visiting_audio_url_fr: string;
   venue: string;
   venue_location: string;
   game_status: string;
   intermission: NumericBoolean;
   home_team_name: string;
   home_team_nickname: string;
   home_team_code: string;
   home_team_city: string;
   home_team_division: string;
   visiting_team_name: string;
   visiting_team_nickname: string;
   visiting_team_code: string;
   visiting_team_city: string;
   visiting_team_division: string;
   playoff: NumericBoolean;
   home_stats: GameByDateRecord;
   visiting_stats: GameByDateRecord;
   /** e.g. "Mar 16, 2024" */
   date_played_fmt: string;
   mediaKitUrl: string;
   /** Goals keyed by period id; `[]` before the game */
   home_team_goals_by_period: PhpArray<Record<string, NumericString>>;
   visiting_team_goals_by_period: PhpArray<Record<string, NumericString>>;
   home_power_play_goals: NumericString;
   home_power_play_opportunities: NumericString;
   /** "goals/opportunities", e.g. "0/3" */
   home_power_plays: string;
   visiting_power_play_goals: NumericString;
   visiting_power_play_opportunities: NumericString;
   visiting_power_plays: string;
   home_shots: NumericString;
   visiting_shots: NumericString;
   /** Keyed by period id */
   periods: Record<string, GameByDatePeriod>;
   goal_summary: GameByDateGoal[];
   goal_list: GameByDateGoal[];
   /** Present after a shootout: goals scored in it */
   visiting_shootout?: number;
   home_shootout?: number;
   shootout_winner?: {
      home: NumericBoolean;
      player_id: NumericString;
      first_name: string;
      last_name: string;
   };
}

/** modulekit `gamesperday` item: number of games on a date */
export interface GameDay {
   /** YYYY-MM-DD */
   date_played: string;
   month: NumericString;
   year: NumericString;
   /** e.g. "Friday" */
   dayofweek: string;
   day: NumericString;
   numberofgames: NumericString;
}
