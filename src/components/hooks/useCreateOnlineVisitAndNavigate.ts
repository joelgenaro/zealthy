import Router from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import difference from 'lodash/difference';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import {
  ReasonForVisit,
  VisitQuestionnaireType,
  VisitState,
} from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from './useVisit';
import { useResetValues } from './useResetValues';
import { preCheckoutNavigation } from '@/utils/precheckoutNavigation';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { useIntakeState } from './useIntake';
import { usePatientState } from './usePatient';
import { useVWO } from '@/context/VWOContext';
import { useLanguage, usePatient } from './data';
import { QuestionnaireName } from '@/types/questionnaire';

type OnlineVisit = {
  id: number;
  status: Database['public']['Tables']['online_visit']['Row']['status'];
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
};
const VISIT_QUERY_INNER = `
  id,
  status,
  isSync: synchronous,
  careSelected: reason_for_visit!inner(id, reason, synchronous),
  intakes
`;

const VISIT_QUERY = `
  id,
  status,
  isSync: synchronous,
  careSelected: reason_for_visit(id, reason, synchronous),
  intakes
`;

const calculateCare = (
  care: string[],
  potentialInsurance: PotentialInsuranceOption,
  variant: string,
  region?: string,
  language?: string
) => {
  if (
    care.includes('Weight loss') &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED].includes(
      potentialInsurance
    ) &&
    variant === '4758b'
  ) {
    return ['Weight Loss Flexible Semaglutide'];
  }

  if (
    care.includes('Weight loss') &&
    [
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance)
  ) {
    return ['Weight loss bundled'];
  }

  if (
    care.includes('Erectile dysfunction') &&
    PotentialInsuranceOption.ED_HARDIES === potentialInsurance
  ) {
    return ['ED hardies'];
  }

  if (care.includes('Weight loss') && language === 'esp') {
    return ['Weight loss Spanish'];
  }

  if (
    care.includes('Weight loss') &&
    PotentialInsuranceOption.ADDITIONAL_PA === potentialInsurance
  ) {
    return ['Additional PA'];
  }

  if (care.includes('Weight loss') && variant === '4758') {
    return ['Weight Loss Flexible'];
  }

  if (
    care.includes('Weight loss') &&
    PotentialInsuranceOption.WEIGHT_LOSS_CONTINUE === potentialInsurance
  ) {
    return ['Weight Loss Continue'];
  }

  if (
    care.includes('Weight loss') &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
    !['IL']?.includes(region!)
  ) {
    return ['Weight loss V2'];
  }

  if (
    care.includes('Anxiety or depression') &&
    potentialInsurance === PotentialInsuranceOption.MENTAL_HEALTH_REFILL_REQUEST
  ) {
    return ['Mental Health Refill Request'];
  }

  return care;
};

export type Options = {
  navigateAway?: boolean;
  resetValues?: boolean;
  requestedQuestionnaires?: VisitQuestionnaireType[];
  resetMedication?: boolean;
  questionnaires?: VisitQuestionnaireType[];
  careType?: PotentialInsuranceOption | undefined;
  skipQuestionnaires?: VisitQuestionnaireType['name'][];
};

const defaultOptions: Options = {
  navigateAway: true,
  resetValues: true,
  requestedQuestionnaires: [],
  resetMedication: true,
  questionnaires: undefined,
  skipQuestionnaires: [],
};

export const useCreateOnlineVisitAndNavigate = (patientId?: number | null) => {
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { updateVisit } = useVisitActions();
  const resetValues = useResetValues();
  const supabase = useSupabaseClient<Database>();
  const { region } = usePatientState();
  const vwoContext = useVWO();
  const { data: patientInfo } = usePatient();
  const [variation6792, setVariation6792] = useState<string | null>(null);
  const language = useLanguage();

  useEffect(() => {
    const fetchVariationName = async () => {
      if (
        ['IN', 'NC', 'GA', 'AZ', 'MN', 'TX'].includes(region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        const variationName = vwoContext.getVariationName(
          '6792',
          String(patientId)
        );
        setVariation6792(variationName || '');
      }
    };

    fetchVariationName();
  }, [region, specificCare, potentialInsurance, vwoContext, patientId]);

  const resetVisit = useCallback(
    (
      visit: OnlineVisit,
      questionnaires: VisitQuestionnaireType[],
      careSelected: ReasonForVisit[],
      reset: boolean = true,
      resetMedication: boolean = true
    ) => {
      const options: Partial<VisitState> = {
        id: visit.id,
        isSync: visit.isSync,
        intakes: visit.intakes,
        selectedCare: {
          careSelections: careSelected,
          other: '',
        },
        questionnaires,
      };

      if (resetMedication) {
        options.medications = [];
      }

      updateVisit(options);

      reset && resetValues();
    },
    [resetValues, updateVisit]
  );

  const createVisit = useCallback(
    async (
      attributes: Database['public']['Tables']['online_visit']['Insert']
    ) => {
      const { data: onlineVisits } = await supabase
        .from('online_visit')
        .insert({
          status: 'Created',
          patient_id: attributes.patient_id,
          synchronous: attributes.synchronous,
          specific_care: attributes.specific_care || specificCare,
          potential_insurance:
            attributes.potential_insurance || potentialInsurance,
          variant: attributes.variant || variant,
        })
        .select(VISIT_QUERY)
        .single();

      return onlineVisits as OnlineVisit;
    },
    [potentialInsurance, specificCare, supabase, variant]
  );

  const findVisit = useCallback(
    async (attributes: { patientId: number; reasons: string[] }) => {
      const { data: allVisits } = await supabase
        .from('online_visit')
        .select(VISIT_QUERY_INNER)
        .eq('patient_id', attributes.patientId)
        .in('status', ['Created', 'Paid']);

      const filteredVisits = (allVisits as OnlineVisit[])
        .filter(v => v.careSelected.length === attributes.reasons.length)
        .filter(
          v =>
            difference(
              v.careSelected.map(c => c.reason),
              attributes.reasons
            ).length === 0
        );
      return (
        filteredVisits.find(v => v.status === 'Paid') ||
        filteredVisits.find(v => v.status === 'Created')
      );
    },
    [supabase]
  );

  const navigate = useCallback(
    (
      attributes: { questionnaire: VisitQuestionnaireType | null },
      calculatedCare: string[]
    ) => {
      const nextPage = preCheckoutNavigation(
        attributes.questionnaire,
        calculatedCare
      );
      if (nextPage) Router.push(nextPage);
    },
    []
  );

  return useCallback(
    async (care: SpecificCareOption[], options: Options = defaultOptions) => {
      if (!patientId) {
        return;
      }

      const {
        navigateAway,
        resetValues,
        requestedQuestionnaires = [],
        resetMedication = true,
        questionnaires,
        careType,
        skipQuestionnaires = [],
      } = {
        ...defaultOptions,
        ...options,
      };

      //map reason to specific care
      const { data: careSelected }: { data: ReasonForVisit[] | null } =
        await supabase
          .from('reason_for_visit')
          .select('id, reason, synchronous')
          .in('reason', care);

      if (careSelected?.length) {
        //check if the visit with the same reason is create

        const createdVisit = await findVisit({
          patientId,
          reasons: careSelected.map(c => c.reason),
        });

        let calculatedCare = calculateCare(
          care,
          careType || potentialInsurance || PotentialInsuranceOption.DEFAULT,
          variant || '',
          region || '',
          language || ''
        );

        if (['Variation-1'].includes(variation6792 || '')) {
          calculatedCare = ['Weight loss'];
        }

        if (createdVisit) {
          const toCompleteQuestionnaires = requestedQuestionnaires
            .concat(questionnaires || mapCareToQuestionnaires(calculatedCare))
            .filter(q => !skipQuestionnaires.includes(q.name));

          const isEnclomipheneVariation3 =
            calculatedCare.includes('Enclomiphene') &&
            patientId &&
            ![
              'TX',
              'IL',
              'PA',
              'GA',
              'SC',
              'OK',
              'LA',
              'MA',
              'MD',
              'MI',
              'MN',
              'MO',
            ].includes(region!) &&
            vwoContext.getVariationName('8205', String(patientId)) ===
              'Variation-3';

          const filteredQuestionnaires = isEnclomipheneVariation3
            ? toCompleteQuestionnaires.filter(
                q => q.name !== 'vouched-verification'
              )
            : toCompleteQuestionnaires;

          resetVisit(
            createdVisit,
            filteredQuestionnaires,
            careSelected,
            resetValues,
            resetMedication
          );

          if (navigateAway)
            navigate(
              {
                questionnaire: filteredQuestionnaires[0],
              },
              calculatedCare
            );
          return;
        }

        // create new visit
        const newVisit = await createVisit({
          patient_id: patientId,
          synchronous: careSelected.some(c => c.synchronous),
          specific_care: careSelected[0].reason,
          potential_insurance: careType,
          variant: patientInfo?.profiles?.signup_variant || variant,
        });

        if (newVisit) {
          await supabase.from('visit_reason').insert(
            careSelected.map(c => ({
              visit_id: newVisit.id,
              reason_id: c.id,
            }))
          );

          const toCompleteQuestionnaires = requestedQuestionnaires
            .concat(questionnaires || mapCareToQuestionnaires(calculatedCare))
            .filter(q => !skipQuestionnaires.includes(q.name));

          // Skip vouched verification for Enclomiphene Variation-3 in pre-checkout flow
          const isEnclomipheneVariation3 =
            calculatedCare.includes('Enclomiphene') &&
            patientId &&
            ![
              'TX',
              'IL',
              'PA',
              'GA',
              'SC',
              'OK',
              'LA',
              'MA',
              'MD',
              'MI',
              'MN',
              'MO',
            ].includes(region!) &&
            vwoContext.getVariationName('8205', String(patientId)) ===
              'Variation-3';

          const filteredQuestionnaires = isEnclomipheneVariation3
            ? toCompleteQuestionnaires.filter(
                q => q.name !== 'vouched-verification'
              )
            : toCompleteQuestionnaires;

          resetVisit(
            newVisit,
            filteredQuestionnaires,
            careSelected,
            resetValues,
            resetMedication
          );

          if (navigateAway)
            navigate(
              {
                questionnaire: filteredQuestionnaires[0],
              },
              calculatedCare
            );
          return;
        }
      } else {
        console.error(
          'Could not map reason to a specific care',
          new Error(
            `Could not map reason to a specifics care: ${care.join(
              ' ,'
            )} for a patient: ${patientId}`
          )
        );
        Router.push(Pathnames.CARE_SELECTION);
        return;
      }
    },
    [
      createVisit,
      findVisit,
      navigate,
      patientId,
      potentialInsurance,
      region,
      resetVisit,
      specificCare,
      supabase,
      variant,
      variation6792,
      vwoContext,
    ]
  );
};
