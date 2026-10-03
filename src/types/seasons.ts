import type { NumericBoolean, NumericString } from './common.ts';

/** modulekit `seasons` item */
export interface Season {
   season_id: NumericString;
   season_name: string;
   shortname: string;
   career: NumericBoolean;
   playoff: NumericBoolean;
   /** YYYY-MM-DD */
   start_date: string;
   /** YYYY-MM-DD */
   end_date: string;
}

/** statviewfeed `bootstrap`: site config, current ids and filter lists */
export interface Bootstrap {
   firebaseUrl: string;
   firebaseApiKey: string;
   current_league_id: NumericString;
   current_season_id: NumericString;
   leagues: {
      id: NumericString;
      name: string;
      short_name: string;
      code: string;
      logo_image: string;
   }[];
   seasons: {
      id: NumericString;
      name: string;
      default_sort: string;
      start_date: string;
      hide_in_standings: boolean;
   }[];
   conferences: {
      conference_id: NumericString;
      conference_name: string;
   }[];
   /** Like `conferences`, with an "All" entry first */
   conferencesAll: {
      conference_id: number | NumericString;
      conference_name: string;
   }[];
   divisions: {
      id: NumericString;
      name: string;
      conference_id: NumericString;
   }[];
   /** Like `divisions`, with an "All" entry first */
   divisionsAll: {
      id: number | NumericString;
      name: string;
      conference_id: null | NumericString;
   }[];
   first_season_year: NumericString;
   regularSeasons: {
      id: NumericString;
      name: string;
   }[];
   playoffSeasons: {
      id: NumericString;
      name: string;
   }[];
   /** First entry is `{ id: -1, name: "All Teams" }` */
   teams: {
      id: number | NumericString;
      name: string;
      nickname?: string;
      team_code?: string;
      division_id?: NumericString;
      logo?: string;
   }[];
   teamsNoAll: {
      id: NumericString;
      name: string;
      nickname: string;
      team_code: string;
      division_id: NumericString;
      logo: string;
   }[];
   months: {
      id: number;
      name: string;
   }[];
   monthsAll: {
      id: number;
      name: string;
   }[];
   positions: {
      id: string;
      name: string;
   }[];
   goalies: {
      id: string;
      name: string;
   }[];
   /** Always empty in captures */
   rosterstatus: unknown[];
   standingsFooter: string;
   rosterFooter: string;
   playerStatsFooter: string;
   showExpandedGoaliesOption: boolean;
   showRosterStatus: null;
   /** Always empty in captures */
   quickViews: unknown[];
   dailySchedRefreshToggle: boolean;
   dailySchedChangeoverHour: number;
   playerNoPicLogoOverride: string;
   svfConfig: {
      daily_schedule: {
         show_ad: boolean;
         showScheduleButton: boolean;
      };
      environment: {
         isLive: boolean;
      };
      hockeytv_url: string;
      'game-summary': {
         'hide-official-numbers': boolean;
      };
      goalie_stats: {
         showExpandedGoaliesOption: boolean;
      };
      schedule: {
         showScheduleButton: boolean;
      };
      liveScoreUpdates: boolean;
      player: {
         show_draft_info: boolean;
      };
      'game-center': {
         show_toi_on_roster: boolean;
         show_blocked_shots_on_roster: boolean;
         show_hits_on_roster: boolean;
         show_faceoffs_on_roster: boolean;
         hide_pts_on_team_stats: boolean;
         show_faceoffs_on_team_stats: boolean;
      };
      link_coaches: boolean;
      roster: {
         alternate_roster_title: boolean;
      };
      scorebar: {
         use_french_time_format: boolean;
         smart_calendar_link: boolean;
      };
      game_summary: {
         hidePlayerPlusMinus: boolean;
         hidePlayerShots: boolean;
      };
   };
   svfLanguages: string[];
   /** UI strings for the site, keyed by label */
   svfLang: Record<string, string>;
   player_shot_heat_map: boolean;
   cdnAssetsUrl: string;
}
