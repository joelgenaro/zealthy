import { CarePersonType } from '@/types/carePersonType';
import { CareProvider } from '@/types/careProvider';
import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';

const today = new Date().toISOString();
const tomorrow = addDays(new Date(), 1).toISOString();
const threeDaysOut = addDays(new Date(), 2).toISOString();
const fourDaysOut = addDays(new Date(), 3).toISOString();
const fiveDaysOut = addDays(new Date(), 4).toISOString();

const careProviders: CareProvider[] = [
  {
    id: 1,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.MENTAL_HEALTH,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
      {
        day: fiveDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 2,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.WEIGHT_LOSS,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 3,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.WEIGHT_LOSS,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 4,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.MENTAL_HEALTH,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 5,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.MENTAL_HEALTH,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 6,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    carePersonType: CarePersonType.PRESCRIBER,
    pastAppointment: new Date(),
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
  {
    id: 7,
    firstName: 'Mark',
    lastName: 'Greene',
    carePersonType: CarePersonType.PRESCRIBER,
    pastAppointment: new Date(),
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      {
        day: today,
        times: ['3:00 PM', '3:30 PM', '4:00 PM'],
      },
      {
        day: tomorrow,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: threeDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
      {
        day: fourDaysOut,
        times: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      },
    ],
    image: faker.image.avatar(),
  },
];

export default careProviders;
