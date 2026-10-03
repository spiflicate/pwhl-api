/**
 * PWHL API Client Library
 * A TypeScript wrapper for the PWHL stats feed (HockeyTech/LeagueStat)
 *
 * @module pwhl-api
 */

export * from './api/index.ts';
export type { APIResult } from './client/types.ts';
export type { LogLevel, PWHLConfig } from './config/index.ts';
export { config, configure, resetConfig } from './config/index.ts';
export * from './errors/index.ts';
export * from './types/index.ts';
export * as normalize from './utils/normalize.ts';
