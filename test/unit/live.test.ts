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

describe('French fallback', () => {
   /** Answer each Firebase path from `bodies` (null when absent) */
   const serve = (bodies: Record<string, unknown>) => {
      const seen: string[] = [];
      const original = globalThis.fetch;
      globalThis.fetch = (async (input: string | URL | Request) => {
         const path = new URL(String(input)).pathname;
         seen.push(path);
         return new Response(JSON.stringify(bodies[path] ?? null));
      }) as typeof fetch;
      return {
         seen,
         restore: () => {
            globalThis.fetch = original;
            resetConfig();
         },
      };
   };
   const fr = '/svf/pwhl/goals/2/games/358.json';
   const en = '/svf/pwhl/goals/1/games/358.json';

   test('reads English while the French section is empty', async () => {
      configure({ language: 'fr', logLevel: 'silent' });
      const s = serve({ [en]: { DatePlayed: '2026-11-25' } });
      const result = await goals(358);
      s.restore();
      expect(result).toEqual({
         success: true,
         data: { DatePlayed: '2026-11-25' },
      });
      expect(s.seen).toEqual([fr, en]);
   });

   test('uses French when it has data', async () => {
      configure({ language: 'fr', logLevel: 'silent' });
      const s = serve({
         [fr]: { DatePlayed: 'fr' },
         [en]: { DatePlayed: 'en' },
      });
      const result = await goals(358);
      s.restore();
      expect(result).toEqual({ success: true, data: { DatePlayed: 'fr' } });
      expect(s.seen).toEqual([fr]);
   });

   test('English reads and the running clock never fall back', async () => {
      configure({ logLevel: 'silent' });
      const s = serve({});
      await goals(358);
      configure({ language: 'fr' });
      await runningClock(358);
      s.restore();
      expect(s.seen).toEqual([en, '/svf/pwhl/runningclock/games/358.json']);
   });

   test('watch reports English, not null, while French is empty', async () => {
      configure({ language: 'fr', logLevel: 'silent' });
      const original = globalThis.fetch;
      const put = (data: unknown) =>
         `event: put\ndata: ${JSON.stringify({ path: '/', data })}\n\n`;
      globalThis.fetch = (async (input: string | URL | Request) => {
         const path = new URL(String(input)).pathname;
         // French answers null first; English a moment later
         if (path === fr) return new Response(put(null));
         await new Promise((r) => setTimeout(r, 20));
         return new Response(put({ DatePlayed: 'en' }));
      }) as typeof fetch;
      const seen: unknown[] = [];
      await new Promise<void>((resolve) => {
         const stop = watch(
            'goals',
            358,
            (data) => {
               seen.push(data);
               stop();
               resolve();
            },
            { retryMs: 1000 },
         );
      });
      globalThis.fetch = original;
      resetConfig();
      expect(seen).toEqual([{ DatePlayed: 'en' }]);
   });

   test('watch reports French over English', async () => {
      configure({ language: 'fr', logLevel: 'silent' });
      const original = globalThis.fetch;
      const put = (data: unknown) =>
         `event: put\ndata: ${JSON.stringify({ path: '/', data })}\n\n`;
      globalThis.fetch = (async (input: string | URL | Request) => {
         const path = new URL(String(input)).pathname;
         // English arrives first; French appears a moment later
         if (path === en) return new Response(put({ DatePlayed: 'en' }));
         await new Promise((r) => setTimeout(r, 20));
         return new Response(put({ DatePlayed: 'fr' }));
      }) as typeof fetch;
      const seen: unknown[] = [];
      await new Promise<void>((resolve) => {
         const stop = watch(
            'goals',
            358,
            (data) => {
               seen.push(data);
               if (seen.length === 2) {
                  stop();
                  resolve();
               }
            },
            { retryMs: 1000 },
         );
      });
      globalThis.fetch = original;
      resetConfig();
      expect(seen).toEqual([{ DatePlayed: 'en' }, { DatePlayed: 'fr' }]);
   });
});
