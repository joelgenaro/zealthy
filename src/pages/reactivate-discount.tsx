import { PatientSubscription, usePatient } from '@/components/hooks/data';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import Spinner from '@/components/shared/Loading/Spinner';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Pathnames } from '@/types/pathnames';
import { weightLossScheduledForCancelationDiscountEvent } from '@/utils/freshpaint/events';
import { Button, Container, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';
import { addDays } from 'date-fns';
import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import LoadingButton from '@/components/shared/Button/LoadingButton';

export default function ReactivateAccount() {
  const { data: patient } = usePatient();
  const [eligibleForDiscount, setEligibleForDiscount] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const supabase = useSupabaseClient();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const [sub, setSub] = useState<PatientSubscription | null>(null);

  const fullyCanceled =
    sub?.status === 'cancelled' || sub?.status === 'canceled';
  useEffect(() => {
    if (patient) {
      const fetchSubscription = async () => {
        try {
          const { data: subscription, error } = await supabase
            .from('patient_subscription')
            .select(`*, subscription!inner(*)`)
            .eq('patient_id', patient.id)
            .eq('subscription_id', 4)
            .eq('visible', true)
            .eq('price', 135)
            .in('status', [
              'scheduled_for_cancelation',
              'cancelled',
              'canceled',
            ])
            .limit(1)
            .maybeSingle();

          if (error || !subscription) {
            setEligibleForDiscount(false);
            setLoading(false);
            return;
          }

          setSub(subscription as PatientSubscription);

          if (subscription?.reference_id) {
            const { data: hasUsedCoupon } = await axios.get(
              '/api/service/payment/get-coupon-usage',
              {
                params: {
                  referenceId: subscription.reference_id,
                  couponId:
                    process.env.NEXT_PUBLIC_STRIPE_REACTIVATE_DISCOUNT_COUPON,
                },
              }
            );

            if (hasUsedCoupon) {
              Router.push(Pathnames.PATIENT_PORTAL);
            } else {
              setEligibleForDiscount(true);
            }
          } else {
            setEligibleForDiscount(true);
          }
        } catch (error) {
          console.error('Error fetching subscription or coupon usage:', error);
          setEligibleForDiscount(false);
        } finally {
          setLoading(false);
        }
      };
      fetchSubscription();
    }
  }, [patient, supabase]);

  const handleReactivation = useCallback(async () => {
    try {
      if (!sub?.reference_id) return;

      setReactivateLoading(true);

      if (fullyCanceled) {
        // Wait until the renew subscription mutation is completed
        await renewSubscription.mutateAsync({
          subscription: sub,
          coupon: process.env.NEXT_PUBLIC_STRIPE_REACTIVATE_DISCOUNT_COUPON,
        });
      } else {
        // Wait until the reactivate subscription mutation is completed
        await reactivateSubscription.mutateAsync(sub.reference_id);
        await axios.post('/api/service/payment/apply-coupon-subscription', {
          subscriptionId: sub.reference_id,
          couponId: process.env.NEXT_PUBLIC_STRIPE_REACTIVATE_DISCOUNT_COUPON,
        });
      }
      weightLossScheduledForCancelationDiscountEvent(
        patient?.profiles?.id,
        patient?.profiles.email,
        true
      );
      setReactivateLoading(false);
      // Redirect to the Patient Portal after successful operation
      Router.push(Pathnames.PATIENT_PORTAL);
    } catch (error) {
      setReactivateLoading(false);
      console.error(
        'Error reactivating subscription or applying coupon:',
        error
      );
    }
  }, [sub, fullyCanceled, renewSubscription, reactivateSubscription]);

  const formatCurrentPeriodEnd = (dateS: string): string => {
    const periodEnd = new Date(dateS);
    return `${periodEnd.toLocaleString('default', {
      month: 'long',
    })} ${periodEnd.getDate()}, ${periodEnd.getFullYear()}`;
  };

  const endDateDiscount = patient?.reactivation_coupon_sent_at
    ? addDays(new Date(patient.reactivation_coupon_sent_at), 2)
    : addDays(new Date(), 2);

  return (
    <>
      <Head>
        <title>Zealthy | Reactivate Account</title>
      </Head>
      {loading ? (
        <Container
          maxWidth="xs"
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Spinner />
        </Container>
      ) : eligibleForDiscount && sub ? (
        <Container
          maxWidth="xs"
          sx={{
            padding: 6,
            display: 'flex',
            gap: '16px',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <Typography variant="h2">
            Reactivate to get $30 off your{' '}
            {fullyCanceled
              ? 'Weight Loss membership'
              : 'next month’s membership'}
          </Typography>
          <>
            {fullyCanceled ? (
              <Typography>
                The $30 discount will be applied to this month&apos;s
                membership, so you&apos;ll only pay $105 instead of $135. Your
                membership will become active again right away.
              </Typography>
            ) : (
              <Typography>
                The $30 discount will be applied to next month&apos;s
                membership, so you&apos;ll only pay $105 instead of $135.
              </Typography>
            )}
          </>
          <Typography>
            {fullyCanceled ? (
              <>
                This discount is only available until{' '}
                {formatCurrentPeriodEnd(endDateDiscount.toString())}.
              </>
            ) : (
              <>
                You will not be charged until{' '}
                {formatCurrentPeriodEnd(sub.current_period_end)}. This discount
                is only available until{' '}
                {formatCurrentPeriodEnd(endDateDiscount.toString())}.
              </>
            )}
          </Typography>
          <LoadingButton
            onClick={handleReactivation}
            loading={reactivateLoading}
          >
            <Typography fontWeight="700">Reactivate my membership</Typography>
          </LoadingButton>
          <Button
            variant="text"
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
          >
            <Typography fontWeight={600}>Skip</Typography>
          </Button>
        </Container>
      ) : (
        <Container
          maxWidth="xs"
          sx={{
            display: 'flex',
            gap: '16px',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <Typography variant="h2">
            You are not eligible for this discount
          </Typography>
        </Container>
      )}
    </>
  );
}

ReactivateAccount.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};
