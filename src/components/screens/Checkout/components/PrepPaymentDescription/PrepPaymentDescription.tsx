import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Order } from '../../types';

interface PrepPaymentDescriptionProps {
  updateOrder: Dispatch<SetStateAction<Order>>;
}

const PrepPaymentDescription = ({
  updateOrder,
}: PrepPaymentDescriptionProps) => {
  return (
    <WhiteBox padding="16px 24px">
      <Stack direction="column" gap={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>Medical Consultation</Typography>
          <Typography fontWeight={600}>$100</Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>Support Fee</Typography>
          <Typography fontWeight={600}>$5</Typography>
        </Stack>
      </Stack>
    </WhiteBox>
  );
};

export default PrepPaymentDescription;
