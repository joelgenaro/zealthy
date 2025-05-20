import { calcBmiIndex, calcTargetWeight } from '@/utils/calcBmiIndex';

describe('calcBmiIndex', () => {
  test('should calculate BMI correctly and round to one decimal place', () => {
    expect(calcBmiIndex(70, 150)).toBe(21.5);
    expect(calcBmiIndex(65, 160)).toBe(26.6);
  });

  test('should return a number', () => {
    expect(typeof calcBmiIndex(70, 150)).toBe('number');
  });
});

describe('calcTargetWeight', () => {
  test('should calculate target weight based on height in inches correctly', () => {
    expect(calcTargetWeight(70)).toBe(128);
    expect(calcTargetWeight(65)).toBe(111);
  });

  test('should return an integer value', () => {
    expect(Number.isInteger(calcTargetWeight(70))).toBeTruthy();
  });
});
