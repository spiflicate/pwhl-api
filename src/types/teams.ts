import type { NumericBoolean, NumericString } from './common.ts';

/** modulekit `teamsbyseason` item */
export interface Team {
   id: NumericString;
   name: string;
   city: string;
   code: string;
   nickname: string;
   division_id: NumericString;
   division_long_name: string;
   team_logo_url: string;
   [key: string]: unknown;
}

/** A player row from modulekit `roster` */
export interface RosterPlayer {
   player_id: NumericString;
   person_id: NumericString;
   first_name: string;
   last_name: string;
   name: string;
   tp_jersey_number: string;
   /** "F", "D" or "G" */
   position: string;
   shoots: string;
   catches?: string;
   birthdate: string;
   height: string;
   rookie: NumericBoolean;
   player_image: string;
   [key: string]: unknown;
}

/** A staff row from modulekit `roster` (coaches and others) */
export interface RosterStaff {
   person_id?: NumericString;
   first_name?: string;
   last_name?: string;
   name?: string;
   [key: string]: unknown;
}

/** Roster split into players and staff */
export interface Roster {
   players: RosterPlayer[];
   staff: RosterStaff[];
}
