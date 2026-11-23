/**
 * LeagueStat Firebase live feed (`/svf/<client>/...`).
 *
 * Unlike the HockeyTech feed, Firebase keeps JSON types: numbers and
 * booleans arrive as numbers and booleans. A game only appears in a
 * section once the scorekeeper publishes data for it, so reads return
 * `null` before that.
 */

/**
 * Values keyed by period id (1, 2, 3, 4 for overtime...). Firebase sends
 * an object with keys 1..n as an array, so index 0 is `null`.
 */
export type ByPeriod<T> = (T | null)[];

/** `runningclock/games/<id>`: the clock as it ticks */
export interface LiveRunningClock {
   Clock: {
      /** "00"–"20", or "-" before the game */
      Minutes: string;
      /** "00"–"59", or "-" before the game */
      Seconds: string;
      Running: boolean;
      /** Period number: "1" before the game, a number once it starts */
      period: string | number;
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
   PeriodId: number;
   /** e.g. "1st" */
   PeriodLongName: string;
   /** e.g. "1" */
   PeriodShortName: string;
   /** e.g. "In Progress (15:18 remaining in 1st)" */
   ProgressString: string;
   Started: boolean;
   Final: boolean;
   /** Same codes as `GameStatus`, as a number */
   StatusId: number;
   /** e.g. "In Progress" */
   StatusName: string;
}

/** A period in a summary's `PeriodsInfo` */
export interface LivePeriodInfo {
   PeriodId: number;
   /** e.g. "1st" */
   LongName: string;
   /** e.g. "1" */
   ShortName: string;
}

/** `goalssummary/<lang>/games/<id>` */
export interface LiveGoalsSummary {
   DatePlayed: string;
   PeriodsInfo: ByPeriod<LivePeriodInfo>;
   HomeGoalTotal: number;
   VisitorGoalTotal: number;
   HomeGoalsByPeriod: ByPeriod<number>;
   VisitorGoalsByPeriod: ByPeriod<number>;
   HomeAssistPoints: number;
   VisitorAssistPoints: number;
   HomeTotalPoints: number;
   VisitorTotalPoints: number;
   HomePowerPlayGoals: number;
   HomePowerPlayAttempts: number;
   VisitorPowerPlayGoals: number;
   VisitorPowerPlayAttempts: number;
   Shootout: boolean;
}

/** `shotssummary/<lang>/games/<id>` */
export interface LiveShotsSummary {
   DatePlayed: string;
   PeriodsInfo: ByPeriod<LivePeriodInfo>;
   HomeShotTotal: number;
   VisitorShotTotal: number;
   HomeShotsByPeriod: ByPeriod<number>;
   VisitorShotsByPeriod: ByPeriod<number>;
}

/** `penaltiessummary/<lang>/games/<id>` (no `DatePlayed`) */
export interface LivePenaltiesSummary {
   /** Penalties taken */
   HomeInfractionsTotal: number;
   VisitorInfractionsTotal: number;
   /** Penalty minutes */
   HomePIMTotal: number;
   VisitorPIMTotal: number;
   GamePenaltyTotalsByPeriod: {
      HomeInfractionTotals: ByPeriod<number>;
      VisitorInfractionTotals: ByPeriod<number>;
      HomePenaltyTotals: ByPeriod<number>;
      VisitorPenaltyTotals: ByPeriod<number>;
   };
}

/** One goal in `goals/<lang>/games/<id>` (draft from the game centre code; not yet seen) */
export interface LiveGoal {
   PeriodLongName: string;
   /** Game time of the goal, e.g. "12:34" */
   Time: string;
   ScorerPlayerId: number;
   ScorerPlayerFirstName: string;
   ScorerPlayerLastName: string;
   IsHome: boolean;
}

/** `goals/<lang>/games/<id>`: only `DatePlayed` until the first goal */
export interface LiveGoals {
   DatePlayed: string;
   /** Draft from the game centre code; not yet seen */
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
