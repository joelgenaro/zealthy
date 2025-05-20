import { formatDate } from '@/utils/date-fns';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import differenceInMonths from 'date-fns/differenceInMonths';
import { useMemo, useState, useEffect } from 'react';
import { parseSubName } from '../PatientMemberships/helpers';
import { Subscription } from '../PatientMemberships/types';
import axios from 'axios';

interface MembershipDetailsProps {
  subscription: Subscription;
  showRenewal?: boolean;
}

const MembershipDetails = ({
  subscription,
  showRenewal = true,
}: MembershipDetailsProps) => {
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [stripeSubscription, setStripeSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const couponResponse = await axios
          .post('/api/service/payment/get-coupon-subscription', {
            subscriptionId: subscription.reference_id,
          })
          .catch(error => {
            console.error('Error fetching coupon:', error);
          });

        const coupon = couponResponse?.data;
        if (coupon?.amount_off) {
          const amountOff = coupon.amount_off / 100;
          setDiscountedPrice(amountOff);
        }

        const subscriptionResponse = await axios.post(
          '/api/service/payment/get-subscription',
          {
            subscriptionId: subscription.reference_id,
          }
        );
        setStripeSubscription(subscriptionResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [subscription.reference_id]);

  const price = useMemo(() => {
    if (stripeSubscription) {
      const amount = stripeSubscription.items.data[0].price.unit_amount;
      return amount ? amount / 100 : 0;
    }
    return subscription.price ?? subscription.subscription.price ?? 0;
  }, [
    stripeSubscription,
    subscription.price,
    subscription.subscription?.price,
  ]);

  const expectedLength = useMemo(() => {
    if (subscription.subscription?.name) {
      if (subscription.subscription.name.includes('3')) {
        return 3;
      } else if (subscription.subscription.name.includes('6')) {
        return 6;
      } else if (subscription.subscription.name.includes('12')) {
        return 12;
      }
    }

    if (stripeSubscription) {
      const intervalCount =
        stripeSubscription.items.data[0].price.recurring.interval_count;
      return intervalCount || 1;
    }

    return 1;
  }, [subscription.subscription?.name, stripeSubscription]);

  const interval = useMemo(() => {
    let intervalUnit = 'month';
    if (stripeSubscription) {
      const recurring = stripeSubscription.items.data[0].price.recurring;
      intervalUnit = recurring.interval;
    } else if (subscription.interval) {
      intervalUnit = subscription.interval;
    }

    return `/${intervalUnit}`;
  }, [stripeSubscription, subscription.interval, expectedLength]);

  const formatIntervalText = useMemo(() => {
    let intervalUnit = subscription.interval || 'month';
    let intervalCount = expectedLength || 1;

    if (stripeSubscription?.items?.data?.[0]?.price?.recurring) {
      intervalUnit = stripeSubscription.items.data[0].price.recurring.interval;
      intervalCount =
        stripeSubscription.items.data[0].price.recurring.interval_count || 1;
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
  }, [subscription.interval, expectedLength, stripeSubscription]);

  const nextRenewalDate = useMemo(() => {
    if (stripeSubscription) {
      const periodEnd = stripeSubscription.current_period_end;
      return formatDate(new Date(periodEnd * 1000).toISOString());
    }
    return formatDate(subscription.current_period_end!);
  }, [stripeSubscription, subscription.current_period_end]);

  const {
    nextMonthFree,
    alreadyPaidTwoMonths,
    totalMonthsPaid,
    refundedMonths,
  } = useMemo(() => {
    if (stripeSubscription) {
      const periodStart = new Date(
        stripeSubscription.current_period_start * 1000
      );
      const periodEnd = new Date(stripeSubscription.current_period_end * 1000);
      const today = new Date();

      const periodLengthInMonths = differenceInMonths(periodEnd, periodStart);
      const monthsLeft = differenceInMonths(periodEnd, today);

      let refundedMonths = 0;
      if (stripeSubscription.metadata) {
        if (stripeSubscription.metadata.original_end_date) {
          const originalEndDate = new Date(
            stripeSubscription.metadata.original_end_date
          );
          const originalMonths = differenceInMonths(
            originalEndDate,
            periodStart
          );
          refundedMonths = Math.max(0, originalMonths - periodLengthInMonths);
        }
      }

      const nextMonthFree =
        periodLengthInMonths === 2 && expectedLength === 1 && monthsLeft > 1;

      const alreadyPaidTwoMonths =
        (expectedLength === 1 || subscription.subscription.id === 1) &&
        periodLengthInMonths >= 3 &&
        monthsLeft > 1;

      let totalMonthsPaid;
      if (refundedMonths > 0) {
        const originalLength = periodLengthInMonths + refundedMonths;
        totalMonthsPaid = `${periodLengthInMonths} of ${originalLength} months paid`;
      } else if (monthsLeft <= 1) {
        totalMonthsPaid = 'Already paid for next month';
      } else {
        totalMonthsPaid = `Already paid for next ${monthsLeft} months`;
      }

      return {
        nextMonthFree,
        alreadyPaidTwoMonths,
        totalMonthsPaid,
        refundedMonths,
      };
    }
    return {
      nextMonthFree: false,
      alreadyPaidTwoMonths: false,
      totalMonthsPaid: '',
      refundedMonths: 0,
    };
  }, [stripeSubscription, expectedLength]);

  return (
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
        {subscription.subscription?.name &&
          parseSubName(subscription.subscription?.name)}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          textAlign: 'left',
        }}
      >
        {`Membership - `}
        {discountedPrice && price ? (
          <>
            <span
              style={{
                textDecoration: 'line-through',
                marginRight: '5px',
                textDecorationColor: '#00531B',
              }}
            >
              ${price}
              {formatIntervalText}
            </span>
            <br />
            <span style={{ color: '#00531B' }}>
              {`Next period only $${
                price - discountedPrice
              } (your $${discountedPrice} discount applied)`}
            </span>
          </>
        ) : alreadyPaidTwoMonths || refundedMonths > 0 ? (
          <>
            <span>
              ${price}
              {formatIntervalText}
            </span>
            <span style={{ color: '#00531B', marginLeft: '5px' }}>
              {totalMonthsPaid}
            </span>
          </>
        ) : nextMonthFree ? (
          <>
            <span
              style={{
                textDecoration: 'line-through',
                marginRight: '5px',
                textDecorationColor: '#00531B',
              }}
            >
              ${price}
              {formatIntervalText}
            </span>
            <span style={{ color: '#00531B' }}>Next month free!</span>
          </>
        ) : (
          <span>
            ${price}
            {formatIntervalText}
          </span>
        )}
      </Typography>
      {showRenewal && (
        <Typography variant="subtitle1">{`Renews on ${nextRenewalDate}`}</Typography>
      )}
    </Stack>
  );
};

export default MembershipDetails;
