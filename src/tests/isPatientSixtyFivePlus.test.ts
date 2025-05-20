import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';

describe('isPatientSixtyFivePlus', () => {
  it('should return true if the patient is 65 years old', () => {
    const testDate = new Date();
    testDate.setFullYear(testDate.getFullYear() - 65);
    expect(isPatientSixtyFivePlus(testDate.toISOString())).toBe(true);
  });

  it('should return true if the patient is older than 65 years', () => {
    const testDate = new Date();
    testDate.setFullYear(testDate.getFullYear() - 70);
    expect(isPatientSixtyFivePlus(testDate.toISOString())).toBe(true);
  });

  it('should return false if the patient is younger than 65 years', () => {
    const testDate = new Date();
    testDate.setFullYear(testDate.getFullYear() - 60);
    expect(isPatientSixtyFivePlus(testDate.toISOString())).toBe(false);
  });

  it('should return false for invalid date inputs', () => {
    expect(isPatientSixtyFivePlus('')).toBe(false);
    expect(isPatientSixtyFivePlus('invalid-date')).toBe(false);
  });
});
