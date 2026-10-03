/**
 * Runtime configuration for the PWHL API client.
 *
 * The defaults target the public PWHL feed used by thepwhl.com. Call
 * `configure()` to point the client at another host or key.
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface PWHLConfig {
   /** HockeyTech feed endpoint. `cluster.leaguestat.com/feed/` also works. */
   baseUrl: string;
   /** Public site key shipped in thepwhl.com's JavaScript. */
   key: string;
   /** HockeyTech client code for the league. */
   clientCode: string;
   /** League id, sent to statviewfeed views. */
   leagueId: number;
   /** Site id, sent to statviewfeed views. */
   siteId: number;
   /** Language for localized responses. */
   language: 'en' | 'fr';
   /** Request timeout in milliseconds. */
   timeout: number;
   /** Logging level for client errors. */
   logLevel: LogLevel;
}

export const DEFAULT_CONFIG: Readonly<PWHLConfig> = Object.freeze({
   baseUrl: 'https://lscluster.hockeytech.com/feed/index.php',
   key: '446521baf8c38984',
   clientCode: 'pwhl',
   leagueId: 1,
   siteId: 0,
   language: 'en',
   timeout: 10000,
   logLevel: 'warn',
});

/** Active configuration used by every request. */
export const config: PWHLConfig = { ...DEFAULT_CONFIG };

/** Override parts of the active configuration. */
export function configure(overrides: Partial<PWHLConfig>): PWHLConfig {
   Object.assign(config, overrides);
   return config;
}

/** Restore the default configuration. */
export function resetConfig(): PWHLConfig {
   Object.assign(config, DEFAULT_CONFIG);
   return config;
}
