import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import IntakeQuestion from '@/components/screens/IntakeQuestion';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  DefaultAccomplishOptions,
  WeightLossOptions,
  MentalHealthOptions,
  HairLossOptions,
  SpecificCareOption,
  PrimaryCareOptions,
  VirtualUrgentCareOptions,
  PotentialInsuranceOption,
  AsyncMentalHealthOptions,
  AsyncMentalHealthTimelineOptions,
  EnclomipheneOptions,
  PreWorkoutOptions,
} from '@/context/AppContext/reducers/types/intake';
import { getUnauthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import DefaultOffer from '@/components/screens/GetStarted/components/Offer/DefaultOffer';
import { careToOffer } from '@/constants/offers';
import { insuranceToAdd } from '@/constants/insuranceOffers';
import { variantOffer } from '@/constants/variantOffer';
import PreOfferPage from '@/components/screens/GetStarted/components/PreOfferPage';
import EnclomipheneProgramPage from '@/components/screens/GetStarted/components/EnclomipheneProgram/EnclomipheneProgramPage';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import HairLossStart from '@/components/screens/GetStarted/components/HairLossStart';
import getConfig from '../../config';

interface MyOptions {
  [key: string]: string[];
}

interface PayloadProps {
  [SpecificCareOption.DEFAULT]: (payload: DefaultAccomplishOptions) => void;
  [SpecificCareOption.OTHER]: (payload: DefaultAccomplishOptions) => void;
  [SpecificCareOption.PRIMARY_CARE]: (payload: PrimaryCareOptions) => void;
  [SpecificCareOption.VIRTUAL_URGENT_CARE]: (
    payload: VirtualUrgentCareOptions
  ) => void;
  [SpecificCareOption.WEIGHT_LOSS]: (payload: WeightLossOptions) => void;
  [SpecificCareOption.WEIGHT_LOSS_AD]: (payload: WeightLossOptions) => void;
  [SpecificCareOption.ANXIETY_OR_DEPRESSION]: (
    payload: MentalHealthOptions
  ) => void;
  [SpecificCareOption.ASYNC_MENTAL_HEALTH]: (
    payload: AsyncMentalHealthOptions
  ) => void;
  [SpecificCareOption.HAIR_LOSS]: (payload: HairLossOptions) => void;
  [SpecificCareOption.BIRTH_CONTROL]: () => void;
  [SpecificCareOption.ERECTILE_DYSFUNCTION]: () => void;
  [SpecificCareOption.ACNE]: () => void;
  [SpecificCareOption.ANTI_AGING]: () => void;
  [SpecificCareOption.MELASMA]: () => void;
  [SpecificCareOption.ROSACEA]: () => void;
  [SpecificCareOption.SKINCARE]: () => void;
  [SpecificCareOption.WEIGHT_LOSS_ACCESS]: () => void;
  [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: () => void;
  [SpecificCareOption.ENCLOMIPHENE]: (payload: EnclomipheneOptions) => void;
  [SpecificCareOption.PRE_WORKOUT]: (payload: PreWorkoutOptions) => void;
  [SpecificCareOption.FEMALE_HAIR_LOSS]: (payload: HairLossOptions) => void;
  [SpecificCareOption.PREP]: () => void;
  [SpecificCareOption.SLEEP]: () => void;
  [SpecificCareOption.SEX_PLUS_HAIR]: () => void;
  [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: () => void;
  [SpecificCareOption.MENOPAUSE]: () => void;
}

const Onboarding = () => {
  const router = useRouter();
  const { push, query } = useRouter();
  const [page, setPage] = useState<
    | 'initial'
    | 'offer'
    | 'pre-offer'
    | 'enclomiphene-program'
    | Pathnames.AMH_QUESTION_1
    | Pathnames.EDHL_PRESIGNUP_QUESTION_1
  >('initial');

  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const {
    specificCare,
    potentialInsurance,
    variant,
    defaultAccomplish,
    weightLoss,
    mentalHealth,
    hairLoss,
    primaryCare,
    virtualUrgentCare,
    asyncMentalHealth,
    enclomiphene,
    preWorkout,
  } = useIntakeState();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (specificCare && typeof window !== 'undefined') {
      window.localStorage.setItem('specificCare', specificCare);
    } else if (!specificCare && typeof window !== 'undefined') {
      const storedCare = window.localStorage.getItem('specificCare');
      if (storedCare) {
        addSpecificCare(storedCare as SpecificCareOption);
      }
    }
  }, [specificCare]);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      router.pathname === Pathnames.GET_STARTED
    ) {
      localStorage.removeItem('specificCare');
      addSpecificCare(null);
    }
  }, [router.pathname, addSpecificCare]);

  useEffect(() => {
    if (specificCare && !query.care) {
      push({ query: { ...query, care: specificCare } }, undefined, {
        shallow: true,
      });
    } else if (
      !specificCare &&
      Object.values(SpecificCareOption).includes(
        query.care as SpecificCareOption
      )
    ) {
      addSpecificCare(query.care as SpecificCareOption);
    }
    if (
      specificCare === SpecificCareOption.FEMALE_HAIR_LOSS ||
      specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT
    ) {
      push({
        pathname: Pathnames.SIGN_UP,
        query: query,
      });
    }
    if (
      !potentialInsurance &&
      Object.values(PotentialInsuranceOption).includes(
        query.ins as PotentialInsuranceOption
      )
    ) {
      addPotentialInsurance(query.ins as PotentialInsuranceOption);
    }

    if (!variant && query.variant) {
      addVariant(query.variant as string);
    }

    if (
      [
        SpecificCareOption.ACNE,
        SpecificCareOption.ANTI_AGING,
        SpecificCareOption.ANXIETY_OR_DEPRESSION,
        SpecificCareOption.MELASMA,
        SpecificCareOption.ROSACEA,
        SpecificCareOption.SKINCARE,
        SpecificCareOption.BIRTH_CONTROL,
        SpecificCareOption.ERECTILE_DYSFUNCTION,
        SpecificCareOption.PREP,
        SpecificCareOption.SLEEP,
      ].includes(specificCare || SpecificCareOption.DEFAULT)
    ) {
      setPage('offer');
    }
    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      [
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
    ) {
      setPage('offer');
    }

    if (
      specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH &&
      page === 'initial'
    ) {
      setPage('pre-offer');
    }
  }, [specificCare, potentialInsurance, query]);

  const {
    addAsyncMentalHealth,
    addDefaultAccomplish,
    removeDefaultAccomplish,
    resetDefaultAccomplish,
    addWeightLoss,
    removeWeightLoss,
    resetWeightLoss,
    addMentalHealth,
    removeMentalHealth,
    removeAsyncMentalHealth,
    resetMentalHealth,
    resetAsyncMentalHealth,
    addHairLoss,
    removeHairLoss,
    resetHairLoss,
    addPrimaryCare,
    removePrimaryCare,
    resetPrimaryCare,
    addVirtualUrgentCare,
    removeVirtualUrgentCare,
    resetVirtualUrgentCare,
    addEnclomiphene,
    removeEnclomiphene,
    resetEnclomiphene,
    addPreWorkout,
    removePreWorkout,
    resetPreWorkout,
  } = useIntakeActions();

  if (query && query.variant === '5267v') {
    router.push(Pathnames.SIGN_UP);
  }

  const oralSemaglutideOptions = [
    WeightLossOptions.LOSE_WEIGHT,
    'Improve overall health',
    'Increase confidence',
    'Increase energy',
  ];

  const options: MyOptions = {
    [SpecificCareOption.DEFAULT]: [
      DefaultAccomplishOptions.PHYSICAL_HEALTH,
      DefaultAccomplishOptions.LASTING_WEIGHT_LOSS,
      DefaultAccomplishOptions.PARTICULAR_MEDS,
      DefaultAccomplishOptions.SPECIFIC_CONDITION,
      DefaultAccomplishOptions.APPOINTMENT,
      DefaultAccomplishOptions.IMPROVE_MENTAL_HEALTH,
      DefaultAccomplishOptions.PRESCRIPTIONS,
    ],
    [SpecificCareOption.PRIMARY_CARE]: [
      PrimaryCareOptions.PHYSICAL_HEALTH,
      PrimaryCareOptions.SPECIFIC_CONDITION,
      PrimaryCareOptions.PRIMARY_CARE,
      PrimaryCareOptions.PARTICULAR_MEDS,
    ],
    [SpecificCareOption.VIRTUAL_URGENT_CARE]: [
      VirtualUrgentCareOptions.COLD_OR_FLU,
      VirtualUrgentCareOptions.SKIN_PROBLEMS,
      VirtualUrgentCareOptions.URINARY_TRACT,
      VirtualUrgentCareOptions.JOINT_OR_MUSCLE,
    ],
    [SpecificCareOption.WEIGHT_LOSS]: [
      WeightLossOptions.LOSE_WEIGHT,
      WeightLossOptions.INSURANCE_MED,
      WeightLossOptions.SPECIFIC_MED,
      WeightLossOptions.GLP_MED,
      WeightLossOptions.INCREASE_CONFIDENCE,
      WeightLossOptions.INCREASE_ACTIVE,
    ],
    [SpecificCareOption.WEIGHT_LOSS_AD]: [
      WeightLossOptions.LOSE_WEIGHT,
      WeightLossOptions.INSURANCE_MED,
      WeightLossOptions.SPECIFIC_MED,
      WeightLossOptions.GLP_MED,
      WeightLossOptions.INCREASE_CONFIDENCE,
      WeightLossOptions.INCREASE_ACTIVE,
    ],
    [SpecificCareOption.ANXIETY_OR_DEPRESSION]: [
      MentalHealthOptions.IMPROVE_MENTAL,
      MentalHealthOptions.IMPROVE_SYMPTOMS_ANXIETY,
      MentalHealthOptions.IMPROVE_SYMPTOMS_OTHER,
      MentalHealthOptions.INCREASE_SATISFACTION,
      MentalHealthOptions.FIND_CLINICIAN,
      MentalHealthOptions.PSYCHIATRIST,
      MentalHealthOptions.PARTICULAR_MEDS,
    ],
    [SpecificCareOption.ASYNC_MENTAL_HEALTH]: [
      AsyncMentalHealthTimelineOptions.FEW_MONTHS,
      AsyncMentalHealthTimelineOptions.PAST_YEAR,
      AsyncMentalHealthTimelineOptions.FEW_YEARS,
      AsyncMentalHealthTimelineOptions.FIVE_YEARS,
      AsyncMentalHealthTimelineOptions.LONGER_THAN_REMEMBER,
      AsyncMentalHealthTimelineOptions.UNSURE,
    ],
    [SpecificCareOption.HAIR_LOSS]: [
      HairLossOptions.PREVENT_LOSS,
      HairLossOptions.REGROW_HAIR,
      HairLossOptions.PARTICULAR_MEDS,
      HairLossOptions.PRIMARY_CARE,
    ],
    [SpecificCareOption.BIRTH_CONTROL]: [],
    [SpecificCareOption.ERECTILE_DYSFUNCTION]: [],
    [SpecificCareOption.ACNE]: [],
    [SpecificCareOption.ANTI_AGING]: [],
    [SpecificCareOption.MELASMA]: [],
    [SpecificCareOption.ROSACEA]: [],
    [SpecificCareOption.SKINCARE]: [],
    [SpecificCareOption.ENCLOMIPHENE]: [
      EnclomipheneOptions.BODY_COMPOSITION,
      EnclomipheneOptions.LIBIDO,
      EnclomipheneOptions.CONFIDENCE,
      EnclomipheneOptions.FEEL_CALM,
    ],
    [SpecificCareOption.FEMALE_HAIR_LOSS]: [],
    [SpecificCareOption.SEX_PLUS_HAIR]: [],
  };
  const selectedOptions = {
    [SpecificCareOption.OTHER]: defaultAccomplish,
    [SpecificCareOption.DEFAULT]: defaultAccomplish,
    [SpecificCareOption.PRIMARY_CARE]: primaryCare,
    [SpecificCareOption.VIRTUAL_URGENT_CARE]: virtualUrgentCare,
    [SpecificCareOption.WEIGHT_LOSS]: weightLoss,
    [SpecificCareOption.WEIGHT_LOSS_AD]: weightLoss,
    [SpecificCareOption.WEIGHT_LOSS_ACCESS]: [],
    [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: [],
    [SpecificCareOption.ANXIETY_OR_DEPRESSION]: mentalHealth,
    [SpecificCareOption.ASYNC_MENTAL_HEALTH]: asyncMentalHealth,
    [SpecificCareOption.HAIR_LOSS]: hairLoss,
    [SpecificCareOption.BIRTH_CONTROL]: [],
    [SpecificCareOption.ERECTILE_DYSFUNCTION]: [],
    [SpecificCareOption.ACNE]: [],
    [SpecificCareOption.ANTI_AGING]: [],
    [SpecificCareOption.MELASMA]: [],
    [SpecificCareOption.ROSACEA]: [],
    [SpecificCareOption.SKINCARE]: [],
    [SpecificCareOption.ENCLOMIPHENE]: enclomiphene,
    [SpecificCareOption.PRE_WORKOUT]: preWorkout,
    [SpecificCareOption.FEMALE_HAIR_LOSS]: [],
    [SpecificCareOption.PREP]: [],
    [SpecificCareOption.SLEEP]: [],
    [SpecificCareOption.SEX_PLUS_HAIR]: [],
    [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: [],
    [SpecificCareOption.MENOPAUSE]: [],
  };
  const addItem: PayloadProps = {
    [SpecificCareOption.OTHER]: addDefaultAccomplish,
    [SpecificCareOption.DEFAULT]: addDefaultAccomplish,
    [SpecificCareOption.PRIMARY_CARE]: addPrimaryCare,
    [SpecificCareOption.VIRTUAL_URGENT_CARE]: addVirtualUrgentCare,
    [SpecificCareOption.WEIGHT_LOSS]: addWeightLoss,
    [SpecificCareOption.WEIGHT_LOSS_AD]: addWeightLoss,
    [SpecificCareOption.WEIGHT_LOSS_ACCESS]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: () => {},
    [SpecificCareOption.ANXIETY_OR_DEPRESSION]: addMentalHealth,
    [SpecificCareOption.ASYNC_MENTAL_HEALTH]: addAsyncMentalHealth,
    [SpecificCareOption.HAIR_LOSS]: addHairLoss,
    [SpecificCareOption.BIRTH_CONTROL]: () => {},
    [SpecificCareOption.ERECTILE_DYSFUNCTION]: () => {},
    [SpecificCareOption.ACNE]: () => {},
    [SpecificCareOption.ANTI_AGING]: () => {},
    [SpecificCareOption.MELASMA]: () => {},
    [SpecificCareOption.ROSACEA]: () => {},
    [SpecificCareOption.SKINCARE]: () => {},
    [SpecificCareOption.ENCLOMIPHENE]: addEnclomiphene,
    [SpecificCareOption.PRE_WORKOUT]: addPreWorkout,
    [SpecificCareOption.FEMALE_HAIR_LOSS]: addHairLoss,
    [SpecificCareOption.PREP]: () => {},
    [SpecificCareOption.SLEEP]: () => {},
    [SpecificCareOption.SEX_PLUS_HAIR]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: () => {},
    [SpecificCareOption.MENOPAUSE]: () => {},
  };
  const removeItem: PayloadProps = {
    [SpecificCareOption.OTHER]: removeDefaultAccomplish,
    [SpecificCareOption.DEFAULT]: removeDefaultAccomplish,
    [SpecificCareOption.PRIMARY_CARE]: removePrimaryCare,
    [SpecificCareOption.VIRTUAL_URGENT_CARE]: removeVirtualUrgentCare,
    [SpecificCareOption.WEIGHT_LOSS]: removeWeightLoss,
    [SpecificCareOption.WEIGHT_LOSS_AD]: removeWeightLoss,
    [SpecificCareOption.ANXIETY_OR_DEPRESSION]: removeMentalHealth,
    [SpecificCareOption.ASYNC_MENTAL_HEALTH]: removeAsyncMentalHealth,
    [SpecificCareOption.HAIR_LOSS]: removeHairLoss,
    [SpecificCareOption.BIRTH_CONTROL]: () => {},
    [SpecificCareOption.ERECTILE_DYSFUNCTION]: () => {},
    [SpecificCareOption.ACNE]: () => {},
    [SpecificCareOption.ANTI_AGING]: () => {},
    [SpecificCareOption.MELASMA]: () => {},
    [SpecificCareOption.ROSACEA]: () => {},
    [SpecificCareOption.SKINCARE]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_ACCESS]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: () => {},
    [SpecificCareOption.ENCLOMIPHENE]: removeEnclomiphene,
    [SpecificCareOption.PRE_WORKOUT]: removePreWorkout,
    [SpecificCareOption.FEMALE_HAIR_LOSS]: removeHairLoss,
    [SpecificCareOption.PREP]: () => {},
    [SpecificCareOption.SLEEP]: () => {},
    [SpecificCareOption.SEX_PLUS_HAIR]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: () => {},
    [SpecificCareOption.MENOPAUSE]: () => {},
  };
  const resetItem: PayloadProps = {
    [SpecificCareOption.OTHER]: resetDefaultAccomplish,
    [SpecificCareOption.DEFAULT]: resetDefaultAccomplish,
    [SpecificCareOption.PRIMARY_CARE]: resetPrimaryCare,
    [SpecificCareOption.VIRTUAL_URGENT_CARE]: resetVirtualUrgentCare,
    [SpecificCareOption.WEIGHT_LOSS]: resetWeightLoss,
    [SpecificCareOption.WEIGHT_LOSS_AD]: resetWeightLoss,
    [SpecificCareOption.ANXIETY_OR_DEPRESSION]: resetMentalHealth,
    [SpecificCareOption.ASYNC_MENTAL_HEALTH]: resetAsyncMentalHealth,
    [SpecificCareOption.HAIR_LOSS]: resetHairLoss,
    [SpecificCareOption.BIRTH_CONTROL]: () => {},
    [SpecificCareOption.ERECTILE_DYSFUNCTION]: () => {},
    [SpecificCareOption.ACNE]: () => {},
    [SpecificCareOption.ANTI_AGING]: () => {},
    [SpecificCareOption.MELASMA]: () => {},
    [SpecificCareOption.ROSACEA]: () => {},
    [SpecificCareOption.SKINCARE]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_ACCESS]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: () => {},
    [SpecificCareOption.ENCLOMIPHENE]: resetEnclomiphene,
    [SpecificCareOption.PRE_WORKOUT]: resetPreWorkout,
    [SpecificCareOption.FEMALE_HAIR_LOSS]: resetHairLoss,
    [SpecificCareOption.PREP]: () => {},
    [SpecificCareOption.SLEEP]: () => {},
    [SpecificCareOption.SEX_PLUS_HAIR]: () => {},
    [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: () => {},
    [SpecificCareOption.MENOPAUSE]: () => {},
  };

  useEffect(() => {
    if (page !== 'enclomiphene-program') {
      return;
    }
    const handlePopState = () => {
      setPage('initial');
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('popstate', handlePopState);
  }, [page]);

  useEffect(() => {
    if (specificCare === SpecificCareOption.PRE_WORKOUT) {
      push(Pathnames.PRE_WORKOUT_QUESTION_0);
    }
  }, [specificCare]);

  useEffect(() => {
    if (specificCare === SpecificCareOption.MENOPAUSE) {
      push(Pathnames.SIGN_UP);
    }
  }, [specificCare]);

  useEffect(() => {
    if (specificCare === SpecificCareOption.SEX_PLUS_HAIR) {
      push(Pathnames.EDHL_PRESIGNUP_QUESTION_1);
    }
  }, [specificCare]);

  const handleContinue = useCallback(() => {
    if (
      !specificCare ||
      potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
    ) {
      push({
        pathname: Pathnames.SIGN_UP,
        query: {
          care: specificCare,
          ins: potentialInsurance,
        },
      });
    } else if (specificCare === SpecificCareOption.SKINCARE) {
      push(Pathnames.SKINCARE_SIGN_UP);
    } else if (specificCare === SpecificCareOption.ENCLOMIPHENE) {
      setPage('enclomiphene-program');
    } else if (variant === '4438' && query.care === 'Weight loss') {
      push({
        pathname: '/weight-loss-ro/bmi',
        query: {
          variant,
          care: query.care,
        },
      });
    } else {
      setPage('offer');
    }
  }, [specificCare, potentialInsurance, variant, query.care, push]);

  const offer = useMemo(() => {
    if (variant === '2805' || variant === '2806' || variant === '4758') {
      return variantOffer[variant];
    } else if (potentialInsurance) {
      return insuranceToAdd[potentialInsurance || 'Default'];
    } else {
      return careToOffer[specificCare || 'Default'];
    }
  }, [potentialInsurance, specificCare, variant]);

  return (
    <>
      <Head>
        <title>{siteName} | Get Started</title>
      </Head>

      {specificCare === SpecificCareOption.HAIR_LOSS ? (
        <HairLossStart />
      ) : (
        <Container maxWidth="sm" sx={{ marginBottom: '12px' }}>
          {[
            SpecificCareOption.PRE_WORKOUT,
            SpecificCareOption.FEMALE_HAIR_LOSS,
          ]?.includes(specificCare!) ? null : specificCare ===
              SpecificCareOption.ASYNC_MENTAL_HEALTH &&
            page === 'initial' ? null : page === 'initial' &&
            specificCare !== SpecificCareOption.ANXIETY_OR_DEPRESSION &&
            specificCare !== SpecificCareOption.PREP &&
            specificCare !== SpecificCareOption.SLEEP &&
            specificCare !== SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT &&
            specificCare !== SpecificCareOption.MENOPAUSE ? (
            <IntakeQuestion
              showNoneOfAbove={
                potentialInsurance !==
                PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
              }
              header={
                specificCare?.includes('Enclomiphene')
                  ? 'Testosterone Protocol'
                  : potentialInsurance ===
                    PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
                  ? ''
                  : "Let's Get Started"
              }
              question={
                specificCare?.includes('Enclomiphene')
                  ? `What brings you to ${siteName}?`
                  : potentialInsurance ===
                    PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
                  ? `What do you hope to accomplish in the ${siteName} Weight Loss Program?`
                  : `What do you hope to accomplish with ${siteName}?`
              }
              details="Please select all that apply."
              answerOptions={
                potentialInsurance ===
                PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
                  ? oralSemaglutideOptions
                  : options[specificCare || 'Default']
              }
              selectedOptions={selectedOptions[specificCare || 'Default']}
              onSelect={addItem[specificCare || 'Default']}
              onDeselect={removeItem[specificCare || 'Default']}
              onReset={resetItem[specificCare || 'Default']}
              onContinue={handleContinue}
            />
          ) : page === 'offer' ? (
            <Stack textAlign="center">
              <DefaultOffer
                offer={offer}
                variant={variant}
                potentialInsurance={potentialInsurance}
              />
            </Stack>
          ) : page === 'pre-offer' ? (
            <PreOfferPage
              onClick={() => router.push(Pathnames.AMH_QUESTION_1)}
            />
          ) : page === 'enclomiphene-program' ? (
            <EnclomipheneProgramPage />
          ) : null}
        </Container>
      )}
    </>
  );
};

export const getServerSideProps = getUnauthProps;

Onboarding.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default Onboarding;
