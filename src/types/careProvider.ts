import { CarePersonType } from './carePersonType';

export type CareProvider = {
  id: number;
  image: string;
  prefix: string;
  firstName: string;
  lastName: string;
  pastAppointment?: string | Date;
  carePersonType: CarePersonType;
  specialties: string[];
  availability: {
    day: string;
    times: string[];
  }[];
};
