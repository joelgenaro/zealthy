import { wholeOrFloat } from '@/utils/wholeOrFloat';

describe('wholeOrFloat function', () => {
  test('should return the number as is if it is a whole number', () => {
    expect(wholeOrFloat(4)).toBe(4);
    expect(wholeOrFloat(100)).toBe(100);
  });

  test('should return the number with two decimal places if it is a float', () => {
    expect(wholeOrFloat(3.123)).toBe('3.12');
    expect(wholeOrFloat(5.6789)).toBe('5.68');
  });
});
