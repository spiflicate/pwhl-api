/**
 * Structural shapes of JSON values, for spotting feed drift.
 *
 * A shape flattens a value into paths, each with the set of JSON kinds
 * seen there: `$[].home_team` → `object`, `$[].home_team.name` →
 * `string`. Array items merge under `[]`, and object keys made only of
 * digits (ids used as keys) merge under `{id}`, so the shape depends on
 * the feed's structure rather than on the data in it.
 */

export type Kind =
   | 'string'
   | 'number'
   | 'boolean'
   | 'null'
   | 'object'
   | 'array';

/** Path → kinds seen there, joined with `|` in sorted order */
export type Shape = Record<string, string>;

export function kindOf(value: unknown): Kind {
   if (value === null) return 'null';
   if (Array.isArray(value)) return 'array';
   const t = typeof value;
   if (t === 'string' || t === 'number' || t === 'boolean') return t;
   return 'object';
}

/** Flatten a JSON value into its shape */
export function shapeOf(value: unknown): Shape {
   const kinds = new Map<string, Set<Kind>>();
   const walk = (v: unknown, path: string) => {
      const kind = kindOf(v);
      const seen = kinds.get(path) ?? new Set<Kind>();
      kinds.set(path, seen.add(kind));
      if (kind === 'array') {
         for (const item of v as unknown[]) walk(item, `${path}[]`);
      } else if (kind === 'object') {
         for (const [k, child] of Object.entries(v as object)) {
            walk(child, `${path}.${/^\d+$/.test(k) ? '{id}' : k}`);
         }
      }
   };
   walk(value, '$');
   const shape: Shape = {};
   for (const path of [...kinds.keys()].sort()) {
      shape[path] = [...(kinds.get(path) ?? [])].sort().join('|');
   }
   return shape;
}

export type Change =
   | { kind: 'added'; path: string; live: string }
   | { kind: 'removed'; path: string; baseline: string }
   | { kind: 'changed'; path: string; baseline: string; live: string };

/** The path a value at `path` sits under, or undefined for the root */
function parentOf(path: string): string | undefined {
   const m = /^(.*)(\[\]|\.[^.[\]]+)$/.exec(path);
   return m?.[1] || undefined;
}

/**
 * Compare a live shape with its baseline.
 *
 * - added: a path the baseline never saw.
 * - removed: a baseline path missing from live data, reported only when
 *   its parent is present in live data and could have held it (an empty
 *   list says nothing about what its items look like).
 * - changed: a path with a kind the baseline never saw there. A `null`
 *   where the baseline only had other kinds is not counted, since the
 *   feed blanks fields with null freely.
 */
export function diffShapes(baseline: Shape, live: Shape): Change[] {
   const changes: Change[] = [];
   for (const [path, kinds] of Object.entries(live)) {
      const before = baseline[path];
      if (before === undefined) {
         if (!isUnder(path, baseline)) continue;
         changes.push({ kind: 'added', path, live: kinds });
         continue;
      }
      const known = new Set(before.split('|'));
      const fresh = kinds
         .split('|')
         .filter((k) => !known.has(k) && k !== 'null');
      if (fresh.length > 0) {
         changes.push({
            kind: 'changed',
            path,
            baseline: before,
            live: kinds,
         });
      }
   }
   for (const [path, kinds] of Object.entries(baseline)) {
      if (path in live) continue;
      if (!couldHold(path, live)) continue;
      changes.push({ kind: 'removed', path, baseline: kinds });
   }
   return changes.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Report an added path only at its top: when `$.a` is new, `$.a.b` is
 * part of the same change, and so are the children of a path that just
 * became an object or list (reported as changed).
 */
function isUnder(path: string, baseline: Shape): boolean {
   const parent = parentOf(path);
   if (parent === undefined) return true;
   const kinds = baseline[parent];
   if (kinds === undefined) return false;
   return kinds
      .split('|')
      .includes(path.endsWith('[]') ? 'array' : 'object');
}

/**
 * Whether live data could have held a baseline path: its parent was an
 * object in live data. List items and id-keyed entries are never
 * "removed", since an empty list or map is not a shape change.
 */
function couldHold(path: string, live: Shape): boolean {
   if (path.endsWith('[]') || path.endsWith('.{id}')) return false;
   const parent = parentOf(path);
   if (parent === undefined) return false;
   return (live[parent] ?? '').split('|').includes('object');
}
