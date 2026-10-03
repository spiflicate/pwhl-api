# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/spiflicate/pwhl-api/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/spiflicate/pwhl-api/releases/tag/v0.1.0
