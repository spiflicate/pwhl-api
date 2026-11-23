/**
 * LeagueStat Firebase live feed (`/svf/<client>/...`).
 *
 * Unlike the HockeyTech feed, Firebase keeps JSON types: numbers and
 * booleans arrive as numbers and booleans. A game only appears in a
 * section once the scorekeeper publishes data for it, so reads return
 * `null` before that.
 */

/** `runningclock/games/<id>`: the clock as it ticks */
export interface LiveRunningClock {
   Clock: {
      /** "00"–"20", or "-" before the game */
      Minutes: string;
      /** "00"–"59", or "-" before the game */
      Seconds: string;
      Running: boolean;
      /** Period number, e.g. "1" */
      period: string;
   };
   /** YYYY-MM-DD */
   DatePlayed: string;
   /** Same codes as `GameStatus`, as a number */
   status_id: number;
}

/** `publishedclock/<lang>/games/<id>`: the clock as last published */
export interface LivePublishedClock {
   DatePlayed: string;
   ClockMinutes: number;
   ClockSeconds: number;
   /** e.g. "1st Period" */
   PeriodLongName: string;
   /** e.g. "Final" or "12:34 1st" */
   ProgressString: string;
}

/** Name of a period in a summary's `PeriodsInfo` */
export interface LivePeriodInfo {
   ShortName: string;
   LongName: string;
}

/** `goalssummary/<lang>/games/<id>` */
export interface LiveGoalsSummary {
   DatePlayed: string;
   HomeGoalTotal: number;
   VisitorGoalTotal: number;
   /** Keyed by period id */
   PeriodsInfo?: Record<string, LivePeriodInfo>;
   HomeGoalsByPeriod?: Record<string, number>;
   VisitorGoalsByPeriod?: Record<string, number>;
   HomePowerPlayGoals?: number;
   HomePowerPlayAttempts?: number;
   VisitorPowerPlayGoals?: number;
   VisitorPowerPlayAttempts?: number;
}

/** `shotssummary/<lang>/games/<id>` */
export interface LiveShotsSummary {
   DatePlayed: string;
   HomeShotTotal: number;
   VisitorShotTotal: number;
}

/** `penaltiessummary/<lang>/games/<id>` */
export interface LivePenaltiesSummary {
   DatePlayed: string;
}

/** One goal in `goals/<lang>/games/<id>` */
export interface LiveGoal {
   PeriodLongName: string;
   /** Game time of the goal, e.g. "12:34" */
   Time: string;
   ScorerPlayerId: number;
   ScorerPlayerFirstName: string;
   ScorerPlayerLastName: string;
   IsHome: boolean;
}

/** `goals/<lang>/games/<id>` */
export interface LiveGoals {
   DatePlayed: string;
   /** Keyed by goal id */
   GameGoals?: Record<string, LiveGoal>;
}

/** Sections of the live feed and the data each holds per game */
export interface LiveSections {
   runningclock: LiveRunningClock;
   publishedclock: LivePublishedClock;
   goalssummary: LiveGoalsSummary;
   penaltiessummary: LivePenaltiesSummary;
   shotssummary: LiveShotsSummary;
   goals: LiveGoals;
}

export type LiveSection = keyof LiveSections;
