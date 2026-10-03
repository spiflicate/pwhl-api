import type {
   NumericBoolean,
   NumericString,
   PhpArray,
   StatviewTable,
} from './common.ts';
import type { RosterDraft } from './teams.ts';

/** modulekit `player` category values */
export type PlayerCategory =
   | 'profile'
   | 'media'
   | 'seasonstats'
   | 'mostrecentseasonstats'
   | 'gamebygame';

/** A draft entry with its display text */
export interface PlayerDraft extends RosterDraft {
   /** e.g. "Ottawa (PWHL) 2025 Round: 5 (#37)" */
   draft_text: string;
   draft_logo: string;
   draft_logo_caption: string;
}

/** modulekit `player&category=profile` */
export interface PlayerProfile {
   first_name: string;
   last_name: string;
   name: string;
   jersey_number: NumericString;
   most_recent_team_id: NumericString;
   most_recent_team_name: string;
   most_recent_team_code: string;
   /** Absent for some former players */
   division?: string;
   active: NumericBoolean;
   rookie: NumericBoolean;
   position: string;
   height: string;
   /** "0" or "" when unknown */
   weight: NumericString;
   /** YYYY-MM-DD */
   birthdate: string;
   shoots: string;
   catches: string;
   /** HTML */
   bio: string;
   primary_image: string;
   birthtown: string;
   birthprov: string;
   birthcntry: string;
   hometown: string;
   homeprov: string;
   homecntry: string;
   draft: PlayerDraft[];
   draft_type: string;
   careerhigh: string;
   current_team?: string;
}

/** modulekit `player&category=media` item */
export interface PlayerMedia {
   id: NumericString;
   person_id: NumericString;
   player_id: NumericString;
   /** File type, e.g. "jpg" */
   media_type: string;
   lang_id: NumericString;
   title: string;
   /** "YYYY-MM-DD hh:mm:ss" */
   uploaded: string;
   is_primary: NumericBoolean;
   uploaded_name: string;
   file_name: string;
   modified: string;
   deleted: NumericBoolean;
   height: NumericString;
   width: NumericString;
   invalidation_requested: string;
   last_invalidated_date: string;
   thumb: string;
   url: string;
}

// --- modulekit `seasonstats` ----------------------------------------------

/** Fields every season row has */
interface SeasonRowBase {
   season_id: NumericString;
   season_name: string;
   shortname: string;
   playoff: NumericBoolean;
   career: NumericBoolean;
   /** YYYY-MM-DD */
   max_start_date: string;
   veteran_status: NumericString;
   /** "*" for a veteran season, otherwise "" */
   veteran: string;
   team_name: string;
   team_code: string;
   team_city: string;
   team_nickname: string;
   team_id: NumericString;
   division: string;
}

/** One skater season from `seasonstats` */
export interface SkaterSeasonRow extends SeasonRowBase {
   sopt_track_faceoffs: NumericString;
   jersey_number: NumericString;
   active: NumericBoolean;
   games_played: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   plus_minus: NumericString;
   penalty_minutes: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   shots: NumericString;
   shootout_attempts: NumericString;
   shootout_goals: NumericString;
   shootout_percentage: NumericString;
   shooting_percentage: NumericString;
   shootout_winning_goals: NumericString;
   points_per_game: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   game_winning_goals: NumericString;
   game_tieing_goals: NumericString;
   faceoff_wins: NumericString;
   faceoff_attempts: NumericString;
   faceoff_pct: NumericString;
   hits: NumericString;
   first_goals: NumericString;
   insurance_goals: NumericString;
   overtime_goals: NumericString;
   unassisted_goals: NumericString;
   empty_net_goals: NumericString;
   penalty_minutes_per_game: NumericString;
   /** Seconds */
   ice_time: NumericString;
   /** "mmm:ss" */
   ice_time_minutes_seconds: string;
   shots_blocked_by_player: NumericString;
}

/** One goalie season from `seasonstats` */
export interface GoalieSeasonRow extends SeasonRowBase {
   games_played: NumericString;
   goals_against: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   goals_against_average: NumericString;
   /** Whole minutes */
   minutes_played: NumericString;
   seconds_played: NumericString;
   shots_against: NumericString;
   wins: NumericString;
   losses: NumericString;
   ties: NumericString;
   ot_losses: NumericString;
   total_losses: NumericString;
   shootout_losses: NumericString;
   ot: NumericString;
   /** Shootout save percentage */
   sosavepct: NumericString;
   shootout_shots: NumericString;
   shutouts: NumericString;
   saves: NumericString;
   savepct: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   penalty_minutes: NumericString;
   /** Shootout shooting percentage against */
   shotspct: NumericString;
   gaa: NumericString;
}

/** Turn every non-string field of a season row into a number */
type Totals<Row, Text extends keyof Row> = {
   [K in Exclude<
      keyof Row,
      | Text
      | 'veteran'
      | 'team_name'
      | 'team_code'
      | 'team_city'
      | 'team_nickname'
      | 'team_id'
      | 'division'
      | 'active'
      | 'sopt_track_faceoffs'
   >]: number;
} & { [K in Text]: string };

/**
 * The trailing "Total" row of a skater season list. Counts are numbers;
 * rates stay strings; team fields are absent.
 */
export type SkaterSeasonTotal = Totals<
   SkaterSeasonRow,
   | 'season_name'
   | 'shortname'
   | 'shootout_percentage'
   | 'shooting_percentage'
   | 'points_per_game'
   | 'faceoff_pct'
   | 'penalty_minutes_per_game'
   | 'ice_time_minutes_seconds'
>;

/** The trailing "Total" row of a goalie season list */
export type GoalieSeasonTotal = Totals<
   GoalieSeasonRow,
   | 'season_name'
   | 'shortname'
   | 'goals_against_average'
   | 'sosavepct'
   | 'savepct'
   | 'shotspct'
   | 'gaa'
>;

/** Season rows by game type, each list ending with a "Total" row */
export interface SeasonStats<Row, Total> {
   regular?: Array<Row | Total>;
   playoff?: Array<Row | Total>;
   exhibition?: Array<Row | Total>;
}

/**
 * modulekit `player&category=seasonstats`. `{}` for a player with no
 * games (the feed sends `false`).
 */
export type PlayerSeasonStats =
   | SeasonStats<SkaterSeasonRow, SkaterSeasonTotal>
   | SeasonStats<GoalieSeasonRow, GoalieSeasonTotal>;

// --- modulekit `mostrecentseasonstats` ------------------------------------

interface RecentStatsBase {
   player_id: NumericString;
   first_name: string;
   last_name: string;
   season_id: NumericString;
   season_name: string;
   team_id: NumericString;
   jersey_number: NumericString;
   team_name: string;
   nickname: string;
   division: string;
   games_played: NumericString;
   /** Seconds; "0" for goalies */
   ice_time: NumericString;
   ice_time_avg: NumericString;
   shootout_attempts: NumericString;
   shootout_games_played: NumericString;
   shootout_percentage: NumericString;
}

/** Skater totals for the most recent season */
export interface SkaterRecentStats extends RecentStatsBase {
   game_winning_goals: NumericString;
   game_tieing_goals: NumericString;
   first_goals: NumericString;
   insurance_goals: NumericString;
   unassisted_goals: NumericString;
   empty_net_goals: NumericString;
   overtime_goals: NumericString;
   goals: NumericString;
   shots: NumericString;
   hits: NumericString;
   shooting_percentage: NumericString;
   assists: NumericString;
   points: NumericString;
   points_per_game: NumericString;
   plus_minus: NumericString;
   penalty_minutes: NumericString;
   penalty_minutes_per_game: NumericString;
   minor_penalties: NumericString;
   major_penalties: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   power_play_points: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   short_handed_points: NumericString;
   shootout_goals: NumericString;
   shootout_winning_goals: NumericString;
   faceoff_attempts: NumericString;
   faceoff_wins: NumericString;
   ice_time_minutes_seconds: string;
   shots_blocked_by_player: NumericString;
   faceoff_pct: NumericString;
   /** "wins/attempts" */
   faceoff_wa: string;
   shots_on: NumericString;
}

/** Goalie totals for the most recent season */
export interface GoalieRecentStats extends RecentStatsBase {
   season_shortname: string;
   has_games_played: NumericBoolean;
   minutes_played: NumericString;
   seconds_played: NumericString;
   saves: NumericString;
   shots: NumericString;
   save_percentage: NumericString;
   goals_against: NumericString;
   empty_net_goals_against: NumericString;
   shutouts: NumericString;
   wins: NumericString;
   losses: NumericString;
   ot_losses: NumericString;
   total_losses: NumericString;
   shootout_losses: NumericString;
   shootout_wins: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   ot: NumericString;
   ties: NumericString;
   shots_against_average: NumericString;
   goals_against_average: NumericString;
}

/**
 * modulekit `player&category=mostrecentseasonstats`. `null` when the
 * player has no recent season (the feed sends `""` or `[]`).
 */
export type PlayerRecentStats =
   | SkaterRecentStats
   | GoalieRecentStats
   | null;

// --- modulekit `gamebygame` -----------------------------------------------

interface GameLogBase {
   /** e.g. "November" */
   gMonth: string;
   /** Game id */
   id: NumericString;
   home_team: NumericString;
   visiting_team: NumericString;
   /** YYYY-MM-DD */
   date_played: string;
   /** "1" when the player's team was home */
   home: NumericBoolean;
   home_team_code: string;
   home_team_name: string;
   home_division: string;
   visiting_team_code: string;
   visiting_team_name: string;
   visiting_division: string;
   /** The player's team id */
   player_team: NumericString;
   goals: NumericString;
   assists: NumericString;
   /** A number, unlike goals and assists */
   points: number;
   shootout_shots: NumericString;
}

/** One skater game from `gamebygame` */
export interface SkaterGameLog extends GameLogBase {
   goalie: '0';
   shots: NumericString;
   /** "mm:ss" */
   ice_time_minutes_seconds: string;
   hits: NumericString;
   shots_blocked_by_player: NumericString;
   /** "" when not tracked */
   plusminus: NumericString;
   plus_minus: NumericString | number;
   shootout_goals: NumericString;
   shootout_attempts: NumericString;
   shootout_goals_win: NumericString;
   /** Decimal string, e.g. "2.00" */
   penalty_minutes: NumericString;
   shooting_percentage: NumericString | number;
   shootout_shots_percentage: number;
   power_play_goals: NumericString;
   short_handed_goals: NumericString;
   empty_net_goals: NumericString;
   /** Sic: the feed's spelling */
   insurange_goals: NumericString;
   game_winning_goals: NumericString;
   first_goals_scored: NumericString;
   game_tieing_goals: NumericString;
   faceoffs_taken: NumericString;
   faceoffs_won: NumericString;
}

/** One goalie game from `gamebygame` */
export interface GoalieGameLog extends GameLogBase {
   goalie: '1';
   goals_against: NumericString;
   seconds_played: NumericString;
   win: NumericString;
   tie: NumericString;
   loss: NumericString;
   total_losses: NumericString;
   shutout: NumericString;
   ot_loss: NumericString;
   shootout_loss: NumericString;
   saves: NumericString;
   shots_against: NumericString;
   shootout_saves: NumericString;
   shootout_goals_against: NumericString;
   /** Always "" */
   pim: string;
   gaa: NumericString;
   svpct: NumericString;
   shootout_shots_percentage: NumericString;
   /** Always "" */
   penalty_minutes: string;
   /** "mm:ss" */
   minutes: string;
}

/** modulekit `player&category=gamebygame` */
export interface PlayerGameByGame {
   games: Array<SkaterGameLog | GoalieGameLog>;
   /** season_id is a number here */
   seasons_played: Array<{ season_id: number; season_name: string }>;
}

/** modulekit `searchplayers` item */
export interface PlayerSearchResult {
   person_id: NumericString;
   player_id: NumericString;
   active: NumericBoolean;
   first_name: string;
   last_name: string;
   phonetic_name: string;
   shoots: string;
   catches: string;
   height: string;
   weight: NumericString;
   rawbirthdate: string;
   birthdate: string;
   birthtown: string;
   birthprov: string;
   birthcntry: string;
   /** Team in the matched season */
   team_id: NumericString;
   jersey_number: NumericString;
   role_id: NumericString;
   season_id: NumericString;
   /** e.g. "Player" */
   role_name: string;
   all_roles: string;
   last_team_name: string;
   last_team_code: string;
   division: string;
   position: string;
   /** File name only, not a URL */
   profile_image: string;
   /** Search relevance */
   score: NumericString;
   /** YYYY-MM-DD */
   last_active_date: string;
}

// --- statviewfeed `player` (the site's player page) -----------------------

export interface PlayerPageInfo {
   jerseyNumber: NumericString;
   firstName: string;
   lastName: string;
   playerId: NumericString;
   personId: NumericString;
   position: string;
   shoots: string;
   catches: string;
   height: string;
   height_sans_hyphen: string;
   height_hyphenated: string;
   weight: NumericString;
   birthDate: string;
   profileImage: string;
   teamImage: string;
   bio: string;
   teamName: string;
   nickName: string;
   division: string;
   drafts: PlayerDraft[];
   draft_type: string;
   display_drafts: boolean;
   commitment: boolean;
   currentTeam: string;
   suspension_games_remaining: string;
   birthPlace: string;
   nationality: { name: string; flag_image: string };
   playerType: 'skater' | 'goalie';
   mostRecentTeam: {
      teamName: string;
      teamNickname: string;
      /** "" when unknown */
      jerseyNumber: NumericString;
      teamLogo: string;
   };
}

/** Career row on the player page; the "Total" row has numbers */
export interface SkaterCareerRow {
   season_name: string;
   /** Absent on the "Total" row */
   team_name?: string;
   games_played: NumericString | number;
   goals: NumericString | number;
   assists: NumericString | number;
   points: NumericString | number;
   plus_minus: NumericString | number;
   penalty_minutes: NumericString | number;
   power_play_goals: NumericString | number;
   shots: NumericString | number;
   shootout_attempts: NumericString | number;
   shootout_goals: NumericString | number;
   shootout_percentage: NumericString;
   shooting_percentage: NumericString;
   short_handed_goals: NumericString | number;
   game_winning_goals: NumericString | number;
   faceoff_wins: NumericString | number;
   faceoff_attempts: NumericString | number;
   faceoff_pct: NumericString;
   /** Absent in older seasons */
   shots_blocked_by_player?: NumericString | number;
}

export interface GoalieCareerRow {
   season_name: string;
   team_name?: string;
   games_played: NumericString | number;
   goals_against: NumericString | number;
   goals_against_average: NumericString;
   minutes_played: NumericString | number;
   wins: NumericString | number;
   losses: NumericString | number;
   ot_losses: NumericString | number;
   shootout_losses: NumericString | number;
   shutouts: NumericString | number;
   saves: NumericString | number;
   savepct: NumericString;
   goals: NumericString | number;
   assists: NumericString | number;
   penalty_minutes: NumericString | number;
}

export interface SkaterCurrentSeasonRow {
   season_name: string;
   games_played: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   penalty_minutes: NumericString;
}

export interface GoalieCurrentSeasonRow {
   season_name: string;
   shutouts: NumericString;
   wins: NumericString;
   losses: NumericString;
   ot_losses: NumericString;
   shootout_losses: NumericString;
   savepct: NumericString;
   gaa: NumericString;
}

/** Game row on the player page; empty games hold 0 instead of "0" */
export interface SkaterPageGame {
   date_played: string;
   /** e.g. "MIN @ NY" */
   game: string;
   shots: NumericString | number;
   goals: NumericString | number;
   assists: NumericString | number;
   points: number;
   pp: NumericString | number;
   sh: NumericString | number;
   gw: NumericString | number;
   ice_time_minutes_seconds: string;
   hits: NumericString;
   shots_blocked_by_player: NumericString;
   plusminus: NumericString | number;
   shootout_goals: NumericString;
   shootout_attempts: NumericString;
   penalty_minutes: NumericString;
   faceoffsTaken: number;
   faceoffPercentage: NumericString | number;
}

export interface GoaliePageGame {
   date_played: string;
   game: string;
   goals_against: NumericString;
   win: NumericString;
   loss: NumericString;
   shutout: NumericString;
   ot_loss: NumericString;
   shootout_loss: NumericString;
   saves: NumericString;
   shots_against: NumericString;
   goals: NumericString;
   assists: NumericString;
   gaa: NumericString;
   svpct: NumericString;
   penalty_minutes: NumericString;
   /** "mm:ss" */
   minutes: string;
}

export interface SkaterGameTotals {
   game: 'Totals';
   /** Always "" */
   date_played: string;
   games_played: number;
   goals: number;
   assists: number;
   points: number;
   shots: number;
   penalty_minutes: number;
   plusminus: number;
   plus_minus: number;
   pp: number;
   sh: number;
   /** Empty-net goals */
   en: number;
   /** Insurance goals */
   ig: number;
   /** First goals */
   fg: number;
   /** Game-winning goals */
   gw: number;
   /** Game-tying goals */
   gt: number;
   shootout_goals: number;
   shootout_attempts: number;
   shootout_goals_win: number;
   hits: number;
   shots_blocked_by_player: number;
   fo: number;
   fo_won: number;
   shooting_percentage: NumericString | number;
   faceoffsTaken: number;
   faceoffPercentage: NumericString;
   ice_time_minutes_seconds: string;
}

export interface GoalieGameTotals {
   game: 'Totals';
   date_played: string;
   games_played: number;
   win: number;
   loss: number;
   total_losses: number;
   tie: number;
   ot_loss: number;
   shootout_loss: number;
   shutout: number;
   goals_against: number;
   shots_against: number;
   saves: number;
   seconds_played: number;
   goals: number;
   assists: number;
   points: number;
   penalty_minutes: number;
   gaa: NumericString;
   svpct: NumericString;
   minutes: string;
}

/** A shot on the player page's shot map */
export interface PlayerShot {
   game_id: NumericString;
   x_location: NumericString;
   y_location: NumericString;
   /** Rink orientation, "0" or "1" */
   orientation: NumericString;
}

/** Tables on the player page carry no link data (`prop` is `[]`) */
type PageTable<Row> = Array<StatviewTable<Row, []>>;

interface PlayerPageBase {
   info: PlayerPageInfo;
   /** The league's current season id */
   currentSeason: NumericString;
   playerShots: PlayerShot[];
   /** The season shown */
   seasonId: number;
   seasonStartDate: string;
   seasonEndDate: string;
   opponentTeamIds: number[];
   media: PhpArray<{ images: PlayerMedia[] }>;
   seasons: Array<{ id: number; name: string }>;
   /** Always empty tables */
   playerProfileHeaders: PageTable<never>;
   playerProfileBioHeaders: PageTable<never>;
   showPlayerDraft: null;
   draftInfo: PageTable<{
      draft_round: NumericString;
      draft_year: NumericString;
      draft_rank: NumericString;
      draft_team: string;
      draft_league: string;
      draft_logo: string;
      draft_logo_caption: string;
   }>;
   /** UI labels keyed by stat, e.g. `goals: { abbreviation: "G", ... }` */
   translations: Record<string, { abbreviation: string; fullText: string }>;
   /** Which skater columns the season tracked; absent for goalies */
   display?: {
      plusMinus: boolean;
      shots: boolean;
      shootout: boolean;
      faceoffs: boolean;
   };
   /** UI strings for the site, keyed by label */
   svfLang: Record<string, string>;
}

export interface SkaterPage extends PlayerPageBase {
   careerStats: PageTable<SkaterCareerRow>;
   /** Row is `[]` when the player has no games this season */
   currentSeasonStats: PageTable<PhpArray<SkaterCurrentSeasonRow>>;
   gameByGame: Array<
      StatviewTable<SkaterPageGame, { game: { gameLink: NumericString } }>
   >;
   /** null when the player has no games in the season */
   gameByGameTotals: SkaterGameTotals | null;
}

export interface GoaliePage extends PlayerPageBase {
   careerStats: PageTable<GoalieCareerRow>;
   currentSeasonStats: PageTable<PhpArray<GoalieCurrentSeasonRow>>;
   gameByGame: Array<
      StatviewTable<GoaliePageGame, { game: { gameLink: NumericString } }>
   >;
   gameByGameTotals: GoalieGameTotals | null;
}

/**
 * statviewfeed `player`: profile, career table, game log and shot map for
 * one season. Narrow on `info.playerType`.
 */
export type PlayerPage = SkaterPage | GoaliePage;
