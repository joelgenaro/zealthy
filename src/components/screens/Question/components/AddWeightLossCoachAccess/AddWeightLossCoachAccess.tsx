import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useIntakeState } from '@/components/hooks/useIntake';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { Button, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

interface AddWeightLossCoachingProps {
  onNext: () => void;
}

const AddWeightLossCoachingAccess = ({
  onNext,
}: AddWeightLossCoachingProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { addCoaching } = useCoachingActions();
  const { potentialInsurance } = useIntakeState();
  const supabase = useSupabaseClient<Database>();
  const name = 'Zealthy Weight Loss Access';

  const insuranceName = useMemo(() => {
    if (potentialInsurance === 'Medicare Access Florida') {
      return 'Medicare';
    }
    return 'Medicaid';
  }, [potentialInsurance]);

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
    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: 'Z-Plan by Zealthy Weight Loss Access Program',
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price: subscription!.price,
      discounted_price: 39,
    });

    onNext();
  }, [addCoaching, onNext, subscription]);

  return (
    <>
      <Typography fontStyle="italic" marginTop="-30px">
        {`Z-Plan, Zealthy’s Access Program for ${insuranceName} Members, is $79/month and does not cover your visits with a provider, which should be covered by your ${insuranceName} plan. For a limited time, the first month of access is only $39.`}
      </Typography>
      <Typography fontStyle="italic" marginTop="-30px">
        {`The weight loss access program does not include anything that is covered by ${insuranceName}.`}
      </Typography>
      <Button onClick={handleContinue}>Continue</Button>
    </>
  );
};

export default AddWeightLossCoachingAccess;
