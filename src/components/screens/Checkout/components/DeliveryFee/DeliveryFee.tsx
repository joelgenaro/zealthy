import { useSelector } from '@/components/hooks/useSelector';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Stack, Typography } from '@mui/material';

const DeliveryFee = () => {
  const coaching = useSelector(store =>
    store.coaching.find(c => c.type === CoachingType.PERSONALIZED_PSYCHIATRY)
  );
  const medications = useSelector(store => store.visit.medications);

  if (coaching) {
    return (
      <WhiteBox padding="16px 24px" gap="2px">
        <Stack direction="row" justifyContent="space-between">
          <Typography>Shipping</Typography>
          <Typography>FREE</Typography>
        </Stack>
      </WhiteBox>
    );
  }

  if (medications.length) {
    return (
      <WhiteBox padding="16px 24px" gap="2px">
        <Stack direction="row" justifyContent="space-between">
          <Typography>Shipping</Typography>
          <Typography>FREE</Typography>
        </Stack>
      </WhiteBox>
    );
  }

  return null;
};

export default DeliveryFee;
