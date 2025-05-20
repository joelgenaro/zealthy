import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Database } from '@/lib/database.types';
import { Box, Typography, useTheme } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { styled } from '@mui/material';
import Fee from '../OrderSummary/components/Fee';
import { monthsFromNow } from '@/utils/monthsFromNow';
import WhatsIncluded from '../OrderSummary/components/ZealthyFee/components/WhatsIncluded';
import { Order } from '../../types';
import { usePatient } from '@/components/hooks/data';

const StyledList = styled('ul')`
  margin: 0;
  padding-left: 1.5rem;
`;

interface ZealthySubscriptionCardProps {
  updateOrder: Dispatch<SetStateAction<Order>>;
}

const ZealthySubscriptionCard = ({
  updateOrder,
}: ZealthySubscriptionCardProps) => {
  const theme = useTheme();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(true);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchZealthySubscription = async () => {
      const { data } = await supabase
        .from('subscription')
        .select('price, reference_id, id')
        .eq('name', 'Zealthy Subscription')
        .single();
      setLoading(false);
      if (data) {
        setSubscriptionPrice(data.price);
        updateOrder(order => ({
          ...order,
          subscriptions: order.subscriptions
            .filter(s => s.price !== data.price)
            .concat({
              id: data.id,
              require_payment_now: true,
              planId: data.reference_id,
              price: 0, // will need to be dynamic based on coupon code
            }),
        }));
      }
    };

    fetchZealthySubscription();
  }, [patient?.id, supabase, updateOrder]);

  if (loading) {
    return null;
  }

  return (
    <WhiteBox padding="16px 24px" gap="24px">
      <Box>
        <Fee name="access fee" isBranded price={`10/month`} discountPrice="0" />
        <StyledList>
          <li>
            <Typography variant="h4">{`First 3 months free`}</Typography>
          </li>
          <li>
            <Typography variant="h4">{`$10/month after first 3 months (charged quarterly)`}</Typography>
          </li>
          <li>
            <Typography variant="h4">{`Next charge on ${monthsFromNow(
              3
            )}`}</Typography>
          </li>
        </StyledList>
      </Box>
      <WhatsIncluded />
    </WhiteBox>
  );
};

export default ZealthySubscriptionCard;
