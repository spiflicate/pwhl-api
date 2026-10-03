// Captured from the live feed on 2026-10-03, trimmed by scripts/trim-fixtures.ts
export default {
   SiteKit: {
      Parameters: {
         feed: 'modulekit',
         view: 'seasons',
         fmt: 'json',
         lang: 'en',
         key: '446521baf8c38984',
         client_code: 'pwhl',
         lang_id: 1,
         league_id: '1',
         season_id: '10',
      },
      Seasons: [
         {
            season_id: '11',
            season_name: '2026-27 Regular Season',
            shortname: '2026-27 Reg',
            career: '1',
            playoff: '0',
            start_date: '2026-12-04',
            end_date: '2027-04-19',
         },
         {
            season_id: '10',
            season_name: '2026-27 Pre-Season',
            shortname: '2026-27 Pre-Season',
            career: '0',
            playoff: '0',
            start_date: '2026-10-01',
            end_date: '2026-11-30',
         },
         {
            season_id: '9',
            season_name: '2026 Playoffs',
            shortname: '2026 Playoffs',
            career: '1',
            playoff: '1',
            start_date: '2026-04-28',
            end_date: '2026-05-28',
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
