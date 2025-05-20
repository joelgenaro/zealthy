import WhiteBox from '@/components/shared/layout/WhiteBox';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Order } from '../../types';
import NonBundledRadioButton from './NonBundledRadioButton';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Spinner from '@/components/shared/Loading/Spinner';
import { useCoachingActions } from '@/components/hooks/useCoaching';

interface SelectionProps {
  updateOrder: Dispatch<SetStateAction<Order>>;
}
type Option = {
  id: number;
  name: string;
  planId: string;
  header: string;
  subHeader: string;
  textPrice?: string;
  discounted_price: number;
  price: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  hasBanner: boolean;
  type: CoachingType;
};

type SubscriptionOption = Database['public']['Tables']['subscription']['Row'];

const PlanSelection = ({ updateOrder }: SelectionProps) => {
  const supabase = useSupabaseClient<Database>();
  const [interval, setInterval] = useState<number | null>(
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 14 : 11
  );
  const [weightLossPlans, setWeightLossPlans] = useState<
    SubscriptionOption[] | null
  >([]);
  const { addCoaching } = useCoachingActions();

  const fetchPlanOptions = async () => {
    const { data: weightLossSubs } = await supabase
      .from('subscription')
      .select('*')
      .in('name', ['Zealthy 3-Month Weight Loss', 'Zealthy Weight Loss']);

    setWeightLossPlans(weightLossSubs);
  };

  const weightLoss3Months = weightLossPlans?.find(
    plan => plan.name === 'Zealthy 3-Month Weight Loss'
  );
  const weightLoss1Month = weightLossPlans?.find(
    plan => plan.name === 'Zealthy Weight Loss'
  );

  useEffect(() => {
    fetchPlanOptions();
  }, []);

  if (!weightLossPlans) {
    return <Spinner />;
  }

  const planOptions = [
    {
      id: weightLoss3Months?.id!,
      name: 'Zealthy 3-Month Weight Loss',
      planId: weightLoss3Months?.reference_id!,
      header: 'Every 3 months',
      subHeader: 'First month $39 but every month after',
      textPrice: '113',
      discounted_price: 275,
      price: weightLoss3Months?.price!,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      hasBanner: true,
      type: CoachingType.WEIGHT_LOSS,
    },
    {
      id: 4,
      name: 'Zealthy Weight Loss Program ',
      planId: weightLoss1Month?.reference_id!,
      header: 'Monthly',
      subHeader: 'First month $39 but every month after',
      textPrice: '135',
      discounted_price: 39,
      price: weightLoss1Month?.price!,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      hasBanner: false,
      type: CoachingType.WEIGHT_LOSS,
    },
  ];

  const handleOnChange = (option: Option) => {
    setInterval(option.id);
    updateOrder(order => ({
      ...order,
      coaching: order.coaching
        .filter(c => c.type !== option.type)
        .concat({
          name: option.name,
          id: option.id,
          planId: option.planId,
          price: option.discounted_price || option.price,
          require_payment_now: true,
          type: CoachingType.WEIGHT_LOSS,
        }),
    }));
    addCoaching(option);
  };

  return (
    <WhiteBox padding="16px 24px" gap="0.5rem">
      <Typography fontWeight={600}>Upgrade your plan & save</Typography>
      <Typography variant="h4">
        Losing weight takes time. Select a longer plan to achieve lasting weight
        loss.
      </Typography>
      {planOptions.map(option => (
        <NonBundledRadioButton
          key={option.id}
          option={option}
          basePrice={option.price}
          onChange={handleOnChange}
          isSelected={option.id === interval}
        />
      ))}
    </WhiteBox>
  );
};

export default PlanSelection;
