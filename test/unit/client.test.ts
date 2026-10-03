import { describe, expect, test } from 'bun:test';
import { buildUrl, get, parseBody, stripJsonp } from '#/client/index.ts';
import type { Endpoint } from '#/client/types.ts';
import { configure } from '#/config/index.ts';
import {
   APIError,
   NetworkError,
   NotFoundError,
   ParseError,
   ServerError,
} from '#/errors/index.ts';
import { jsonp, mockFetch, siteKit } from './helpers.ts';

const seasons: Endpoint = {
   feed: 'modulekit',
   view: 'seasons',
   dataKey: 'Seasons',
};
const player: Endpoint = {
   feed: 'modulekit',
   view: 'player',
   dataKey: 'Player',
};
const summary: Endpoint = {
   feed: 'gc',
   tab: 'gamesummary',
   dataKey: 'Gamesummary',
};
const players: Endpoint = { feed: 'statviewfeed', view: 'players' };

describe('buildUrl', () => {
   mockFetch();

   test('modulekit adds key, client code, view, fmt and lang', () => {
      const url = new URL(buildUrl(seasons));
      expect(url.origin + url.pathname).toBe(
         'https://lscluster.hockeytech.com/feed/index.php',
      );
      expect(Object.fromEntries(url.searchParams)).toEqual({
         feed: 'modulekit',
         key: '446521baf8c38984',
         client_code: 'pwhl',
         view: 'seasons',
         fmt: 'json',
         lang: 'en',
      });
   });

   test('gc uses tab and lang_code', () => {
      const q = new URL(buildUrl(summary, { game_id: 210 })).searchParams;
      expect(q.get('tab')).toBe('gamesummary');
      expect(q.get('lang_code')).toBe('en');
      expect(q.get('game_id')).toBe('210');
      expect(q.has('view')).toBeFalse();
   });

   test('statviewfeed adds league and site ids', () => {
      const q = new URL(buildUrl(players)).searchParams;
      expect(q.get('league_id')).toBe('1');
      expect(q.get('site_id')).toBe('0');
      expect(q.has('fmt')).toBeFalse();
   });

   test('omits undefined params and honours configure()', () => {
      configure({
         baseUrl: 'https://cluster.leaguestat.com/feed/',
         language: 'fr',
      });
      const url = new URL(buildUrl(seasons, { season_id: undefined }));
      expect(url.host).toBe('cluster.leaguestat.com');
      expect(url.searchParams.get('lang')).toBe('fr');
      expect(url.searchParams.has('season_id')).toBeFalse();
   });
});

describe('stripJsonp', () => {
   test('strips bare parentheses', () => {
      expect(stripJsonp('([1,2])')).toBe('[1,2]');
   });

   test('strips a named callback and trailing semicolon', () => {
      expect(stripJsonp('angular.callbacks._2({"a":1});')).toBe('{"a":1}');
   });

   test('leaves plain JSON alone', () => {
      expect(stripJsonp('{"a":1}')).toBe('{"a":1}');
   });
});

describe('parseBody', () => {
   test('unwraps SiteKit.<View>', () => {
      const r = parseBody(
         seasons,
         JSON.stringify(siteKit('Seasons', [{ season_id: '8' }])),
      );
      expect(r).toEqual({ success: true, data: [{ season_id: '8' }] });
   });

   test('unwraps GC.<Tab>', () => {
      const r = parseBody(
         summary,
         JSON.stringify({ GC: { Parameters: {}, Gamesummary: { a: 1 } } }),
      );
      expect(r).toEqual({ success: true, data: { a: 1 } });
   });

   test('returns statviewfeed bodies unwrapped from JSONP', () => {
      const r = parseBody(players, jsonp([{ sections: [] }]));
      expect(r).toEqual({ success: true, data: [{ sections: [] }] });
   });

   test('plain-text "Invalid key." is an APIError', () => {
      const r = parseBody(seasons, 'Invalid key.');
      expect(r.success).toBeFalse();
      if (!r.success) {
         expect(r.error).toBeInstanceOf(APIError);
         expect(r.error.message).toBe('Invalid key.');
      }
   });

   test('unknown view is an APIError', () => {
      const r = parseBody(
         seasons,
         JSON.stringify({
            SiteKit: { Undefined: 'Undefined Tab notaview' },
         }),
      );
      expect(r.success).toBeFalse();
      if (!r.success) {
         expect(r.error).toBeInstanceOf(APIError);
         expect(r.error.message).toBe('Undefined Tab notaview');
      }
   });

   test('error field in data is a NotFoundError', () => {
      const r = parseBody(
         player,
         JSON.stringify(
            siteKit('Player', { error: 'no such person/player found' }),
         ),
      );
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(NotFoundError);
   });

   test('missing data key is an APIError', () => {
      const r = parseBody(seasons, JSON.stringify(siteKit('Other', [])));
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(APIError);
   });

   test('broken JSON is a ParseError', () => {
      const r = parseBody(players, '([{"sections":');
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(ParseError);
   });

   test('empty arrays are a success', () => {
      const r = parseBody(seasons, JSON.stringify(siteKit('Seasons', [])));
      expect(r).toEqual({ success: true, data: [] });
   });
});

describe('get', () => {
   const fetch = mockFetch();

   test('returns unwrapped data', async () => {
      fetch.respond(siteKit('Seasons', [{ season_id: '8' }]));
      const r = await get(seasons);
      expect(r).toEqual({ success: true, data: [{ season_id: '8' }] });
      expect(fetch.calls).toHaveLength(1);
   });

   test('maps HTTP 404 to NotFoundError', async () => {
      fetch.respond('', 404);
      const r = await get(summary, { game_id: 999999 });
      expect(r.success).toBeFalse();
      if (!r.success) {
         expect(r.error).toBeInstanceOf(NotFoundError);
         expect(r.error.context.statusCode).toBe(404);
      }
   });

   test('maps HTTP 5xx to ServerError', async () => {
      fetch.respond('', 503);
      const r = await get(seasons);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(ServerError);
   });

   test('maps thrown fetch errors to NetworkError', async () => {
      fetch.throwOnce(new TypeError('fetch failed'));
      const r = await get(seasons);
      expect(r.success).toBeFalse();
      if (!r.success) expect(r.error).toBeInstanceOf(NetworkError);
   });
});
