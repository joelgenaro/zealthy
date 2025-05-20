import { usePayment } from '@/components/hooks/usePayment';
import { useSelector } from '@/components/hooks/useSelector';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { usePostCheckoutNavigation } from '@/context/NavigationContext/NavigationContext';
import { Button, Stack } from '@mui/material';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import VisitMessage from '../VisitStart';

const PaymentAddOn = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const coaching = useSelector(store => store.coaching);
  const { paymentAddOn } = usePayment();
  const { next } = usePostCheckoutNavigation();

  const coachingPlan = useMemo(() => coaching[0], [coaching]);

  const title = `You have added ${coachingPlan?.name} to your cart.`;

  const body = useMemo(() => {
    return `Do you authorize us to charge your card ${coachingPlan?.price}?`;
  }, [coachingPlan?.price]);

  const handleYes = useCallback(async () => {
    try {
      setLoading(true);
      await paymentAddOn({
        planId: coachingPlan.planId,
        id: coachingPlan.id,
        price: coachingPlan.price,
        name: coachingPlan.name,
        require_payment_now: true,
        type: coachingPlan.type,
      });
      Router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [coachingPlan, next, paymentAddOn]);

  const handleNo = useCallback(() => {
    Router.push(next);
  }, [next]);

  return (
    <VisitMessage title={title} body={body}>
      <Stack gap="16px">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <LoadingButton onClick={handleYes} loading={loading}>
          Yes
        </LoadingButton>
        <Button variant="text" onClick={handleNo}>
          Continue without coaching
        </Button>
      </Stack>
    </VisitMessage>
  );
};

export default PaymentAddOn;
