import { useCouponCodeRedeem, useLanguage } from '@/components/hooks/data';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatientState } from '@/components/hooks/usePatient';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { Button, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import getConfig from '../../../../../../config';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

interface AddWeighLossCoachingProps {
  onNext: () => void;
}

const AddWeighLossCoaching = ({ onNext }: AddWeighLossCoachingProps) => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { addCoaching } = useCoachingActions();
  const { potentialInsurance, variant, specificCare } = useIntakeState();
  const patientState = usePatientState();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const vwo = useVWO();
  const supabase = useSupabaseClient<Database>();
  const name = 'Zealthy Weight Loss';
  const language = useLanguage();
  const recurring = useMemo(
    () => ({
      interval: 'month',
      interval_count: 1,
    }),
    []
  );
  const variant5284 =
    ['IL', 'TX'].includes(patientState?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ? vwo.getVariationName('5284', String(patientState?.id!))
      : '';

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null;

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);

  const handleContinue = useCallback(() => {
    if (!subscription) return;
    potentialInsurance === PotentialInsuranceOption.TX
      ? addCoaching({
          type: CoachingType.WEIGHT_LOSS,
          name: 'Zealthy Weight Loss (Texas)',
          id: subscription!.id,
          planId:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
              ? 'price_1O4mrZAO83GerSecjflSM4Np'
              : 'price_1O4mrAAO83GerSec3TqnUODJ',
          recurring,
          price: 119,
          discounted_price: 39,
        })
      : potentialInsurance === 'Semaglutide Bundled'
      ? addCoaching({
          type: CoachingType.WEIGHT_LOSS,
          name: 'Zealthy Weight Loss + Semaglutide Program',
          id: subscription!.id,
          planId:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
              ? 'price_1NudYDAO83GerSecwJSW28y6'
              : 'price_1NudYfAO83GerSec0QE1mgIo',
          recurring,
          price: 297,
          discounted_price: 217,
        })
      : potentialInsurance === 'Tirzepatide Bundled'
      ? variant == '2746'
        ? addCoaching({
            type: CoachingType.WEIGHT_LOSS,
            name: 'Zealthy Weight Loss + Tirzepatide Program',
            id: subscription!.id,
            planId:
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
                ? 'price_1NvqDuAO83GerSecRyYr1SQQ'
                : 'price_1NvqD9AO83GerSecbYShw4SV',
            recurring,
            price: 449,
          })
        : addCoaching({
            type: CoachingType.WEIGHT_LOSS,
            name: 'Zealthy Weight Loss + Tirzepatide Program',
            id: subscription!.id,
            planId:
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
                ? 'price_1NvqDuAO83GerSecRyYr1SQQ'
                : 'price_1NvqD9AO83GerSecbYShw4SV',
            recurring,
            price: 449,
            discounted_price: 349,
          })
      : variant5284 === 'Variation-1'
      ? addCoaching({
          id: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 14 : 11,
          name: 'Zealthy 3-Month Weight Loss',
          planId:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
              ? 'price_1NuIyxAO83GerSecZUtO9ow7'
              : 'price_1NtYcYAO83GerSecD694XICK',
          discounted_price: 275,
          price: 339,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          type: CoachingType.WEIGHT_LOSS,
        })
      : addCoaching({
          type: CoachingType.WEIGHT_LOSS,
          name: `${siteName} Weight Loss Program`,
          id: subscription!.id,
          planId: subscription!.reference_id,
          recurring,
          price: subscription!.price,
          discounted_price: 39,
        });

    onNext();
  }, [
    subscription,
    potentialInsurance,
    addCoaching,
    recurring,
    variant,
    onNext,
  ]);

  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Typography fontStyle="italic">
          {couponCodeRedeem?.code === 'katie'
            ? `For a limited time, the first month of ${siteName}’s weight loss program is only $39 with your radio promo and limited time offer`
            : potentialInsurance === 'OH'
            ? ``
            : potentialInsurance === 'TX'
            ? `For a limited time, the first month of ${siteName}'s weight loss program is only $39. The typical program cost is $119/month. You can opt out at any time.`
            : potentialInsurance === 'Semaglutide Bundled'
            ? `${siteName}’s weight loss program, which includes your monthly supply of semaglutide is $217 for the first month and $297/mo after that, with no additional fees or co-pays. The cost of compound semaglutide is included.`
            : potentialInsurance === 'Tirzepatide Bundled'
            ? `${siteName}’s weight loss program, which includes your monthly supply of tirzepatide is $349 for the first month and $449/mo after that, with no additional fees or co-pays. The cost of compound tirzepatide is included.`
            : language === 'esp'
            ? `Por tiempo limitado, el primer mes del programa de pérdida de peso de ${siteName} cuesta solo $39. El costo típico del programa es de $135/mes. Puedes darte de baja en cualquier momento.`
            : variant6471
            ? `For a limited time, the first month of ${siteName}'s weight loss program is only $39 and you’ll only pay if you’re prescribed. The typical program cost is $135/month. You can opt out at any time.`
            : `For a limited time, the first month of ${siteName}'s weight loss program is only $39. The typical program cost is $135/month. You can opt out at any time.`}
        </Typography>
        {['Semaglutide Bundled', 'Tirzepatide Bundled'].includes(
          potentialInsurance || ''
        ) && (
          <Typography fontStyle="italic">
            {'You can cancel any time and we have a 30-day refund guarantee.'}
          </Typography>
        )}
      </Stack>
      <Button onClick={handleContinue}>
        {language === 'esp' ? 'Continuar' : 'Continue'}
      </Button>
    </Stack>
  );
};

export default AddWeighLossCoaching;
