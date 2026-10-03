import type {
   NumericBoolean,
   NumericString,
   StatviewTable,
} from './common.ts';

// --- statviewfeed `players` (the site's stats tables) ---------------------

/** Fields every statviewfeed `players` row has */
interface StatRowBase {
   player_id: NumericString;
   name: string;
   /** "" for some players who left the league */
   active: NumericBoolean | '';
   rookie: NumericBoolean | '';
   team_code: string;
   games_played: NumericString;
   /** The only numeric value in a row */
   rank: number;
}

/** statviewfeed `players` row for skaters, `statsType=standard` */
export interface SkaterStatRow extends StatRowBase {
   /** "" when unknown */
   position: string;
   goals: NumericString;
   shots: NumericString;
   /** Absent in seasons before hits were tracked */
   hits?: NumericString;
   shots_blocked_by_player: NumericString;
   /** Total ice time, "mmm:ss"; absent before ice time was tracked */
   ice_time_minutes_seconds?: string;
   shooting_percentage: NumericString;
   assists: NumericString;
   points: NumericString;
   points_per_game: NumericString;
   plus_minus: NumericString;
   penalty_minutes: NumericString;
   penalty_minutes_per_game: NumericString;
   /** Average ice time, "mm:ss" */
   ice_time_per_game_avg?: string;
   hits_per_game_avg?: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   faceoff_attempts: NumericString;
   faceoff_wins: NumericString;
   faceoff_pct: NumericString;
   /** Present in seasons that tracked shootouts */
   shootout_goals?: NumericString;
   shootout_attempts?: NumericString;
   shootout_winning_goals?: NumericString;
   shootout_percentage?: NumericString;
}

/** statviewfeed `players` row for skaters, `statsType=expanded` */
export interface SkaterExpandedStatRow extends StatRowBase {
   position: string;
   game_winning_goals: NumericString;
   first_goals: NumericString;
   insurance_goals: NumericString;
   unassisted_goals: NumericString;
   empty_net_goals: NumericString;
   overtime_goals: NumericString;
   goals: NumericString;
   shots: NumericString;
   shooting_percentage: NumericString;
   assists: NumericString;
   points: NumericString;
   plus_minus: NumericString;
   penalty_minutes: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   shootout_goals: NumericString;
   shootout_attempts: NumericString;
   shootout_winning_goals: NumericString;
   shootout_percentage: NumericString;
}

/** statviewfeed `players` row for goalies */
export interface GoalieStatRow extends StatRowBase {
   /** "mmmm:ss" */
   minutes_played: string;
   saves: NumericString;
   shots: NumericString;
   /** e.g. "0.955" */
   save_percentage: NumericString;
   goals_against: NumericString;
   shutouts: NumericString;
   wins: NumericString;
   losses: NumericString;
   ot_losses: NumericString;
   shootout_losses?: NumericString;
   shootout_goals_against: NumericString;
   shootout_attempts: NumericString;
   goals: NumericString;
   assists: NumericString;
   penalty_minutes: NumericString;
   shootout_percentage: NumericString;
   goals_against_average: NumericString;
}

/** Per-team split of a skater who played for several teams */
export interface SkaterTeamSplit {
   player_id: NumericString;
   active: NumericBoolean;
   team_code: string;
   games_played: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   penalty_minutes: NumericString;
   plus_minus: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   position: string;
   shots: NumericString;
   shooting_percentage: NumericString;
   points_per_game: NumericString;
   penalty_minutes_per_game: NumericString;
   faceoff_attempts: NumericString;
   faceoff_wins: NumericString;
   faceoff_pct: NumericString;
   /** Always "&nbsp;" */
   name: string;
   shootout_goals?: NumericString;
   shootout_winning_goals?: NumericString;
   shootout_attempts?: NumericString;
   shootout_percentage?: NumericString;
}

/** Per-team split of a skater, `statsType=expanded` */
export interface SkaterExpandedTeamSplit {
   player_id: NumericString;
   active: NumericBoolean;
   team_code: string;
   games_played: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   penalty_minutes: NumericString;
   plus_minus: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   unassisted_goals: NumericString;
   game_winning_goals: NumericString;
   position: string;
   shots: NumericString;
   shooting_percentage: NumericString;
   first_goals: NumericString;
   insurance_goals: NumericString;
   empty_net_goals: NumericString;
   overtime_goals: NumericString;
   shootout_goals: NumericString;
   shootout_winning_goals: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   /** Always "&nbsp;" */
   name: string;
}

/** Per-team split of a goalie who played for several teams */
export interface GoalieTeamSplit {
   player_id: NumericString;
   active: NumericBoolean;
   rookie: NumericBoolean;
   team_code: string;
   games_played: NumericString;
   minutes_played: string;
   saves: NumericString;
   shots: NumericString;
   save_percentage: NumericString;
   goals_against: NumericString;
   shutouts: NumericString;
   wins: NumericString;
   losses: NumericString;
   ot_losses: NumericString;
   shootout_losses: NumericString;
   shootout_goals_against: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   goals_against_average: NumericString;
   /** Always "&nbsp;" */
   name: string;
}

/** Link ids that accompany each row */
export interface StatRowProp {
   name: { playerLink: NumericString; seoName: string };
   active: { active: NumericBoolean | '' };
   rookie: { rookie: NumericBoolean | '' };
   team_code: { teamLink: NumericString };
}

/** One player in a stats table */
export interface StatEntry<Row, Split> {
   row: Row;
   prop: StatRowProp;
   /** Per-team rows, present when the player played for several teams */
   teams?: Split[];
}

/** Raw statviewfeed `players` response */
export type PlayerStatsTable<Row, Split> = Array<
   StatviewTable<Row, StatRowProp, { teams?: Split[] }>
>;

// --- modulekit `statviewtype` leaders and team stats ----------------------

/** Biographical fields shared by modulekit leader rows */
interface LeaderBio {
   player_id: NumericString;
   /** e.g. "A. Roque" */
   shortname: string;
   first_name: string;
   last_name: string;
   name: string;
   phonetic_name: string;
   height: string;
   /** "" or "0" when unknown */
   weight: NumericString;
   position: string;
   suspension_games_remaining: string;
   suspension_indefinite: string;
   veteran: NumericString;
   draft_eligible: NumericString;
   jersey_number: NumericString;
   shoots: string;
   team_name: string;
   team_code: string;
   team_id: NumericString;
   division: string;
   /** e.g. "Sep 25, 1997" */
   birthdate: string;
   /** e.g. "'97" */
   birthdate_year: string;
   age: NumericString;
   hometown: string;
   homeprov: string;
   homecntry: string;
   birthtown: string;
   birthprov: string;
   birthcntry: string;
   hometownprov: string;
   homeplace: string;
   games_played: NumericString;
   /** Seconds */
   ice_time: NumericString;
   ice_time_avg: NumericString;
   /** Always "" */
   loose_ball_recoveries: string;
   /** Always "" */
   caused_turnovers: string;
   /** Always "" */
   turnovers: string;
   shootout_games_played: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   latest_team_id: NumericString;
   /** Number of teams played for this season */
   num_teams: NumericString;
   /** Team logo URL */
   logo: string;
   rank: number;
   namelink: string;
   /** 1 on the combined row of a player with `team_breakdown` */
   is_total?: number;
}

/** Skater row from modulekit leaders and team stats */
export interface SkaterLeaderBase extends LeaderBio {
   active: NumericBoolean | '';
   rookie: NumericBoolean | '';
   last_years_club: string;
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
   shots_blocked_by_player: NumericString;
   /** "mmm:ss" */
   ice_time_minutes_seconds: string;
   shooting_percentage: NumericString;
   assists: NumericString;
   points: NumericString;
   points_per_game: NumericString;
   plus_minus: NumericString;
   penalty_minutes: NumericString;
   penalty_minutes_per_game: NumericString;
   /** "mm:ss" */
   ice_time_per_game_avg: string;
   hits_per_game_avg: NumericString;
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
   faceoff_pct: NumericString;
   /** "wins/attempts" */
   faceoff_wa: string;
   shots_on: NumericString;
   team_breakdown?: SkaterLeaderTeamSplit[];
}

/** Per-team split on a modulekit skater row */
export interface SkaterLeaderTeamSplit {
   player_id: NumericString;
   active: NumericBoolean;
   team_id: NumericString;
   team_name: string;
   team_code: string;
   division: string;
   jersey_number: NumericString;
   games_played: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   /** YYYY-MM-DD */
   eff_start_date: string;
   /** Day number, not a date */
   eff_end_date: NumericString;
   penalty_minutes: NumericString;
   plus_minus: NumericString;
   power_play_goals: NumericString;
   power_play_assists: NumericString;
   short_handed_goals: NumericString;
   short_handed_assists: NumericString;
   unassisted_goals: NumericString;
   game_winning_goals: NumericString;
   game_tieing_goals: NumericString;
   position: string;
   suspension_games_remaining: string;
   shots: NumericString;
   loose_ball_recoveries: string;
   caused_turnovers: string;
   turnovers: string;
   shooting_percentage: NumericString;
   first_goals: NumericString;
   insurance_goals: NumericString;
   empty_net_goals: NumericString;
   overtime_goals: NumericString;
   shootout_goals: NumericString;
   shootout_winning_goals: NumericString;
   shootout_games_played: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   points_per_game: NumericString;
   penalty_minutes_per_game: NumericString;
   shots_on: NumericString;
   faceoff_attempts: NumericString;
   faceoff_wins: NumericString;
   faceoff_pct: NumericString;
   faceoff_wa: string;
   /** Team code */
   name: string;
   namelink: string;
   /** HTML link */
   teamlink: string;
}

/** Goalie row from modulekit leaders and team stats */
export interface GoalieLeaderBase extends LeaderBio {
   active: NumericBoolean;
   rookie: NumericBoolean;
   /** YYYY-MM-DD */
   start_date: string;
   catches: string;
   has_games_played: NumericBoolean;
   /** "mmm:ss" */
   minutes_played: string;
   /** Whole minutes */
   minutes_played_g: NumericString;
   seconds_played: NumericString;
   saves: NumericString;
   shots: NumericString;
   save_percentage: NumericString;
   goals_against: NumericString;
   empty_net_goals_against: NumericString;
   shutouts: NumericString;
   wins: NumericString;
   losses: NumericString;
   regulation_losses: NumericString;
   non_reg_losses: NumericString;
   regulation_wins: NumericString;
   ot_wins: NumericString;
   non_reg_wins: NumericString;
   ot_losses: NumericString;
   total_losses: NumericString;
   shootout_losses: NumericString;
   shootout_wins: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   goals: NumericString;
   assists: NumericString;
   points: NumericString;
   penalty_minutes: NumericString;
   /** Overtime decisions */
   ot: NumericString;
   ties: NumericString;
   shots_against_average: NumericString;
   goals_against_average: NumericString;
   team_breakdown?: GoalieLeaderTeamSplit[];
}

/** Per-team split on a modulekit goalie row */
export interface GoalieLeaderTeamSplit {
   player_id: NumericString;
   active: NumericBoolean;
   rookie: NumericBoolean;
   season_id: NumericString;
   team_id: NumericString;
   team_code: string;
   team_name: string;
   position: string;
   suspension_games_remaining: string;
   jersey_number: NumericString;
   games_played: NumericString;
   minutes_played: string;
   seconds_played: NumericString;
   saves: NumericString;
   empty_net_goals_against: NumericString;
   shots: NumericString;
   save_percentage: NumericString;
   goals_against: NumericString;
   shutouts: NumericString;
   ice_time: NumericString;
   ice_time_avg: NumericString;
   wins: NumericString;
   losses: NumericString;
   regulation_losses: NumericString;
   non_reg_losses: NumericString;
   regulation_wins: NumericString;
   ot_wins: NumericString;
   non_reg_wins: NumericString;
   ot_losses: NumericString;
   shootout_games_played: NumericString;
   shootout_losses: NumericString;
   shootout_wins: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   ties: NumericString;
   shots_against_average: NumericString;
   goals_against_average: NumericString;
   ot: NumericString;
   eff_start_date: string;
   eff_end_date: NumericString;
   name: string;
   namelink: string;
   teamlink: string;
}

/** Links on rows from the league-wide leader lists */
interface LeaderLinks {
   /** leaguestat.com player page */
   player_page_link: string;
   /** HTML link to the team page */
   teamlink: string;
   /** 60x60 headshot URL */
   photo: string;
}

/** modulekit `statviewtype&type=topscorers` row, also `combinedplayers` */
export interface TopScorer extends SkaterLeaderBase, LeaderLinks {}

/** modulekit `statviewtype&type=topgoalies` row, also `combinedplayers` */
export interface TopGoalie extends GoalieLeaderBase, LeaderLinks {}

/** modulekit `statviewtype&type=skaters` row (one team's skaters) */
export interface TeamSkaterStats extends SkaterLeaderBase {
   /** 240x240 headshot URL */
   player_image: string;
   /** leaguestat.com player page */
   player_page_link: string;
   /** HTML link to the team page */
   teamlink: string;
}

/** modulekit `statviewtype&type=goalies` player row */
export interface TeamGoalieStats extends GoalieLeaderBase {
   player_image: string;
}

/** The "Empty Net" pseudo-row of a team's goalie stats */
export interface TeamEmptyNetStats {
   name: 'Empty Net ';
   namelink: 'Empty Net ';
   /** 0 when the team never pulled its goalie */
   games_played: NumericString | number;
   seconds_played: NumericString;
   goals_against: NumericString | number;
   average: NumericString;
   goals_against_average: NumericString;
   shots: NumericString | number;
   /** "m:ss" */
   minutes_played: string;
}

/** The "Totals" pseudo-row of a team's goalie stats */
export interface TeamGoalieTotals {
   name: 'Totals ';
   namelink: 'Totals ';
   'int-kit-name': string;
   games_played: NumericString;
   /** Whole minutes */
   minutes_played: number;
   seconds_played: NumericString;
   saves: NumericString;
   shots: NumericString;
   save_percentage: NumericString;
   goals_against: NumericString;
   empty_net_goals_against: NumericString;
   shutouts: NumericString | number;
   wins: NumericString;
   losses: NumericString;
   ot_losses: NumericString;
   shootout_games_played: NumericString;
   shootout_losses: NumericString;
   shootout_wins: NumericString;
   shootout_goals_against: NumericString;
   shootout_saves: NumericString;
   shootout_attempts: NumericString;
   shootout_percentage: NumericString;
   ties: NumericString;
   shots_against_average: NumericString;
   average: NumericString;
   goals_against_average: NumericString;
}

/** Rows of a team's goalie stats: goalies, then the two pseudo-rows */
export type TeamGoalieStatsRow =
   | TeamGoalieStats
   | TeamEmptyNetStats
   | TeamGoalieTotals;

/** modulekit `combinedplayers&type=skaters`: top players per category */
export interface SkaterCategoryLeaders {
   goals: TopScorer[];
   assists: TopScorer[];
   points: TopScorer[];
   power_play_goals: TopScorer[];
   power_play_assists: TopScorer[];
   short_handed_goals: TopScorer[];
   short_handed_assists: TopScorer[];
   game_winning_goals: TopScorer[];
   first_goals: TopScorer[];
   insurance_goals: TopScorer[];
   overtime_goals: TopScorer[];
   penalty_minutes: TopScorer[];
   plus_minus: TopScorer[];
   shootout_games_played: TopScorer[];
   rookie_scoring: TopScorer[];
   shots: TopScorer[];
}

/** modulekit `combinedplayers&type=goalies`: top goalies per category */
export interface GoalieCategoryLeaders {
   goals_against_average: TopGoalie[];
   save_percentage: TopGoalie[];
   wins: TopGoalie[];
   shutouts: TopGoalie[];
}

/** modulekit `statviewtype&type=streaks` row: a point streak */
export interface PointStreak {
   id: NumericString;
   player_id: NumericString;
   rookie: NumericBoolean;
   /** e.g. "May 10, 2026" */
   first_game_date: string;
   last_game_date: string;
   first_name: string;
   last_name: string;
   name: string;
   /** Games in the streak */
   length: NumericString;
   goals: NumericString;
   assists: NumericString;
   has_split: NumericBoolean;
   games_played: NumericString;
   /** "1" while the streak is still running */
   ongoing: NumericBoolean;
   points: NumericString;
   streak_start_team_id: NumericString;
   streak_end_team_id: NumericString;
   num_teams: NumericString;
   division_short_name: string;
   division_long_name: string;
   rank: NumericString;
   team_name: string;
   team_city: string;
   team_code: string;
   team_nickname: string;
}

// --- statviewfeed `leadersExtended` ---------------------------------------

/** One leader in a statviewfeed leader list */
export interface Leader {
   rank: number;
   player_id: NumericString;
   jersey_number: NumericString;
   name: string;
   team_id: NumericString;
   team_name: string;
   team_code: string;
   team_logo: string;
   team_logo_small: string;
   /** The stat as displayed, e.g. "8" or "0.944" */
   stat_formatted: NumericString;
   /** Category name, e.g. "Points" */
   type_formatted: string;
   /** 120x160 headshot URL */
   photo: string;
   photo_small: string;
   position: string;
   division: string;
}

export interface LeaderList {
   results: Leader[];
   /** Sort key for the full stats table, e.g. "points" */
   sortKey: string;
}

/** statviewfeed `leadersExtended`, keyed by display name */
export interface Leaders {
   skaters: {
      Points: LeaderList;
      Goals: LeaderList;
      Assists: LeaderList;
   };
   goalies: {
      Wins: LeaderList;
      'Save Percentage': LeaderList;
      'Goals Against Average': LeaderList;
   };
}
