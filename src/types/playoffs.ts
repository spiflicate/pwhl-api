import type { NumericString } from './common.ts';

/** One series in a playoff round */
export interface BracketMatchup {
   series_letter: string;
   team1: NumericString;
   team2: NumericString;
   /** Wins are numbers; everything else is a string */
   team1_wins: number;
   team2_wins: number;
   winner: string;
   /** "N/A" when unset */
   feeder_series1: string;
   /** "N/A" when unset */
   feeder_series2: string;
   games: Array<Record<string, unknown>>;
   [key: string]: unknown;
}

export interface BracketRound {
   round: NumericString;
   round_name: string;
   round_type_name: string;
   matchups: BracketMatchup[];
   [key: string]: unknown;
}

/** modulekit `brackets` */
export interface Bracket {
   teams: Record<string, Record<string, unknown>>;
   rounds: BracketRound[];
   logo?: string;
   [key: string]: unknown;
}
