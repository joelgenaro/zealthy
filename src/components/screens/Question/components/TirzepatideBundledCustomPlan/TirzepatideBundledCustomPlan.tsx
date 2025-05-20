import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { QuestionWithName } from '@/types/questionnaire';
import { useCallback, useEffect } from 'react';
import CustomBundledPlan from '@/components/shared/CustomBundledPlan';

const listItems = [
  'Medical consultation with a provider and prescription if medically appropriate',
  'One month of low-cost Tirzepatide Medication delivered for free with overnight shipping',
  'Tracking your weight loss progress and goals',
];

interface TirzepatideBundledCustomPlan {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const SemaglutideBundledCustomPlan = ({
  question,
  nextPage,
}: TirzepatideBundledCustomPlan) => {
  const { addCoaching } = useCoachingActions();
  const price = 449;
  const discountedPrice = 349;

  const handleClick = useCallback(() => {
    nextPage();
  }, [nextPage]);

  useEffect(() => {
    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: 'Zealthy Weight Loss + Tirzepatide Program',
      id: 4,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      planId:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
          ? 'price_1NvqDuAO83GerSecRyYr1SQQ'
          : 'price_1NvqD9AO83GerSecbYShw4SV',
      price,
      discounted_price: discountedPrice,
    });
  }, [addCoaching]);

  return (
    <CustomBundledPlan
      question={question}
      onClick={handleClick}
      price={price}
      discountedPrice={discountedPrice}
      listItems={listItems}
      medicationName="Tirzepatide"
    />
  );
};

export default SemaglutideBundledCustomPlan;
