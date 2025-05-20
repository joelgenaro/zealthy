import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

import { uuid } from 'uuidv4';
import { EditDeliveryAddress, UpdatePayment } from '../UpdatePatientInfo';
import { useVisitAsync, useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
} from '@/components/hooks/data';
import axios from 'axios';
import { differenceInDays } from 'date-fns';
import PatientPaymentMethod from '../PatientPaymentMethod';
import { usePayment } from '@/components/hooks/usePayment';
import PaymentEditModal from '../PaymentEditModal';
import ErrorMessage from '../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import toast from 'react-hot-toast';
import SubscriptionRestartModal from '../SubscriptionRestartModal';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderQuarterlyEvent,
} from '@/utils/freshpaint/events';
import {
  useReactivateSubscription,
  useRenewSubscription,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import BasicModal from '../BasicModal';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { useVWO } from '@/context/VWOContext';
import medicationAttributeName from '@/utils/medicationAttributeName';
import DOMPurify from 'dompurify';
import { useABTest } from '@/context/ABZealthyTestContext';

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Insert'];

interface ConfirmationProps {
  onNext?: () => void;
}

export function RecurringWeightLossBulkAddOn({ onNext }: ConfirmationProps) {
  const supabase = useSupabaseClient<Database>();
  const { code, refill } = Router.query;
  const { updatePatient: updatePatientAsync } = usePatientAsync();
  const { updateOnlineVisit: updateVisitAsync } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const [error, setError] = useState('');
  const vwoClient = useVWO();
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { data: patientInfo } = usePatient();
  const { createInvoicePayment } = usePayment();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const [page, setPage] = useState<string>('confirm');
  const { data: patientCareTeam } = usePatientCareTeam();
  const [deliveryLoading, setDeliveryLoading] = useState<boolean>(false);
  const { medications } = useVisitState();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const [loading, setLoading] = useState<boolean>(false);
  const [shippingId, setShippingId] = useState<string>('1');
  const [openCanceled, setOpenCanceled] = useState(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openMeidcareAttestationModal, setOpenMedicareAttestationModal] =
    useState(false);
  const { data: patientSubscriptions, refetch } =
    useAllVisiblePatientSubscription();
  const { data: unpaidInvoices } = usePatientUnpaidInvoices();
  const [isPrePayVariant, setIsPrePayVariant] = useState(false);
  const [isRecurringVariant, setIsRecurringVariant] = useState(false);
  const updatePatient = useUpdatePatient();
  const medicationName = medicationAttributeName(medications?.[0]?.name);

  const [variationName3542, setVariationName3542] = useState<string>('');
  const { data: patient } = usePatient();
  const ABZTest = useABTest();

  useEffect(() => {
    const activateVariants = async () => {
      if (
        vwoClient &&
        patientInfo?.id &&
        !['TX'].includes(patientInfo?.region || '')
      ) {
        const variant3542 =
          (await vwoClient?.activate('3542', patientInfo)) || '';
        setVariationName3542(variant3542);

        if (variant3542 && variant3542 !== 'Control') {
          setIsPrePayVariant(true);
        }
      }
      if (
        vwoClient &&
        patientInfo?.id &&
        ['TX'].includes(patientInfo?.region || '')
      ) {
        const variantName = await vwoClient?.activate('3357', patientInfo);
        if (variantName === 'Variation-1') {
          setIsRecurringVariant(true);
        }
      }
    };
    activateVariants();
  }, [patientInfo?.id, patientInfo?.region, vwoClient]);

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  const isPrescriptionCanceled = patientSubscriptions?.find(
    s =>
      s.product === 'Recurring Weight Loss Medication' &&
      s.status === 'canceled'
  );

  const uniqueKey = useMemo(() => uuid(), [failed]);
  function compareFn(a: any, b: any) {
    if (new Date(a.created_at) < new Date(b.created_at)) {
      return -1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
      return 1;
    }
    return 0;
  }
  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const bulkCoaching = useSelector(store => store.coaching).find(
    c => c.discounted_price === 264
  );
  const medicareAccess = useSelector(store => store.coaching).find(
    c => c.name === 'Z-Plan by Zealthy Weight Loss Access Program'
  );
  const semaglutideBundled =
    useSelector(store => store.coaching).find(
      c => c.name === 'Zealthy Weight Loss + Semaglutide Program'
    ) ||
    (weightLossSubscription?.price === 297 ? weightLossSubscription : false);
  const tirzepatideBundled =
    useSelector(store => store.coaching).find(
      c => c.name === 'Zealthy Weight Loss + Tirzepatide Program'
    ) ||
    (weightLossSubscription?.price === 449 ? weightLossSubscription : false);
  const texasPromo = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy Weight Loss (Texas)'
  );

  const handleClose = useCallback(() => setOpenPaymentModal(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleOptIn: ChangeEventHandler<HTMLInputElement> = e =>
    setOptIn(e.target.checked);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingId((event.target as HTMLInputElement).value);
  };

  const subPeriodEnd = new Date(
    weightLossSubscription?.current_period_end || ''
  );
  const daysToPeriodEnd = differenceInDays(subPeriodEnd, new Date());
  const existingBulkSubscription = useMemo(() => {
    return (
      daysToPeriodEnd > 60 && weightLossSubscription?.status !== 'canceled'
    );
  }, [weightLossSubscription?.status, daysToPeriodEnd]);

  const price = useMemo(() => {
    return 216;
  }, [
    weightLossSubscription,
    existingBulkSubscription,
    medicareAccess,
    semaglutideBundled,
    tirzepatideBundled,
  ]);

  const controlTotal = Math.floor(medications?.[0]?.discounted_price ?? 0);

  const controlTotal3Months = Math.floor(controlTotal * 3);

  const prePayTotal =
    controlTotal3Months + price + (shippingId === '2' ? 15 : 0);

  const months: number = 2;

  const isBundled =
    medications?.[0]?.price === 297 || medications?.[0]?.price === 449;

  const onBack = useCallback(() => {
    if (onNext) {
      onNext();
    } else {
      Router.push(Pathnames.PATIENT_PORTAL);
    }
  }, [onNext]);

  const onSuccess = useCallback(
    async (newSubscription?: any) => {
      setLoading(true);
      if (code) {
        await supabase
          .from('single_use_appointment')
          .update({ used: true })
          .eq('id', code);
      }
      const price =
        (medications?.[0]?.discounted_price as number) * 3 ||
        medications?.[0]?.price ||
        0;
      const medicationRequest: PrescriptionRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: price + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      };

      const foundPR = patientPrescriptionRequests?.find(
        p =>
          p.medication_quantity_id === medicationRequest.medication_quantity_id
      );
      if (patientPrescriptionRequests?.length && foundPR) {
        medicationRequest.id = foundPR.id;
      }

      const prescriptionRequest = await supabase
        .from('prescription_request')
        .upsert(medicationRequest)
        .select()
        .maybeSingle();
      console.log(prescriptionRequest, 'prfin123');
      if (prescriptionRequest.status === 201) {
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName,
          '3-month'
        );

        prescriptionRequestedReorderQuarterlyEvent(
          patientInfo?.profiles?.email!,
          medications?.[0]?.name,
          '3 Month',
          medications?.[0]?.dosage!
        );

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
            .eq('id', prescriptionRequest.data?.id!);

          if (refill === 'true') {
            await Promise.allSettled([
              updatePatientAsync({
                last_refill_request: new Date().toISOString(),
              }),
              updateVisitAsync({
                status: 'Completed',
                completed_at: new Date().toISOString(),
              }),
              submitQuestionnaireResponses(),
            ]);
          }
        }
        toast.success('Prescription request has been submitted!');
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    },
    [
      bulkCoaching,
      medications,
      months,
      onBack,
      patientCareTeam,
      patientInfo,
      shippingId,
      supabase,
      existingBulkSubscription,
      weightLossSubscription,
      isPrePayVariant,
      patientPrescriptionRequests,
      vwoClient,
    ]
  );

  const handlePrescriptionRequest = async () => {
    if (!patientInfo || !weightLossSubscription) return;
    setLoading(true);
    if (openScheduledForCancelation) {
      await reactivateSubscription.mutateAsync(
        weightLossSubscription?.reference_id || ''
      );
    }
    let newSubscription;
    if (openCanceled) {
      const newSub: any = await renewSubscription.mutateAsync(
        weightLossSubscription
      );
      newSubscription = {
        ...weightLossSubscription,
        status: newSub?.subscription?.status,
        current_period_end: newSub?.subscription?.current_period_end * 1000,
        reference_id: newSub?.subscription?.id,
      };
    }

    const metadata = {
      zealthy_medication_name: isBundled
        ? `${medications?.[0]?.name} Bundled`
        : `${medications?.[0]?.name} compound 3 months`,
      zealthy_care: 'Weight loss',
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `weight-loss-bulk`,
      zealthy_patient_id: patientInfo.id,
      zealthy_product_name: semaglutideBundled
        ? 'Weight Loss Semaglutide Bundled'
        : tirzepatideBundled
        ? 'Weight Loss Tirzepatide Bundled'
        : texasPromo
        ? 'Weight Loss Texas'
        : medicareAccess
        ? 'Weight Loss Medicare Access'
        : 'Weight Loss',
    };

    //create payment intent
    if (price > 0) {
      const { data, error } = await createInvoicePayment(
        patientInfo.id,
        price * 100,
        metadata,
        '2 Months Weight Loss Membership',
        true,
        uniqueKey
      );

      //handle payment intent
      if (error) {
        setError(error || 'Something went wrong. Please try again');
        setFailed(true);
        setLoading(false);
        return;
      }

      if (data) {
        await Promise.allSettled([
          vwoClient?.track(
            '3452',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7895',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),

          vwoClient?.track(
            '5751',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5867',
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
            '6822-2',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6822-3',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6303',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5777',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5053',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5751',
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
            patient?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          ABZTest.trackMetric(
            'Clone_5871',
            patient?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          ABZTest.trackMetric(
            '6465_new',
            patient?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track(
            '5476',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5628',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track('4320', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('5053', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('7458', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('8078', 'prescriptionRequestSubmitted', patientInfo),

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
            '4954',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6031',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '6826',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
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
            '7934',
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
            '5483',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '7743',
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

        return onSuccess(newSubscription);
      }
    } else {
      return onSuccess(newSubscription);
    }
    refetch();
    return;
  };

  const handleSubmit = () => {
    window.VWO?.event('purchase_upsell_weight_loss_bulk');
    setLoading(true);
    if (!optIn) {
      setLoading(false);
      return setError(
        'In order to proceed you will need to select the box above to confirm you have read the terms'
      );
    }
    if (weightLossSubscription?.status === 'canceled') {
      setLoading(false);
      setOpenCanceled(true);
      return;
    }

    if (weightLossSubscription?.status === 'scheduled_for_cancelation') {
      setLoading(false);
      setOpenScheduledForCancelation(true);
      return;
    }

    if ((unpaidInvoices?.length ?? 0) > 0) {
      setLoading(false);
      setOpenUpdatePayment(true);
      return;
    }

    if (isPatient65OrOlder) {
      return setOpenMedicareAttestationModal(true);
    }

    return handlePrescriptionRequest();
  };

  const handleCanceledClose = () => {
    setOpenCanceled(false);
  };

  const handleScheduledForCancelationClose = () => {
    setOpenScheduledForCancelation(false);
  };

  const handleScheduledForCancelation = async () => {
    await handlePrescriptionRequest();
    refetch();
  };

  const handleCanceled = async () => {
    await handlePrescriptionRequest();
    refetch();
  };

  const handlePayAllInvoices = async () => {
    await axios.post(`/api/stripe/utils/authorization/issued`, {
      unpaidInvoices: unpaidInvoices,
      stripeCustomerId: patientPayment?.customer_id,
    });
  };

  return (
    <Container maxWidth="sm">
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
            }}
          >
            {isPrescriptionCanceled
              ? `By confirming below, you’ll be re-activating your medication subscription. Your Rx will be shipped to your home.`
              : `Your discount for 3 months of ${medications?.[0]?.name} and the next ${months} months of your membership has been applied.
           You won’t be charged for medication unless your provider approves your Rx request.`}
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
                {`Pre-pay next ${months} months of membership`}
              </Typography>
              <Typography variant="body1">
                <Typography
                  component="span"
                  variant="body1"
                  sx={{
                    textDecoration: 'line-through',
                    marginRight: '0.2rem',
                    width: '20px',
                  }}
                >
                  ${'135'}
                </Typography>
                {`$108 per month`}
              </Typography>
              <Typography variant="body1">
                {`Next ${months} months upfront with discount applied`}
              </Typography>

              <Stack>
                <Typography variant="body1">
                  ${price} Due If Prescribed
                </Typography>
                <Typography variant="body1" fontStyle="italic">
                  (The amount is for your Zealthy weight loss membership for the
                  next 2 months. As a reminder, your membership includes medical
                  services, care coordination, coaching, and access to
                  affordable GLP-1 medications shipped to your home. You will
                  only pay the next 2 months of your membership if prescribed
                  this 3 month supply.)
                </Typography>
              </Stack>
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
                {'Your medication'}
              </Typography>
              <Typography variant="subtitle1">
                {`${medications?.[0]?.name}`}
              </Typography>
              <Typography variant="subtitle1">
                {medications?.[0]?.dosage?.replace('mgs', 'mg')}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`3 month supply`}
              </Typography>
              <Stack>
                <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                  {medications?.[0]?.mgSavings}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                  {`$${controlTotal3Months} Due If Prescribed`}
                </Typography>
                <Typography variant="body1" fontStyle="italic">
                  (The amount is for medication only and we expect it to last 3
                  months. You will only pay if prescribed.)
                </Typography>
              </Stack>
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
                {'Weekly dosage'}
              </Typography>
              <Typography
                component="div"
                variant="body1"
                fontSize="0.95rem !important"
                sx={{
                  '.subtitle': {
                    color: '#989898',
                    fontFamily: 'Inter',
                    fontSize: '0.8rem',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '1.25rem',
                    letterSpacing: '-0.00375rem',
                    marginBottom: '3px',
                  },
                  '>p': {
                    marginTop: 0,
                    marginBottom: '3px',
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(String(medications?.[0]?.dose)),
                }}
              />
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
                {'Total'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`$${prePayTotal} Due If Prescribed`}
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
                {'Total due today'}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ marginBottom: '2px' }}
              >
                {`$0`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                Only pay if prescribed
              </Typography>
            </Box>

            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                component="h4"
                sx={{
                  color: '#989898',
                  marginBottom: '16px',
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
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
                  onChange={handleChange}
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
                    sx={{ marginBottom: '16px' }}
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
              <Typography sx={{ marginBottom: '16px' }}>
                United States
              </Typography>
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
                <Stack gap="16px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={handleOpen}
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

          <Typography
            fontWeight={700}
            textAlign="center"
            sx={{ color: '#008A2E' }}
          >
            {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
              ? 'On average, people lose 5% of their weight when taking semaglutide for 3 months'
              : 'On average, people lose 7% of their weight when taking tirzepatide for 3 months'}
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                textAlign: 'start',
                marginBottom: '1rem',
              }}
            >
              <FormControlLabel
                sx={{
                  margin: '0',
                  marginTop: '20px',
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    letterSpacing: '-0.006em',
                    lineHeight: '1.25rem',
                  },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={optIn}
                    onChange={handleOptIn}
                    sx={{
                      padding: 0,
                      color: '#1B1B1B',
                      marginRight: '16px',
                    }}
                  />
                }
                label="By proceeding, you confirm you’re aware that Compound GLP-1 is not included in the price of the membership."
              />
            </Box>

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%', margin: '0.5rem 0' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {`Confirm order - $0`}
            </LoadingButton>
            <Stack gap={1.5} fontStyle="italic">
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {`*You will be charged $${controlTotal3Months} if you are
                  prescribed compounded semaglutide. This is what Zealthy
                  expects to last 3 month. Your provider may recommend a
                  different dosage amount, which would change the price.`}
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {Router.asPath.includes('/patient-portal')
                  ? `If prescribed, your medication subscription, which currently renews at $${controlTotal3Months} every 90 days, will be updated to the higher dosage, which means it will renew at $${controlTotal3Months} every 90 days.`
                  : `If prescribed, you are purchasing an automatically-renewing
                  subscription and will be charged $${controlTotal3Months} for
                  the first 90 days and $${controlTotal3Months} every 90 days
                  until you cancel.`}
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {`As part of your subscription, you will receive a 90-day supply
                  of the prescription product(s) prescribed to you. The
                  prescription product(s) associated with your subscription will
                  be shipped to your address every 90 days. A partner pharmacy
                  will refill and ship your prescription product(s) on the same
                  continuous basis during the subscription period. We will
                  notify you of any actions you need to take to ensure that the
                  prescription product(s) associated with your subscription
                  remains active. It is your responsibility to complete these
                  actions. Unless you have canceled, your subscription will
                  automatically renew even if you have not taken the required
                  actions to ensure that the prescription product(s) associated
                  with your subscription remains active.`}
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {`Your subscription will renew unless you cancel at least 2 days
                  before the next renewal date.`}
              </Typography>
              <Typography variant="subtitle2" fontSize="0.75rem !important">
                {`You can view your renewal date and cancel your subscription(s)
                  through your account or by contacting customer support at
                  support@getzealthy.com. If you cancel, it will take effect at
                  the end of the current subscription period and, if applicable,
                  you will continue to get the active prescription product(s)
                  associated with your subscription until the end of the
                  subscription period.`}
              </Typography>
            </Stack>

            <Typography
              fontSize="0.75rem !important"
              fontStyle="italic"
              mt="1rem"
            >
              {medications?.[0]?.name.toLowerCase().includes('semaglutide')
                ? `**This is based on data from a 2022 study published the American Medical Association titled "Weight Loss Outcomes Associated With Semaglutide Treatment for Patients With Overweight or Obesity.`
                : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled "Tirzepatide Once Weekly for the Treatment of Obesity.`}
            </Typography>
          </Box>
          <PaymentEditModal
            onClose={handleClose}
            open={openPaymentModal}
            title="Add new payment method to order your GLP-1 medication"
            handlePrescriptionRequest={handlePrescriptionRequest}
            setOpenUpdatePayment={setOpenUpdatePayment}
            handlePayAllInvoices={handlePayAllInvoices}
          />
          <SubscriptionRestartModal
            titleOnSuccess={'Your subscription has been reactivated.'}
            onConfirm={handleCanceled}
            onClose={handleCanceledClose}
            title={
              Router.asPath.includes('/bundled')
                ? `Reactivate your weight loss + ${
                    medications?.[0]?.name?.split(' ')[0]
                  } membership to order medication?`
                : 'Reactivate your weight loss membership to order medication?'
            }
            description={[
              'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.',
              'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
            ]}
            medication={medications[0]}
            open={openCanceled}
            buttonText="Yes, reactivate and order"
          />
          <SubscriptionRestartModal
            titleOnSuccess={'Your subscription has been reactivated.'}
            open={openScheduledForCancelation}
            title={
              Router.asPath.includes('/bundled')
                ? `Reactivate your weight loss + ${
                    medications?.[0]?.name?.split(' ')[0]
                  } membership to order medication?`
                : 'Reactivate your weight loss membership to order medication?'
            }
            description={[
              'In order to order medication, you need to have an active Weight Loss membership that is not scheduled for cancellation within the next month, since this will allow your provider to monitor your care during the entire period of taking your medication.',
              'Once you confirm below, your Zealthy Weight Loss subscription will no longer be scheduled for cancellation. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
            ]}
            medication={medications[0]}
            onConfirm={handleScheduledForCancelation}
            onClose={handleScheduledForCancelationClose}
            buttonText="Yes, reactivate and order"
          />
          <BasicModal isOpen={openUpdatePayment} useMobileStyle={false}>
            <Typography variant="h3" textAlign="center">
              You must add updated payment information to submit your GLP-1
              medication order.
            </Typography>
            <Typography textAlign="center">
              In order to order medication, you need to have valid payment
              information.
            </Typography>
            <Typography textAlign="center">
              You will only pay for medication if prescribed.
            </Typography>
            <Stack gap="10px">
              <LoadingButton
                size="small"
                onClick={() => {
                  setOpenPaymentModal(true);
                }}
              >
                Update payment and continue
              </LoadingButton>
              <Button
                size="small"
                variant="outlined"
                onClick={() => history.back()}
              >
                Cancel
              </Button>
            </Stack>
          </BasicModal>
          <MedicareAttestationModal
            open={openMeidcareAttestationModal}
            submitRequest={handlePrescriptionRequest}
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
            patientId={patientInfo?.id}
            goHome={() => {
              refetchPatientPayment();
              setPage('confirm');
            }}
          />
        </>
      )}
    </Container>
  );
}
