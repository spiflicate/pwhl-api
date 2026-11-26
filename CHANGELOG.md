# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.1]

### Fixed

- `live` with `language: 'fr'`: the published clock, summaries and goals
  fall back to English while the French section is empty, instead of
  returning `null` all game. No game in the 2026-27 preseason had French
  data. `watch` follows both and switches to French if it appears.

## [0.2.0]

### Added

- `Coach.roster` on `games.summary` coaches: HockeyTech started sending this
  staff flag in November 2026.
- `live` namespace for LeagueStat's Firebase feed: `runningClock`,
  `runningClocks`, `publishedClock`, `goalsSummary`, `penaltiesSummary`,
  `shotsSummary` and `goals` read a game once, and `watch` follows one over
  Firebase's event stream. Types come from game 353, the 2026-27 preseason
  opener.
- `firebaseUrl` config option.

### Fixed

- Goalie `shots_against`, `goals_against` and `saves` in `games.summary` and
  `games.preview` lineups can be strings while a game is on.
- `games.preview` for a team's first game of the season: `last_game` is
  `false`, and `longest_player_streaks`, `mostPIM` and `rookie` are `[]`.
- `games.preview` and `games.matchup` for a team with no games yet leave
  `power_play_goals` and `power_play_goals_against` out of the power-play and
  penalty-kill totals.
- `games.preview` leaders (`rookie`, `mostPIM`, `leadingScorers`) can have a
  `null` `player_id` and no `jersey_number`.
- `games.playByPlay` penalty shots leave out `goal_type_name` when saved.

## [0.1.0]

First release.

### Added

- Functions for every supported HockeyTech feed endpoint, grouped by domain:
  `seasons`, `schedule`, `teams`, `players`, `stats`, `standings`, `playoffs`
  and `games`.
- Field-level response types, checked against live fixtures at typecheck time.
- `normalize` helpers for the feed's string-encoded numbers, booleans and clocks.
- Typed errors (`APIError`, `NotFoundError`, `ValidationError`, `ParseError`,
  `NetworkError`) that also catch the feed's HTTP 200 error bodies.
- `configure()` for language, timeout, logging and feed overrides.
- ESM and CommonJS builds with type declarations for both.

### Not covered yet

- Live game data from LeagueStat's Firebase feed (running clock, live events).
  It only returns data during games, so it waits for the 2026-27 season.

[Unreleased]: https://github.com/spiflicate/pwhl-api/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/spiflicate/pwhl-api/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/spiflicate/pwhl-api/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/spiflicate/pwhl-api/releases/tag/v0.1.0
