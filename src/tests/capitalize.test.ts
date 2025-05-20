import { capitalize } from '@/utils/capitalize';

describe('capitalize', () => {
  test('should return an empty string if input is undefined', () => {
    expect(capitalize(undefined)).toBe('');
  });

  test('should return an empty string if input is null', () => {
    expect(capitalize(null)).toBe('');
  });

  test('should capitalize the first letter of the string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('returns an empty string if the input is empty', () => {
    expect(capitalize('')).toBe('');
  });

  test('should not change the case of other characters', () => {
    expect(capitalize('heLLo')).toBe('HeLLo');
  });
});
