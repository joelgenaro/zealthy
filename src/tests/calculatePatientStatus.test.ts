import { clinicianTitle } from '@/utils/clinicianTitle';

describe('clinicianTitle', () => {
  it('should prefix with "Dr." if the clinician type includes "MD or DO"', () => {
    const clinician = {
      type: ['MD or DO'],
      profiles: {
        first_name: 'John',
        last_name: 'Doe',
      },
    };
    const result = clinicianTitle(clinician);
    expect(result).toMatch(/^Dr.\s/);
  });

  it('should not prefix with "Dr." if clinician type does not include "MD or DO"', () => {
    const clinician = {
      type: ['Nurse'],
      profiles: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
    };
    const result = clinicianTitle(clinician);
    expect(result).not.toMatch(/^Dr.\s/);
  });

  it('should correctly format the full title including first and last names', () => {
    const clinician = {
      type: ['MD or DO'],
      profiles: {
        first_name: 'John',
        last_name: 'Doe',
      },
    };
    const result = clinicianTitle(clinician);
    expect(result).toBe('Dr. John Doe');
  });
});
