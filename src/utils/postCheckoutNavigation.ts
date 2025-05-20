import { Pathnames } from '@/types/pathnames';
import { IntakeType } from './getIntakesForVisit-v2';

export const postCheckoutNavigation = (questionnaire: IntakeType | null) => {
  if (!questionnaire) {
    return Pathnames.POST_CHECKOUT_COMPLETE_VISIT;
  }

  //go to intro if present or to the first question
  if (questionnaire.intro) {
    return `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaire.name}`;
  }

  return `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaire.name}/${questionnaire?.entry}`;
};
