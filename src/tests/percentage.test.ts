import { percentage } from '@/utils/percentage';

describe('percentage function', () => {
  test('should calculate the percentage of a total', () => {
    expect(percentage(50, 200)).toBe(100);
  });

  test('should round to the nearest whole number', () => {
    expect(percentage(33, 300)).toBe(99);
  });

  test('should return 0 if percent is 0', () => {
    expect(percentage(0, 1000)).toBe(0);
  });

  test('should handle 100 percent correctly', () => {
    expect(percentage(100, 123)).toBe(123);
  });

  test('return type should be a number', () => {
    const result = percentage(25, 400);
    expect(typeof result).toBe('number');
  });
});
