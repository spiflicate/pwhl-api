# pwhl-api

TypeScript wrapper for the PWHL stats API (HockeyTech/LeagueStat), with simple, composable functions and full type safety. Modeled on [nhle-api](https://github.com/spiflicate/nhle-api).

## Install

```bash
bun add pwhl-api
# or
npm install pwhl-api
```

## Usage

Functions are grouped by domain. Every function returns an `APIResult`: either `{ success: true, data }` or `{ success: false, error }`. Nothing throws.

```ts
import { games, schedule, seasons, stats, teams } from 'pwhl-api';

const season = await seasons.current();
if (!season.success) throw season.error;

const games2026 = await schedule.season(season.data);
const roster = await teams.roster(3, season.data); // { players, staff }
const leaders = await stats.skaters({ seasonId: season.data, limit: 10 });
const boxScore = await games.summary(210);
```

| Namespace   | Functions                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `seasons`   | `list`, `current`, `bootstrap`                                                                                   |
| `schedule`  | `season`, `scorebar`, `day`, `gameDays`                                                                          |
| `teams`     | `bySeason`, `roster`, `skaterStats`, `goalieStats`                                                               |
| `players`   | `profile`, `seasonStats`, `recentStats`, `gameByGame`, `media`, `search`, `page`, `transactions`                 |
| `stats`     | `skaters`, `goalies`, `topScorers`, `topGoalies`, `leaders`, `skaterCategoryLeaders`, `goalieCategoryLeaders`, `streaks` |
| `standings` | `season`, `table`, `specialTeams`                                                                                |
| `playoffs`  | `bracket`                                                                                                        |
| `games`     | `summary`, `playByPlay`, `ticker`, `clock`, `preview`, `boxScore`, `events`, `matchup`                           |

Live game data from LeagueStat's Firebase feed (running clock, live events) is not covered yet; it only returns data during the season.

### Raw values

Types mirror the feed, where nearly every value is a string (`"8"`, `"1"`, `"0.955"`). The `normalize` helpers convert them:

```ts
import { normalize } from 'pwhl-api';

normalize.toNumber('0.955'); // 0.955
normalize.toBool('1'); // true
normalize.clockToSeconds('18:50'); // 1130
```

### Errors

Errors extend `PWHLError` and carry a `category`. The feed often answers HTTP 200 for bad requests, so the client also reads the body:

| Situation               | Error             |
| ----------------------- | ----------------- |
| Bad key, unknown view   | `APIError`        |
| Unknown player or game  | `NotFoundError`   |
| Invalid argument        | `ValidationError` |
| Unparseable body        | `ParseError`      |
| Timeout, no connection  | `NetworkError`    |

### Configuration

```ts
import { configure } from 'pwhl-api';

configure({ language: 'fr', timeout: 5000, logLevel: 'silent' });
```

`baseUrl`, `key`, `clientCode`, `leagueId` and `siteId` can also be overridden.

## Development

```bash
bun install
bun test               # unit tests (mocked fetch)
PWHL_LIVE=1 bun test test/integration   # live checks, needs network access
bun scripts/trim-fixtures.ts <capture-dir>   # refresh test/fixtures from new captures
bun run lint
bun run typecheck
bun run build
bun run drift          # compare live response shapes with the baseline
bun run check:package  # publint + are-the-types-wrong on the packed tarball
```

`test/fixtures` holds trimmed responses captured from the live feed. `test/unit/fixture-types.test.ts` checks each one against its response type, so `bun run typecheck` fails if a type claims a field the feed does not send, types it wrongly, or leaves out a field the feed sends.

### Feed drift check

The PWHL feed is undocumented and can change without notice. `bun run drift` calls every public function against the live feed (with ids for finished games and seasons) and compares each response's structure with `scripts/drift/baseline.json`. It fails when an endpoint stops answering, an error response changes, or a field is added, removed or changes type. Values are ignored, and so are fields that turn `null`.

The **Feed drift** workflow runs it daily and on demand (Actions → Feed drift → Run workflow). A failure opens one `feed-drift` issue with the report, which the next passing run closes. It is separate from CI, so upstream changes never block a PR.

When the feed really has changed:

1. Update the types in `src/types/`.
2. Recapture and trim the fixtures (`bun scripts/trim-fixtures.ts <capture-dir>`), so `bun run typecheck` checks the new types.
3. Accept the new shapes with `bun run drift --update` and commit the baseline.

`test/unit/drift.test.ts` fails if a public function has no drift check, or if the fixtures contain fields the baseline lacks.

### Releasing

1. Move the `Unreleased` notes in `CHANGELOG.md` under the new version.
2. Bump the version and tag it: `npm version patch` (or `minor`/`major`).
3. Push the commit and tag: `git push --follow-tags`.

4. Approve the staged version with 2FA, on npmjs.com (the package's **Staged Packages** tab) or with `npm stage approve <stage-id>`.

The **Release** workflow checks that the tag matches `package.json`, runs the full CI suite and `check:package`, stages the version on npm with provenance, and creates a GitHub release. It uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so there is no npm token in the repo, and [staged publishing](https://docs.npmjs.com/staged-publishing), so nothing goes live until a maintainer approves it.

One-time setup:

1. Publish the first version by hand (`npm publish`), since trusted publishing is configured on an existing package.
2. On npmjs.com, open the package's **Settings → Trusted publishing** and add GitHub Actions with user `spiflicate`, repository `pwhl-api` and workflow `release.yml`. Leave "Allow npm publish" and "Allow npm dist-tag" unchecked, so CI can only stage.
3. Under **Publishing access**, choose "Require two-factor authentication and disallow tokens".
4. Push the `v0.1.0` tag. The workflow sees that 0.1.0 is already on npm, skips the publish and creates the GitHub release.

## License

MIT
