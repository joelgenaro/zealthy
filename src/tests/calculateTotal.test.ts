import { calculateTotal } from '@/utils/calculateTotal';

describe('calculateTotal', () => {
  it('should return zero for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should correctly sum the prices of the items', () => {
    const items = [{ price: 10 }, { price: 15 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(45);
  });

  it('should handle items with price of 0', () => {
    const items = [{ price: 0 }, { price: 0 }, { price: 0 }];
    expect(calculateTotal(items)).toBe(0);
  });

  it('should return correct total with floating point numbers', () => {
    const items = [{ price: 10.75 }, { price: 15.5 }, { price: 20.25 }];
    expect(calculateTotal(items)).toBeCloseTo(46.5);
  });
});
