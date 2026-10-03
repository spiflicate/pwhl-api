import { describe, expect, test } from 'bun:test';
import { clockToSeconds, toBool, toNumber } from '#/utils/normalize.ts';

describe('normalize', () => {
   test('toBool', () => {
      expect(toBool('1')).toBeTrue();
      expect(toBool(1)).toBeTrue();
      expect(toBool('0')).toBeFalse();
      expect(toBool('')).toBeFalse();
   });

   test('toNumber', () => {
      expect(toNumber('8')).toBe(8);
      expect(toNumber('0.955')).toBe(0.955);
      expect(toNumber(3)).toBe(3);
      expect(toNumber('')).toBeNull();
      expect(toNumber('N/A')).toBeNull();
   });

   test('clockToSeconds', () => {
      expect(clockToSeconds('18:50')).toBe(1130);
      expect(clockToSeconds('565:17')).toBe(33917);
      expect(clockToSeconds('00:12:30')).toBe(750);
      expect(clockToSeconds('Final')).toBeNull();
   });
});
