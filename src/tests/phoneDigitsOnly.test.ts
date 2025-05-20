import { phoneDigitsOnly } from '@/utils/phoneDigitsOnly';

describe('phoneDigitsOnly function', () => {
  test('removes the US country code +1 from the start of a phone number', () => {
    const result = phoneDigitsOnly('+11234567890');
    expect(result).toBe('1234567890');
  });

  test('returns the original string when there is no +1 at the start', () => {
    const result = phoneDigitsOnly('1234567890');
    expect(result).toBe('1234567890');
  });

  test('returns an empty string when input is undefined', () => {
    // @ts-ignore
    const result = phoneDigitsOnly(undefined);
    expect(result).toBe('');
  });

  test('handles the input being null (by treating it as undefined)', () => {
    // @ts-ignore
    const result = phoneDigitsOnly(null);
    expect(result).toBe('');
  });
});
