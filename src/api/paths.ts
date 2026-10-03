/**
 * Internal map from library functions to HockeyTech feed endpoints.
 *
 * The public API is grouped by domain; which feed serves each function
 * is an implementation detail kept here.
 */

import type { Endpoint } from '#/client/types.ts';

export const seasonPaths = {
   list: { feed: 'modulekit', view: 'seasons', dataKey: 'Seasons' },
   bootstrap: { feed: 'statviewfeed', view: 'bootstrap' },
} as const satisfies Record<string, Endpoint>;

export const schedulePaths = {
   season: { feed: 'modulekit', view: 'schedule', dataKey: 'Schedule' },
   scorebar: { feed: 'modulekit', view: 'scorebar', dataKey: 'Scorebar' },
   day: { feed: 'modulekit', view: 'gamesbydate', dataKey: 'Gamesbydate' },
   gameDays: {
      feed: 'modulekit',
      view: 'gamesperday',
      dataKey: 'Gamesperday',
   },
} as const satisfies Record<string, Endpoint>;

export const teamPaths = {
   bySeason: {
      feed: 'modulekit',
      view: 'teamsbyseason',
      dataKey: 'Teamsbyseason',
   },
   roster: { feed: 'modulekit', view: 'roster', dataKey: 'Roster' },
   stats: {
      feed: 'modulekit',
      view: 'statviewtype',
      dataKey: 'Statviewtype',
   },
} as const satisfies Record<string, Endpoint>;

export const playerPaths = {
   player: { feed: 'modulekit', view: 'player', dataKey: 'Player' },
   search: {
      feed: 'modulekit',
      view: 'searchplayers',
      dataKey: 'Searchplayers',
   },
   page: { feed: 'statviewfeed', view: 'player' },
   transactions: {
      feed: 'modulekit',
      view: 'statviewtype',
      dataKey: 'Statviewtype',
   },
} as const satisfies Record<string, Endpoint>;

export const statsPaths = {
   players: { feed: 'statviewfeed', view: 'players' },
   leaders: { feed: 'statviewfeed', view: 'leadersExtended' },
   statviewtype: {
      feed: 'modulekit',
      view: 'statviewtype',
      dataKey: 'Statviewtype',
   },
   categoryLeaders: {
      feed: 'modulekit',
      view: 'combinedplayers',
      dataKey: 'Combinedplayers',
   },
} as const satisfies Record<string, Endpoint>;

export const standingsPaths = {
   season: {
      feed: 'modulekit',
      view: 'statviewtype',
      dataKey: 'Statviewtype',
   },
   table: { feed: 'statviewfeed', view: 'teams' },
} as const satisfies Record<string, Endpoint>;

export const playoffPaths = {
   bracket: { feed: 'modulekit', view: 'brackets', dataKey: 'Brackets' },
} as const satisfies Record<string, Endpoint>;

export const gamePaths = {
   summary: { feed: 'gc', tab: 'gamesummary', dataKey: 'Gamesummary' },
   playByPlay: { feed: 'gc', tab: 'pxpverbose', dataKey: 'Pxpverbose' },
   clock: { feed: 'gc', tab: 'clock', dataKey: 'Clock' },
   preview: { feed: 'gc', tab: 'preview', dataKey: 'Preview' },
   ticker: { feed: 'gc', tab: 'pxp', dataKey: 'Pxp' },
   boxScore: { feed: 'statviewfeed', view: 'gameSummary' },
   events: { feed: 'statviewfeed', view: 'gameCenterPlayByPlay' },
   matchup: { feed: 'statviewfeed', view: 'gameCenterPreview' },
} as const satisfies Record<string, Endpoint>;

/** Short label for an endpoint, used in validation error context */
export function label(endpoint: Endpoint, type?: string): string {
   const base =
      endpoint.feed === 'gc'
         ? `gc/${endpoint.tab}`
         : `${endpoint.feed}/${endpoint.view}`;
   return type ? `${base}/${type}` : base;
}
