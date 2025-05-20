import {
  usePatientAddress,
  usePatientDefaultPayment,
  usePatientPayment,
  useSubscription,
} from '@/components/hooks/data';
import { usePayment } from '@/components/hooks/usePayment';
import { PatientSubscriptionProps } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { monthsFromNow } from '@/utils/date-fns';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { differenceInCalendarDays } from 'date-fns';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';
import PatientPaymentMethod from '../PatientPaymentMethod';
import PaymentEditModal from '../PaymentEditModal';
import { EditDeliveryAddress, UpdatePayment } from '../UpdatePatientInfo';

type Patient = Database['public']['Tables']['patient']['Row'];
type Invoice = Database['public']['Tables']['invoice']['Row'];

interface SwitchWeightLossNonBundledProps {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Patient;
}

export default function SwitchWeightLossBundled({
  patient,
  visibleSubscriptions,
}: SwitchWeightLossNonBundledProps) {
  const supabase = useSupabaseClient<Database>();

  const [error, setError] = useState('');
  const [page, setPage] = useState('confirm');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [chargeToRefund, setChargeToRefund] = useState<string | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(true);
  const [firstMonthInvoice, setFirstMonthInvoice] = useState<Invoice | null>(
    null
  );

  const { data: subscription } = useSubscription('Zealthy Weight Loss');
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: patientAddress } = usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { createChargeRefund, replaceSubscription, cancelSubscription } =
    usePayment();

  const currentWeightLoss = visibleSubscriptions?.find(
    sub =>
      sub?.subscription?.name === 'Zealthy Weight Loss' &&
      ['active', 'trialing'].includes(sub?.status) &&
      [297, 449].includes(sub?.price || 0)
  );

  const bundledPlanType =
    currentWeightLoss?.price === 449 ? 'tirzepatide' : 'semaglutide';

  const firstMonthPrice = bundledPlanType === 'tirzepatide' ? 349 : 217;

  const ongoingPrice = bundledPlanType === 'tirzepatide' ? 449 : 297;

  const refundAmount = firstMonthPrice - 49;

  let nonBundledPlanId =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1NAwDaAO83GerSec3qOej31N'
      : 'price_1MwzwCAO83GerSecB4VhacQq';

  async function onSuccess() {
    //create new subscription
    await replaceSubscription({
      trialEnd: monthsFromNow(1),
      id: subscription?.id!,
      planId: nonBundledPlanId,
      reference_id: currentWeightLoss?.reference_id!, // old subscription will be hidden
    });

    toast.success('You have successfully switched your membership!');

    //cancel old subscription
    await cancelSubscription(
      currentWeightLoss?.reference_id!,
      `Switched to non-bundled weight loss subscription`
    );

    Router.push(Pathnames.PATIENT_PORTAL);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!patient.id || !chargeToRefund) {
      setError(
        'Something went wrong. Please reload the page and try again or message your care team.'
      );
      return;
    }

    setLoading(true);

    // create refund
    const { data } = await createChargeRefund(chargeToRefund, refundAmount);

    if (!data?.message?.includes('successful')) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
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
    if (firstMonthPrice) {
      fetchChargeToRefund(firstMonthPrice);
    }
  }, [firstMonthPrice]);

  if (!currentWeightLoss) {
    return (
      <Stack gap={2}>
        <Typography variant="h2" textAlign="center">
          Oops! <br /> You must have a bundled Zealthy Weight Loss plan in order
          to switch to our standard plan.
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

    if (daysSinceCreated > 31) {
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
            The update to the regular weight loss plan (not including
            medication) has been added to your cart. You will get a refund of $
            {refundAmount}. You will receive this refund in 5-7 business days.
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
                Regular weight loss plan (does not include medication;
                medication charged separately)
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
              {`Confirm - $${refundAmount} refund`}
            </LoadingButton>

            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
            >
              *You will receive a refund of ${refundAmount} for your first
              month. The ${refundAmount} refund will be processed immediately
              but may take 5-7 business days to be returned to your bank
              account.
            </Typography>
            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
            >
              Medication will no longer be included in the cost of membership,
              but support for prior authorization to have brand name GLP-1
              medication will now be covered. You will be then be charged $135
              for every month (reduced from ${ongoingPrice}) after unless you
              cancel your membership. You can cancel your membership by logging
              into your Zealthy account and clicking “Profile” in the top right
              corner and selecting “Manage Membership” in the program details
              section. Your monthly membership fees are non-refundable and you
              can cancel up to 36 hours before any future billing period.
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
