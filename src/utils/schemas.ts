import { type } from 'arktype';
import type { APIResult } from '#/client/types.ts';
import { ValidationError } from '#/errors/index.ts';

export function isParseError(value: unknown): value is type.errors {
   return value instanceof type.errors;
}

/** Turn an arktype failure into a failed APIResult */
export function invalid(
   errors: type.errors,
   endpoint: string,
): { success: false; error: ValidationError } {
   return {
      success: false,
      error: new ValidationError(errors.summary, { endpoint }),
   };
}

/** Validate input, returning parsed output or a failed APIResult */
export function validate<T>(
   schema: (input: unknown) => T | type.errors,
   input: unknown,
   endpoint: string,
): { ok: true; value: T } | { ok: false; result: APIResult<never> } {
   const out = schema(input);
   if (isParseError(out))
      return { ok: false, result: invalid(out, endpoint) };
   return { ok: true, value: out };
}

/** A positive integer id, given as a number or numeric string */
const Id = type('number.integer > 0').or(
   type('string.integer.parse').to('number.integer > 0'),
);

export const SeasonId = Id.describe('a season id (positive integer)');
export const TeamId = Id.describe('a team id (positive integer)');
export const PlayerId = Id.describe('a player id (positive integer)');
export const GameId = Id.describe('a game id (positive integer)');

export const OptionalTeamId = TeamId.or('undefined');

export const DayCount = type('0 <= number.integer <= 365').describe(
   'a whole number of days from 0 to 365',
);

export const StatsPosition = type("'skaters' | 'goalies'");
export const StatsType = type("'standard' | 'bio' | 'extended'");
