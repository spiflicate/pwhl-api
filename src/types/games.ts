/**
 * Game Center (gc feed) types. Field lists come from live responses for
 * finished games across every season, including overtime, shootout and
 * playoff games.
 */

import type {
   GameStatus,
   NumericBoolean,
   NumericString,
} from './common.ts';

/** A player embedded in gc events */
export interface PlayerRef {
   player_id: NumericString;
   jersey_number: NumericString;
   team_id: NumericString;
   team_code: string;
   first_name: string;
   last_name: string;
}

/** A player slot that is all `null` when nobody filled it (no assist) */
export type NullPlayerRef = { [K in keyof PlayerRef]: PlayerRef[K] | null };

/** A player slot whose id is "" and other fields `null` when unset */
export type EmptyPlayerRef = { player_id: NumericString } & Omit<
   NullPlayerRef,
   'player_id'
>;

type HomeVisitor<T> = { home: T; visitor: T };
type HomeVisiting<T> = { home: T; visiting: T };

// --- gamesummary -----------------------------------------------------------

/** The game record behind `gamesummary` */
export interface GameMeta {
   id: NumericString;
   season_id: NumericString;
   league_id: NumericString;
   home_team: NumericString;
   visiting_team: NumericString;
   game_number: NumericString;
   game_letter: string;
   type_id: string;
   if_necessary: NumericBoolean;
   quick_score: NumericBoolean;
   mvp1: NumericString;
   mvp2: NumericString;
   mvp3: NumericString;
   featured_player_id: string;
   date_played: string;
   date_tbd: NumericBoolean;
   schedule_time: string;
   time_tbd: NumericBoolean;
   timezone: string;
   start_time: string;
   end_time: string;
   forfeit: NumericBoolean;
   shootout: NumericString;
   shootout_first_shooter_home: NumericBoolean;
   attendance: NumericString;
   location: NumericString;
   home_coach: string;
   home_assistant_coach1: string;
   home_assistant_coach2: string;
   home_manager: string;
   visiting_coach: string;
   visiting_assistant_coach1: string;
   visiting_assistant_coach2: string;
   visiting_manager: string;
   period: NumericString;
   game_clock: string;
   status: GameStatus;
   started: NumericBoolean;
   game_length: string;
   pending_final: NumericString;
   final: NumericBoolean;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   home_goals_actual: NumericString;
   public_notes: string;
   private_notes: string;
   league_game_notes: string;
   visiting_team_notes: string;
   home_team_notes: string;
   capacity: string;
   schedule_notes: string;
   schedule_notes_fr: string;
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
   tickets_url: string;
   tickets_url_fr: string;
   last_modified: string;
   watch_now_url: string;
   watch_now_droid_url: string;
   visiting_goals_actual: NumericString;
   htv_game_id: string;
   imported_id: string;
   created: string;
   flo_core_event_id: string;
   flo_live_event_id: string;
   uses_spalk_rc: string;
   tournament_id: string;
   start_time_without_seconds: string;
   end_time_without_seconds: string;
   '12_hour_start_time_without_seconds': string;
   '12_hour_end_time_without_seconds': string;
   length: string;
   timezone_short: string;
}

/** A team as described in `gamesummary` */
export interface SummaryTeam {
   id: NumericString;
   league_id: NumericString;
   code: string;
   team_code: string;
   address1: string;
   address2: string;
   province: string;
   postal: string;
   country: string;
   phone: string;
   fax: string;
   active: NumericBoolean;
   placeholder: NumericBoolean;
   team_id: NumericString;
   lang_id: NumericString;
   season_id: NumericString;
   name: string;
   city: string;
   nickname: string;
   logo_caption: string;
}

export interface SummaryPeriod {
   id: NumericString;
   short_name: string;
   long_name: string;
   sort_order: NumericString;
   period_id: NumericString;
   /** Seconds */
   length: NumericString;
   mandatory: NumericBoolean;
}

export interface ShootoutAttempt {
   event: 'shootout';
   id: NumericString;
   game_id: NumericString;
   home: NumericBoolean;
   player_id: NumericString;
   goalie_id: NumericString;
   shot_order: NumericString;
   goal: NumericBoolean | '';
   winning_goal: NumericBoolean;
   jersey_number: NumericString;
   first_name: string;
   last_name: string;
   goalie_first_name: string;
   goalie_last_name: string;
   goalie_jersey_number: NumericString;
}

export interface Official {
   official_type_id: NumericString;
   description: string;
   first_name: string;
   last_name: string;
   jersey_number: NumericString;
   person_id: NumericString;
}

export interface SummaryPenalty {
   event: 'penalty';
   time_off_formatted: string;
   team_id: NumericString;
   home: NumericBoolean;
   period_id: NumericString;
   period: string;
   offence: NumericString;
   pp: NumericBoolean;
   bench: NumericBoolean;
   penalty_shot: NumericBoolean;
   minutes: number;
   minutes_formatted: string;
   penalty_class_id: NumericString;
   penalty_class: string;
   lang_penalty_description: string;
   s: number;
   player_penalized_info: {
      player_id?: NumericString;
      jersey_number?: NumericString;
      team_id: NumericString;
      team_code: string;
      first_name?: string;
      last_name?: string;
   };
   player_served_info: PlayerRef;
}

export interface SummaryGoal {
   event: 'goal';
   x_location: NumericString;
   y_location: NumericString;
   time: string;
   team_id: NumericString;
   home: NumericBoolean;
   period_id: NumericString;
   goal_type: string;
   location_set: NumericBoolean;
   power_play: NumericBoolean;
   empty_net: NumericBoolean;
   penalty_shot: NumericBoolean;
   short_handed: NumericBoolean;
   insurance_goal: NumericBoolean;
   game_winning: NumericBoolean;
   game_tieing: NumericBoolean;
   scorer_goal_num: NumericString;
   s: number;
   goal_scorer: PlayerRef;
   assist1_player: NullPlayerRef;
   assist2_player: NullPlayerRef;
   plus: {
      player_id: NumericString;
      jersey_number: NumericString;
      first_name: string;
      last_name: string;
   }[];
   minus: {
      player_id: NumericString;
      jersey_number: NumericString;
      first_name: string;
      last_name: string;
   }[];
}

/** One goalie stint */
export interface SummaryGoalie {
   id: NumericString;
   player_id: NumericString;
   first_name: string;
   last_name: string;
   period_start: string;
   time_start: string;
   period_end: string;
   time_end: string;
   saves: NumericString;
   secs: NumericString;
   seconds: NumericString;
   goals_against: NumericString;
   win: NumericString;
   loss: NumericString;
   shootout_loss: NumericString;
   ot_loss: NumericString;
   tie: NumericBoolean;
   shutout: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   secs_mmss: string;
   shots_against: number;
}

export interface Coach {
   coach_id: NumericString;
   last_name: string;
   first_name: string;
   description: string;
   person_role_id: NumericString;
   person_id: NumericString;
}

export interface PenaltyShot {
   event: 'penaltyshot';
   id: NumericString;
   game_id: NumericString;
   home: NumericBoolean;
   period_id: NumericString;
   time: string;
   player_id: NumericString;
   goalie_id: NumericString;
   penalty_code_id: NumericString;
   shot_took_place: NumericString;
   shot_wide: NumericString;
   game_goal_id: NumericString;
   game_penalty_shot_id: NumericString;
   penalty_number: string;
   period_short: NumericString;
   period: string;
   seconds: NumericString;
   shot_goalie_id: NumericString;
   player_jersey_number: NumericString;
   player_first_name: string;
   player_last_name: string;
   goalie_first_name: string;
   goalie_last_name: string;
   goalie_jersey_number: NumericString;
}

export interface GameLineup {
   goalies: {
      person_id: NumericString;
      player_id: NumericString;
      first_name: string;
      last_name: string;
      start: NumericString;
      position: NumericString;
      position_str: string;
      status: string;
      rookie: NumericBoolean;
      seconds: number;
      time: null | string;
      shots_against: number;
      goals_against: number;
      saves: number;
      goals: number;
      assists: number;
      pim: number;
      shots: NumericString;
      jersey_number: NumericString;
   }[];
   players: {
      person_id: NumericString;
      player_id: NumericString;
      first_name: string;
      last_name: string;
      start: NumericString;
      position: NumericString;
      position_str: string;
      status: string;
      rookie: NumericBoolean;
      goals: number;
      assists: number;
      plusminus: number | string;
      pim: number;
      faceoff_wins: NumericString;
      faceoff_attempts: NumericString;
      hits: NumericString;
      icings: null;
      offsides: null;
      shots: NumericString;
      shots_on: NumericString;
      power_play_goals: number;
      short_handed_goals: number;
      game_winning_goal: number;
      shots_blocked_by_player?: NumericString;
      shots_blocked?: NumericString;
      jersey_number: NumericString;
   }[];
}

/** gc `gamesummary` */
export interface GameSummary {
   meta: GameMeta;
   /** UI labels, e.g. "GAME SUMMARY" */
   txt_title: string;
   txt_scoring: string;
   txt_total: string;
   txt_shots: string;
   /** Game number */
   game_ident: string;
   /** e.g. "Saturday, March 16, 2024" */
   game_date: string;
   /** "h:mm" */
   game_length: string;
   status_title: string;
   /** e.g. "Final SO" */
   status_value: string;
   /** Keyed by period id */
   periods: Record<string, SummaryPeriod>;
   shootout: NumericString;
   visitor: SummaryTeam;
   home: SummaryTeam;
   visitor_division: string;
   visitor_division_id: NumericString;
   home_division: string;
   home_division_id: NumericString;
   mvp_type: number;
   shootoutDetail: ShootoutAttempt[];
   /** Three stars; a slot is null when not awarded */
   mvps: Array<{
      player_id: NumericString;
      first_name: string;
      last_name: string;
      jersey_number: NumericString;
      /** 1 home, 0 visitor */
      home: number;
   } | null>;
   venue: string;
   /** e.g. "Elizabeth Mantha (15)" */
   referee1: string;
   referee2: string;
   linesman1: string;
   linesman2: string;
   officialsOnIce: Official[];
   /** Always empty in captures */
   officialsOffIce: unknown[];
   homeShootout: number;
   visitorShootout: number;
   /** Bench minors per team; shape varies with the data */
   benchGoalCount: Record<string, number> | number[] | null;
   penalties: SummaryPenalty[];
   goals: SummaryGoal[];
   goalies: HomeVisitor<SummaryGoalie[]>;
   home_team_lineup: GameLineup;
   visitor_team_lineup: GameLineup;
   game_date_iso_8601: string;
   coaches: HomeVisitor<Coach[]>;
   pimBench: HomeVisitor<number>;
   powerPlayGoals: HomeVisitor<number>;
   powerPlayCount: HomeVisitor<number>;
   goalCount: HomeVisitor<number>;
   assistCount: HomeVisitor<number>;
   pointsCount: HomeVisitor<number>;
   pimTotal: HomeVisitor<number>;
   infCount: HomeVisitor<number>;
   /** Keyed by period id */
   shotsByPeriod: HomeVisitor<Record<string, number>>;
   penaltyshots: HomeVisitor<PenaltyShot[]>;
   totalFaceoffs: HomeVisitor<{ att: number; won: number }>;
   totalHits: HomeVisitor<number>;
   totalGoals: HomeVisitor<number>;
   totalShots: HomeVisitor<number>;
   totalShotsOn: HomeVisitor<number>;
   /** Keyed by period id */
   goalsByPeriod: HomeVisitor<Record<string, number>>;
}

// --- pxpverbose ------------------------------------------------------------

export interface PbpGoalieChange {
   event: 'goalie_change';
   goalie_in_id: null | NumericString;
   goalie_out_id: null | NumericString;
   period_id: NumericString;
   time: string;
   team_code: string;
   s: number;
   team_id: NumericString;
   goalie_in_info: NullPlayerRef;
   goalie_out_info?: PlayerRef;
}

export interface PbpFaceoff {
   event: 'faceoff';
   id: NumericString;
   period: NumericString;
   time: string;
   time_formatted: string;
   home_player_id: NumericString;
   visitor_player_id: NumericString;
   home_win: NumericBoolean;
   location_id: NumericString;
   s: number;
   x_location: number;
   y_location: number;
   win_team_id: NumericString;
   player_home: PlayerRef;
   player_visitor: PlayerRef;
}

export interface PbpHit {
   event: 'hit';
   id: NumericString;
   home: NumericBoolean;
   team_id: NumericString;
   player_id: NumericString;
   period: NumericString;
   time: string;
   time_formatted: string;
   x_location: number;
   y_location: number;
   hit_type: NumericString;
   s: number;
   hitter: EmptyPlayerRef;
}

export interface PbpBlockedShot {
   event: 'blocked_shot';
   id: NumericString;
   game_id: NumericString;
   player_id: NumericString;
   goalie_id: NumericString;
   team_id: NumericString;
   home: NumericBoolean;
   blocker_player_id: NumericString;
   x_location: number;
   y_location: number;
   orientation: NumericString;
   seconds: NumericString;
   time: string;
   time_formatted: string;
   period: string;
   period_long_name: string;
   period_id: NumericString;
   shot_type: NumericString;
   shot_type_description: string;
   quality: NumericString;
   shot_quality_description: string;
   s: number;
   player_team_id: NumericString;
   blocker_team_id: NumericString;
   player: PlayerRef;
   goalie: EmptyPlayerRef;
   blocker: EmptyPlayerRef;
}

export interface PbpShot {
   id: NumericString;
   player_id: NumericString;
   goalie_id: NumericString;
   event: 'shot';
   home: NumericBoolean;
   team_id: NumericString;
   period_id: NumericString;
   time: string;
   time_formatted: string;
   x_location: number;
   y_location: number;
   shot_type: NumericString;
   shot_type_description: string;
   shot_quality_description: string;
   quality: NumericString;
   game_goal_id: NumericString;
   s: number;
   player_team_id: NumericString;
   goalie_team_id: NumericString;
   player: PlayerRef;
   goalie: EmptyPlayerRef;
   assist1_player_id?: NumericString;
   assist2_player_id?: NumericString;
   goal_type_name?: string;
}

export interface PbpGoal {
   id: NumericString;
   event: 'goal';
   goal_type: string;
   home: NumericBoolean;
   team_id: NumericString;
   goal_player_id: NumericString;
   assist1_player_id: NumericString;
   assist2_player_id: NumericString;
   time: string;
   time_formatted: string;
   period: string;
   x_location: number;
   y_location: number;
   location_set: NumericBoolean;
   power_play: NumericBoolean;
   empty_net: NumericBoolean;
   penalty_shot: NumericBoolean;
   short_handed: NumericBoolean;
   insurance_goal: NumericBoolean;
   game_winning: NumericBoolean;
   game_tieing: NumericBoolean;
   period_id: NumericString;
   scorer_goal_num: NumericString;
   s: number;
   plus: PlayerRef[];
   minus: PlayerRef[];
   goal_scorer: PlayerRef;
   assist1_player?: PlayerRef;
   assist2_player?: PlayerRef;
}

export interface PbpPenalty {
   event: 'penalty';
   id: NumericString;
   player_id: NumericString;
   player_served: NumericString;
   offence: NumericString;
   pp: NumericBoolean;
   time_off_formatted: string;
   period: string;
   bench: NumericBoolean;
   home: NumericBoolean;
   penalty_shot: NumericBoolean;
   minutes: NumericString;
   minutes_formatted: string;
   penalty_class_id: NumericString;
   penalty_class: string;
   lang_penalty_description: string;
   period_id: NumericString;
   player_penalized_info: {
      player_id?: NumericString;
      jersey_number?: NumericString;
      team_id: NumericString;
      team_code: string;
      first_name?: string;
      last_name?: string;
   };
   player_served_info: PlayerRef;
   s: number;
   team_id: NumericString;
}

export interface PbpShootout {
   event: 'shootout';
   id: NumericString;
   home: NumericBoolean;
   player_id: NumericString;
   team_id: NumericString;
   goalie_id: NumericString;
   shot_order: NumericString;
   goal: NumericBoolean | '';
   winning_goal: NumericBoolean;
   s: number;
   goalie_info: PlayerRef;
   shooter_info: PlayerRef;
}

export interface PbpPenaltyShot {
   event: 'penaltyshot';
   id: NumericString;
   home: NumericBoolean;
   player_id: NumericString;
   goalie_id: NumericString;
   time: string;
   period: string;
   period_id: NumericString;
   game_goal_id: NumericString;
   s: number;
   goal_type_name: string;
   result: string;
   team_id: NumericString;
   player: PlayerRef;
   goalie: PlayerRef;
}

/** gc `pxpverbose` event, discriminated on `event` */
export type PlayByPlayEvent =
   | PbpGoalieChange
   | PbpFaceoff
   | PbpHit
   | PbpBlockedShot
   | PbpShot
   | PbpGoal
   | PbpPenalty
   | PbpShootout
   | PbpPenaltyShot;

// --- pxp -------------------------------------------------------------------

export interface TickerFaceoff {
   event: 'faceoff';
   time: string;
   home_player_id: NumericString;
   visitor_player_id: NumericString;
   home_win: NumericBoolean;
   win_team_id: NumericString;
   period_id: NumericString;
   s: number;
}

export interface TickerGoal {
   event: 'goal';
   goal_type: string;
   home: NumericBoolean;
   team_id: NumericString;
   goal_player_id: NumericString;
   assist1_player_id: NumericString;
   assist2_player_id: NumericString;
   time: string;
   period: string;
   period_id: NumericString;
   s: number;
}

export interface TickerHit {
   event: 'hit';
   time: string;
   home: NumericBoolean;
   team_id: NumericString;
   player_id: NumericString;
   hit_type: NumericString;
   s: number;
   period_id: NumericString;
}

export interface TickerPenalty {
   event: 'penalty';
   player_id: NumericString;
   player_served: NumericString;
   offence: NumericString;
   pp: NumericBoolean;
   period: string;
   bench: NumericBoolean;
   home: NumericBoolean;
   penalty_shot: NumericBoolean;
   minutes: NumericString;
   penalty_class: string;
   lang_penalty_description: string;
   period_id: NumericString;
   team_id: NumericString;
   time: string;
   s: number;
}

export interface TickerShot {
   event: 'shot';
   id: NumericString;
   home: NumericBoolean;
   period_id: NumericString;
   team_id: NumericString;
   player_id: NumericString;
   time: string;
   shot_type: NumericString;
   quality: NumericString;
   goalie_id: NumericString;
   s: number;
}

export interface TickerShootout {
   event: 'soshot';
   id: NumericString;
   player_id: NumericString;
   goalie_id: NumericString;
   goal: NumericBoolean | '';
   winning_goal: NumericBoolean;
   home: NumericBoolean;
   shot_order: NumericString;
   team_id: NumericString;
   period_id: number;
   time: string;
   s: NumericString;
}

/** gc `pxp` event: the latest 20 events in compact form */
export type TickerEvent =
   | TickerFaceoff
   | TickerGoal
   | TickerHit
   | TickerPenalty
   | TickerShot
   | TickerShootout;

// --- clock -----------------------------------------------------------------

export interface ClockTeam {
   name: string;
   team_id: NumericString;
   team_code: string;
   team_nickname: string;
   team_city: string;
}

/** gc `clock`: compact live game state */
export interface GameClock {
   period: NumericString;
   game_clock: string;
   game_date_iso_8601: string;
   timezone: string;
   timezone_short: string;
   started: NumericBoolean;
   game_number: NumericString;
   season_id: NumericString;
   season_name: string;
   home_team: ClockTeam;
   visiting_team: ClockTeam;
   text_game_summary: string;
   official_game_report: string;
   home_audio_url: string;
   home_video_url: string;
   home_webcast_url: string;
   visiting_audio_url: string;
   visiting_video_url: string;
   visiting_webcast_url: string;
   tickets_url: string;
   venue: string;
   final: NumericBoolean;
   status: GameStatus;
   home_goal_count: NumericString;
   visiting_goal_count: NumericString;
   progress: string;
   progress_short: string;
   period_name: string;
   home_lineup_card: string;
   visiting_lineup_card: string;
   game_lineups: string;
   home_audio_url_fr: string;
   home_video_url_fr: string;
   home_webcast_url_fr: string;
   visiting_audio_url_fr: string;
   visiting_video_url_fr: string;
   visiting_webcast_url_fr: string;
   tickets_url_fr: string;
   updated: {
      clock: number;
      meta: number;
      lineup: number;
      goals: number;
      penalties: number;
      penaltyshots: number;
      shots: number;
      hits: number;
      faceoffs: number;
      pxp: number;
      shootouts: number;
      h2h: number;
      pxpverbose: number;
   };
   /** Goals per period, keyed by period id ("SO" for the shootout) */
   scoring: HomeVisiting<Record<string, NumericString>>;
   /** Shots per period, keyed by period id */
   shots_on_goal: HomeVisiting<Record<string, number>>;
   power_play: {
      total: HomeVisiting<NumericString>;
      goals: HomeVisiting<NumericString>;
   };
   /** Faceoffs won */
   fow: HomeVisiting<number>;
   /** Absent in seasons that did not track hits */
   hits?: HomeVisiting<number>;
}

// --- preview ---------------------------------------------------------------

/** Season settings embedded in `preview` */
export interface SeasonConfig {
   id: NumericString;
   league_id: NumericString;
   start_date: string;
   end_date: string;
   season_name: string;
   career: NumericBoolean;
   shortname: string;
   playoff: NumericBoolean;
   created: string;
   last_updated: string;
   use_shootouts: NumericBoolean;
   min_num_ice_players: string;
   max_num_ice_players: string;
   regulation_win_points: NumericString;
   ot_win_points: NumericString;
   ot_loss_points: NumericString;
   tie_points: NumericString;
   current: NumericBoolean;
   sopt_calc_age_year: string;
   ignored: NumericString;
   sopt_display: NumericString;
   clear_day: string;
   clear_roster_size: NumericString;
   sopt_lineup_faceoffs: NumericString;
   sopt_track_faceoffs: NumericString;
   sopt_track_hits: NumericString;
   sopt_track_goalie_saves_auto: NumericString;
   sopt_track_shootout_misses_as_saves: NumericString;
   sopt_count_wide_penalty_shots_as_saves: NumericString;
   sopt_track_shots: NumericString;
   sopt_track_shots_wide: NumericString;
   sopt_track_shot_quality: NumericString;
   sopt_track_shot_type: NumericString;
   sopt_track_on_ice_officials: NumericString;
   sopt_track_off_ice_officials: NumericString;
   sopt_show_plus_minus: NumericString;
   sopt_track_stars_of_game: NumericString;
   sopt_track_team_stars_of_game: NumericString;
   sopt_stars_of_game_config: NumericString;
   sopt_stars_of_game_type: NumericString;
   sopt_stars_of_game_count: NumericString;
   sopt_playoff_rounds: NumericString;
   hidden: NumericBoolean;
   hide_in_standings: NumericBoolean;
   sopt_goalie_otl_only: NumericString;
   sopt_hide_goalie_otl: NumericString;
   sopt_hide_goalie_sol: NumericString;
   sopt_conf_standings_div_asterisks: NumericString;
   sopt_show_standings_cutoff: NumericString;
   sopt_conf_team_standings_bydiv: NumericString;
   sopt_show_clinching_teams: NumericString;
   ranking_config: NumericString;
   statview_configuration_id: NumericString;
   sopt_locked: string;
   sopt_lineup_hits: string;
   sopt_track_goalie_gpi: string;
   sopt_track_shot_location: NumericString;
   sopt_track_shots_blocked: NumericString;
   sopt_min_lineup_players: NumericString;
   sopt_max_lineup_players: NumericString;
   sopt_enable_power_play_clock: NumericString;
   sopt_track_goal_location: NumericString;
   sopt_track_timeouts: NumericString;
   sopt_num_timeouts_regulation: NumericString;
   sopt_num_timeouts_ot: NumericString;
   sopt_num_players_even_strength_ot: NumericString;
   sopt_track_icing: NumericString;
   sopt_track_offside: NumericString;
   sopt_track_time_on_ice: NumericString;
   sopt_track_breakouts: NumericString;
   sopt_track_odd_man_rush: NumericString;
   sopt_auto_populate_toi_players: NumericString;
   sopt_min_goalie_minutes: NumericString;
   sopt_traded_players_appear_on_past_rosters: NumericString;
   sopt_show_interleague_games: NumericString;
   sopt_record_format_id: NumericString;
   trans_shortname: string;
   trans_season_name: string;
}

/** A head-to-head record from one side */
export interface HeadToHead {
   name: null | string;
   w: number;
   l: number;
   otl: number;
   sl: number;
   t: number;
   otw: number;
   sw: number;
}

export interface PreviousMeeting {
   gameId: NumericString;
   visitingTeamId: NumericString;
   visitingCity: string;
   visitingScore: NumericString;
   homeTeamId: NumericString;
   homeCity: string;
   homeScore: NumericString;
   datePlayed: string;
   game_date_iso_8601: string;
   status: string;
}

export interface PreviewTeamBase {
   pp_vs_opp: {
      power_plays: number;
      power_play_goals: number | NumericString;
      percentage: number;
      pk_percentage_of_opp: number;
   };
   season_records: {
      leading_after_1st: string;
      leading_after_2nd: string;
      tied_after_1st: string;
      tied_after_2nd: string;
      trailing_after_1st: string;
      trailing_after_2nd: string;
      out_shooting_opponents: string;
      out_shot_by_opponent: string;
      one_goal_game: string;
      two_goal_game: string;
      three_goal_game: string;
      four_goal_game: string;
      five_goal_game: string;
      six_goal_game: string;
      sevenplus_goal_game: string;
      as_of_game: string;
   };
}

export interface PreviewTeamRecord {
   team_id: NumericString;
   name: string;
   city: string;
   team_code: string;
   nickname: string;
   divisionName: string;
   conferenceName: string;
   wins: number;
   losses: number;
   ties: number;
   points: number;
   ot_wins: number;
   ot_losses: number;
   shootout_wins: number;
   shootout_losses: number;
   goals_for: number;
   goals_against: number;
   penalty_minutes: number;
   past_10_wins: number;
   past_10_losses: number;
   past_10_ties: number;
   past_10_ot_losses: number;
   past_10_shootout_losses: number;
   past_10_ot_wins: number;
   past_10_shootout_wins: number;
   home_w: number;
   home_l: number;
   home_t: number;
   home_sl: number;
   home_otl: number;
   home_otw: number;
   home_sw: number;
   away_w: number;
   away_l: number;
   away_t: number;
   away_sl: number;
   away_otl: number;
   away_otw: number;
   away_sw: number;
   power_plays: number;
   power_play_goals: number;
   times_short_handed: number;
   power_play_goals_against: number;
   last_game: string;
   gamesPlayed: number;
   gp: number;
   pp_away: {
      power_plays: number;
      power_player_goals: number;
      power_play_goals: number;
      percentage: number;
   };
   pp_home: {
      power_plays: number;
      power_player_goals: number;
      power_play_goals: number;
      percentage: number;
   };
   pp: {
      power_plays: number;
      power_player_goals: number;
      power_play_goals: number;
      percentage: number;
   };
   pk_away: {
      times_short_handed: number;
      power_player_goals_against: number;
      power_play_goals_against: number;
      percentage: number;
   };
   pk_home: {
      times_short_handed: number;
      power_player_goals_against: number;
      power_play_goals_against: number;
      percentage: number;
   };
   pk: {
      times_short_handed: number;
      power_player_goals_against: number;
      power_play_goals_against: number;
      percentage: number;
   };
   pim: {
      games_played: number;
      penalty_minutes: number;
      bench_minutes: number;
      penalties_per_game: number;
   };
   longest_player_streaks: {
      assists: {
         player_id: NumericString;
         first_name: string;
         last_name: string;
         goals: number;
         assists: number;
         points: number;
         length: number;
      }[];
      points: {
         player_id: NumericString;
         first_name: string;
         last_name: string;
         goals: number;
         assists: number;
         points: number;
         length: number;
      }[];
      goals: {
         player_id: NumericString;
         first_name: string;
         last_name: string;
         goals: number;
         assists: number;
         points: number;
         length: number;
      }[];
   };
   lastGames: {
      id: NumericString;
      date_played: string;
      game_date_iso_8601: string;
      home_team: NumericString;
      homeCode: string;
      homeCity: string;
      home_goal_count: NumericString;
      visiting_team: NumericString;
      visitingCode: string;
      visitingCity: string;
      visiting_goal_count: NumericString;
      winner: NumericString;
   }[];
   rookie: {
      points: number;
      assists: number;
      first_name: string;
      last_name: string;
      rookie: NumericBoolean;
      jersey_number: NumericString;
      player_id: NumericString;
      penalty_minutes?: number;
      goals: number;
   };
   leadingScorers: {
      points: number;
      assists: number;
      first_name: string;
      last_name: string;
      rookie: NumericBoolean;
      jersey_number: NumericString;
      player_id: NumericString;
      penalty_minutes?: number;
      goals: number;
   }[];
   mostPIM: {
      assists: number;
      goals: number;
      points: number;
      first_name: string;
      last_name: string;
      rookie: NumericBoolean;
      player_id: NumericString;
      penalty_minutes: number;
      jersey_number: NumericString;
   };
   all_w: number;
   all_l: number;
   all_t: number;
   all_otl: number;
   all_sl: number;
   last10: string;
   streak: string;
   percentage: number;
   pp_percentage: number;
   pk_percentage: number;
   teamPIMperGame: number;
}

export interface PreviewLineup {
   goalies: {
      person_id: NumericString;
      player_id: NumericString;
      first_name: string;
      last_name: string;
      start: NumericString;
      position: NumericString;
      position_str: string;
      jersey_number: NumericString;
      status: string;
      rookie: NumericBoolean;
      seconds: number;
      time: null | string;
      shots_against: number;
      goals_against: number;
      saves: number;
      goals: number;
      assists: number;
      pim: number;
   }[];
   players: {
      person_id: NumericString;
      player_id: NumericString;
      first_name: string;
      last_name: string;
      start: NumericString;
      position: NumericString;
      position_str: string;
      jersey_number: NumericString;
      status: string;
      rookie: NumericBoolean;
      goals: number;
      assists: number;
      plusminus: number | string;
      pim: number;
      faceoff_wins: NumericString;
      faceoff_attempts: NumericString;
      hits: NumericString;
      icings: null;
      offsides: null;
      shots: NumericString;
      shots_on: NumericString;
   }[];
}

/**
 * A team in `preview`. Record fields are absent for a team with no games
 * in the season yet (playoffs, preseason).
 */
export type PreviewTeam = PreviewTeamBase & Partial<PreviewTeamRecord>;

type HeadToHeadRecord = {
   home_team: HeadToHead;
   visiting_team: HeadToHead;
};

/** gc `preview`: head-to-head records, recent form and lineups */
export interface GamePreview {
   current_season: SeasonConfig;
   /** "" when there is no previous season */
   last_season: SeasonConfig | '';
   HeadToHeadRecord: HeadToHeadRecord;
   last_HeadToHeadRecord: HeadToHeadRecord;
   last5YearsRecord: HeadToHeadRecord;
   last5YearsRecord_home_games: HeadToHeadRecord;
   last5YearsRecord_visiting_games: HeadToHeadRecord;
   previous_meetings: PreviousMeeting[];
   home_team: PreviewTeam & { lineup: PreviewLineup };
   /** The visiting team's record (no lineup) */
   visitor_team: PreviewTeam;
   /** The visiting team's lineup only */
   visiting_team: { lineup: PreviewLineup };
}
