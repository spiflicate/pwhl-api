import { describe, expect, test } from 'bun:test';
import { goals, runningClock, watch } from '#/api/live.ts';
import {
   applyEvent,
   livePath,
   liveUrl,
   parseEvent,
} from '#/client/firebase.ts';
import { configure, resetConfig } from '#/config/index.ts';
import { NotFoundError, ValidationError } from '#/errors/index.ts';
import { mockFetch } from './helpers.ts';

describe('live paths', () => {
   test('runningclock has no language', () => {
      expect(livePath('runningclock', 353)).toBe('runningclock/games/353');
   });

   test('other sections use the configured language', () => {
      expect(livePath('goals', 353)).toBe('goals/1/games/353');
      configure({ language: 'fr' });
      expect(livePath('goals', 353)).toBe('goals/2/games/353');
      resetConfig();
   });

   test('url adds scheme, client code and .json', () => {
      expect(liveUrl('runningclock/games/353')).toBe(
         'https://leaguestat-b9523.firebaseio.com/svf/pwhl/runningclock/games/353.json',
      );
      configure({ firebaseUrl: 'example.firebaseio.com/' });
      expect(liveUrl('x')).toBe(
         'https://example.firebaseio.com/svf/pwhl/x.json',
      );
      resetConfig();
   });
});

describe('live reads', () => {
   const fetch = mockFetch();

   test('returns the value', async () => {
      const clock = {
         Clock: {
            Minutes: '12',
            Seconds: '34',
            Running: true,
            period: '2',
         },
         DatePlayed: '2026-11-22',
         status_id: 2,
      };
      fetch.respond(clock);
      const result = await runningClock(353);
      expect(result).toEqual({ success: true, data: clock });
      expect(fetch.calls[0]?.pathname).toBe(
         '/svf/pwhl/runningclock/games/353.json',
      );
   });

   test('returns null for a game the feed lacks', async () => {
      fetch.respond(null);
      expect(await goals(1)).toEqual({ success: true, data: null });
   });

   test('maps Firebase error bodies', async () => {
      fetch.respond({ error: 'Permission denied' }, 404);
      const result = await goals(353);
      expect(result.success).toBe(false);
      if (!result.success) {
         expect(result.error).toBeInstanceOf(NotFoundError);
         expect(result.error.message).toBe('Permission denied');
      }
   });

   test('validates the game id', async () => {
      const result = await runningClock(-1);
      expect(result.success).toBe(false);
      if (!result.success)
         expect(result.error).toBeInstanceOf(ValidationError);
      expect(fetch.calls).toHaveLength(0);
   });
});

describe('stream events', () => {
   test('parses event blocks and skips keep-alives', () => {
      expect(parseEvent('event: keep-alive\ndata: null')).toBeNull();
      expect(
         parseEvent('event: put\ndata: {"path":"/","data":{"a":1}}'),
      ).toEqual({ type: 'put', data: { path: '/', data: { a: 1 } } });
   });

   test('put replaces at a path, patch merges, null deletes', () => {
      let v = applyEvent(null, 'put', { path: '/', data: { a: { b: 1 } } });
      expect(v).toEqual({ a: { b: 1 } });
      v = applyEvent(v, 'put', { path: '/a/c', data: 2 });
      expect(v).toEqual({ a: { b: 1, c: 2 } });
      v = applyEvent(v, 'patch', { path: '/a', data: { b: 3, 'd/e': 4 } });
      expect(v).toEqual({ a: { b: 3, c: 2, d: { e: 4 } } });
      v = applyEvent(v, 'put', { path: '/a/b', data: null });
      expect(v).toEqual({ a: { c: 2, d: { e: 4 } } });
      expect(applyEvent(v, 'put', { path: '/', data: null })).toBeNull();
   });
});

describe('watch', () => {
   test('applies streamed events and stops', async () => {
      const original = globalThis.fetch;
      const body = [
         'event: put\ndata: {"path":"/","data":{"Clock":{"Minutes":"20"}}}\n\n',
         'event: keep-alive\ndata: null\n\n',
         'event: patch\ndata: {"path":"/Clock","data":{"Minutes":"19"}}\n\n',
      ].join('');
      globalThis.fetch = (async () =>
         new Response(body, { status: 200 })) as unknown as typeof fetch;
      const seen: unknown[] = [];
      const done = new Promise<void>((resolve) => {
         const stop = watch(
            'runningclock',
            353,
            (data) => {
               seen.push(data);
               if (seen.length === 2) {
                  stop();
                  resolve();
               }
            },
            { retryMs: 10 },
         );
      });
      await done;
      globalThis.fetch = original;
      expect(seen).toEqual([
         { Clock: { Minutes: '20' } },
         { Clock: { Minutes: '19' } },
      ]);
   });
});
