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

/** statviewfeed `bootstrap`: page config and current ids */
export interface Bootstrap {
   current_league_id: NumericString;
   current_season_id: NumericString;
   leagues: Array<Record<string, unknown>>;
   seasons: Array<{
      id: NumericString;
      name: string;
      start_date: string;
      hide_in_standings?: boolean;
      [key: string]: unknown;
   }>;
   conferences: Array<Record<string, unknown>>;
   divisions: Array<Record<string, unknown>>;
   /** First entry is `{ id: "-1", name: "All Teams" }` */
   teams: Array<Record<string, unknown>>;
   teamsNoAll: Array<{
      id: NumericString;
      name: string;
      nickname: string;
      team_code: string;
      [key: string]: unknown;
   }>;
   months: Array<Record<string, unknown>>;
   positions: Array<Record<string, unknown>>;
   goalies: Array<Record<string, unknown>>;
   cdnAssetsUrl?: string;
   firebaseUrl?: string;
   firebaseApiKey?: string;
   [key: string]: unknown;
}
