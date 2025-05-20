import coachingNameFilter from '@/utils/coachingNameFilter';

describe('coachingNameFilter', () => {
  test('removes the substring "(Texas)" from the input string', () => {
    const input = 'Doctor John Doe (Texas)';
    const output = coachingNameFilter(input);
    expect(output).toBe('Doctor John Doe ');
  });

  test('returns the input string unchanged if it does not contain "(Texas)"', () => {
    const input = 'Doctor Jane Doe';
    const output = coachingNameFilter(input);
    expect(output).toBe('Doctor Jane Doe');
  });

  test('should return an empty string if input is an empty string', () => {
    const input = '';
    const output = coachingNameFilter(input);
    expect(output).toBe('');
  });

  test('should handle null or undefined inputs gracefully', () => {
    // @ts-ignore
    expect(coachingNameFilter(undefined)).toBe(undefined);
    // @ts-ignore
    expect(coachingNameFilter(null)).toBe(null);
  });
});
