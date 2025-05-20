import {
  usePatientDefaultPayment,
  usePatientSubscriptionByName,
  useSubscription,
} from '@/components/hooks/data';
import toast from 'react-hot-toast';
import { usePayment } from '@/components/hooks/usePayment';
import ExistingPaymentMethod from '@/components/screens/Checkout/components/ExistingPaymentMethod';
import TotalToday from '@/components/screens/Checkout/components/TotalToday';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { Pathnames } from '@/types/pathnames';
import { dateDiffInDays, formatDate, monthsFromNow } from '@/utils/date-fns';
import { Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useStripe } from '@stripe/react-stripe-js';

interface ConfirmUpgradeProps {}

const ConfirmUpgrade = ({}: ConfirmUpgradeProps) => {
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { plan, discount, type = 'weight loss' } = Router.query;
  const { data: subscription } = useSubscription(plan as string);
  const { data: currentSub, refetch } = usePatientSubscriptionByName(
    type as string
  );

  const {
    createInvoicePayment,
    createPaymentIntent,
    renewSubscription,
    cancelSubscription,
    upgradeSubscription,
  } = usePayment();
  const stripe = useStripe();

  const frequency = useMemo(() => {
    if (subscription) {
      const number = subscription.name.replace(/\D+/g, '');
      return number.match(/\d+/) ? Number(number) : 1;
    }
    return 1;
  }, [subscription]);

  const discountAmount = useMemo(() => {
    const number = (discount as string).replace(/\D+/g, '');
    return number.match(/\d+/) ? Number(number) : 1;
  }, [discount]);

  const nextCharge = useMemo(() => {
    const chargeAt = new Date(monthsFromNow(frequency) * 1000).toISOString();
    return formatDate(chargeAt);
  }, [frequency]);

  const unusedTime = useMemo(() => {
    if (!currentSub && !subscription) {
      return 0;
    }

    const difference = dateDiffInDays(
      new Date(),
      new Date(currentSub?.current_period_end!)
    );

    return Math.round(
      (difference / (currentSub?.interval_count! * 31)) * currentSub?.price!
    );
  }, [subscription, currentSub]);

  const totalAmount = useMemo(() => {
    if (subscription) {
      return subscription?.price - unusedTime;
    }
    return 0;
  }, [subscription, unusedTime]);

  const onSuccess = useCallback(async () => {
    //create new subscription
    await upgradeSubscription(currentSub?.patient_id!, {
      id: subscription?.id?.toString()!,
      price_id: subscription?.reference_id!,
    });

    //cancel old subscription and hide it
    await cancelSubscription(
      currentSub?.reference_id!,
      `Upgraded to ${frequency} months subscription`
    );

    await supabase
      .from('patient_subscription')
      .update({ visible: false })
      .eq('reference_id', currentSub?.reference_id!);

    toast.success('You have successfully upgraded your membership.');

    //refetch weight loss subscription
    await refetch();

    //redirect to patient portal/profile
    Router.push(`${Pathnames.PATIENT_PORTAL}/profile?page=home`);
    setLoading(false);
  }, [
    cancelSubscription,
    frequency,
    refetch,
    renewSubscription,
    subscription?.id,
    subscription?.reference_id,
    currentSub?.reference_id,
  ]);

  const onSubmit = useCallback(async () => {
    if (!currentSub || !totalAmount || !subscription) {
      return;
    }

    setLoading(true);

    const metadata = {
      zealthy_subscription_id: subscription.id,
      reason: `upgrade`,
      zealthy_patient_id: currentSub.patient_id,
    };

    //create payment intent
    const { data, error } = await createInvoicePayment(
      currentSub?.patient_id,
      Math.round(totalAmount * 100),
      metadata,
      'Subscription upgrade to ' + subscription.name
    );

    if (!data) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    await onSuccess();
  }, [createInvoicePayment, subscription, totalAmount, currentSub, onSuccess]);

  return (
    <Stack gap="24px">
      <Typography variant="h2">Confirm upgrade</Typography>
      {paymentMethod ? (
        <ExistingPaymentMethod
          paymentMethod={paymentMethod}
          onError={setError}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={167}
          sx={{ borderRadius: '16px' }}
        />
      )}

      {!currentSub || !subscription ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={162}
          sx={{ borderRadius: '16px' }}
        />
      ) : (
        <Paper
          sx={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 0, 0, 0.19)',
          }}
        >
          <Stack gap="16px">
            <Typography>
              {`By selecting upgrade below, you will receive a ${discountAmount}% discount on your membership moving forward. You will not be charged again until ${nextCharge}. This is a summary of what you owe today for the next ${frequency} months of lasting weight loss care:`}
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Plan cost:</Typography>
              <Typography>${subscription?.price}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="#777777">
                Unused time on current subscription after today
              </Typography>
              <Typography>{`-$${unusedTime}`}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <TotalToday amount={totalAmount} discount={0} />

      {loading && (
        <LoadingModal
          title="Authorizing payment..."
          description="This will take a few seconds."
        />
      )}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Button disabled={loading} fullWidth onClick={onSubmit}>
        Upgrade
      </Button>
    </Stack>
  );
};

export default ConfirmUpgrade;
