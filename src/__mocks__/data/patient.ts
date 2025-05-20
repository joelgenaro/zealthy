import { IPatient } from '@/types/patient';
import { patientUser } from './user';

export const patientWithAddress: IPatient = {
  id: 4,
  address: {
    street: '1508 Bay Rd.',
    unit: '1000',
    city: 'Miami Beach',
    zip: '33139',
    state: 'FL',
  },
  user: patientUser,
};
