import {
  combinations,
  hairLossMedication,
  hairLossMedication6month,
} from '@/constants/hairLossMedicationMapping';

describe('Data structure tests', () => {
  test('combinations should be defined and contains specific keys', () => {
    expect(combinations).toBeDefined();
    expect(Object.keys(combinations)).toEqual(
      expect.arrayContaining([
        'Oral Minoxidil and Oral Finasteride',
        'Oral Finasteride and Minoxidil Foam',
        'Topical Finasteride and Minoxidil Gel',
        'Oral Minoxidil',
        'Oral Finasteride',
        'Minoxidil Foam',
      ])
    );
  });

  test('each combination should have the necessary properties', () => {
    Object.values(combinations).forEach(combination => {
      expect(combination).toHaveProperty('Icon');
      expect(combination).toHaveProperty('displayName');
      expect(combination).toHaveProperty('price');
      expect(combination).toHaveProperty('discountedPrice');
      expect(combination).toHaveProperty('interval');
      expect(combination).toHaveProperty('description');
      expect(combination).toHaveProperty('discount');
      expect(combination).toHaveProperty('images');
      expect(combination).toHaveProperty('height');
    });
  });

  test('hairLossMedication should have correct structure', () => {
    Object.values(hairLossMedication).forEach(med => {
      expect(med).toHaveProperty('name');
      expect(med).toHaveProperty('type');
      expect(med).toHaveProperty('quantity');
      expect(med).toHaveProperty('price');
      expect(med).toHaveProperty('discounted_price');
      expect(med).toHaveProperty('recurring');
      expect(med.recurring).toHaveProperty('interval');
      expect(med.recurring).toHaveProperty('interval_count');
      expect(med).toHaveProperty('medication_quantity_id');
    });
  });

  test('hairLossMedication6month should match the expected values and structure', () => {
    Object.values(hairLossMedication6month).forEach(med => {
      expect(med).toHaveProperty('name');
      expect(med).toHaveProperty('type');
      expect(med).toHaveProperty('quantity');
      expect(med).toHaveProperty('dosage');
      expect(med).toHaveProperty('price');
      expect(med).toHaveProperty('discounted_price');
      expect(med).toHaveProperty('recurring');
      expect(med.recurring).toHaveProperty('interval');
      expect(med.recurring).toHaveProperty('interval_count');
      expect(med).toHaveProperty('medication_quantity_id');
    });
  });
});
