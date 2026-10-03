/**
 * HockeyTech feed client.
 *
 * Every PWHL endpoint is the same PHP script switched by query parameters.
 * The client adds the shared parameters, normalizes the three response
 * envelopes, and detects the errors the feed reports with HTTP 200.
 */

import { config, type LogLevel } from '#/config/index.ts';
import {
   APIError,
   ErrorCategory,
   errorFromStatus,
   errorFromThrown,
   NotFoundError,
   ParseError,
   type PWHLError,
} from '#/errors/index.ts';
import type { APIResult, Endpoint, QueryParams } from './types.ts';

export type { APIResult, Endpoint, QueryParams } from './types.ts';

/** Build the full request URL for an endpoint */
export function buildUrl(endpoint: Endpoint, params: QueryParams = {}) {
   const url = new URL(config.baseUrl);
   const q = url.searchParams;
   q.set('feed', endpoint.feed);
   q.set('key', config.key);
   q.set('client_code', config.clientCode);

   switch (endpoint.feed) {
      case 'modulekit':
         q.set('view', endpoint.view);
         q.set('fmt', 'json');
         q.set('lang', config.language);
         break;
      case 'gc':
         q.set('tab', endpoint.tab);
         q.set('fmt', 'json');
         q.set('lang_code', config.language);
         break;
      case 'statviewfeed':
         q.set('view', endpoint.view);
         q.set('league_id', String(config.leagueId));
         q.set('site_id', String(config.siteId));
         q.set('lang', config.language);
         break;
   }

   for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
   }
   return url.toString();
}

/**
 * Strip a JSONP wrapper: `callback({...})` or a bare `({...})`.
 * Returns the input unchanged when it is not wrapped.
 */
export function stripJsonp(body: string): string {
   const text = body.trim();
   const match = /^(?:[A-Za-z_$][\w.$]*)?\(([\s\S]*)\);?$/.exec(text);
   return match?.[1] ?? text;
}

/** Send a GET request to a HockeyTech endpoint */
export async function get<T>(
   endpoint: Endpoint,
   params?: QueryParams,
): Promise<APIResult<T>> {
   const url = buildUrl(endpoint, params);
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), config.timeout);

   try {
      const response = await fetch(url, {
         method: 'GET',
         headers: { Accept: 'application/json' },
         signal: controller.signal,
      });

      if (!response.ok) {
         return fail(errorFromStatus(response, { endpoint: url }));
      }

      const text = await response.text();
      const parsed = parseBody(endpoint, text, url);
      if (!parsed.success) return fail(parsed.error);
      return { success: true, data: parsed.data as T };
   } catch (error) {
      return fail(errorFromThrown(error, { endpoint: url }));
   } finally {
      clearTimeout(timeoutId);
   }
}

/**
 * Parse a response body and unwrap the feed's envelope.
 * Exported for tests and for parsing captured fixtures.
 */
export function parseBody(
   endpoint: Endpoint,
   text: string,
   url?: string,
): APIResult<unknown> {
   const ctx = { ...(url !== undefined && { endpoint: url }) };
   const trimmed = text.trim();

   // A bad key returns plain text, e.g. "Invalid key."
   if (!/^[[{(]/.test(trimmed) && !/^[A-Za-z_$][\w.$]*\(/.test(trimmed)) {
      return {
         success: false,
         error: new APIError(trimmed || 'Empty response body', {
            ...ctx,
            responseBody: trimmed,
         }),
      };
   }

   let body: unknown;
   try {
      body = JSON.parse(
         endpoint.feed === 'statviewfeed' ? stripJsonp(trimmed) : trimmed,
      );
   } catch (cause) {
      return {
         success: false,
         error: new ParseError('Response body is not valid JSON', {
            ...ctx,
            cause,
            responseBody: trimmed.slice(0, 500),
         }),
      };
   }

   if (endpoint.feed === 'statviewfeed')
      return { success: true, data: body };

   const envelopeKey = endpoint.feed === 'modulekit' ? 'SiteKit' : 'GC';
   const envelope = isRecord(body) ? body[envelopeKey] : undefined;
   if (!isRecord(envelope)) {
      return {
         success: false,
         error: new APIError(`Response has no ${envelopeKey} envelope`, {
            ...ctx,
            responseBody: body,
         }),
      };
   }

   // Unknown view: {"SiteKit": {"Undefined": "Undefined Tab notaview"}}
   if (typeof envelope.Undefined === 'string') {
      return {
         success: false,
         error: new APIError(envelope.Undefined, {
            ...ctx,
            responseBody: body,
         }),
      };
   }

   if (!(endpoint.dataKey in envelope)) {
      return {
         success: false,
         error: new APIError(
            `Response is missing ${envelopeKey}.${endpoint.dataKey}`,
            { ...ctx, responseBody: body },
         ),
      };
   }

   const data = envelope[endpoint.dataKey];

   // Unknown id: {"Player": {"error": "no such person/player found"}}
   if (isRecord(data) && typeof data.error === 'string') {
      return {
         success: false,
         error: new NotFoundError(data.error, {
            ...ctx,
            statusCode: 200,
            responseBody: body,
         }),
      };
   }

   return { success: true, data };
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return (
      typeof value === 'object' && value !== null && !Array.isArray(value)
   );
}

const LEVELS: Record<LogLevel, number> = {
   silent: 0,
   error: 1,
   warn: 2,
   info: 3,
   debug: 4,
};

function fail(error: PWHLError): { success: false; error: PWHLError } {
   const level: LogLevel =
      error.category === ErrorCategory.NETWORK ||
      error.category === ErrorCategory.SERVER
         ? 'error'
         : error.category === ErrorCategory.VALIDATION
           ? 'debug'
           : 'info';
   if (LEVELS[level] <= LEVELS[config.logLevel]) {
      console.error(`[PWHL API] ${error.message}`, error.context);
   }
   return { success: false, error };
}
