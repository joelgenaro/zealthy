import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { QuestionWithName } from '@/types/questionnaire';
import { useCallback, useEffect } from 'react';
import CustomBundledPlan from '@/components/shared/CustomBundledPlan';
import { usePatientState } from '@/components/hooks/usePatient';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useVWO } from '@/context/VWOContext';

const listItems = [
  'Medical consultation with a provider and prescription if medically appropriate',
  'One month of low-cost Semaglutide Medication delivered for free with overnight shipping',
  'Tracking your weight loss progress and goals',
];

interface SemaglutideBundledCustomPlan {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const SemaglutideBundledCustomPlan = ({
  question,
  nextPage,
}: SemaglutideBundledCustomPlan) => {
  const patientState = usePatientState();
  const { potentialInsurance } = useIntakeState();
  const { addCoaching } = useCoachingActions();
  const vwoContext = useVWO();
  const price = 297;
  const discountedPrice = 217;
  let variationName5481: string | null | undefined;

  if (
    ['CA', 'TX'].includes(patientState?.region!) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    )
  ) {
    variationName5481 = vwoContext?.getVariationName(
      '5481',
      String(patientState?.id)
    );
  }

  const handleClick = useCallback(() => {
    nextPage();
  }, [nextPage]);

  useEffect(() => {
    if (variationName5481 !== 'Variation-1') {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: 'Zealthy Weight Loss + Semaglutide Program',
        id: 4,
        planId:
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'price_1NudYDAO83GerSecwJSW28y6'
            : 'price_1NudYfAO83GerSec0QE1mgIo',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        price,
        discounted_price: discountedPrice,
      });
    } else {
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: 'Zealthy Weight Loss + Semaglutide Program',
        id: 4,
        planId:
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
            ? 'price_1PfqlXAO83GerSecpsmBc17r'
            : 'price_1PfqrmAO83GerSecF9WROtam',
        recurring: {
          interval: 'month',
          interval_count: 3,
        },
        price: 891,
        discounted_price: 630,
      });
    }
  }, [addCoaching]);

  return (
    <CustomBundledPlan
      question={question}
      onClick={handleClick}
      price={price}
      discountedPrice={discountedPrice}
      listItems={listItems}
      medicationName="Semaglutide"
    />
  );
};

export default SemaglutideBundledCustomPlan;
