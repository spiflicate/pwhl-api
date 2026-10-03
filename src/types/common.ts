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

/**
 * PHP serializes an empty associative array as `[]`, so objects that can
 * be empty arrive as either the object or an empty array.
 */
export type PhpArray<T> = T | [];

/** Column metadata for a statviewfeed table */
export interface StatviewHeader {
   properties: {
      /** Row key the column shows */
      key: string;
      hidden: boolean;
      /** CSS classes, e.g. "hide-mobile" */
      class: string;
      /** Short label, e.g. "GP" */
      label: string;
      /** Long label, e.g. "Games Played" */
      title: string;
      sortable: boolean;
      align: string;
      highlight: boolean;
      sortKey: string;
   };
}

/** statviewfeed table layout: sections of `{ prop, row }` items */
export interface StatviewTable<Row, Prop, Extra = unknown> {
   sections: StatviewSection<Row, Prop, Extra>[];
}

export interface StatviewSection<Row, Prop, Extra = unknown> {
   /** "" for single-section tables */
   title: string;
   /** Column metadata keyed by row key */
   headers: Record<string, StatviewHeader>;
   data: Array<{ prop: Prop; row: Row } & Extra>;
}
