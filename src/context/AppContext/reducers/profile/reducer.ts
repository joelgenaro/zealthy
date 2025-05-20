import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import {
  ProfileAction,
  ProfileActionTypes,
  ProfileState,
} from '../types/profile';

export const profileInitialState: ProfileState = {
  first_name: '',
  last_name: '',
  gender: '',
  birth_date: '',
  phone_number: '',
  email: '',
};

const profileReducer = (
  state: ProfileState,
  action: ProfileAction
): ProfileState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).profile,
      };
    case ProfileActionTypes.ADD_FIRST_NAME:
      return {
        ...state,
        first_name: action.payload,
      };
    case ProfileActionTypes.ADD_LAST_NAME:
      return {
        ...state,
        last_name: action.payload,
      };
    case ProfileActionTypes.ADD_DATE_OF_BIRTH:
      return {
        ...state,
        birth_date: action.payload,
      };
    case ProfileActionTypes.ADD_PHONE_NUMBER:
      return {
        ...state,
        phone_number: action.payload,
      };
    case ProfileActionTypes.ADD_SEX_AT_BIRTH:
      return {
        ...state,
        gender: action.payload,
      };
    default:
      return state;
  }
};

export default profileReducer;
