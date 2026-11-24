/**
 * Game status codes outside `GameStatus`, for spotting drift that keeps
 * the shape: a status that starts sending `'5'` is still a string.
 */
import type { GameStatus } from '#/types/common.ts';

/** Every member of a string union, checked both ways by the compiler */
function members<T extends string>() {
   return <const A extends readonly T[]>(
      values: A &
         ([Exclude<T, A[number]>] extends [never] ? unknown : never),
   ): ReadonlySet<string> => new Set(values);
}

export const GAME_STATUSES = members<GameStatus>()(['1', '2', '3', '4']);

/**
 * Where each check's response carries a `GameStatus` code. Other
 * `status` fields are free text ("Final SO") or player flags.
 */
export const STATUS_PATHS: Readonly<Record<string, readonly string[]>> = {
   'schedule.season': ['$[].status'],
   'schedule.season (team)': ['$[].status'],
   'schedule.scorebar': ['$[].GameStatus'],
   'schedule.day': ['$[].status'],
   'playoffs.bracket': ['$.rounds[].matchups[].games[].status'],
   'games.summary': ['$.meta.status'],
   'games.clock': ['$.status'],
   // Firebase sends the same codes as numbers
   'live.runningClocks': ['$.{id}.status_id'],
   'live.runningClock': ['$.status_id'],
   'live.publishedClock': ['$.StatusId'],
};

/** The values at a shape-style path (`$.a[].b`) */
export function valuesAt(data: unknown, path: string): unknown[] {
   const steps = path
      .slice(1)
      .split(/(?=\.)|(?=\[\])/)
      .filter(Boolean);
   let current: unknown[] = [data];
   for (const step of steps) {
      const next: unknown[] = [];
      for (const v of current) {
         if (step === '[]') {
            if (Array.isArray(v)) next.push(...v);
         } else if (
            v !== null &&
            typeof v === 'object' &&
            !Array.isArray(v)
         ) {
            const key = step.slice(1);
            const row = v as Record<string, unknown>;
            // `{id}` stands for every numeric key, as in shapes
            if (key === '{id}') {
               for (const [k, child] of Object.entries(row)) {
                  if (/^\d+$/.test(k)) next.push(child);
               }
            } else if (key in row) next.push(row[key]);
         }
      }
      current = next;
   }
   return current;
}

export interface UnknownValue {
   kind: 'status';
   path: string;
   value: string;
}

export function describeValue(v: UnknownValue): string {
   return `unknown game status \`${v.value}\` at \`${v.path}\``;
}

/** Every status code a check's response sends that `GameStatus` lacks */
export function unknownValuesFor(
   check: string,
   data: unknown,
): UnknownValue[] {
   const found = new Map<string, UnknownValue>();
   for (const path of STATUS_PATHS[check] ?? []) {
      for (const value of valuesAt(data, path)) {
         const code = typeof value === 'number' ? String(value) : value;
         if (typeof code === 'string' && !GAME_STATUSES.has(code)) {
            found.set(`${path}=${code}`, {
               kind: 'status',
               path,
               value: code,
            });
         }
      }
   }
   return [...found.values()];
}
