/**
 * Helpers for the feed's string-typed scalars.
 *
 * Nearly every value arrives as a string ("8", "0", "0.955"); these
 * convert them in one place.
 */

/** "1" / "0" (or 1 / 0) to a boolean. Anything else is false. */
export function toBool(value: unknown): boolean {
   return value === '1' || value === 1 || value === true;
}

/**
 * Numeric string to number. Returns `null` for empty strings, "N/A",
 * and anything else that is not a finite number.
 */
export function toNumber(value: unknown): number | null {
   if (typeof value === 'number')
      return Number.isFinite(value) ? value : null;
   if (typeof value !== 'string' || value.trim() === '') return null;
   const n = Number(value);
   return Number.isFinite(n) ? n : null;
}

/** "mm:ss" (minutes may exceed 59, e.g. "565:17") to seconds */
export function clockToSeconds(value: string): number | null {
   const match = /^(\d+):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
   if (!match) return null;
   const [, a, b, c] = match;
   if (c !== undefined) {
      return Number(a) * 3600 + Number(b) * 60 + Number(c);
   }
   return Number(a) * 60 + Number(b);
}
