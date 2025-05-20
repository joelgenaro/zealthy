import WhiteBox from '@/components/shared/layout/WhiteBox';
import { ConsultationState } from '@/context/AppContext/reducers/types/consultation';
import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Order } from '../../types';
import { Price } from '../OrderSummary/components/Fee';

interface ConsultationFeeProps {
  consultation: ConsultationState;
  updateOrder: Dispatch<SetStateAction<Order>>;
  canRemove: boolean;
}

const ConsultationFee = ({
  consultation,
  updateOrder,
}: ConsultationFeeProps) => {
  useEffect(() => {
    updateOrder(order => ({
      ...order,
      consultation: order.consultation
        .filter(c => c.type !== consultation.type)
        .concat({
          type: consultation.type,
          price: consultation.discounted_price || consultation.price,
          require_payment_now: true,
        }),
    }));
  }, [consultation, updateOrder]);

  return (
    <WhiteBox key={consultation.type} padding="16px 24px" gap="2px">
      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={600}>{consultation.name}</Typography>
        {consultation?.discounted_price ? (
          <Price
            discountPrice={`${consultation.discounted_price}`}
            price={consultation.price}
          />
        ) : (
          <Price price={consultation.price} />
        )}
      </Stack>
      {!!consultation?.concerns?.length && (
        <Stack direction="row" gap={0.5}>
          <Typography variant="h4">
            {consultation?.concerns?.length > 1 ? 'Conditions:' : 'Condition:'}
          </Typography>
          <Typography variant="h4">
            {consultation?.concerns?.join(', ')}
          </Typography>
        </Stack>
      )}
    </WhiteBox>
  );
};

export default ConsultationFee;
