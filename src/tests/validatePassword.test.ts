import { validatePassword } from '@/utils/validatePassword';

describe('validatePassword', () => {
  it('should return false for null passwords', () => {
    expect(validatePassword(null)).toBe(false);
  });

  it('should return false for empty passwords', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('should return false for passwords lacking a lowercase letter', () => {
    expect(validatePassword('12345A!@')).toBe(false);
  });

  it('should return false for passwords lacking an uppercase letter', () => {
    expect(validatePassword('12345a!@')).toBe(false);
  });

  it('should return false for passwords lacking a digit', () => {
    expect(validatePassword('abcdeA!@')).toBe(false);
  });

  it('should return false for passwords lacking a special character', () => {
    expect(validatePassword('abcdeA123')).toBe(false);
  });

  it('should return false for passwords shorter than 8 characters', () => {
    expect(validatePassword('Ab1!')).toBe(false);
  });

  it('should return true for valid passwords', () => {
    expect(validatePassword('Abc123!@')).toBe(true);
  });
});
