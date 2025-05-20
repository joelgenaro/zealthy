import {
  buildSig,
  buildSupplies,
  pharmacyNotes,
} from '@/utils/Empower/buildEmpowerPrescriptions';

describe('pharmacyNotes', () => {
  it('returns compounded message for tirzepatide medication', () => {
    const prescription = { medication: 'Tirzepatide' };
    const result = pharmacyNotes(prescription as any);
    expect(result).toBe(
      'The patient requires compounded Tirzepatide + Niacinamide to facilitate a dose that cannot be achieved with the commercially available pre-dosed pen.'
    );
  });

  it('returns null for non-tirzepatide medication', () => {
    const prescription = { medication: 'Aspirin' };
    const result = pharmacyNotes(prescription as any);
    expect(result).toBeNull();
  });
});

describe('buildSig', () => {
  it('constructs signature string correctly', () => {
    const directions = 'Take 1 tablet daily';
    const result = buildSig(directions, 2, 0);
    expect(result).toBe(
      'Month 1 and 2: Take 1 tablet daily or as directed by your provider'
    );
  });

  it('correctly trims parenthesis in directions', () => {
    const directions = 'Take 1 tablet (with water)';
    const result = buildSig(directions, 1, 0);
    expect(result).toBe(
      'Month 1: Take 1 tablet  or as directed by your provider'
    );
  });
});

describe('buildSupplies', () => {
  const mockData = {
    total: 2,
    patientProfile: {
      last_name: 'Doe',
      first_name: 'John',
      gender: 'Male',
      birth_date: '1990-01-01',
      phone_number: '1234567890',
      region: 'NY',
    },
    patientAddress: {
      address_line_1: '123 Main St',
      address_line_2: 'Apt 4',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
    },
    patientRegion: 'NY',
  };

  it('returns correct supply details with multiple entries', () => {
    const supplies = buildSupplies(mockData as any);
    expect(supplies).toHaveLength(2);
    expect(supplies[0].Patient.FirstName).toBe('John');
    expect(supplies[1].Medication.ItemDesignatorId).toBe(
      '164E03AAC77A9C31601F4F93A294D65F'
    );
  });
});

describe('buildPrescription', () => {
  const mockData = {
    idx: 0,
    quantity: 1,
    patientProfile: {
      last_name: 'Doe',
      first_name: 'John',
      gender: 'Male',
      birth_date: '1990-01-01',
      phone_number: '1234567890',
    },
    patientAddress: {
      address_line_1: '123 Main St',
      address_line_2: 'Apt 4',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
    },
    prescription: {
      medication_id: 'MED123',
      medication: 'Metformin',
      dosage_instructions: 'Take one daily',
    },
    patientRegion: 'NY',
  };
});
