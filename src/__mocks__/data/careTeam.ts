import { CarePersonType } from '@/types/carePersonType';
import { CareTeamMember } from '@/types/careTeamMember';
import { faker } from '@faker-js/faker';

const careTeam: CareTeamMember[] = [
  {
    id: 1,
    userId: 1,
    user: {
      id: 1,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon(2).toISOString(),
      faker.date.soon(3).toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
  {
    id: 2,
    userId: 2,
    user: {
      id: 2,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon().toISOString(),
      faker.date.soon(3).toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
  {
    id: 3,
    userId: 3,
    user: {
      id: 3,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon().toISOString(),
      faker.date.soon(1).toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
  {
    id: 4,
    userId: 4,
    user: {
      id: 4,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon().toISOString(),
      faker.date.soon().toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
  {
    id: 5,
    userId: 5,
    user: {
      id: 5,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon(1).toISOString(),
      faker.date.soon(2).toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
  {
    id: 6,
    userId: 6,
    user: {
      id: 6,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    carePersonType: CarePersonType.PRESCRIBER,
    prefix: 'Dr.',
    specialties: ['Primary care', 'Internal medicine'],
    availability: [
      faker.date.soon(1).toISOString(),
      faker.date.soon(3).toISOString(),
    ],
    image: faker.image.avatar(),
    bio: faker.lorem.paragraphs(1),
  },
];

export default careTeam;
