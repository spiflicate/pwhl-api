import type { NumericBoolean, NumericString } from './common.ts';

/** modulekit `teamsbyseason` item */
export interface Team {
   id: NumericString;
   name: string;
   city: string;
   code: string;
   nickname: string;
   team_caption: string;
   division_id: NumericString;
   division_long_name: string;
   division_short_name: string;
   team_logo_url: string;
}

/** A draft entry attached to a roster player */
export interface RosterDraft {
   id: NumericString;
   person_id: NumericString;
   draft_round: NumericString;
   draft_date: string;
   draft_year: NumericString;
   /** Overall pick */
   draft_rank: NumericString;
   draft_team: string;
   draft_team_id: NumericString;
   draft_league: string;
   junior_team: string;
   show_on_roster: NumericBoolean;
   draft_mode: NumericString;
   lang_id: NumericString;
   draft_type_id: NumericString;
   draft_type: string;
   draft_status: string;
}

/** A player row from modulekit `roster` */
export interface RosterPlayer {
   id: NumericString;
   player_id: NumericString;
   /** Same as player_id */
   playerId: NumericString;
   person_id: NumericString;
   active: NumericBoolean;
   first_name: string;
   last_name: string;
   name: string;
   phonetic_name: string;
   display_name: string;
   /** "L", "R" or "" */
   shoots: string;
   /** Goalies only */
   catches?: string;
   hometown: string;
   homeprov: string;
   homecntry: string;
   homeplace: string;
   birthtown: string;
   birthprov: string;
   birthcntry: string;
   birthplace: string;
   /** e.g. "5'6" */
   height: string;
   /** Same as height */
   h: string;
   /** e.g. "5-6" */
   height_hyphenated: string;
   /** "0" or "" when unknown */
   weight: NumericString;
   w: NumericString;
   hidden: NumericBoolean;
   current_team: string;
   /** e.g. "Signed", "Reserve", "Draftee" */
   status: string;
   /** YYYY-MM-DD */
   birthdate: string;
   /** e.g. "'03" */
   birthdate_year: string;
   rawbirthdate: string;
   latest_team_id: NumericString;
   veteran_status: NumericString;
   /** "*" for veterans, otherwise "" */
   veteran_description: string;
   team_id: NumericString;
   team_name: string;
   division: string;
   tp_jersey_number: NumericString;
   rookie: NumericBoolean;
   /** "*" for rookies, otherwise "&nbsp;" */
   isRookie: string;
   position_id: NumericString;
   /** "C", "LW", "RW", "LD", "RD", "F", "D" or "G" */
   position: string;
   nhlteam: string;
   /** e.g. "NY (PWHL) 2025 Round: 1 (#1)", or "" */
   draft_status: string;
   draftinfo: RosterDraft[];
   player_image: string;
}

/** A staff row from modulekit `roster` (coaches and others) */
export interface RosterStaff {
   id: NumericString;
   person_id: NumericString;
   first_name: string;
   last_name: string;
   name: string;
   team_id: NumericString;
   /** e.g. "Head Coach", "General Manager" */
   role: string;
   role_id: NumericString;
   hometown: string;
   homeprov: string;
   jersey_number: NumericString;
   /** YYYY-MM-DD */
   start_date: string;
   end_date: string;
   is_admin: NumericBoolean;
   division: string;
}

/** Roster split into players and staff */
export interface Roster {
   players: RosterPlayer[];
   staff: RosterStaff[];
}

/** One signing, trade or release */
export interface Transaction {
   /** "1" signed, "2" traded from, "3" traded to, "4" retired */
   transaction_type: NumericString;
   /** e.g. "Signed", "Traded to" */
   title: string;
   /** "1" add, "0" remove */
   ttype: NumericBoolean;
   /** "ADD" or "DEL" */
   ttype_text: string;
   /** YYYY-MM-DD */
   transaction_date: string;
   /** "hh:mm:ss" */
   transaction_time: string;
   /** "MM/DD/YYYY" */
   formatted_transaction_date: string;
   timezone: string;
   player_id: NumericString;
   /** Free text, e.g. the other team or contract type */
   response1: string;
   response2: string;
   first_name: string;
   last_name: string;
   /** e.g. "Kelly Babstock (RW)" */
   player_name: string;
   position: string;
   team_id: NumericString;
   team_city: string;
   team_name: string;
   team_code: string;
   division: string;
   team_logo: string;
   detail: string;
}

/** modulekit `statviewtype&type=transactions` */
export interface Transactions {
   transactions: Transaction[];
   num_results: number;
}
