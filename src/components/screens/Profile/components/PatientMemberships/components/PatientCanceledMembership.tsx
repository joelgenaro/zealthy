import {
  PatientSubscriptionProps,
  useAllVisiblePatientSubscription,
} from '@/components/hooks/data';
import { useRenewSubscription } from '@/components/hooks/mutations';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { QueryObserverResult } from 'react-query/types/core';
import {
  nameToCanceledModalText,
  nameToMembership,
  parseSubName,
} from '../helpers';
import { PatientMembershipProps } from '../types';
import axios from 'axios';

const PatientCanceledMembership = ({
  subscription,
}: PatientMembershipProps & {
  refetchSubscription: () => Promise<
    QueryObserverResult<PatientSubscriptionProps[]>
  >;
}) => {
  const [open, setOpen] = useState(false);
  const [stripeSubscription, setStripeSubscription] = useState<any>(null);
  const renewPrescription = useRenewSubscription();
  const { refetch } = useAllVisiblePatientSubscription();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await axios
          .post('/api/service/payment/get-subscription', {
            subscriptionId: subscription.reference_id,
          })
          .catch(() => ({ data: null }));

        if (response?.data) {
          setStripeSubscription(response.data);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }
    };

    if (subscription.reference_id) {
      fetchSubscriptionData();
    }
  }, [subscription.reference_id]);

  const handleReactivation = useCallback(async () => {
    await renewPrescription.mutateAsync(subscription);
  }, [renewPrescription, subscription]);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    refetch();
    setOpen(false);
  }, [refetch]);

  const formatIntervalText = useMemo(() => {
    let intervalUnit = subscription.interval || 'month';
    let intervalCount = 1;

    if (stripeSubscription?.items?.data?.[0]?.price?.recurring) {
      intervalUnit = stripeSubscription.items.data[0].price.recurring.interval;
      intervalCount =
        stripeSubscription.items.data[0].price.recurring.interval_count || 1;
    } else if (subscription?.subscription?.name) {
      if (subscription.subscription.name.includes('3')) {
        intervalCount = 3;
      } else if (subscription.subscription.name.includes('6')) {
        intervalCount = 6;
      } else if (subscription.subscription.name.includes('12')) {
        intervalCount = 12;
      }
    }

    if (
      (intervalUnit === 'month' && intervalCount === 12) ||
      (intervalUnit === 'day' && intervalCount === 365)
    ) {
      return `/year`;
    }

    if (intervalCount > 1) {
      return ` every ${intervalCount} ${intervalUnit}${
        intervalCount > 1 ? 's' : ''
      }`;
    } else {
      return `/${intervalUnit}`;
    }
  }, [
    stripeSubscription,
    subscription.interval,
    subscription.subscription?.name,
  ]);

  const refundInfo = useMemo(() => {
    if (!stripeSubscription?.metadata) return null;

    if (stripeSubscription.metadata.original_end_date) {
      const currentEndDate = subscription.current_period_end
        ? new Date(subscription.current_period_end)
        : null;
      const originalEndDate = new Date(
        stripeSubscription.metadata.original_end_date
      );

      if (currentEndDate && currentEndDate < originalEndDate) {
        return `(Partially refunded)`;
      }
    }

    return null;
  }, [stripeSubscription, subscription.current_period_end]);

  const text = useMemo(
    () =>
      nameToCanceledModalText[subscription.subscription.name || ''] || {
        title: 'Reactivate your subscription?',
        description: () => [
          `Once you confirm below, your subscription will become active.`,
        ],
        titleOnSuccess: 'Your subscription has been reactivated.',
      },
    [subscription.subscription.name]
  );

  return (
    <>
      <WhiteBox
        padding="24px"
        gap="16px"
        key={subscription.reference_id}
        alignItems="start"
      >
        <Box
          bgcolor="#FFEAE3"
          padding="5px 15px"
          borderRadius="12px"
          width="100%"
        >
          <Typography
            textAlign="center"
            variant="subtitle1"
          >{`Subscription is cancelled. Renew to continue care today.`}</Typography>
        </Box>
        <Stack alignItems="start">
          <Typography
            variant="h3"
            sx={{
              fontSize: '16px !important',
              fontWeight: '600',
              lineHeight: '24px !important',
              color: '#989898',
            }}
          >
            {subscription?.subscription?.name &&
              parseSubName(subscription?.subscription?.name)}
          </Typography>
          <Typography variant="subtitle1">
            {`Membership - $${
              subscription?.price
                ? subscription?.price
                : subscription?.subscription?.price
            }${formatIntervalText} ${refundInfo || ''}`}
          </Typography>
          <Typography textAlign="left" variant="subtitle1">
            Inactive
          </Typography>
        </Stack>
        <Link
          onClick={handleOpen}
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {`Renew ${
            nameToMembership[subscription.subscription.name ?? 'Zealthy access']
          }`}
        </Link>
      </WhiteBox>
      <SubscriptionRestartModal
        titleOnSuccess={text.titleOnSuccess}
        onConfirm={handleReactivation}
        onClose={handleClose}
        title={text.title}
        description={text.description()}
        open={open}
        buttonText="Yes, reactivate"
      />
    </>
  );
};

export default PatientCanceledMembership;
