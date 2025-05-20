import DOMPurify from 'dompurify';
import { Dispatch } from 'react';
import { ProfileAction, ProfileActionTypes } from '../types/profile';

export const getProfileActions = (dispatch: Dispatch<ProfileAction>) => ({
  addPhone: (payload: string) =>
    dispatch({
      type: ProfileActionTypes.ADD_PHONE_NUMBER,
      payload: DOMPurify.sanitize(payload, {
        USE_PROFILES: { html: false },
      }),
    }),
  addLastName: (payload: string) =>
    dispatch({
      type: ProfileActionTypes.ADD_LAST_NAME,
      payload: DOMPurify.sanitize(payload, {
        USE_PROFILES: { html: false },
      }),
    }),
  addFirstName: (payload: string) =>
    dispatch({
      type: ProfileActionTypes.ADD_FIRST_NAME,
      payload: DOMPurify.sanitize(payload, {
        USE_PROFILES: { html: false },
      }),
    }),
  addSexAtBirth: (payload: string) =>
    dispatch({
      type: ProfileActionTypes.ADD_SEX_AT_BIRTH,
      payload: DOMPurify.sanitize(payload, {
        USE_PROFILES: { html: false },
      }),
    }),
  addDateOfBirth: (payload: string) =>
    dispatch({
      type: ProfileActionTypes.ADD_DATE_OF_BIRTH,
      payload: DOMPurify.sanitize(payload, {
        USE_PROFILES: { html: false },
      }),
    }),
});
