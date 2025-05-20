import { usePayment } from '@/components/hooks/usePayment';
import { useSelector } from '@/components/hooks/useSelector';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { QuestionWithName } from '@/types/questionnaire';
import {
  Button,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Price } from '@/components/screens/Checkout/components/OrderSummary/components/Fee';
import { monthsFromNow } from '@/utils/monthsFromNow';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { usePatient, usePatientDefaultPayment } from '@/components/hooks/data';
import PaymentEditModal from '@/components/shared/PaymentEditModal';
import { logger } from '@supabase/auth-helpers-nextjs';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { useVWO } from '@/context/VWOContext';
type PaymentProfile = Pick<
  Database['public']['Tables']['payment_profile']['Row'],
  'customer_id' | 'last4'
>;

const listItems = [
  'Matching you to a mental health coach who will work to ensure that appropriately prescribed medication supplemented by proper emotional support',
  '45 minute monthly 1:1 coaching sessions by phone or video',
  'Unlimited messaging with your coach to track your progress and check in on how you’re doing',
  'Tracking your mental health progress and goals',
];

interface CoachingAddOnProps {
  onNext: (nextPage?: string) => void;
  question: QuestionWithName;
}

const MentalHealthCoachingAddon = ({
  onNext,
  question,
}: CoachingAddOnProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(false);
  const vwoClientInstance = useVWO();
  const [error, setError] = useState('');
  const [hasMentalHealthSubscription, setMentalHealthSubscription] =
    useState(false);
  const { paymentAddOn } = usePayment();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const plan = useSelector(store =>
    store.coaching.find(c => c.type === CoachingType.MENTAL_HEALTH)
  );
  const supabase = useSupabaseClient<Database>();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Coach (Mental Health)')
  );

  const { updateAppointment } = useAppointmentAsync();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleSkip = useCallback(() => {
    onNext();
  }, [onNext]);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  const handleScheduledAppointment = async () => {
    setLoading(true);

    updateAppointment(
      appointment!.id,
      {
        status: 'Confirmed',
      },
      patient!
    )
      .then(() => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        logger.error('handleScheduleAppt_err', error);
      });
  };

  const handleSubmit = useCallback(async () => {
    if (!plan) return;
    try {
      setLoading(true);
      await paymentAddOn({
        id: plan.id,
        planId: plan.planId,
        require_payment_now: true,
        name: plan.name,
        price: plan.discounted_price || plan.price,
        type: CoachingType.MENTAL_HEALTH,
      });
      setLoading(false);
      window.VWO?.event('purchaseMhCoach');
      await Promise.all([
        vwoClientInstance?.track('7865_2', 'purchaseMhCoach', patient),
        vwoClientInstance?.track('8552_2', 'purchaseMh', patient),
      ]);
      handleScheduledAppointment();
      onNext();
    } catch (err) {
      setError(
        (err as Error).message ||
          'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchMentalHealthSubscription() {
      if (!patient?.id || !plan?.id) {
        return;
      }
      const { data } = await supabase
        .from('patient_subscription')
        .select('*, subscription(name)')
        .eq('status', 'active')
        .eq('patient_id', patient?.id)
        .eq('subscription_id', plan?.id)
        .limit(1);
      return data;
    }

    if (patient?.id) {
      fetchMentalHealthSubscription().then(subscription => {
        setMentalHealthSubscription(!isEmpty(subscription));
      });
    }
  }, [patient?.id, plan?.id, supabase]);

  return (
    <Stack gap="48px" marginTop="-48px">
      <Typography
        variant="h2"
        sx={{
          fontSize: '32px',
          fontWeight: '700',
          lineHeight: '38px',
          ...(question?.styles || {}).header,
        }}
      >
        You have added Monthly 1:1 Mental Health Coaching to your cart.
      </Typography>
      <Stack gap="16px">
        <Stack>
          <Typography
            sx={{
              fontSize: '16px !important',
              fontWeight: '600',
              lineHeight: '22px',
              letterSpacing: '0.005em',
              marginBottom: '8px',
            }}
          >
            {'Our mental health coaching program includes:'}
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '8px',
              fontSize: '16px',
            }}
            disablePadding
          >
            {listItems.map(item => (
              <ListItem key={item} sx={{ display: 'list-item', padding: 0 }}>
                {item}
              </ListItem>
            ))}
          </List>
        </Stack>
        <Stack
          direction="column"
          gap="16px"
          sx={{
            padding: '24px',
            background: '#FFFFFF',
            border: '1px solid #D8D8D8',
            borderRadius: '16px',
          }}
        >
          <Stack direction="column">
            <Typography
              variant="h3"
              sx={{
                fontSize: '16px !important',
                fontWeight: '600',
                lineHeight: '24px !important',
                color: '#989898',
              }}
            >
              Payment
            </Typography>
            <Typography variant="subtitle1">
              {paymentMethod?.last4
                ? `**** **** **** ${paymentMethod?.last4}`
                : 'No payment information!'}
            </Typography>
            <Link onClick={handleOpen}>
              <Typography color={theme.palette.primary.light} fontWeight={600}>
                Edit
              </Typography>
            </Link>
          </Stack>

          <Stack direction="column" gap="8px">
            <Typography
              variant="h3"
              sx={{
                fontSize: '16px !important',
                fontWeight: '600',
                lineHeight: '24px !important',
                color: '#989898',
              }}
            >
              Coaching fee
            </Typography>
            <Price
              price={`${plan!.price}/month`}
              discountPrice={`${plan!.discounted_price} for the first month`}
              fontWeight={300}
            />
          </Stack>
        </Stack>
        <Typography fontStyle="italic">
          {`You can opt out at any time. After your first month, you will be charged $99/month starting on ${monthsFromNow()}.`}
        </Typography>
      </Stack>

      <Stack direction="column" gap="30px" alignItems="center">
        {hasMentalHealthSubscription ? (
          <>
            <Typography color="green" textAlign="center">
              Good news! You have already subscribed. Please click <b>Next</b>{' '}
              button to continue
            </Typography>
            <Button onClick={handleNext} fullWidth>
              Next
            </Button>
          </>
        ) : (
          <>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%' }}
              loading={loading}
              disabled={hasMentalHealthSubscription || loading}
              onClick={handleSubmit}
            >
              {`Add 1:1 Coaching - $${
                plan?.discounted_price || plan?.price
              }.00`}
            </LoadingButton>

            <Link
              sx={{
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '0.005em',
                fontWeight: '600',
              }}
              onClick={handleSkip}
            >
              Continue without coaching
            </Link>
          </>
        )}
      </Stack>
      <PaymentEditModal
        open={open}
        title="Update your card to get your care or prescription"
        onClose={handleClose}
      />
    </Stack>
  );
};

export default MentalHealthCoachingAddon;
