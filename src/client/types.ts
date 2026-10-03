/**
 * Client type definitions
 */

import type { PWHLError } from '#/errors/index.ts';

export type APIResult<T> =
   | { success: true; data: T }
   | { success: false; error: PWHLError };

/** Query parameter values accepted by the client */
export type QueryValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryValue>;

/**
 * Describes one HockeyTech endpoint. HockeyTech routes by query string,
 * so an endpoint is a feed plus a view or tab rather than a URL path.
 */
export type Endpoint =
   | {
        /** Classic SiteKit API: `{ SiteKit: { <dataKey>: ... } }` */
        feed: 'modulekit';
        view: string;
        /** Key under `SiteKit` that holds the data, e.g. `Seasons` */
        dataKey: string;
     }
   | {
        /** Game Center: `{ GC: { <dataKey>: ... } }` */
        feed: 'gc';
        tab: string;
        /** Key under `GC` that holds the data, e.g. `Gamesummary` */
        dataKey: string;
     }
   | {
        /** Stats-page feed: JSONP-wrapped body, returned as-is */
        feed: 'statviewfeed';
        view: string;
     };
