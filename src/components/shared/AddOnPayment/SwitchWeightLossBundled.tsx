import {
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  useStripeSubscription,
  useSubscription,
} from '@/components/hooks/data';
import { usePayment } from '@/components/hooks/usePayment';
import { PatientSubscriptionProps } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { monthsFromNow } from '@/utils/date-fns';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { differenceInCalendarDays } from 'date-fns';
import Router from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';
import PatientPaymentMethod from '../PatientPaymentMethod';
import PaymentEditModal from '../PaymentEditModal';
import { EditDeliveryAddress, UpdatePayment } from '../UpdatePatientInfo';
import { oralSemaglutideBundled } from '@/constants/rules/post-checkout-intake';

type Patient = Database['public']['Tables']['patient']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Invoice = Database['public']['Tables']['invoice']['Row'];

function getPlanId(medication: 'semaglutide' | 'tirzepatide') {
  if (medication === 'semaglutide') {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1NudYDAO83GerSecwJSW28y6'
      : 'price_1NudYfAO83GerSec0QE1mgIo';
  } else {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1NvqDuAO83GerSecRyYr1SQQ'
      : 'price_1NvqD9AO83GerSecbYShw4SV';
  }
}

interface SwitchWeightLossBundledProps {
  medication: 'semaglutide' | 'tirzepatide';
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Patient;
  profile: Profile;
}

export function SwitchWeightLossBundled({
  patient,
  profile,
  medication,
  visibleSubscriptions,
}: SwitchWeightLossBundledProps) {
  const supabase = useSupabaseClient<Database>();

  const [error, setError] = useState('');
  const [page, setPage] = useState('confirm');
  const [loading, setLoading] = useState(false);
  const [shippingId, setShippingId] = useState('1');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [chargeToRefund, setChargeToRefund] = useState<string | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(true);
  const [firstMonthInvoice, setFirstMonthInvoice] = useState<Invoice | null>(
    null
  );

  const { data: patientCareTeam } = usePatientCareTeam();
  const { data: subscription } = useSubscription('Zealthy Weight Loss');
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: patientAddress } = usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const {
    createChargeRefund,
    createInvoicePayment,
    replaceSubscription,
    cancelSubscription,
  } = usePayment();

  const currentWeightLoss = visibleSubscriptions?.find(
    sub =>
      sub?.subscription?.name === 'Zealthy Weight Loss' &&
      ['active', 'trialing'].includes(sub?.status)
  );

  const { data: stripeData } = useStripeSubscription(
    currentWeightLoss?.reference_id!
  );

  const [currentSubscriptionPrice, setCurrentSubscriptionPrice] =
    useState<number>(0);

  const hasTirzepatideBundled =
    currentWeightLoss && currentWeightLoss.price === 449;
  const hasSemaglutideBundled =
    currentWeightLoss && currentWeightLoss.price === 297;
  const hasOralSemaglutideBundled =
    currentWeightLoss && currentWeightLoss.price === 249;

  useEffect(() => {
    if (stripeData?.trial_end) {
      setCurrentSubscriptionPrice(
        hasTirzepatideBundled
          ? 349
          : hasSemaglutideBundled
          ? 217
          : hasOralSemaglutideBundled
          ? stripeData.trial_end * 1000 <= Date.now()
            ? 249
            : 149
          : 39
      );
    }
  }, [
    hasOralSemaglutideBundled,
    hasSemaglutideBundled,
    hasTirzepatideBundled,
    stripeData?.trial_end,
  ]);

  const price = useMemo(() => {
    if ((stripeData?.trial_end ?? 0) * 1000 <= Date.now()) {
      return (
        (medication === 'semaglutide' ? 297 : 449) +
        (shippingId === '2' ? 15 : 0)
      );
    } else {
      return (
        (medication === 'semaglutide' ? 217 : 349) +
        (shippingId === '2' ? 15 : 0)
      );
    }
  }, [stripeData?.trial_end, medication, shippingId]);

  const totalAmount = price - currentSubscriptionPrice;

  const priceDifference = useMemo(() => {
    return currentSubscriptionPrice - price;
  }, [currentSubscriptionPrice, price]);

  const refundAmount = priceDifference > 0 ? priceDifference : 0;

  let bundledPlanId = getPlanId(medication);

  async function onSuccess() {
    const medicationRequest = {
      patient_id: patient?.id,
      region: patient?.region,
      medication_quantity_id: 98,
      status: 'REQUESTED',
      note: `${medication} compound 1 months`,
      specific_medication: medication,
      total_price: totalAmount,
      shipping_method: parseInt(shippingId, 10),
      care_team: patientCareTeam
        ?.filter((e: any) => e.role.includes('Provider'))
        ?.map((e: any) => e.clinician_id),
    };

    const prescriptionRequest = await supabase
      .from('prescription_request')
      .insert(medicationRequest)
      .select()
      .maybeSingle();

    const addToQueue = await supabase
      .from('task_queue')
      .insert({
        task_type: patient.has_verified_identity
          ? 'PRESCRIPTION_REQUEST'
          : 'PRESCRIPTION_REQUEST_ID_REQUIRED',
        patient_id: patient?.id,
        queue_type: 'Provider (QA)',
        visible: true,
      })
      .select()
      .maybeSingle()
      .then(({ data }) => data);

    if (prescriptionRequest.data?.id) {
      await supabase
        .from('prescription_request')
        .update({ queue_id: addToQueue?.id })
        .eq('id', prescriptionRequest.data?.id);
    }

    //create new subscription
    await replaceSubscription({
      trialEnd: monthsFromNow(1),
      id: subscription?.id!,
      planId: bundledPlanId,
      reference_id: currentWeightLoss?.reference_id!, // old subscription will be hidden
    });

    toast.success('You have successfully upgraded your membership!');

    //cancel old subscription
    await cancelSubscription(
      currentWeightLoss?.reference_id!,
      `Upgraded to bundled ${medication} subscription`
    );

    if (
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
      hasOralSemaglutideBundled
    ) {
      window.freshpaint.track(`switched-to-${medication}-bundled`, {
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        refund_amount: refundAmount,
      });
    }

    Router.push(Pathnames.PATIENT_PORTAL);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!patient.id || !totalAmount) {
      return;
    }

    setLoading(true);

    if (!!refundAmount) {
      if (!chargeToRefund) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      // create refund
      const { data } = await createChargeRefund(chargeToRefund, refundAmount);

      if (!data?.message?.includes('successful')) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      const metadata = {
        zealthy_medication_name: medication,
        zealthy_care: 'Weight loss',
        zealthy_product_name:
          medication === 'semaglutide'
            ? 'Weight Loss Semaglutide Bundled'
            : 'Weight Loss Tirzepatide Bundled',
        zealthy_subscription_id: subscription?.id,
        reason: `switch-to-bundle`,
        zealthy_patient_id: patient.id,
      };

      //create payment intent
      const { data } = await createInvoicePayment(
        patient.id,
        totalAmount * 100,
        metadata,
        'Switch subscription to bundled ' + medication
      );

      if (!data) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
    }

    await onSuccess();
  }

  async function fetchChargeToRefund(firstMonthPrice: number) {
    if (!patient.id) {
      return;
    }

    const invoice = await supabase
      .from('invoice')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('amount_due', firstMonthPrice)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(res => res.data);

    if (invoice?.charge) {
      setChargeToRefund(invoice.charge);
      setFirstMonthInvoice(invoice);
    }
    setLoadingInvoice(false);
  }

  useEffect(() => {
    if (currentSubscriptionPrice) {
      fetchChargeToRefund(currentSubscriptionPrice);
    }
  }, [currentSubscriptionPrice, fetchChargeToRefund]);

  if (!currentWeightLoss) {
    return (
      <Stack gap={2}>
        <Typography variant="h2" textAlign="center">
          Oops! <br /> You must have a Zealthy Weight Loss plan in order to use
          this link.
        </Typography>
        <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
          Go home
        </Button>
        <Button
          onClick={() =>
            Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
          }
        >
          Message your care team
        </Button>
      </Stack>
    );
  }

  if (medication === 'tirzepatide' && hasTirzepatideBundled) {
    return (
      <Stack gap={2}>
        <Typography variant="h2" textAlign="center">
          Oops! <br /> Looks like you already have a Tirzepatide bundled plan.
        </Typography>
        <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
          Go home
        </Button>
        <Button
          onClick={() =>
            Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
          }
        >
          Message your care team
        </Button>
      </Stack>
    );
  }

  if (medication === 'semaglutide' && hasSemaglutideBundled) {
    return (
      <Stack gap={2}>
        <Typography variant="h2" textAlign="center">
          Oops! <br /> Looks like you already have a Semaglutide bundled plan.
        </Typography>
        <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
          Go home
        </Button>
        <Button
          onClick={() =>
            Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
          }
        >
          Message your care team
        </Button>
      </Stack>
    );
  }

  if (!loadingInvoice && !firstMonthInvoice) {
    return (
      <Stack gap={2}>
        <Typography variant="h2" textAlign="center">
          Oops! <br /> We were not able to find a first month charge for your
          current weight loss plan. If you believe this is an error, please
          contact support.
        </Typography>
        <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
          Go home
        </Button>
        <Button
          onClick={() =>
            Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
          }
        >
          Message your care team
        </Button>
      </Stack>
    );
  }

  if (firstMonthInvoice && firstMonthInvoice.created_at) {
    const daysSinceCreated = differenceInCalendarDays(
      new Date(),
      new Date(firstMonthInvoice.created_at)
    );

    if (daysSinceCreated > 31 && !oralSemaglutideBundled) {
      return (
        <Stack gap={2}>
          <Typography variant="h2" textAlign="center">
            Oops! <br /> This offer is only available to patients who have been
            subscribed to a weight loss plan for less than one month.
          </Typography>
          <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
            Go home
          </Button>
          <Button
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
          >
            Message your care team
          </Button>
        </Stack>
      );
    }
  }

  return (
    <>
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
            }}
          >
            {hasOralSemaglutideBundled
              ? `The ${medication} + care plan has been added to your cart. You will be charged the difference between this plan and the last month of your current plan, which is $${
                  price - currentSubscriptionPrice
                }. This charge has been added to your cart.`
              : `The ${medication} + care plan has been added to your cart. You will be able to get a refund if not prescribed. The difference of your $${currentSubscriptionPrice} and the $${price} monthly charge has been added to your cart.`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
              marginBottom: '1rem',
            }}
          >
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Your plan'}
              </Typography>
              <Typography variant="subtitle1">
                {`${
                  medication === 'semaglutide' ? 'Semaglutide' : 'Tirzepatide'
                } weekly injections`}
              </Typography>
              <Typography variant="subtitle1">
                Ongoing care with medical provider
              </Typography>
              <Typography variant="subtitle1">
                {hasOralSemaglutideBundled
                  ? 'Unlimited messaging with care team'
                  : 'Unlimited messaging with coach'}
              </Typography>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                Delivery options
              </Typography>
              <FormControl>
                <RadioGroup
                  aria-labelledby="delivery-options"
                  defaultValue="standard"
                  name="radio-buttons-group"
                  value={shippingId}
                  onChange={event =>
                    setShippingId((event.target as HTMLInputElement).value)
                  }
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    sx={{ marginBottom: '10px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Mail Innovations - $0
                        </Typography>
                        <Typography>Usually arrives in 5-8 days</Typography>
                      </>
                    }
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Next Day Air Saver - $15
                        </Typography>
                        <Typography>Usually arrives in 3-5 days</Typography>
                      </>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Delivery address'}
              </Typography>
              <Typography>{patientAddress?.address_line_1}</Typography>
              <Typography>{patientAddress?.address_line_2}</Typography>
              <Typography>
                {patientAddress?.city}, {patientAddress?.state}
              </Typography>
              <Typography>{patientAddress?.zip_code}</Typography>
              <Typography>United States</Typography>
              <Link
                onClick={() => setPage('delivery-address')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Edit'}
              </Link>
            </Box>
            {paymentMethod ? (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '16px !important',
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    color: '#989898',
                  }}
                >
                  {'Payment'}
                </Typography>
                <Stack gap="5px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={() => setShowPaymentModal(true)}
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Stack>
              </>
            ) : null}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%', marginBottom: '2rem' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {`Confirm order - $${
                refundAmount
                  ? `${refundAmount} refund`
                  : `${totalAmount} due today`
              }`}
            </LoadingButton>

            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
            >
              {`*You will be charged $${totalAmount} today for your plan which includes both your doctor and your monthly supply of ${medication}.`}
            </Typography>
            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
            >
              {`You will be charged $${price} every month thereafter until you cancel. Cancel any time.`}
            </Typography>
            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
            >
              If you are not prescribed, you will be able to receive a refund.
            </Typography>
          </Box>
          <PaymentEditModal
            onClose={() => setShowPaymentModal(false)}
            open={showPaymentModal}
            title="Update your card to get your care or prescription"
          />
        </>
      )}
      {page === 'delivery-address' && (
        <>
          <EditDeliveryAddress goHome={() => setPage('confirm')} />
        </>
      )}
      {page === 'update-payment' && (
        <>
          <UpdatePayment
            stripeCustomerId={patientPayment?.customer_id}
            patientId={patient.id}
            goHome={() => {
              refetchPatientPayment();
              setPage('confirm');
            }}
          />
        </>
      )}
    </>
  );
}
