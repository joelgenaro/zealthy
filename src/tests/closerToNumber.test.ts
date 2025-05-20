import { closerToNumber } from '@/utils/closerToNumber';

describe('closerToNumber function', () => {
  it('should return value1 if it is closer to the number', () => {
    expect(closerToNumber(5, 4, 12)).toBe(4);
  });

  it('should return value2 if it is closer to the number', () => {
    expect(closerToNumber(10, 4, 12)).toBe(12);
  });

  it('should return value1 as default when both differences are equal', () => {
    expect(closerToNumber(8, 4, 12)).toBe(4);
  });

  it('supports default values for value1 and value2', () => {
    expect(closerToNumber(6)).toBe(4);
  });

  it('returns value1 if number is equally distant from value1 and value2', () => {
    expect(closerToNumber(8, 6, 10)).toBe(6);
  });
});
