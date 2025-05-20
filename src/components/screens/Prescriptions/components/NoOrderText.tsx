import { useWeightLossSubscription } from '@/components/hooks/data';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo } from 'react';

const NoOrderText = () => {
  const { data: weightLossSubscription } = useWeightLossSubscription();

  const text = useMemo(() => {
    if (
      !weightLossSubscription ||
      weightLossSubscription.subscription.name.includes('Coaching Only')
    ) {
      return <>You do not have any medication orders at this time.</>;
    }

    if (
      ['canceled', 'scheduled_for_cancelation'].includes(
        weightLossSubscription.status
      )
    ) {
      return (
        <>
          You do not have any medication orders at this time. You may{' '}
          <Link href="/patient-portal/profile">reactivate</Link> if you’d like
          to submit a prescription request or order medication.
        </>
      );
    }

    return <>You do not have any medication orders at this time.</>;
  }, [weightLossSubscription]);

  return (
    <Typography component="p" variant="body1">
      {text}
    </Typography>
  );
};

export default NoOrderText;
