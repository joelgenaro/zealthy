import { IAddress } from './address';
import { IUser } from './user';

export interface IPatient {
  id: number;
  address: IAddress | null;
  user: IUser;
}
