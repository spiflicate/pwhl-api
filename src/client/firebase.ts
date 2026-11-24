/**
 * LeagueStat Firebase client: REST reads and event streams for the live
 * feed under `/svf/<client>/`. Used by `api/live`.
 */
import type { APIResult } from '#/client/types.ts';
import { config } from '#/config/index.ts';
import {
   errorFromStatus,
   errorFromThrown,
   ParseError,
   type PWHLError,
} from '#/errors/index.ts';
import type { LiveSection } from '#/types/index.ts';

export interface StreamOptions {
   /** Called on stream errors; the stream reconnects after `retryMs` */
   onError?: (error: PWHLError) => void;
   /** Delay before reconnecting, in milliseconds (default 5000) */
   retryMs?: number;
}

/** Firebase path of one game in a section, after `/svf/<client>/` */
export function livePath(section: LiveSection, gameId: number | string) {
   if (section === 'runningclock') return `runningclock/games/${gameId}`;
   const lang = config.language === 'fr' ? 2 : 1;
   return `${section}/${lang}/games/${gameId}`;
}

/** Full REST URL for a path under `/svf/<client>/` */
export function liveUrl(path: string): string {
   const base = config.firebaseUrl.replace(/\/+$/, '');
   const host = /^https?:\/\//.test(base) ? base : `https://${base}`;
   return `${host}/svf/${config.clientCode}/${path}.json`;
}

export async function read<T>(path: string): Promise<APIResult<T>> {
   const url = liveUrl(path);
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), config.timeout);
   try {
      const response = await fetch(url, {
         headers: { Accept: 'application/json' },
         signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) {
         return {
            success: false,
            error: errorFromStatus(
               response,
               { endpoint: url, responseBody: text },
               firebaseError(text),
            ),
         };
      }
      try {
         return { success: true, data: JSON.parse(text) as T };
      } catch (cause) {
         return {
            success: false,
            error: new ParseError('Response body is not valid JSON', {
               endpoint: url,
               cause,
               responseBody: text.slice(0, 500),
            }),
         };
      }
   } catch (error) {
      return {
         success: false,
         error: errorFromThrown(error, { endpoint: url }),
      };
   } finally {
      clearTimeout(timeoutId);
   }
}

/** Firebase error bodies look like {"error": "Permission denied"} */
function firebaseError(text: string): string | undefined {
   try {
      const body: unknown = JSON.parse(text);
      if (typeof body === 'object' && body && 'error' in body) {
         const message = (body as { error: unknown }).error;
         if (typeof message === 'string') return message;
      }
   } catch {
      // not JSON
   }
   return undefined;
}

export async function stream(
   url: string,
   signal: AbortSignal,
   onData: (value: unknown) => void,
   options: StreamOptions,
) {
   const retryMs = options.retryMs ?? 5000;
   while (!signal.aborted) {
      let value: unknown = null;
      try {
         const response = await fetch(url, {
            headers: { Accept: 'text/event-stream' },
            signal,
         });
         if (!response.ok || !response.body) {
            const text = await response.text().catch(() => '');
            throw errorFromStatus(
               response,
               { endpoint: url, responseBody: text },
               firebaseError(text),
            );
         }
         const decoder = new TextDecoder();
         let buffer = '';
         for await (const chunk of response.body) {
            buffer += decoder.decode(chunk, { stream: true });
            for (;;) {
               const end = buffer.indexOf('\n\n');
               if (end < 0) break;
               const event = parseEvent(buffer.slice(0, end));
               buffer = buffer.slice(end + 2);
               if (!event) continue;
               if (event.type === 'put' || event.type === 'patch') {
                  value = applyEvent(value, event.type, event.data);
                  onData(value);
               } else if (
                  event.type === 'cancel' ||
                  event.type === 'auth_revoked'
               ) {
                  throw new ParseError(`Stream ${event.type}`, {
                     endpoint: url,
                     responseBody: event.data,
                  });
               }
            }
         }
      } catch (error) {
         if (signal.aborted) return;
         options.onError?.(errorFromThrown(error, { endpoint: url }));
      }
      if (signal.aborted) return;
      await new Promise((resolve) => setTimeout(resolve, retryMs));
   }
}

interface StreamEvent {
   type: string;
   data: unknown;
}

/** Parse one server-sent event block; null for keep-alives */
export function parseEvent(block: string): StreamEvent | null {
   let type = '';
   let data = '';
   for (const line of block.split('\n')) {
      if (line.startsWith('event:')) type = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
   }
   if (!type || type === 'keep-alive') return null;
   try {
      return { type, data: JSON.parse(data) };
   } catch {
      return { type, data };
   }
}

/**
 * Apply a Firebase stream event to the current value. `put` replaces the
 * value at `path`; `patch` merges its keys into it. A `null` leaf deletes.
 */
export function applyEvent(
   value: unknown,
   type: 'put' | 'patch',
   payload: unknown,
): unknown {
   if (!isRecord(payload) || typeof payload.path !== 'string') return value;
   const keys = payload.path.split('/').filter(Boolean);
   if (type === 'put') return setAt(value, keys, payload.data);
   if (!isRecord(payload.data)) return value;
   let next = value;
   for (const [key, child] of Object.entries(payload.data)) {
      next = setAt(
         next,
         [...keys, ...key.split('/').filter(Boolean)],
         child,
      );
   }
   return next;
}

function setAt(value: unknown, keys: string[], leaf: unknown): unknown {
   if (keys.length === 0) return leaf;
   const [key, ...rest] = keys as [string, ...string[]];
   const copy: Record<string, unknown> = isRecord(value)
      ? { ...value }
      : {};
   const child = setAt(copy[key], rest, leaf);
   if (child === null || child === undefined) delete copy[key];
   else copy[key] = child;
   return Object.keys(copy).length === 0 ? null : copy;
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return (
      typeof value === 'object' && value !== null && !Array.isArray(value)
   );
}
