import axios from 'axios';
import Router from 'next/router';
import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  FilledInput,
  FormControl,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  useActivePatientSubscription,
  usePatient,
  usePatientSubscription,
} from '@/components/hooks/data';
import { membershipEvent } from '@/utils/freshpaint/events';
import { usePayment } from '@/components/hooks/usePayment';
import { useSearchParams } from 'next/navigation';
import { Pathnames } from '@/types/pathnames';
import { notEmpty } from '@/types/utils/notEmpty';
import { formatDate } from '@/utils/date-fns';
import { differenceInDays } from 'date-fns';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'] & {
    order: Database['public']['Tables']['order']['Row'] & {
      prescription: Database['public']['Tables']['prescription']['Row'] & {
        medication_quantity: Database['public']['Tables']['medication_quantity']['Row'] & {
          medication_dosage: Database['public']['Tables']['medication_dosage']['Row'] & {
            medication: Database['public']['Tables']['medication']['Row'];
          };
        };
      };
    };
  };

const usePatientWeightLossPrescriptions = () => {
  const supabase = useSupabaseClient<Database>();

  return useCallback(
    async (patientId: number) => {
      return supabase
        .from('patient_prescription')
        .select(
          '*, order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
        )
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .eq(
          'order.prescription.medication_quantity.medication_dosage.medication.display_name',
          'Weight Loss Medication'
        )
        .then(({ data }): Record<string, string>[] =>
          ((data || []) as PatientPrescription[])
            .map(d => {
              if (d.order.prescription.medication) {
                return {
                  [d.order.prescription.medication]: formatDate(
                    d.current_period_end
                  ),
                };
              }
              return;
            })
            .filter(notEmpty)
        );
    },
    [supabase]
  );
};

const isWeightLoss = (subscriptionName: string) => {
  return [
    'Zealthy Weight Loss',
    'Zealthy Weight Loss Access',
    'Zealthy 3-Month Weight Loss',
    'Zealthy 3-Month Weight Loss [IL]',
    'Zealthy 6-Month Weight Loss',
    'Zealthy 12-Month Weight Loss',
  ].includes(subscriptionName);
};

export default function BundledMembershipManage() {
  const supabase = useSupabaseClient<Database>();
  const { id } = Router.query;
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const { data: patient } = usePatient();
  const { data: subscriptionData } = usePatientSubscription(id);
  const { data: patientSubscriptions, refetch: refetchSubscriptions } =
    useActivePatientSubscription();

  const [loading, setLoading] = useState(false);
  const { scheduleForCancelation } = usePayment();
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [reasonValue, setReasonValue] = useState<string>('');
  const getWeightLossPrescriptions = usePatientWeightLossPrescriptions();

  const subPrice =
    subscriptionData?.price ?? subscriptionData?.subscription?.price ?? 297;
  const subMed = [297].includes(subPrice) ? 'semaglutide' : 'tirzepatide';

  const handleCancelWeightlossAppointments = async () => {
    if (!patient?.id) {
      return;
    }
    const appointments = await supabase
      .from('appointment')
      .select('*')
      .eq('patient_id', patient?.id)
      .eq('status', 'Confirmed')
      .eq('care', SpecificCareOption.WEIGHT_LOSS);

    if (!appointments?.data) return;

    await Promise.all(
      appointments.data.map(appointment => {
        return supabase
          .from('appointment')
          .update({ status: 'Cancelled' })
          .eq('id', appointment?.id);
      })
    );
  };
  const handleCancelSubscription = useCallback(
    async (
      referenceId: string | null | undefined,
      cancelReason: string | null | undefined
    ) => {
      setLoading(true);

      await scheduleForCancelation(referenceId!, cancelReason);

      let prescriptions = null;

      if (
        isWeightLoss(subscriptionData?.subscription?.name || '') &&
        patient?.id
      ) {
        prescriptions = await getWeightLossPrescriptions(patient.id);
      }

      membershipEvent(
        patient?.profiles.first_name,
        patient?.profiles?.email,
        patientSubscriptions?.filter(
          (sub: any) => sub.reference_id === referenceId
        )[0].subscription.name,
        subscriptionData?.current_period_end,
        prescriptions
      );
      await handleCancelWeightlossAppointments();
      Router.push(Pathnames.PATIENT_PORTAL);

      toast.success('Membership scheduled for cancellation');
      refetchSubscriptions();
      setLoading(false);
    },
    [
      scheduleForCancelation,
      subscriptionData?.subscription?.name,
      subscriptionData?.current_period_end,
      patient?.id,
      patient?.profiles.first_name,
      patient?.profiles?.email,
      patientSubscriptions,
      refetchSubscriptions,
      getWeightLossPrescriptions,
      id,
    ]
  );

  const parseSubManage = (sub: string) => {
    const names: { [key: string]: string } = {
      'Zealthy Subscription': 'Cancel primary care membership',
      'Mental Health Coaching': 'Cancel mental health plan',
      'Zealthy Weight Loss Access': 'Cancel weight loss access plan',
      'Zealthy 3-Month Weight Loss': 'Manage your plan',
      'Zealthy 3-Month Weight Loss [IN]': 'Manage your plan',
      'Zealthy 6-Month Weight Loss': 'Manage your plan',
      'Zealthy 12-Month Weight Loss': 'Manage your plan',
      'Zealthy Weight Loss': 'Manage your plan',
      'Medication Subscription': 'Cancel medication membership',
      'Zealthy Personalized Psychiatry': 'Cancel psychiatry membership',
    };
    return names[sub];
  };
  const parseSubName = (sub: string) => {
    const names: { [key: string]: string } = {
      'Zealthy Subscription': 'Primary Care Membership',
      'Mental Health Coaching': 'Mental Health Coaching Plan',
      'Zealthy Weight Loss': 'Weight Loss Plan',
      'Zealthy 3-Month Weight Loss': 'Zealthy 3-Month Weight Loss',
      'Zealthy 3-Month Weight Loss [IN]': 'Zealthy 3-Month Weight Loss',
      'Zealthy 6-Month Weight Loss': 'Zealthy 6-Month Weight Loss',
      'Zealthy 12-Month Weight Loss': 'Zealthy 12-Month Weight Loss',
      'Zealthy Weight Loss Access': 'Weight Loss Access Plan',
      'Medication Subscription': 'Medication Membership',
      'Zealthy Personalized Psychiatry': 'Personalized Psychiatry Plan',
    };
    return names[sub];
  };

  async function handleReasonSave() {
    if (!id) {
      return;
    }
    await supabase
      .from('patient_subscription')
      .update({ cancel_reason: `${reasonValue}` })
      .eq('reference_id', id);
    Router.push(
      {
        query: { id, page: 'feedback' },
      },
      undefined,
      { shallow: true }
    );
  }
  async function handleFeedbackSave() {
    if (!id) {
      return;
    }
    await supabase
      .from('patient_subscription')
      .update({
        cancel_reason: `${reasonValue} - ${feedbackValue}`,
      })
      .eq('reference_id', id);
    Router.push(
      {
        query: { id, page: 'final' },
      },
      undefined,
      { shallow: true }
    );
  }
  async function handleApplyCoupon() {
    setLoading(true);

    const applyCoupon = await axios.post(
      '/api/service/payment/apply-coupon-subscription',
      {
        subscriptionId: subscriptionData?.reference_id,
        couponId: process.env.NEXT_PUBLIC_STRIPE_50_DOLLARS_OFF_WEIGHT_LOSS,
      }
    );
    if (applyCoupon.status === 200) {
      Router.push(
        {
          query: { id, page: 'discount-applied' },
        },
        undefined,
        { shallow: true }
      );
    }
    setLoading(false);
  }

  const periodLength = differenceInDays(
    new Date(
      subscriptionData?.current_period_end
        ? subscriptionData?.current_period_end
        : ''
    ),
    new Date(
      subscriptionData?.current_period_start
        ? subscriptionData?.current_period_start
        : ''
    )
  );

  const totalMonthsLeft = differenceInDays(
    new Date(subscriptionData?.current_period_end || ''),
    new Date()
  );

  const expectedLength = subscriptionData?.subscription?.name?.includes('3')
    ? 3
    : subscriptionData?.subscription?.name?.includes('6')
    ? 6
    : subscriptionData?.subscription?.name?.includes('12')
    ? 12
    : 1;

  const interval =
    (expectedLength || 1) > 1
      ? ` every ${expectedLength} ${subscriptionData?.interval}s`
      : `/${subscriptionData?.interval}`;

  const nextMonthFree =
    periodLength > 59 &&
    periodLength < 65 &&
    expectedLength === 1 &&
    totalMonthsLeft > 30;

  const alreadyPaidTwoMonths =
    expectedLength === 1 && periodLength > 80 && totalMonthsLeft > 30;

  return (
    <Box display="flex" justifyContent="center" width="100%">
      {!page && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            border: '1px solid #D8D8D8',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: '16px !important',
              fontWeight: '600',
              lineHeight: '24px !important',
              color: '#989898',
            }}
          >
            {subscriptionData?.subscription?.name &&
              parseSubName(subscriptionData?.subscription?.name)}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
            {`Membership - `}{' '}
            {alreadyPaidTwoMonths ? (
              <>
                <span
                  style={{
                    textDecoration: 'line-through',
                    marginRight: '5px',
                    textDecorationColor: '#00531B',
                  }}
                >
                  {`$${
                    subscriptionData?.subscription?.price
                      ? subscriptionData?.subscription?.price
                      : subscriptionData?.price
                  }
                ${interval}`}
                </span>
                <span style={{ color: '#00531B' }}>
                  {Math.floor(totalMonthsLeft / 30) < 2
                    ? 'Already paid for next month'
                    : `Already paid next ${Math.floor(
                        totalMonthsLeft / 30
                      )} months`}
                </span>
              </>
            ) : null}
            {nextMonthFree ? (
              <>
                <span
                  style={{
                    textDecoration: 'line-through',
                    marginRight: '5px',
                    textDecorationColor: '#00531B',
                  }}
                >
                  {`$${
                    subscriptionData?.price
                      ? subscriptionData?.price
                      : subscriptionData?.subscription?.price
                  }
                ${interval}`}
                </span>
                <span style={{ color: '#00531B' }}>Next month free!</span>
              </>
            ) : null}
            {!nextMonthFree && !alreadyPaidTwoMonths
              ? `$${
                  subscriptionData?.price
                    ? subscriptionData?.price
                    : subscriptionData?.subscription?.price
                }${interval}`
              : null}
          </Typography>
          <Stack gap="10px">
            <Link
              onClick={() =>
                Router.push(
                  {
                    query: {
                      id,
                      page: '1',
                    },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {`${
                subscriptionData?.subscription?.name &&
                parseSubManage(subscriptionData?.subscription?.name)
              }`}
            </Link>
            <Link
              onClick={() => Router.push('/patient-portal/profile')}
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Back to profile
            </Link>
          </Stack>
        </Box>
      )}
      {page === '1' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            Any current or future semaglutide or tirzepatide orders will be
            cancelled if you unsubscribe.
          </Typography>
          <Typography>
            You won’t be able to request any additional refills and current
            orders of semaglutide or tirzepatide will be paused since your
            Zealthy provider won’t be able to monitor you for the duration of
            the refill.
          </Typography>
          <Stack spacing={2} mt="1rem">
            <Button
              fullWidth
              size="small"
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              Keep your membership
            </Button>
            <Button
              fullWidth
              size="small"
              color="grey"
              onClick={() =>
                Router.push(
                  {
                    query: { id, page: '3' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            >
              Continue unsubscribe
            </Button>
          </Stack>
        </Stack>
      )}
      {page === '2' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            Need to learn more about GLP-1 medication or Zealthy’s Weight Loss
            Program?
          </Typography>
          <Typography>
            You can read more about the Zealthy Weight Loss program as well as
            GLP-1 medications like Wegovy, Ozempic, and Mounjaro.
          </Typography>
          <Typography>
            Our Senior Medical Director, Dr. Echeverry, has written about this
            topic on the Zealthy blog.
          </Typography>
          <Stack spacing={2} mt="1rem">
            <Button
              fullWidth
              size="small"
              onClick={() => window.open('https://getzealthy.com/blog')}
            >
              Review more information
            </Button>
            <Button
              fullWidth
              size="small"
              color="grey"
              onClick={() =>
                Router.push(
                  {
                    query: { id, page: '3' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            >
              Continue unsubscribe
            </Button>
          </Stack>
        </Stack>
      )}
      {page === '3' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            Do you have questions for your care team? We can help!
          </Typography>
          <Typography>
            Let your care team know what’s going on. They can make changes to
            your care plan or help you explore insurance coverage or alternative
            medication options.
          </Typography>
          <Stack spacing={2} mt="1rem">
            <Button
              fullWidth
              size="small"
              onClick={() =>
                Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
              }
            >
              Message your care team
            </Button>
            <Button
              fullWidth
              size="small"
              color="grey"
              onClick={() =>
                Router.push(
                  {
                    query: { id, page: '4' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            >
              Continue unsubscribe
            </Button>
          </Stack>
        </Stack>
      )}
      {page === '4' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            Keep your {subMed} program for less!
          </Typography>
          <Typography>
            You can switch to a half-price program for a limited time. You’ll
            still get access to your Zealthy doctor, coach, and your medication
            for $50 off for the next month!
          </Typography>
          <Typography>
            ${subPrice - 50} for your next month of Zealthy Weight Loss.
          </Typography>
          <Typography>
            You won’t be billed today. Will apply to your next billing cycle.
          </Typography>
          <Stack spacing={2} mt="1rem">
            <LoadingButton
              fullWidth
              size="small"
              onClick={() => handleApplyCoupon()}
            >
              Switch membership
            </LoadingButton>
            <Button
              fullWidth
              size="small"
              color="grey"
              onClick={() =>
                Router.push(
                  {
                    query: { id, page: '5' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            >
              Continue unsubscribe
            </Button>
          </Stack>
        </Stack>
      )}
      {page === '5' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">We’re sorry to see you go!</Typography>

          <Typography>
            We’d really appreciate your feedback as we work to improve the
            Zealthy member experience.
          </Typography>

          <Stack spacing={2} mt="1rem">
            <Button
              fullWidth
              size="small"
              onClick={() =>
                Router.push(
                  {
                    query: { id, page: 'reason' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            >
              Continue
            </Button>
          </Stack>
        </Stack>
      )}
      {page === 'reason' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            Is there anything else you’d like to say?
          </Typography>
          <FormControl
            sx={{
              width: '100%',
            }}
          >
            <FilledInput
              sx={{
                background: '#EEEEEE',
                '&:hover': {
                  background: '#EEEEEE',
                },
                marginBottom: '1rem',
              }}
              onChange={e => setReasonValue(e.target.value)}
              fullWidth
              placeholder="Type here..."
              multiline
              disableUnderline={true}
              rows={8}
            />
          </FormControl>
          <Button
            fullWidth
            onClick={handleReasonSave}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Next
          </Button>
        </Stack>
      )}
      {page === 'feedback' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">
            What might encourage you to join Zealthy again in the future?
          </Typography>
          <Typography variant="subtitle1">
            For example: new benefits, price changes, etc.
          </Typography>
          <FormControl
            sx={{
              marginBottom: '1rem',
            }}
          >
            <FilledInput
              sx={{
                background: '#EEEEEE',
                '&:hover': {
                  background: '#EEEEEE',
                },
              }}
              onChange={e => setFeedbackValue(e.target.value)}
              fullWidth
              placeholder="Your feedback will help improve the program for other members?"
              multiline
              disableUnderline={true}
              rows={8}
            />
          </FormControl>
          <Button
            fullWidth
            onClick={handleFeedbackSave}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Continue
          </Button>
        </Stack>
      )}
      {page === 'final' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">Thank you!</Typography>
          <Typography>
            Please select the unsubscribe button below to confirm your
            cancellation.
          </Typography>
          <Typography>
            You will continue to have access to your account until your next
            renewal date, at which time your account will be cancelled.
          </Typography>
          <Typography>
            However, any medication orders will be cancelled since your Zealthy
            provider won’t be able to monitor you for the duration of you taking
            the medication.
          </Typography>

          <LoadingButton
            fullWidth
            size="small"
            loading={loading}
            disabled={loading}
            onClick={() =>
              handleCancelSubscription(
                subscriptionData?.reference_id
                  ? subscriptionData?.reference_id
                  : '',
                `${reasonValue} - ${feedbackValue}`
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Unsubscribe
          </LoadingButton>
        </Stack>
      )}
      {page === 'discount-applied' && (
        <Stack gap="24px" maxWidth="448px">
          <Typography variant="h2">Membership discount applied!</Typography>
          <Typography>
            You’ll save $50 for your next month! This will apply to your next
            billing cycle.
          </Typography>

          <Stack spacing={2} mt="1rem">
            <LoadingButton
              fullWidth
              size="small"
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              Done
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
