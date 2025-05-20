import Router from 'next/router';
import { useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import { useCreateOnlineVisitAndNavigate } from './useCreateOnlineVisitAndNavigate';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useRequestedQuestionnaires } from './useRequestedQuestionnaires';
import { useProfileState } from './useProfile';
import { useCalculateSpecificCare } from './useCalculateSpecificCare';

export const useRedirectUser = (patientId?: number | null) => {
  const { gender } = useProfileState();
  const requestedQuestionnaires = useRequestedQuestionnaires();
  const calculatedSpecificCare = useCalculateSpecificCare();

  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(patientId);

  return useCallback(async () => {
    let newCare = calculatedSpecificCare;

    if (
      !newCare ||
      newCare === SpecificCareOption.DEFAULT ||
      newCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
      newCare === SpecificCareOption.PRIMARY_CARE
    ) {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }

    if (gender === 'female' && newCare === SpecificCareOption.SEX_PLUS_HAIR) {
      Router.push(Pathnames.UNSUPPORTED_CARE);
      return;
    }

    if (gender === 'male' && newCare === SpecificCareOption.MENOPAUSE) {
      Router.push(Pathnames.UNSUPPORTED_CARE);
      return;
    }

    if (
      gender === 'male' &&
      (newCare === SpecificCareOption.FEMALE_HAIR_LOSS ||
        newCare === SpecificCareOption.HAIR_LOSS)
    ) {
      newCare = SpecificCareOption.HAIR_LOSS;
    }
    if (
      gender === 'female' &&
      (newCare === SpecificCareOption.FEMALE_HAIR_LOSS ||
        newCare === SpecificCareOption.HAIR_LOSS)
    ) {
      newCare = SpecificCareOption.FEMALE_HAIR_LOSS;
    }

    createVisitAndNavigateAway([newCare], {
      requestedQuestionnaires,
    });
  }, [
    calculatedSpecificCare,
    createVisitAndNavigateAway,
    gender,
    requestedQuestionnaires,
  ]);
};
