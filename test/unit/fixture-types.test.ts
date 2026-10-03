/**
 * Compile-time check that captured responses fit the library's response
 * types. `bun run typecheck` fails if a type claims a field the feed does
 * not send, or gives it the wrong type. The runtime test only keeps this
 * file in the test run.
 */
import { expect, test } from 'bun:test';
import type {
   Bootstrap,
   Bracket,
   GameClock,
   GamePreview,
   GameSummary,
   GoalieStatRow,
   PlayByPlayEvent,
   PlayerGameByGame,
   PlayerMedia,
   PlayerProfile,
   PlayerSeasonStats,
   RosterPlayer,
   RosterStaff,
   ScheduleGame,
   ScorebarGame,
   Season,
   SkaterStatRow,
   Team,
} from '#/types/index.ts';
import clock from '../fixtures/gc-clock.ts';
import summary from '../fixtures/gc-gamesummary.ts';
import preview from '../fixtures/gc-preview.ts';
import pxp from '../fixtures/gc-pxpverbose.ts';
import brackets from '../fixtures/modulekit-brackets.ts';
import goalieSeason from '../fixtures/modulekit-goalie-seasonstats.ts';
import gameByGame from '../fixtures/modulekit-player-gamebygame.ts';
import media from '../fixtures/modulekit-player-media.ts';
import profile from '../fixtures/modulekit-player-profile.ts';
import playerSeason from '../fixtures/modulekit-player-seasonstats.ts';
import roster from '../fixtures/modulekit-roster.ts';
import schedule from '../fixtures/modulekit-schedule.ts';
import scorebar from '../fixtures/modulekit-scorebar.ts';
import seasons from '../fixtures/modulekit-seasons.ts';
import teams from '../fixtures/modulekit-teamsbyseason.ts';
import bootstrap from '../fixtures/statview-bootstrap.ts';
import goalies from '../fixtures/statview-players-goalies-standard.ts';
import skaters from '../fixtures/statview-players-skaters-standard.ts';

/** Strip `readonly` from an `as const` fixture */
type Mutable<T> = T extends readonly (infer U)[]
   ? Mutable<U>[]
   : T extends object
     ? { -readonly [K in keyof T]: Mutable<T[K]> }
     : T;

/** View an `as const` fixture as plain mutable JSON */
const mut = <F>(fixture: F) => fixture as Mutable<F>;
/** Compiles only when the fixture is assignable to T */
const fits = <T>(value: T) => value;

fits<Season[]>(mut(seasons.SiteKit.Seasons));
fits<ScheduleGame[]>(mut(schedule.SiteKit.Schedule));
fits<ScorebarGame[]>(mut(scorebar.SiteKit.Scorebar));
fits<Team[]>(mut(teams.SiteKit.Teamsbyseason));
fits<RosterPlayer>(mut(roster.SiteKit.Roster[0]));
fits<RosterStaff[]>(mut(roster.SiteKit.Roster[27]));
fits<PlayerProfile>(mut(profile.SiteKit.Player));
fits<PlayerSeasonStats>(mut(playerSeason.SiteKit.Player));
fits<PlayerSeasonStats>(mut(goalieSeason.SiteKit.Player));
fits<PlayerGameByGame>(mut(gameByGame.SiteKit.Player));
fits<PlayerMedia[]>(mut(media.SiteKit.Player));
fits<Bracket>(mut(brackets.SiteKit.Brackets));
fits<Bootstrap>(mut(bootstrap));
fits<SkaterStatRow[]>(mut(skaters[0].sections[0].data.map((d) => d.row)));
fits<GoalieStatRow[]>(mut(goalies[0].sections[0].data.map((d) => d.row)));
fits<GameSummary>(mut(summary.GC.Gamesummary));
fits<PlayByPlayEvent[]>(mut(pxp.GC.Pxpverbose));
fits<GameClock>(mut(clock.GC.Clock));
fits<GamePreview>(mut(preview.GC.Preview));

test('captured fixtures fit the response types (checked by tsc)', () => {
   expect(seasons.SiteKit.Seasons.length).toBeGreaterThan(0);
});
