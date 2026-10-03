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

| Namespace  | Functions                                               |
| ---------- | ------------------------------------------------------- |
| `seasons`  | `list`, `current`, `bootstrap`                          |
| `schedule` | `season`, `scorebar`                                    |
| `teams`    | `bySeason`, `roster`                                    |
| `players`  | `profile`, `seasonStats`, `gameByGame`, `media`         |
| `stats`    | `skaters`, `goalies`                                    |
| `playoffs` | `bracket`                                               |
| `games`    | `summary`, `playByPlay`, `clock`, `preview`             |

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
bun run lint
bun run typecheck
bun run build
```

## License

MIT
