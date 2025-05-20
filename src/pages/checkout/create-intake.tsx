import { useInsuranceState } from '@/components/hooks/useInsurance';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useProfileState } from '@/components/hooks/useProfile';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitAsync } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getPostCheckoutAuth } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import { QuestionnaireName } from '@/types/questionnaire';
import getIntakesForVisit, { IntakeType } from '@/utils/getIntakesForVisit-v2';
import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useVWOVariationName } from '@/components/hooks/data';
import { useFlowState } from '@/components/hooks/useFlow';

interface CreateIntakeProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const CreateIntake = ({ patient }: CreateIntakeProps) => {
  const profile = useProfileState(); // we want to use profile state here because it have age attribute added
  const insurance = useInsuranceState();
  const { updateOnlineVisit } = useVisitAsync();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const visit = useSelector(store => store.visit);
  const coaching = useSelector(store => store.coaching);
  const [eventFired, setEventFired] = useState<boolean>(false);
  const appointments = useSelector(store => store.appointment);
  const vwo = useVWO();
  const { currentFlow } = useFlowState();
  const fromTrendingSkincare = useSelector(
    store => store.intake?.variant === 'trending-card-skincare'
  );
  const isED = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Erectile dysfunction'
    )
  );
  const variationName4687 = ['MO'].includes(patient?.region!)
    ? vwo.getVariationName('Clone_4687', String(patient?.id))
    : '';
  const variationName5484 =
    ['WA', 'VA'].includes(patient?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS
      ? vwo.getVariationName('5484', String(patient?.id))
      : '';
  const variationName6337 =
    ['KY', 'WI', 'FL'].includes(patient?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ? vwo.getVariationName('6337', String(patient?.id))
      : '';
  const { data: variationName8205 } = useVWOVariationName('8205');
  const variationName7380 =
    ['MA', 'MS', 'MD'].includes(patient?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ? vwo.getVariationName('7380', String(patient?.id))
      : '';

  const intakes = useMemo(() => {
    let intakes: any[] = [];

    if (
      specificCare === SpecificCareOption.ENCLOMIPHENE &&
      variationName8205?.variation_name === 'Variation-3'
    ) {
      console.log(
        'Adding standard vouched verification flow for Enclomiphene Variation-4'
      );

      // Use standard questionnaires with their proper names
      intakes = [
        {
          name: QuestionnaireName.VOUCHED_VERIFICATION,
          entry: envMapping[QuestionnaireName.VOUCHED_VERIFICATION]!.entry,
          intro: !!envMapping[QuestionnaireName.VOUCHED_VERIFICATION]!.intro,
          questions:
            envMapping[QuestionnaireName.VOUCHED_VERIFICATION]!.questions,
        },
        {
          name: QuestionnaireName.CHECKOUT_SUCCESS,
          entry: envMapping[QuestionnaireName.CHECKOUT_SUCCESS]!.entry,
          intro: !!envMapping[QuestionnaireName.CHECKOUT_SUCCESS]!.intro,
          questions: envMapping[QuestionnaireName.CHECKOUT_SUCCESS]!.questions,
        },
        {
          name: QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2,
          entry:
            envMapping[QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2]!.entry,
          intro:
            !!envMapping[QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2]!.intro,
          questions:
            envMapping[QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2]!.questions,
        },
      ];

      return intakes;
    }

    if (specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS) {
      return [];
    }

    if (specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS_V2) {
      intakes = [
        {
          name: 'weight-loss-access-v2',
          entry: 'CHECKOUT_SUCCESS',
          intro: true,
        },
      ];
    }

    if (
      variant === '4758' &&
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
    ) {
      intakes = [
        {
          name: 'weight-loss-checkout-success',
          entry: 'WEIGHT_LOSS_CHECKOUT_S_Q1',
          intro: false,
          questions: envMapping['weight-loss-checkout-success']!.questions,
        },
        {
          name: 'weight-loss-post-v2',
          entry: 'WEIGHT_LOSS_BOR-Q1',
          intro: false,
          questions: envMapping['weight-loss-post-v2']!.questions,
        },
        {
          name: QuestionnaireName.WEIGHT_LOSS_PREFERENCE,
          entry: 'WEIGHT-LOSS-PREFERENCE-A-Q1',
          intro: false,
          questions:
            envMapping[QuestionnaireName.WEIGHT_LOSS_PREFERENCE]!.questions,
        },
        {
          name: QuestionnaireName.WEIGHT_LOSS_PAY,
          entry: 'WEIGHT-LOSS-PAY-A-Q1',
          intro: false,
          questions: envMapping[QuestionnaireName.WEIGHT_LOSS_PAY]!.questions,
        },
        {
          name: QuestionnaireName.WEIGHT_LOSS_TREATMENT,
          entry: 'WEIGHT-LOSS-TREATMENT-A-Q1',
          intro: false,
          questions:
            envMapping[QuestionnaireName.WEIGHT_LOSS_TREATMENT]!.questions,
        },
        {
          name: 'identity-verification',
          entry: 'IDENTITY-V-Q1',
          intro: false,
          questions: envMapping['identity-verification']!.questions,
        },
        {
          name: 'complete-visit',
          entry: 'WEIGHT_LOSS_COMPLETE-Q1',
          intro: false,
          questions: envMapping['complete-visit']!.questions,
        },
        {
          name: 'responses-reviewed',
          entry: 'RESPONSES-REVIEWED-A-Q1',
          intro: false,
          questions: envMapping['responses-reviewed']!.questions,
        },
      ];
    }
    if (variant === '4935Var2NI') {
      intakes = [
        {
          name: 'weight-loss-checkout-success',
          entry: 'WEIGHT_LOSS_CHECKOUT_S_Q1',
          intro: false,
          questions: envMapping['weight-loss-checkout-success']!.questions,
        },
        {
          name: 'weight-loss-checkout-success-esp',
          entry: 'WEIGHT_LOSS_CHECKOUT_S_Q1',
          intro: false,
          questions: envMapping['weight-loss-checkout-success-esp']!.questions,
        },
        {
          name: 'delivery-address',
          entry: 'DELIVERY-A-Q1',
          intro: false,
          questions: envMapping['delivery-address']!.questions,
        },
        {
          name: 'weight-loss-medical',
          entry: 'WEIGHT-LOSS-MEDICAL-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-medical']!.questions,
        },
        {
          name: QuestionnaireName.WEIGHT_LOSS_POST,
          entry: 'WEIGHT_LOSS_MEDICAL_HISTORY_Q1',
          intro: false,
          questions: envMapping[QuestionnaireName.WEIGHT_LOSS_POST]!.questions,
        },
        {
          name: 'weight-loss-preference',
          entry: 'WEIGHT-LOSS-PREFERENCE-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-preference']!.questions,
        },
        {
          name: 'weight-loss-pay',
          entry: 'WEIGHT-LOSS-PAY-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-pay']!.questions,
        },
        {
          name: 'weight-loss-treatment',
          entry: 'WEIGHT-LOSS-TREATMENT-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-treatment']!.questions,
        },
        {
          name: 'identity-verification',
          entry: 'IDENTITY-V-Q1',
          intro: false,
          questions: envMapping['identity-verification']!.questions,
        },
        {
          name: 'complete-visit',
          entry: 'WEIGHT_LOSS_COMPLETE-Q1',
          intro: false,
          questions: envMapping['complete-visit']!.questions,
        },
        {
          name: 'responses-reviewed',
          entry: 'RESPONSES-REVIEWED-A-Q1',
          intro: false,
          questions: envMapping['responses-reviewed']!.questions,
        },
      ];
    }

    const questionnaires: IntakeType[] = [];

    const reasons = [
      'Hyperpigmentation Dark Spots',
      'Acne',
      'Fine Lines & Wrinkles',
      'Rosacea',
    ].includes(specificCare ?? '')
      ? [{ reason: specificCare }]
      : visit.selectedCare.careSelections;

    if (!intakes.length) {
      intakes = getIntakesForVisit({
        patient,
        profile,
        visit,
        coaching,
        insurance,
        appointments,
        reasons,
        potentialInsurance,
        variationName4687,
        variationName5484,
      });
    }

    if (
      currentFlow === 'mhl-prescription-renewal' ||
      currentFlow === 'ed-prescription-renewal'
    ) {
      intakes = [];
    }

    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
    ) {
      const questionnaire = 'vouched-verification';
      const newIdentityObject = {
        name: questionnaire,
        entry: envMapping[questionnaire]!.entry,
        care: envMapping[questionnaire]!.care,
        intro: !!envMapping[questionnaire]!.intro,
        questions: envMapping[questionnaire]!.questions,
      };
      intakes = intakes.map(i =>
        i.name === 'identity-verification' ? newIdentityObject : i
      );
    }

    if (fromTrendingSkincare) {
      return questionnaires
        .concat(intakes)
        .filter(q => q.name !== QuestionnaireName.VOUCHED_VERIFICATION);
    }

    if (variationName6337 === 'Variation-1') {
      intakes = [
        {
          name: 'weight-loss-checkout-success',
          entry: 'WEIGHT_LOSS_CHECKOUT_S_Q1',
          intro: false,
          questions: envMapping['weight-loss-checkout-success']!.questions,
        },
        {
          name: 'pharmacy-preference',
          entry: 'PHARMACY_P_Q1',
          intro: false,
          questions: envMapping['pharmacy-preference']!.questions,
        },
        {
          name: 'insurance-information',
          entry: 'INSURANCE-INFORMATION-A-Q1',
          intro: false,
          questions: envMapping['insurance-information']!.questions,
        },
        {
          name: QuestionnaireName.WEIGHT_LOSS_POST_V2,
          entry: 'LAB-OR-BLOOD-TESTS-A-Q1',
          intro: false,
          questions:
            envMapping[QuestionnaireName.WEIGHT_LOSS_POST_V2]!.questions,
        },
        {
          name: 'weight-loss-pay',
          entry: 'WEIGHT-LOSS-PAY-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-pay']!.questions,
        },
        {
          name: 'weight-loss-treatment',
          entry: 'WEIGHT-LOSS-TREATMENT-A-Q1',
          intro: false,
          questions: envMapping['weight-loss-treatment']!.questions,
        },
        {
          name: 'identity-verification',
          entry: 'IDENTITY-V-Q1',
          intro: false,
          questions: envMapping['identity-verification']!.questions,
        },
        {
          name: 'complete-visit',
          entry: 'WEIGHT_LOSS_COMPLETE-Q1',
          intro: false,
          questions: envMapping['complete-visit']!.questions,
        },
        {
          name: 'live-provider-visit',
          entry: 'LIVE_PV_Q1',
          intro: false,
          questions: envMapping['live-provider-visit']!.questions,
        },
        {
          name: 'full-body-photo',
          entry: 'FBP_Q1',
          intro: false,
          questions: envMapping['full-body-photo']!.questions,
        },
        {
          name: 'responses-reviewed',
          entry: 'RESPONSES-REVIEWED-A-Q1',
          intro: false,
          questions: envMapping['responses-reviewed']!.questions,
        },
        {
          name: 'what-next',
          entry: 'WHAT-NEXT-A-Q1',
          intro: false,
          questions: envMapping['now-what']!.questions,
        },
      ];
    }

    if (variationName7380 === 'Variation-2') {
      // Add NowWhat page/questionnaire before vouched-identity questionnaire
      intakes = intakes
        .map(i =>
          i.name === 'vouched-verification'
            ? [
                {
                  name: 'now-what-7380',
                  entry: 'NOW-WHAT-A-Q1',
                  intro: false,
                  questions: envMapping['now-what-7380']!.questions,
                },
                {
                  name: 'vouched-verification',
                  entry: envMapping['vouched-verification']!.entry,
                  care: envMapping['vouched-verification']!.care,
                  intro: !!envMapping['vouched-verification']!.intro,
                  questions: envMapping['vouched-verification']!.questions,
                },
              ]
            : i
        )
        .flat();
    }

    return questionnaires.concat(intakes);
  }, [
    specificCare,
    potentialInsurance,
    patient,
    variant,
    fromTrendingSkincare,
    profile,
    visit,
    coaching,
    insurance,
    appointments,
    variationName8205,
  ]);
  const isUnsupportedOralSemaglutide =
    ['CA', 'AL', 'AR', 'HI', 'KS', 'MI', 'MN', 'MS'].includes(
      patient?.region || ''
    ) && potentialInsurance === 'Semaglutide Bundled Oral Pills';
  const submitIntakes = useCallback(
    async (variation?: string | null) => {
      if (!visit.id) {
        if (specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT) {
          Router.replace(Pathnames.CHECKOUT_COMPLETE);
          return;
        }
        throw new Error('There is no visit id');
      } else {
        // keeping just in case, moved for 9447
        // if (
        //   specificCare === SpecificCareOption.WEIGHT_LOSS &&
        //   !patient.has_verified_identity &&
        //   !eventFired
        // ) {
        //   window?.freshpaint?.track('weight-loss-skipped-ID');
        //   setEventFired(true);
        // }

        updateOnlineVisit({
          status: isED ? 'Completed' : 'Paid',
          intakes:
            variation === 'Variation-1'
              ? intakes?.filter(
                  i =>
                    i.name !== QuestionnaireName.WEIGHT_LOSS_BUNDLED_TREATMENT
                )
              : intakes,
          paid_at: new Date().toISOString(),
        }).then(() => {
          isUnsupportedOralSemaglutide
            ? Router.replace(Pathnames.ORAL_SEMAGLUTIDE_UNSUPPORTED_REGION)
            : Router.replace(Pathnames.CHECKOUT_COMPLETE);
        });
      }
    },
    [intakes, updateOnlineVisit, visit.id]
  );

  useEffect(() => {
    if (profile && insurance && specificCare) {
      submitIntakes();
    }
  }, [profile, insurance, specificCare]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getPostCheckoutAuth;

CreateIntake.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CreateIntake;
