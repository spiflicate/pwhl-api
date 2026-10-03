/**
 * Shared wire types.
 *
 * Types mirror the feed as it arrives: nearly every scalar is a string.
 * Use the helpers in `normalize` to convert values.
 */

/** "1" true, "0" false */
export type NumericBoolean = '1' | '0';

/** Numeric value sent as a string, e.g. "8" or "0.955" */
export type NumericString = string;

/** Game status codes shared by schedule, scorebar and gc */
export const GameStatus = {
   NotStarted: '1',
   InProgress: '2',
   UnofficialFinal: '3',
   Final: '4',
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

/** statviewfeed table layout: sections of `{ row, prop }` items */
export interface StatviewTable<Row, Prop = Record<string, unknown>> {
   sections: StatviewSection<Row, Prop>[];
}

export interface StatviewSection<Row, Prop = Record<string, unknown>> {
   title: string;
   headers: Record<string, unknown>;
   data: Array<{ row: Row; prop: Prop }>;
}
