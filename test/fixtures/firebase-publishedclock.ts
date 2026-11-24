// Captured from LeagueStat's Firebase feed for game 353 on 2026-11-22
// (svf/pwhl/publishedclock/1/games/353), in game order
export default [
   // 1st period
   {
      ClockMinutes: 15,
      ClockSeconds: 18,
      DatePlayed: '2026-11-22',
      Final: false,
      PeriodId: 1,
      PeriodLongName: '1st',
      PeriodShortName: '1',
      ProgressString: 'In Progress (15:18 remaining in 1st)',
      Started: true,
      StatusId: 2,
      StatusName: 'In Progress',
   },
   // unofficial final, overtime
   {
      ClockMinutes: 0,
      ClockSeconds: 3,
      DatePlayed: '2026-11-22',
      Final: false,
      PeriodId: 4,
      PeriodLongName: '1st OT',
      PeriodShortName: 'OT1',
      ProgressString: 'Unofficial Final SO',
      Started: true,
      StatusId: 3,
      StatusName: 'Unofficial Final',
   },
   // final
   {
      ClockMinutes: 0,
      ClockSeconds: 0,
      DatePlayed: '2026-11-22',
      Final: true,
      PeriodId: 3,
      PeriodLongName: '3rd',
      PeriodShortName: '3',
      ProgressString: 'Final',
      Started: true,
      StatusId: 4,
      StatusName: 'Final',
   },
] as const;
