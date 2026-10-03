/**
 * One check per public library function, called with ids that have
 * data. Stable ids point at finished games and seasons, so their shapes
 * should only change when the feed does.
 */
import {
   games,
   players,
   playoffs,
   schedule,
   seasons,
   standings,
   stats,
   teams,
} from '#/api/index.ts';
import type { APIResult } from '#/client/types.ts';
import { config, configure } from '#/config/index.ts';

const SEASON = 8; // 2025-26 regular season
const PLAYOFF_SEASON = 9; // 2026 playoffs
const TEAM = 1;
const GAME = 326;
const PLAYER = 52;
const GOALIE = 262;
const GAME_DATE = '2026-04-25'; // GAME was played this day

export interface DriftCheck {
   /** `namespace.function`, plus a variant in parentheses when needed */
   name: string;
   run: () => Promise<APIResult<unknown>>;
   /**
    * The error class the call must fail with. Checks without one must
    * succeed, and their data shape is compared with the baseline.
    */
   expectError?: string;
   /**
    * Data depends on today's date (current season, nearby games), so an
    * empty result is normal and fields missing today are only noted.
    */
   volatile?: boolean;
}

export const checks: DriftCheck[] = [
   { name: 'seasons.list', run: () => seasons.list() },
   {
      name: 'seasons.current',
      run: () => seasons.current(),
      volatile: true,
   },
   {
      name: 'seasons.bootstrap',
      run: () => seasons.bootstrap(),
      volatile: true,
   },
   {
      name: 'seasons.bootstrap (season)',
      run: () => seasons.bootstrap(SEASON),
   },
   { name: 'schedule.season', run: () => schedule.season(SEASON) },
   {
      name: 'schedule.season (team)',
      run: () => schedule.season(SEASON, TEAM),
   },
   {
      name: 'schedule.scorebar',
      run: () => schedule.scorebar({ daysBack: 7, daysAhead: 30 }),
      volatile: true,
   },
   { name: 'schedule.day', run: () => schedule.day(GAME_DATE) },
   {
      name: 'schedule.gameDays',
      run: () => schedule.gameDays('2025-11-01', '2026-05-31'),
   },
   { name: 'teams.bySeason', run: () => teams.bySeason(SEASON) },
   { name: 'teams.roster', run: () => teams.roster(TEAM, SEASON) },
   {
      name: 'teams.skaterStats',
      run: () => teams.skaterStats(TEAM, SEASON),
   },
   {
      name: 'teams.goalieStats',
      run: () => teams.goalieStats(TEAM, SEASON),
   },
   { name: 'players.profile', run: () => players.profile(PLAYER) },
   {
      name: 'players.seasonStats',
      run: () => players.seasonStats(PLAYER, SEASON),
   },
   {
      name: 'players.seasonStats (goalie)',
      run: () => players.seasonStats(GOALIE, SEASON),
   },
   {
      name: 'players.gameByGame',
      run: () => players.gameByGame(PLAYER, SEASON),
   },
   {
      name: 'players.gameByGame (goalie)',
      run: () => players.gameByGame(GOALIE, SEASON),
   },
   { name: 'players.media', run: () => players.media(PLAYER) },
   { name: 'players.recentStats', run: () => players.recentStats(PLAYER) },
   {
      name: 'players.recentStats (goalie)',
      run: () => players.recentStats(GOALIE),
   },
   { name: 'players.search', run: () => players.search('smith') },
   { name: 'players.page', run: () => players.page(PLAYER, SEASON) },
   {
      name: 'players.page (goalie)',
      run: () => players.page(GOALIE, SEASON),
   },
   {
      name: 'players.transactions',
      run: () => players.transactions(SEASON),
   },
   {
      name: 'stats.skaters',
      run: () => stats.skaters({ seasonId: SEASON }),
   },
   {
      name: 'stats.skaters (expanded)',
      run: () => stats.skaters({ seasonId: SEASON, statsType: 'expanded' }),
   },
   {
      name: 'stats.goalies',
      run: () => stats.goalies({ seasonId: SEASON }),
   },
   { name: 'stats.topScorers', run: () => stats.topScorers(SEASON) },
   { name: 'stats.topGoalies', run: () => stats.topGoalies(SEASON) },
   { name: 'stats.leaders', run: () => stats.leaders(SEASON) },
   {
      name: 'stats.skaterCategoryLeaders',
      run: () => stats.skaterCategoryLeaders(SEASON),
   },
   {
      name: 'stats.goalieCategoryLeaders',
      run: () => stats.goalieCategoryLeaders(SEASON),
   },
   { name: 'stats.streaks', run: () => stats.streaks(SEASON) },
   { name: 'standings.season', run: () => standings.season(SEASON) },
   {
      name: 'standings.season (division)',
      run: () => standings.season(SEASON, { groupBy: 'division' }),
   },
   { name: 'standings.table', run: () => standings.table(SEASON) },
   {
      name: 'standings.table (home)',
      run: () => standings.table(SEASON, { context: 'home' }),
   },
   {
      name: 'standings.specialTeams',
      run: () => standings.specialTeams(SEASON),
   },
   {
      name: 'playoffs.bracket',
      run: () => playoffs.bracket(PLAYOFF_SEASON),
   },
   { name: 'games.summary', run: () => games.summary(GAME) },
   { name: 'games.playByPlay', run: () => games.playByPlay(GAME) },
   { name: 'games.clock', run: () => games.clock(GAME) },
   { name: 'games.preview', run: () => games.preview(GAME) },
   { name: 'games.ticker', run: () => games.ticker(GAME) },
   { name: 'games.boxScore', run: () => games.boxScore(GAME) },
   { name: 'games.events', run: () => games.events(GAME) },
   { name: 'games.matchup', run: () => games.matchup(GAME) },

   // Error behaviour the client depends on
   {
      name: 'games.summary (unknown game)',
      run: () => games.summary(99999999),
      expectError: 'NotFoundError',
   },
   {
      name: 'games.boxScore (unknown game)',
      run: () => games.boxScore(99999999),
      expectError: 'NotFoundError',
   },
   {
      name: 'players.page (unknown player)',
      run: () => players.page(99999999),
      expectError: 'NotFoundError',
   },
   {
      name: 'players.profile (unknown player)',
      run: () => players.profile(99999999),
      expectError: 'NotFoundError',
   },
   {
      name: 'seasons.list (bad key)',
      run: async () => {
         const key = config.key;
         configure({ key: 'not-a-key' });
         try {
            return await seasons.list();
         } finally {
            configure({ key });
         }
      },
      expectError: 'APIError',
   },
];
