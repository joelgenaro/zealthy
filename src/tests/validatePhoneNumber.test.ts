import { validatePhoneNumber } from '@/utils/validatePhoneNumber';

describe('validatePhoneNumber', () => {
  it('should return false for null input', () => {
    expect(validatePhoneNumber(null)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(validatePhoneNumber(undefined)).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(validatePhoneNumber('')).toBe(false);
  });

  it('should return false if phoneNumber has less than 11 digits', () => {
    expect(validatePhoneNumber('1234567890')).toBe(false);
  });

  it('should return false if phoneNumber has more than 11 digits', () => {
    expect(validatePhoneNumber('123456789012')).toBe(false);
  });

  it('should return false if phoneNumber contains invalid characters', () => {
    expect(validatePhoneNumber('1234AB67890')).toBe(false);
  });

  it('should return false if area code is not valid', () => {
    expect(validatePhoneNumber('1-800-123-4567')).toBe(false);
  });
});
