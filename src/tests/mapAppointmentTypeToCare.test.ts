import { mapAppointmentTypeToCare } from '@/utils/mapAppointmentTypeToCare';
import { ReasonForVisit } from '../context/AppContext/reducers/types/visit';
import { ProviderType } from '../lib/database.enums';

describe('mapAppointmentTypeToCare', () => {
  it('should return formatted string for Provider type', () => {
    const appointmentType = 'Provider';
    const selectedCare = {
      careSelections: [
        { reason: 'Cough' },
        { reason: 'Fever' },
      ] as ReasonForVisit[],
      other: 'Headache',
    };
    const result = mapAppointmentTypeToCare(appointmentType, selectedCare);
    expect(result).toEqual('Cough / Fever / Headache');
  });

  it('should return "Primary care" if no reasons are provided', () => {
    const appointmentType = 'Provider';
    const selectedCare = {
      careSelections: [],
      other: '',
    };
    const result = mapAppointmentTypeToCare(appointmentType, selectedCare);
    expect(result).toEqual('Primary care');
  });

  it('should return formatted string for non-Provider type', () => {
    const appointmentType = ProviderType['COACH_(MENTAL_HEALTH)'];
    const selectedCare = null; // Not used for this path
    // @ts-ignore
    const result = mapAppointmentTypeToCare(appointmentType, selectedCare);
    expect(result).toEqual('1:1 with Coach (Mental Health)');
  });
});
