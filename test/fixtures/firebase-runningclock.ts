// Captured from LeagueStat's Firebase feed for game 353 on 2026-11-22
// (svf/pwhl/runningclock/games/353), in game order
export default [
   // pregame
   {
      Clock: { Minutes: '-', Running: false, Seconds: '-', period: '1' },
      DatePlayed: '2026-11-22',
      status_id: 1,
   },
   // 1st period
   {
      Clock: { Minutes: '13', Running: true, Seconds: '44', period: 1 },
      DatePlayed: '2026-11-22',
      status_id: 2,
   },
   // unofficial final, overtime
   {
      Clock: { Minutes: '00', Running: false, Seconds: '03', period: 4 },
      DatePlayed: '2026-11-22',
      status_id: 3,
   },
   // final
   {
      Clock: { Minutes: '00', Running: false, Seconds: '00', period: '3' },
      DatePlayed: '2026-11-22',
      status_id: 4,
   },
] as const;
