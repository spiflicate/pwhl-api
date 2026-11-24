// Captured from LeagueStat's Firebase feed for game 353 on 2026-11-22
// (svf/pwhl/penaltiessummary/1/games/353), in game order
export default [
   // 1st period
   {
      GamePenaltyTotalsByPeriod: {
         HomeInfractionTotals: [null, 1],
         HomePenaltyTotals: [null, 2],
         VisitorInfractionTotals: [null, 1],
         VisitorPenaltyTotals: [null, 2],
      },
      HomeInfractionsTotal: 1,
      HomePIMTotal: 2,
      VisitorInfractionsTotal: 1,
      VisitorPIMTotal: 2,
   },
   // unofficial final, overtime
   {
      GamePenaltyTotalsByPeriod: {
         HomeInfractionTotals: [null, 3, 1, 1, 0],
         HomePenaltyTotals: [null, 6, 2, 2, 0],
         VisitorInfractionTotals: [null, 2, 1, 0, 1],
         VisitorPenaltyTotals: [null, 4, 2, 0, 2],
      },
      HomeInfractionsTotal: 5,
      HomePIMTotal: 10,
      VisitorInfractionsTotal: 4,
      VisitorPIMTotal: 8,
   },
   // final
   {
      GamePenaltyTotalsByPeriod: {
         HomeInfractionTotals: [null, 3, 1, 1],
         HomePenaltyTotals: [null, 6, 2, 2],
         VisitorInfractionTotals: [null, 2, 1, 0],
         VisitorPenaltyTotals: [null, 4, 2, 0],
      },
      HomeInfractionsTotal: 5,
      HomePIMTotal: 10,
      VisitorInfractionsTotal: 3,
      VisitorPIMTotal: 6,
   },
] as const;
