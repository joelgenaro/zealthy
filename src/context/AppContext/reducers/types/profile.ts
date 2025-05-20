import { Database } from '@/lib/database.types';
import { CommonAction } from './common';

export type ProfileState = Pick<
  Database['public']['Tables']['profiles']['Row'],
  | 'birth_date'
  | 'gender'
  | 'first_name'
  | 'phone_number'
  | 'last_name'
  | 'email'
>;

export enum ProfileActionTypes {
  ADD_FIRST_NAME = 'ADD_FIRST_NAME',
  ADD_LAST_NAME = 'ADD_LAST_NAME',
  ADD_PHONE_NUMBER = 'ADD_PHONE_NUMBER',
  ADD_SEX_AT_BIRTH = 'ADD_SEX_AT_BIRTH',
  ADD_DATE_OF_BIRTH = 'ADD_DATE_OF_BIRTH',
}

export type ProfileAction =
  | CommonAction
  | {
      type:
        | ProfileActionTypes.ADD_FIRST_NAME
        | ProfileActionTypes.ADD_LAST_NAME
        | ProfileActionTypes.ADD_PHONE_NUMBER
        | ProfileActionTypes.ADD_DATE_OF_BIRTH
        | ProfileActionTypes.ADD_SEX_AT_BIRTH;
      payload: string;
    };
