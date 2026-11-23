// Captured from LeagueStat's Firebase feed for game 353 on 2026-11-22
// (svf/pwhl/shotssummary/1/games/353), in game order
export default [
   // 1st period
   {
      DatePlayed: '2026-11-22',
      HomeShotTotal: 0,
      HomeShotsByPeriod: [null, 0],
      PeriodsInfo: [null, { LongName: '1st', PeriodId: 1, ShortName: '1' }],
      VisitorShotTotal: 2,
      VisitorShotsByPeriod: [null, 2],
   },
   // unofficial final, overtime
   {
      DatePlayed: '2026-11-22',
      HomeShotTotal: 36,
      HomeShotsByPeriod: [null, 6, 15, 11, 4],
      PeriodsInfo: [
         null,
         { LongName: '1st', PeriodId: 1, ShortName: '1' },
         { LongName: '2nd', PeriodId: 2, ShortName: '2' },
         { LongName: '3rd', PeriodId: 3, ShortName: '3' },
         { LongName: '1st OT', PeriodId: 4, ShortName: 'OT1' },
      ],
      VisitorShotTotal: 39,
      VisitorShotsByPeriod: [null, 18, 10, 8, 2],
   },
   // final
   {
      DatePlayed: '2026-11-22',
      HomeShotTotal: 32,
      HomeShotsByPeriod: [null, 6, 15, 11],
      PeriodsInfo: [
         null,
         { LongName: '1st', PeriodId: 1, ShortName: '1' },
         { LongName: '2nd', PeriodId: 2, ShortName: '2' },
         { LongName: '3rd', PeriodId: 3, ShortName: '3' },
      ],
      VisitorShotTotal: 36,
      VisitorShotsByPeriod: [null, 18, 10, 8],
   },
] as const;
