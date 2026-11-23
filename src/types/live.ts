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

/** A player on the ice for a goal, in a goal's `PlusPlayers` */
export interface LivePlusPlayer {
   Id: number;
   FirstName: string;
   LastName: string;
   Jersey: number;
}

/** One goal in `goals/<lang>/games/<id>` */
export interface LiveGoal {
   /** Event id, the goal's key in `GameGoals` */
   LSEventId: number;
   IsHome: boolean;
   Period: number;
   /** e.g. "1st" */
   PeriodLongName: string;
   /** e.g. "1" */
   PeriodShortName: string;
   /** Elapsed time in the period, e.g. "10:35" */
   Time: string;
   ScorerPlayerId: number;
   ScorerPlayerFirstName: string;
   ScorerPlayerLastName: string;
   ScorerJerseyNumber: number;
   /** The scorer's goal count, including this one */
   ScorerGoalNumber: number;
   ScorerPlayerImageURL: string;
   /** The `Assist1…` and `Assist2…` fields are left out when there is no such assist */
   Assist1PlayerId?: number;
   Assist1PlayerFirstName?: string;
   Assist1PlayerLastName?: string;
   Assist1PlayerJerseyNumber?: number;
   Assist1PlayerNumAssists?: number;
   Assist2PlayerId?: number;
   Assist2PlayerFirstName?: string;
   Assist2PlayerLastName?: string;
   Assist2PlayerJerseyNumber?: number;
   Assist2PlayerNumAssists?: number;
   /** 1 or 0 */
   PowerPlay: number;
   /** 1 or 0 */
   ShortHanded: number;
   /** 1 or 0 */
   EmptyNet: number;
   /** 1 or 0 */
   PenaltyShot: number;
   /**
    * Players credited as on the ice. Left out until the scorekeeper enters
    * them, which can be minutes after the goal; goals are revised in place
    * (a goal can turn into a power-play goal later, too).
    */
   PlusPlayers?: LivePlusPlayer[];
}

/** `goals/<lang>/games/<id>`: only `DatePlayed` until the first goal */
export interface LiveGoals {
   DatePlayed: string;
   /** Keyed by event id (`LSEventId`) */
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
