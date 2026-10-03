import type { NumericBoolean, NumericString } from './common.ts';

/** modulekit `player` category values */
export type PlayerCategory =
   | 'profile'
   | 'media'
   | 'seasonstats'
   | 'mostrecentseasonstats'
   | 'gamebygame';

/** modulekit `player&category=profile` */
export interface PlayerProfile {
   first_name: string;
   last_name: string;
   name: string;
   jersey_number: string;
   most_recent_team_id: NumericString;
   most_recent_team_name: string;
   most_recent_team_code: string;
   position: string;
   shoots: string;
   catches: string;
   height: string;
   weight: string;
   birthdate: string;
   birthtown: string;
   birthprov: string;
   birthcntry: string;
   active: NumericBoolean;
   rookie: NumericBoolean;
   bio: string;
   primary_image: string;
   draft: unknown[];
   [key: string]: unknown;
}

/**
 * One season row from `seasonstats`. The last row of each list is a
 * "Total" row that can carry numbers instead of strings.
 */
export interface PlayerSeasonRow {
   season_id?: NumericString;
   season_name: string;
   team_id?: NumericString;
   team_name?: string;
   games_played: NumericString | number;
   [key: string]: unknown;
}

/** modulekit `player&category=seasonstats` */
export interface PlayerSeasonStats {
   regular?: PlayerSeasonRow[];
   playoff?: PlayerSeasonRow[];
   exhibition?: PlayerSeasonRow[];
   [key: string]: unknown;
}

/** modulekit `player&category=gamebygame` */
export interface PlayerGameByGame {
   games: Array<{
      id: NumericString;
      date_played: string;
      home: NumericBoolean;
      goals: NumericString;
      assists: NumericString;
      points: NumericString;
      [key: string]: unknown;
   }>;
   seasons_played: Array<{ season_id: NumericString; season_name: string }>;
}

/** modulekit `player&category=media` item */
export interface PlayerMedia {
   id: NumericString;
   media_type: string;
   title: string;
   url: string;
   thumb: string;
   is_primary: NumericBoolean;
   [key: string]: unknown;
}
