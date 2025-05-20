import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import Typography from '@mui/material/Typography';
import { List, ListItem, Box, Container } from '@mui/material';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSearchParams } from 'next/navigation';
import Router, { useRouter } from 'next/router';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { useVWO } from '@/context/VWOContext';
import {
  useAllVisiblePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import axios from 'axios';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleQuarterlyEvent,
  prescriptionRequestedReorderQuarterlyEvent,
} from '@/utils/freshpaint/events';
import toast from 'react-hot-toast';
import { addMonths } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useABTest } from '@/context/ABZealthyTestContext';
import { Pathnames } from '@/types/pathnames';
import { useVisitState } from '@/components/hooks/useVisit';
import medicationAttributeName from '@/utils/medicationAttributeName';
import Head from 'next/head';
import Footer from '@/components/shared/layout/Footer';
import { supabaseClient } from '@/lib/supabaseClient';
import Spinner from '@/components/shared/Loading/Spinner';
import { useStripe } from '@stripe/react-stripe-js';

function compareFn(a: any, b: any) {
  if (new Date(a.created_at) < new Date(b.created_at)) {
    return -1;
  } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return 1;
  }
  return 0;
}

const ResponsesReviewed = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const vwoClient = useVWO();
  const ABZTest = useABTest();
  const { data: patientInfo } = usePatient();
  const { data: patientSubscriptions, refetch } =
    useAllVisiblePatientSubscription();
  const supabase = useSupabaseClient<Database>();
  const stripe = useStripe();
  const router = useRouter();
  const months: number = 2;
  const [isValidKlarnaPayment, setIsValidKlarnaPayment] =
    useState<boolean>(false);

  const { medications } = useVisitState();
  const medicationName = medicationAttributeName(medications?.[0]?.name);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription = useMemo(
    () =>
      weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0],
    [weightLossSubs]
  );

  const uncapturedPaymentIntentId = searchParams?.get('payment_id');

  useLayoutEffect(() => {
    if (!uncapturedPaymentIntentId) {
      Router.push('/patient-portal/weight-loss-treatment/compound');
    }
  }, [uncapturedPaymentIntentId]);

  const listItems = [
    {
      title: 'Provider review: ',
      body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.',
    },
    {
      title: 'Check your email and SMS: ',
      body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
    },
    {
      body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
    },
  ];

  let responsesReviewedTitle = 'Your responses are being reviewed!';
  let responsesReviewedDescription =
    "Your Zealthy Provider may reach out to you if they have any additional questions. Here's what's next:";
  let continueButtonText = 'Continue';

  const onSuccess = useCallback(
    async (newSubscription?: any) => {
      window.VWO?.event('3MonthPrescriptionRequestSubmitted');
      setLoading(true);
      if (vwoClient && patientInfo?.id && uncapturedPaymentIntentId) {
        const prescriptionRequest = await supabase
          .from('prescription_request')
          .update({ is_visible: true })
          .eq('uncaptured_payment_intent_id', uncapturedPaymentIntentId)
          .eq('patient_id', patientInfo?.id)
          .eq('is_visible', false)
          .select('*')
          .single();

        if (prescriptionRequest.error) {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
          return;
        }

        const isBundled = prescriptionRequest.data?.is_bundled;

        await Promise.allSettled([
          vwoClient?.track(
            '7895',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6465',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7458',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8078',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6140',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5476',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5867',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5053',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6822',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6303',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5751',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3542',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4624',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3463',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3357',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5871_new',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '5871_new',
            patientInfo?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          ABZTest.trackMetric(
            'Clone_5871',
            patientInfo?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          ABZTest.trackMetric(
            '6465_new',
            patientInfo?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track(
            '8288',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3780',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3594',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3452',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3452-2',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track('3543', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('4002', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('7930', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('7743', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('8676', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track(
            '8676',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track('3722', 'non-bundled3MonthUpsell', patientInfo),

          vwoClient?.track(
            '4287',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),

          vwoClient?.track(
            '4295',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4601',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_4687',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4918',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5071',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4935',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5484',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6826',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6792',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6337',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6028',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '6988',
            patientInfo?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track(
            'Clone_6775',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            'Clone_6775_2',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '75801',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4798',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '780101',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '780102',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7934',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7960',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7380',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7935',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9363',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8685',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_1',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_2',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9057_3',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9502',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
        ]);

        let applyCredit;

        const trialEnd = addMonths(
          weightLossSubscription?.status === 'canceled' && !newSubscription
            ? new Date()
            : new Date(
                newSubscription?.current_period_end ||
                  weightLossSubscription?.current_period_end ||
                  ''
              ),
          months
        );

        applyCredit = await axios.post(
          '/api/service/payment/apply-credit-balance',
          {
            referenceId:
              newSubscription?.reference_id ||
              weightLossSubscription?.reference_id,
            trialEnd,
          }
        );

        if (applyCredit?.status === 200) {
          if (prescriptionRequest.data) {
            prescriptionRequestedEvent(
              patientInfo?.profiles?.email!,
              medicationName,
              '3-month'
            );
            if (isBundled) {
              prescriptionRequestedReorderBundleQuarterlyEvent(
                patientInfo?.profiles?.email!,
                medications?.[0]?.name,
                '3 Month',
                medications?.[0]?.dosage!
              );
            } else {
              if (Router.asPath.includes('weight-loss-compound-refill')) {
                prescriptionRequestedReorderQuarterlyEvent(
                  patientInfo?.profiles?.email!,
                  medications?.[0]?.name,
                  '3 Month',
                  medications?.[0]?.dosage!
                );
              }
            }
            if (Router.asPath.includes('patient-portal')) {
              const addToQueue = await supabase
                .from('task_queue')
                .insert({
                  task_type: 'PRESCRIPTION_REFILL',
                  patient_id: patientInfo?.id,
                  queue_type: 'Provider (QA)',
                })
                .select()
                .maybeSingle()
                .then(({ data }) => data);
              await supabase
                .from('prescription_request')
                .update({ queue_id: addToQueue?.id })
                .eq('id', prescriptionRequest.data?.id);
            }
            toast.success('Prescription request submitted!');
            setLoading(false);
          } else {
            setLoading(false);
            toast.error(
              'There was a problem submitting your prescription request'
            );
          }
        }
      }
    },
    [
      vwoClient,
      patientInfo,
      uncapturedPaymentIntentId,
      supabase,
      ABZTest,
      weightLossSubscription?.status,
      weightLossSubscription?.current_period_end,
      weightLossSubscription?.reference_id,
      medicationName,
      medications,
    ]
  );

  useEffect(() => {
    if (
      vwoClient &&
      patientInfo?.id &&
      uncapturedPaymentIntentId &&
      patientSubscriptions &&
      loading &&
      isValidKlarnaPayment
    ) {
      onSuccess();
    }
  }, [
    vwoClient,
    patientInfo,
    uncapturedPaymentIntentId,
    onSuccess,
    patientSubscriptions,
    loading,
    isValidKlarnaPayment,
  ]);

  useEffect(() => {
    if (router.query['payment_intent_client_secret']) {
      setLoading(true);
    }
    const getPiInfo = async () => {
      if (!router || !stripe) return;
      const data = await stripe.retrievePaymentIntent(
        router.query['payment_intent_client_secret'] as string
      );

      const klarnaErrors = [
        'Customer cancelled checkout on Klarna',
        'Customer was declined by Klarna',
        'Klarna checkout was not completed and has expired',
      ];

      // Check if Klarna Payment was cancelled
      const cancelledKlarnaPayment = klarnaErrors.includes(
        data?.paymentIntent?.last_payment_error?.message || ''
      );

      // If so
      if (cancelledKlarnaPayment) {
        // Delete prescription request
        const prescRequest = await supabaseClient
          .from('prescription_request')
          .delete()
          .eq('uncaptured_payment_intent_id', router.query['payment_intent']!)
          .select();

        // Go back to payment page
        if (router.query['redirect-if-failed'] !== undefined) {
          const redirect = (
            router.query['redirect-if-failed'] as string
          ).replaceAll('~', '&');
          console.log(redirect);
          router.push(redirect);
        }
      } else {
        console.log('SUCCESSFUL KLARNA PAYMENT!');
        setIsValidKlarnaPayment(true);
        return;
      }
    };
    getPiInfo();
  }, [
    router.query['payment_intent'],
    router.query['payment_intent_client_secret'],
    router.query['redirect-if-failed'],
    stripe,
    supabaseClient,
  ]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Treatments</title>
        </Head>
        <Box sx={{ maxWidth: '540px', width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {responsesReviewedTitle}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
              {responsesReviewedDescription}
            </Typography>
            <List
              sx={{
                listStyleType: 'disc',
                pl: 3,
                marginBottom: '3rem',
              }}
              disablePadding
            >
              {listItems.map((item, index) => (
                <ListItem key={index} sx={{ display: 'list-item', padding: 0 }}>
                  {item.title && <b>{item.title}</b>}
                  {item.body}
                </ListItem>
              ))}
            </List>
            <LoadingButton
              type="button"
              loading={loading}
              disabled={loading}
              fullWidth
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              {continueButtonText}
            </LoadingButton>
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

ResponsesReviewed.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ResponsesReviewed;
