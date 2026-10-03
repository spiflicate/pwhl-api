import { afterEach, beforeEach } from 'bun:test';
import { configure, resetConfig } from '#/config/index.ts';

export interface MockFetch {
   /** URLs requested, in order */
   calls: URL[];
   /** Set the next response body (string or JSON value) and status */
   respond(body: unknown, status?: number): void;
   /** Make the next request throw */
   throwOnce(error: Error): void;
}

/** Replace globalThis.fetch for each test in the current file */
export function mockFetch(): MockFetch {
   const original = globalThis.fetch;
   let body: unknown = {};
   let status = 200;
   let thrown: Error | undefined;

   const mock: MockFetch = {
      calls: [],
      respond(b, s = 200) {
         body = b;
         status = s;
      },
      throwOnce(error) {
         thrown = error;
      },
   };

   beforeEach(() => {
      mock.calls.length = 0;
      body = {};
      status = 200;
      thrown = undefined;
      configure({ logLevel: 'silent' });
      globalThis.fetch = (async (input: string | URL | Request) => {
         mock.calls.push(new URL(String(input)));
         if (thrown) {
            const e = thrown;
            thrown = undefined;
            throw e;
         }
         const text =
            typeof body === 'string' ? body : JSON.stringify(body);
         return new Response(text, { status });
      }) as typeof fetch;
   });

   afterEach(() => {
      globalThis.fetch = original;
      resetConfig();
   });

   return mock;
}

export const siteKit = (dataKey: string, data: unknown) => ({
   SiteKit: { Parameters: {}, [dataKey]: data, Copyright: {} },
});

export const gc = (dataKey: string, data: unknown) => ({
   GC: { Parameters: {}, [dataKey]: data },
});

/** Wrap a value the way statviewfeed does: `([...])` */
export const jsonp = (data: unknown) => `(${JSON.stringify(data)})`;
