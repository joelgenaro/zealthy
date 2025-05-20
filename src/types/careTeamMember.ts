import { CarePersonType } from './carePersonType';
import { IUser } from './user';

export type CareTeamMember = {
  id: number;
  image: string;
  prefix: string;
  userId: number;
  user: IUser;
  carePersonType: CarePersonType;
  specialties: string[];
  availability: string[];
  bio: string;
};
