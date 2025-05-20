import {
  AnswerItem,
  AnswerState,
} from '@/context/AppContext/reducers/types/answer';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { postCheckoutNavigation } from '@/utils/postCheckoutNavigation';
import { preCheckoutNavigation } from '@/utils/precheckoutNavigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback } from 'react';
import { useAnswerActions } from './useAnswer';
import { useConsultationActions } from './useConsultation';
import { useIntakeActions, useIntakeSelect } from './useIntake';
import { useVisitActions } from './useVisit';
import { useVWOVariationName } from './data';

const medicationName = (reason: string) => {
  switch (reason) {
    case 'Acne':
      return 'Acne';
    case 'Fine Lines & Wrinkles':
      return 'Anti-Aging';
    case 'Hyperpigmentation Dark Spots':
      return 'Melasma';
    case 'Rosacea':
      return 'Rosacea';

    default:
      return 'Acne';
  }
};

const calculateCare = (
  care: string[],
  potentialInsurance: PotentialInsuranceOption
) => {
  if (
    care.includes('Weight loss') &&
    [
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance)
  ) {
    return ['Weight loss bundled'];
  }

  if (
    care.includes('Erectile dysfunction') &&
    [PotentialInsuranceOption.ED_HARDIES].includes(potentialInsurance)
  ) {
    return ['ED hardies'];
  }

  return care;
};

export type AnswerResponse = {
  created_at: string | null;
  questionnaire_name: string;
  response: {
    canvas_id: string;
    codingSystem: string;
    items: AnswerItem[];
  };
  submitted: boolean;
  submitted_by: string | null;
  visit_id: number;
};

export type OnlineVisit = {
  id: number;
  status: Database['public']['Tables']['online_visit']['Row']['status'];
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
  potential_insurance?: PotentialInsuranceOption;
  specific_care?: SpecificCareOption;
  variant?: string;
  paid_at: string;
};

export const useVisitAnswers = () => {
  const supabase = useSupabaseClient<Database>();
  const { setAnswers } = useAnswerActions();

  return useCallback(
    async (visitId: number) => {
      const responses = await supabase
        .from('questionnaire_response')
        .select('*')
        .eq('visit_id', visitId)
        .then(({ data }) => (data || []) as unknown as AnswerResponse[]);

      const answers = responses
        .map(r => r.response.items)
        .flat()
        .reduce((acc, item) => {
          acc[item.name] = item;
          return acc;
        }, {} as AnswerState);

      setAnswers(answers);

      return answers;
    },
    [setAnswers, supabase]
  );
};

export const useVisitHandler = () => {
  const { updateVisit } = useVisitActions();
  const handleAnswers = useVisitAnswers();
  const { addConsultation } = useConsultationActions();
  const specificCare = useIntakeSelect(intake => intake.specificCare);
  const potentialInsurance = useIntakeSelect(
    intake => intake.potentialInsurance
  );
  const { addPotentialInsurance, addSpecificCare, addVariant } =
    useIntakeActions();
  const { data: variation8201 } = useVWOVariationName('8201');

  const handlePaidVisit = useCallback(
    async (visit: OnlineVisit | null) => {
      if (!visit) return;

      await handleAnswers(visit.id);

      if (!potentialInsurance) {
        addPotentialInsurance(
          visit.potential_insurance || PotentialInsuranceOption.DEFAULT
        );
      }

      if (!specificCare) {
        addSpecificCare(visit.specific_care || SpecificCareOption.DEFAULT);
      }

      updateVisit({
        isSync: visit.isSync,
        id: visit.id,
        intakes: visit.intakes,
        questionnaires: [],
        selectedCare: {
          careSelections: visit.careSelected,
          other: '',
        },
      });

      const firstIntake = visit.intakes.filter(i => i.entry !== null)[0];
      const nextPage = postCheckoutNavigation(firstIntake);
      Router.push(nextPage);
      return;
    },
    [
      addPotentialInsurance,
      addSpecificCare,
      handleAnswers,
      potentialInsurance,
      specificCare,
      updateVisit,
    ]
  );

  const handleCreatedVisit = useCallback(
    async (visit: OnlineVisit | null) => {
      if (!visit) return;

      const care = visit.careSelected.map(r => r.reason);
      const answers = await handleAnswers(visit.id);

      const calculatedCare = calculateCare(
        care,
        visit.potential_insurance || PotentialInsuranceOption.DEFAULT
      );

      const questionnaires = mapCareToQuestionnaires(calculatedCare);

      const formattedAnswers =
        Object.keys(answers).length > 0
          ? {
              created_at: null,
              patient_id: null,
              questionnaire_name: questionnaires[0]?.name || '',
              response: { items: Object.values(answers) },
              submitted: true,
              submitted_by: null,
              visit_id: visit.id,
              retry_submission_at: null,
            }
          : null;

      if (!potentialInsurance) {
        addPotentialInsurance(
          visit.potential_insurance || PotentialInsuranceOption.DEFAULT
        );
      }

      if (!specificCare) {
        addSpecificCare(visit.specific_care || SpecificCareOption.DEFAULT);
      }

      updateVisit({
        isSync: visit.isSync,
        id: visit.id,
        intakes: [],
        selectedCare: {
          careSelections: visit.careSelected,
          other: '',
        },
        questionnaires,
      });

      if (care[0] === 'Hair loss') {
        Router.push('/hair-loss/start');
        return;
      }

      if (
        [
          'Rosacea',
          'Hyperpigmentation Dark Spots',
          'Acne',
          'Fine Lines & Wrinkles',
        ].includes(care[0])
      ) {
        const medication = medicationName(care[0]);

        addVariant('trending-card-skincare');
        addConsultation({
          name: `${medication} Medical Consultation`,
          price: 50,
          discounted_price: 20,
          type: medication as ConsultationType,
        });
        Router.push(Pathnames.WHAT_NEXT);
        return;
      }
      console.log('variation name', variation8201?.variation_name);

      if (variation8201?.variation_name === 'Variation-1') {
        const nextPage = preCheckoutNavigation(
          questionnaires[0],
          specificCare,
          formattedAnswers
        );

        if (nextPage) Router.push(nextPage);
        return;
      }

      const nextPage = preCheckoutNavigation(questionnaires[0], specificCare);

      if (nextPage) Router.push(nextPage);
      return;
    },
    [
      addPotentialInsurance,
      addSpecificCare,
      handleAnswers,
      potentialInsurance,
      specificCare,
      updateVisit,
      variation8201,
    ]
  );

  return useCallback(
    (visit: OnlineVisit) => {
      if (visit.status === 'Paid') {
        return handlePaidVisit(visit);
      } else {
        return handleCreatedVisit(visit);
      }
    },
    [handleCreatedVisit, handlePaidVisit]
  );
};
