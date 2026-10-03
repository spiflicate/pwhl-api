// Captured from the live feed on 2026-10-03, trimmed by scripts/trim-fixtures.ts
export default {
   SiteKit: {
      Parameters: {
         feed: 'modulekit',
         view: 'gamesperday',
         fmt: 'json',
         lang: 'en',
         key: '446521baf8c38984',
         client_code: 'pwhl',
         start_date: '2026-01-01',
         end_date: '2026-12-31',
         lang_id: 1,
         league_id: '1',
         season_id: '10',
      },
      Gamesperday: [
         {
            date_played: '2026-01-02',
            month: '1',
            year: '2026',
            dayofweek: 'Friday',
            day: '2',
            numberofgames: '1',
         },
         {
            date_played: '2026-01-03',
            month: '1',
            year: '2026',
            dayofweek: 'Saturday',
            day: '3',
            numberofgames: '3',
         },
         {
            date_played: '2026-01-04',
            month: '1',
            year: '2026',
            dayofweek: 'Sunday',
            day: '4',
            numberofgames: '1',
         },
      ],
      Copyright: {
         required_copyright:
            "Official statistics provided by Professional Women's Hockey League",
         required_link: 'http://leaguestat.com',
         powered_by: 'Powered by HockeyTech.com',
         powered_by_url: 'http://hockeytech.com',
      },
   },
} as const;
