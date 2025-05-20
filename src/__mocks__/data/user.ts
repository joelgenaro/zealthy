import { IUser } from '@/types/user';
import { faker } from '@faker-js/faker';

export const patientUser: IUser = {
  id: 4,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};
