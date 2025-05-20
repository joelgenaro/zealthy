import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import { Pathnames } from '@/types/pathnames';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { QuestionnaireResponse } from '@/pages/api/supabase/questionnaire_response/_utils.ts/types';

export const preCheckoutNavigation = (
  questionnaire: VisitQuestionnaireType | null,
  calculatedCare?: string[] | string | null | undefined,
  answers?: QuestionnaireResponse | null
) => {
  if (calculatedCare && calculatedCare.includes(SpecificCareOption.SKINCARE)) {
    return;
  }

  if (answers && questionnaire) {
    const lastAnsweredQuestion = (
      answers?.response as { items: { name: string }[] }
    ).items.slice(-1)[0].name;

    return `${Pathnames.QUESTIONNAIRES}/${questionnaire.name}/${lastAnsweredQuestion}`;
  }

  if (
    !questionnaire ||
    (calculatedCare &&
      (calculatedCare.includes(SpecificCareOption.ACNE) ||
        calculatedCare.includes(SpecificCareOption.ROSACEA) ||
        calculatedCare.includes(SpecificCareOption.ANTI_AGING) ||
        calculatedCare.includes(SpecificCareOption.MELASMA)))
  ) {
    return Pathnames.WHAT_NEXT;
  }

  if (questionnaire.intro) {
    return `${Pathnames.QUESTIONNAIRES}/${questionnaire.name}`;
  }

  return `${Pathnames.QUESTIONNAIRES}/${questionnaire.name}/${questionnaire.entry}`;
};
