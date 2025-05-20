import { IAddress } from './address';

export interface PharmacyInfo {
  name: string;
  address?: IAddress;
  formattedAddress?: string;
  phone?: string;
  id?: string;
}
