/**
 * @module api/live
 * @description Live game data from LeagueStat's Firebase feed: the running
 * clock, published clock, goals and shot and penalty summaries. Each
 * section is read once with its own function, or followed with `watch`.
 *
 * A game appears in a section only once the scorekeeper publishes data for
 * it, so reads return `null` before then (and for unknown ids).
 */

import {
   livePath,
   liveUrl,
   read,
   type StreamOptions,
   stream,
} from '#/client/firebase.ts';
import type { APIResult } from '#/client/types.ts';
import type { LiveSection, LiveSections } from '#/types/index.ts';
import { GameId, validate } from '#/utils/schemas.ts';

async function section<S extends LiveSection>(
   name: S,
   gameId: number | string,
): Promise<APIResult<LiveSections[S] | null>> {
   const v = validate(GameId, gameId, `live.${name}`);
   if (!v.ok) return v.result;
   return read(livePath(name, v.value));
}

/** Running clock of one game, updated as it ticks */
export function runningClock(gameId: number | string) {
   return section('runningclock', gameId);
}

/** Running clocks of every game the feed holds, keyed by game id */
export function runningClocks(): Promise<
   APIResult<Record<string, LiveSections['runningclock']> | null>
> {
   return read('runningclock/games');
}

/** Clock as last published, with period name and progress string */
export function publishedClock(gameId: number | string) {
   return section('publishedclock', gameId);
}

/** Goal totals, goals by period and power plays */
export function goalsSummary(gameId: number | string) {
   return section('goalssummary', gameId);
}

/** Penalty summary */
export function penaltiesSummary(gameId: number | string) {
   return section('penaltiessummary', gameId);
}

/** Shot totals */
export function shotsSummary(gameId: number | string) {
   return section('shotssummary', gameId);
}

/** Every goal scored so far, with scorer */
export function goals(gameId: number | string) {
   return section('goals', gameId);
}

export interface WatchOptions extends StreamOptions {
   /** Stops the watch when aborted */
   signal?: AbortSignal;
}

/**
 * Follow one game's section and call `onData` with the whole value each
 * time it changes (`null` until the game appears). Uses Firebase's REST
 * event stream, so updates arrive as the scorekeeper sends them.
 * Reconnects after errors. Returns a function that stops the watch.
 */
export function watch<S extends LiveSection>(
   name: S,
   gameId: number | string,
   onData: (data: LiveSections[S] | null) => void,
   options: WatchOptions = {},
): () => void {
   const controller = new AbortController();
   const stop = () => controller.abort();
   options.signal?.addEventListener('abort', stop, { once: true });
   const v = validate(GameId, gameId, `live.watch`);
   if (!v.ok) {
      if (!v.result.success) options.onError?.(v.result.error);
      return stop;
   }
   const url = liveUrl(livePath(name, v.value));
   const emit = (value: unknown) => onData(value as LiveSections[S] | null);
   void stream(url, controller.signal, emit, options);
   return stop;
}
