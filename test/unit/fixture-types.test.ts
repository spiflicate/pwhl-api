/**
 * Compile-time check that captured responses match the library's response
 * types. `bun run typecheck` fails if a type claims a field the feed does
 * not send, gives it the wrong type, or leaves out a field the feed sends.
 * The runtime test only keeps this file in the test run.
 */
import { expect, test } from 'bun:test';
import type {
   Bootstrap,
   BoxScore,
   Bracket,
   GameByDate,
   GameClock,
   GameDay,
   GameEvent,
   GamePreview,
   GameSummary,
   GoalieCategoryLeaders,
   GoalieStatRow,
   GoalieTeamSplit,
   Leaders,
   Matchup,
   PlayByPlayEvent,
   PlayerGameByGame,
   PlayerMedia,
   PlayerPage,
   PlayerProfile,
   PlayerRecentStats,
   PlayerSearchResult,
   PlayerSeasonStats,
   PointStreak,
   RosterPlayer,
   RosterStaff,
   ScheduleGame,
   ScorebarGame,
   Season,
   SkaterCategoryLeaders,
   SkaterExpandedStatRow,
   SkaterExpandedTeamSplit,
   SkaterStatRow,
   SkaterTeamSplit,
   SpecialTeamsRow,
   StandingsHeading,
   StandingsTable,
   StandingsTableRow,
   StandingsTeam,
   StatEntry,
   Team,
   TeamGoalieStatsRow,
   TeamSkaterStats,
   TickerEvent,
   TopGoalie,
   TopScorer,
   Transactions,
} from '#/types/index.ts';
import clock from '../fixtures/gc-clock.ts';
import summary from '../fixtures/gc-gamesummary.ts';
import preview from '../fixtures/gc-preview.ts';
import pxp from '../fixtures/gc-pxp.ts';
import pxpVerbose from '../fixtures/gc-pxpverbose.ts';
import brackets from '../fixtures/modulekit-brackets.ts';
import combinedGoalies from '../fixtures/modulekit-combinedplayers-goalies.ts';
import combinedSkaters from '../fixtures/modulekit-combinedplayers-skaters.ts';
import gamesByDate from '../fixtures/modulekit-gamesbydate.ts';
import gamesPerDay from '../fixtures/modulekit-gamesperday.ts';
import goalieGameByGame from '../fixtures/modulekit-goalie-gamebygame.ts';
import goalieSeason from '../fixtures/modulekit-goalie-seasonstats.ts';
import gameByGame from '../fixtures/modulekit-player-gamebygame.ts';
import media from '../fixtures/modulekit-player-media.ts';
import recent from '../fixtures/modulekit-player-mostrecentseasonstats.ts';
import profile from '../fixtures/modulekit-player-profile.ts';
import playerSeason from '../fixtures/modulekit-player-seasonstats.ts';
import roster from '../fixtures/modulekit-roster.ts';
import schedule from '../fixtures/modulekit-schedule.ts';
import scorebar from '../fixtures/modulekit-scorebar.ts';
import search from '../fixtures/modulekit-searchplayers.ts';
import seasons from '../fixtures/modulekit-seasons.ts';
import standingsConference from '../fixtures/modulekit-standings-conference.ts';
import standingsDivision from '../fixtures/modulekit-standings-division.ts';
import streaks from '../fixtures/modulekit-streaks.ts';
import teamGoalies from '../fixtures/modulekit-team-goalies.ts';
import teamSkaters from '../fixtures/modulekit-team-skaters.ts';
import teams from '../fixtures/modulekit-teamsbyseason.ts';
import topGoalies from '../fixtures/modulekit-topgoalies.ts';
import topScorers from '../fixtures/modulekit-topscorers.ts';
import transactions from '../fixtures/modulekit-transactions.ts';
import bootstrap from '../fixtures/statview-bootstrap.ts';
import boxScore from '../fixtures/statview-gamesummary.ts';
import goaliePage from '../fixtures/statview-goalie.ts';
import leaders from '../fixtures/statview-leaders.ts';
import events from '../fixtures/statview-playbyplay.ts';
import playerPage from '../fixtures/statview-player.ts';
import goalies from '../fixtures/statview-players-goalies-standard.ts';
import skatersExpanded from '../fixtures/statview-players-skaters-expanded.ts';
import skaters from '../fixtures/statview-players-skaters-standard.ts';
import matchup from '../fixtures/statview-preview.ts';
import standingsHome from '../fixtures/statview-standings-home.ts';
import standingsOverall from '../fixtures/statview-standings-overall.ts';
import standingsSpecial from '../fixtures/statview-standings-special.ts';

/** Strip `readonly` from an `as const` fixture */
type Mutable<T> = T extends readonly []
   ? []
   : T extends readonly (infer U)[]
     ? Mutable<U>[]
     : T extends object
       ? { -readonly [K in keyof T]: Mutable<T[K]> }
       : T;

/** Keys of any member of a union */
type AllKeys<T> = T extends unknown ? keyof T : never;
/** `T[K]` across the members of a union that have K */
type ValueAt<T, K> = T extends unknown
   ? K extends keyof T
      ? T[K]
      : never
   : never;
type Element<T> = T extends readonly (infer U)[] ? U : never;

/**
 * F with every key T does not declare mapped to `never`, at any depth, so
 * a fixture with fields the type leaves out stops compiling.
 */
type NoExtra<T, F> = unknown extends T
   ? F
   : F extends readonly unknown[]
     ? NoExtra<Element<T>, F[number]>[]
     : F extends object
       ? {
            [K in keyof F]: K extends AllKeys<T>
               ? NoExtra<ValueAt<T, K>, F[K]>
               : never;
         }
       : F;

/**
 * Compiles only when the fixture is assignable to T and has no fields T
 * leaves out
 */
const fits =
   <T>() =>
   <F extends T>(fixture: F & NoExtra<T, F>) =>
      fixture;
/** View an `as const` fixture as plain mutable JSON */
const mut = <F>(fixture: F) => fixture as Mutable<F>;

const rows = <R>(
   table: readonly { sections: readonly { data: readonly R[] }[] }[],
) => table.flatMap((t) => t.sections.flatMap((s) => s.data));

fits<Season[]>()(mut(seasons.SiteKit.Seasons));
fits<ScheduleGame[]>()(mut(schedule.SiteKit.Schedule));
fits<ScorebarGame[]>()(mut(scorebar.SiteKit.Scorebar));
fits<GameByDate[]>()(mut(gamesByDate.SiteKit.Gamesbydate));
fits<GameDay[]>()(mut(gamesPerDay.SiteKit.Gamesperday));
fits<Team[]>()(mut(teams.SiteKit.Teamsbyseason));
fits<RosterPlayer>()(mut(roster.SiteKit.Roster[0]));
fits<RosterStaff[]>()(mut(roster.SiteKit.Roster[27]));
fits<TeamSkaterStats[]>()(mut(teamSkaters.SiteKit.Statviewtype));
fits<TeamGoalieStatsRow[]>()(mut(teamGoalies.SiteKit.Statviewtype));
fits<PlayerProfile>()(mut(profile.SiteKit.Player));
fits<PlayerSeasonStats>()(mut(playerSeason.SiteKit.Player));
fits<PlayerSeasonStats>()(mut(goalieSeason.SiteKit.Player));
fits<PlayerRecentStats>()(mut(recent.SiteKit.Player));
fits<PlayerGameByGame>()(mut(gameByGame.SiteKit.Player));
fits<PlayerGameByGame>()(mut(goalieGameByGame.SiteKit.Player));
fits<PlayerMedia[]>()(mut(media.SiteKit.Player));
fits<PlayerSearchResult[]>()(mut(search.SiteKit.Searchplayers));
fits<PlayerPage>()(mut(playerPage));
fits<PlayerPage>()(mut(goaliePage));
fits<Transactions>()(mut(transactions.SiteKit.Statviewtype));
fits<Bracket>()(mut(brackets.SiteKit.Brackets));
fits<Bootstrap>()(mut(bootstrap));
fits<StatEntry<SkaterStatRow, SkaterTeamSplit>[]>()(mut(rows(skaters)));
fits<StatEntry<SkaterExpandedStatRow, SkaterExpandedTeamSplit>[]>()(
   mut(rows(skatersExpanded)),
);
fits<StatEntry<GoalieStatRow, GoalieTeamSplit>[]>()(mut(rows(goalies)));
fits<TopScorer[]>()(mut(topScorers.SiteKit.Statviewtype));
fits<TopGoalie[]>()(mut(topGoalies.SiteKit.Statviewtype));
fits<SkaterCategoryLeaders>()(mut(combinedSkaters.SiteKit.Combinedplayers));
fits<GoalieCategoryLeaders>()(mut(combinedGoalies.SiteKit.Combinedplayers));
fits<PointStreak[]>()(mut(streaks.SiteKit.Statviewtype));
fits<Leaders>()(mut(leaders));
fits<Array<StandingsTeam | StandingsHeading>>()(
   mut(standingsConference.SiteKit.Statviewtype),
);
fits<Array<StandingsTeam | StandingsHeading>>()(
   mut(standingsDivision.SiteKit.Statviewtype),
);
fits<StandingsTable<StandingsTableRow>>()(mut(standingsOverall));
fits<StandingsTable<StandingsTableRow>>()(mut(standingsHome));
fits<StandingsTable<SpecialTeamsRow>>()(mut(standingsSpecial));
fits<GameSummary>()(mut(summary.GC.Gamesummary));
fits<PlayByPlayEvent[]>()(mut(pxpVerbose.GC.Pxpverbose));
fits<TickerEvent[]>()(mut(pxp.GC.Pxp));
fits<GameClock>()(mut(clock.GC.Clock));
fits<GamePreview>()(mut(preview.GC.Preview));
fits<BoxScore>()(mut(boxScore));
fits<GameEvent[]>()(mut(events));
fits<Matchup>()(mut(matchup));

test('captured fixtures fit the response types (checked by tsc)', () => {
   expect(seasons.SiteKit.Seasons.length).toBeGreaterThan(0);
});
