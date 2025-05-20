import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router, { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useVWO } from '@/context/VWOContext';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientIntakes,
  usePatientPayment,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  useRedeemedCouponCode,
} from '@/components/hooks/data';
import { usePayment } from '@/components/hooks/usePayment';
import {
  useApplyCouponCode,
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import { usePathname } from 'next/navigation';
import { useVisitState } from '@/components/hooks/useVisit';
import medicationAttributeName from '@/utils/medicationAttributeName';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { uuid } from 'uuidv4';
import { useSelector } from '@/components/hooks/useSelector';
import differenceInDays from 'date-fns/differenceInDays';
import { Pathnames } from '@/types/pathnames';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleQuarterlyEvent,
  weightLossDiscountCodeApplied,
} from '@/utils/freshpaint/events';
import toast from 'react-hot-toast';
import addMonths from 'date-fns/addMonths';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Link from '@mui/material/Link';
import PatientPaymentMethod from '@/components/shared/PatientPaymentMethod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import PaymentEditModal from '@/components/shared/PaymentEditModal';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import BasicModal from '@/components/shared/BasicModal';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import {
  EditDeliveryAddress,
  UpdatePayment,
} from '@/components/shared/UpdatePatientInfo';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import Image from 'next/image';
import klarnaBadge from '../../../../../../../public/images/klarna-badge.png';
import { loadStripe } from '@stripe/stripe-js';

const formatNumber = (num: number) => {
  let nf = new Intl.NumberFormat('en-US');
  return nf.format(num);
};

function compareFn(a: any, b: any) {
  if (new Date(a.created_at) < new Date(b.created_at)) {
    return -1;
  } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return 1;
  }
  return 0;
}

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Insert'];

interface WeightLossBulkSixMonthAddOnProps {
  onNext: (s?: string) => void;
  variant?: string;
}

const WeightLossBulkSixMonthAddOn = ({
  onNext,
}: WeightLossBulkSixMonthAddOnProps) => {
  const supabase = useSupabaseClient<Database>();
  const { code } = Router.query;
  const [error, setError] = useState('');
  const vwoClient = useVWO();
  const [failed, setFailed] = useState(false);
  const { data: patientInfo } = usePatient();
  const { createInvoicePayment, createPaymentIntent } = usePayment();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const applyCouponCode = useApplyCouponCode();
  const pathname = usePathname();

  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const { data: redeemedCouponCodes } = useRedeemedCouponCode();
  const { data: patientIntakes } = usePatientIntakes();
  const [page, setPage] = useState<string>('confirm');
  const { data: patientCareTeam } = usePatientCareTeam();
  const { medications } = useVisitState();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [klarnaLoading, setKlarnaLoading] = useState<boolean>(false);
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
  const [isPrePayVariant, setIsPrePayVariant] = useState(true);
  const [isRecurringVariant, setIsRecurringVariant] = useState(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isDiscountAvailable, setIsDiscountAvailable] =
    useState<boolean>(false);
  const [discountApplied, setDiscountApplied] = useState<string>('');

  const [paymentSelection, setPaymentSelection] = useState<string>('');

  const handleKlarnaSelection = async () => {
    setPaymentSelection('klarna');
  };

  useEffect(() => {
    if (paymentSelection === 'klarna') {
      handleSubmit();
      setPaymentSelection('');
    }
  }, [paymentSelection]);

  const [campaignKey, setCampaignKey] = useState('');
  const medicationName = medicationAttributeName(medications?.[0]?.name);

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  const uniqueKey = useMemo(() => uuid(), [router.asPath, failed]);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);

  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const bulkCoaching = useSelector(store => store.coaching).find(
    c => c.discounted_price === 264
  );

  const isCompoundRefill = pathname?.includes('weight-loss-compound-refill');
  const isRequestCompound = pathname?.includes(
    'patient-portal/weight-loss-treatment'
  );
  // const isPostCheckout = pathname?.includes('post-checkout');

  const handleClose = useCallback(() => setOpenPaymentModal(false), []);
  const handleOpen = useCallback(() => setOpenPaymentModal(true), []);
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

  const isBundled = true;

  const price = useMemo(() => {
    if (
      existingBulkSubscription &&
      weightLossSubscription?.status !== 'canceled' &&
      !isBundled
    )
      return 0;
    return medications?.[0]?.discounted_price! + (shippingId === '2' ? 15 : 0);
  }, [
    existingBulkSubscription,
    medications,
    weightLossSubscription?.status,
    isBundled,
    shippingId,
  ]);

  const months: number = 5;

  const checkoutHeader = medications?.[0]?.name
    ?.toLowerCase()
    .includes('semaglutide')
    ? 'Your discount for 6 months of Semaglutide has been applied. You won’t be charged for either unless your provider approves your Rx request & we’re ready to ship it to you.'
    : `Your discount for 6 months of Tirzepatide and the next ${months} months of your membership has been applied. If you are not eligible for medication, you will be refunded.`;

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

      if (existingBulkSubscription) {
        const price =
          (medications?.[0]?.discounted_price as number) * 3 ||
          medications?.[0]?.price ||
          0;
        const medicationRequest = {
          patient_id: patientInfo?.id,
          region: patientInfo?.region,
          medication_quantity_id: medications?.[0].medication_quantity_id,
          status: Router.asPath.includes('/patient-portal')
            ? 'REQUESTED'
            : 'PRE_INTAKES',
          note: isBundled
            ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 6 months. Dosage: ${medications[0].dosage}`
            : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 6 months.  Dosage: ${medications[0].dosage}`,
          specific_medication: medications?.[0]?.name,
          total_price: price + (shippingId === '2' ? 15 : 0),
          shipping_method: parseInt(shippingId, 10),
          care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        };

        const prescriptionRequest = await supabase
          .from('prescription_request')
          .insert(medicationRequest)
          .select()
          .maybeSingle();

        if (
          prescriptionRequest.status === 201 &&
          patientInfo &&
          prescriptionRequest.data?.id
        ) {
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

          prescriptionRequestedEvent(
            patientInfo?.profiles?.email!,
            medicationName!,
            '3-month'
          );
          onBack();
        } else {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
        }
      } else {
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
              ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 6 months. Dosage: ${medications[0].dosage}`
              : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 6 months.  Dosage: ${medications[0].dosage}`,
            specific_medication: medications?.[0]?.name,
            total_price:
              medications?.[0]?.price! + (shippingId === '2' ? 15 : 0),
            shipping_method: parseInt(shippingId, 10),
            care_team: patientCareTeam?.map((e: any) => e.clinician_id),
            coupon_code: discountApplied || null,
            number_of_month_requested: 6,
            is_bundled: isBundled,
            type:
              medicationName === 'Oral Semaglutide'
                ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
            matrix_id: medications[0].matrixId,
          };

          const foundPR = patientPrescriptionRequests?.find(
            p =>
              p.medication_quantity_id ===
              medicationRequest.medication_quantity_id
          );

          if (patientPrescriptionRequests?.length && foundPR) {
            medicationRequest.id = foundPR.id;
          }

          const prescriptionRequest = await supabase
            .from('prescription_request')
            .upsert(medicationRequest)
            .select()
            .maybeSingle();

          if (discountApplied) {
            weightLossDiscountCodeApplied(
              patientInfo?.profiles?.id!,
              patientInfo?.profiles?.email!
            );
          }

          if (prescriptionRequest.status === 200) {
            prescriptionRequestedEvent(
              patientInfo?.profiles?.email!,
              medicationName,
              '3-month'
            );

            prescriptionRequestedReorderBundleQuarterlyEvent(
              patientInfo?.profiles?.email!,
              medications?.[0]?.name,
              '6 Month',
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

              if (prescriptionRequest.data?.id) {
                await supabase
                  .from('prescription_request')
                  .update({ queue_id: addToQueue?.id })
                  .eq('id', prescriptionRequest.data?.id);
              }
            }
            onBack();
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
      discountApplied,
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
      zealthy_medication_name: `${medications?.[0]?.name} Bundled`,
      zealthy_care: 'Weight loss',
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `weight-loss-bulk-year`,
      zealthy_patient_id: patientInfo.id,
      zealthy_product_name: 'Weight Loss Semaglutide Bundled',
    };

    //create payment intent
    if (price > 0) {
      const { data, error } = await createInvoicePayment(
        patientInfo.id,
        price * 100,
        metadata,
        '6 Months Weight Loss Semaglutide Membership',
        false,
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

    if (paymentSelection === 'klarna') {
      return handleKlarnaPayment();
    }

    return handlePrescriptionRequest();
  };

  const handleKlarnaPayment = async () => {
    try {
      setKlarnaLoading(true);
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      const metadata = {
        zealthy_medication_name: isBundled
          ? `${medications?.[0]?.name} Bundled`
          : `${medications?.[0]?.name} compound 6 months`,
        zealthy_care: 'Weight loss',
        zealthy_patient_email: patientInfo?.profiles?.email,
        zealthy_subscription_id: weightLossSubscription?.subscription.id,
        reason: `weight-loss-bulk`,
        zealthy_patient_id: patientInfo?.id,
        zealthy_product_name:
          medications?.[0]?.name === 'Oral Semaglutide'
            ? medications?.[0]?.name
            : `Weight Loss ${medications?.[0]?.name} Bundled`,
      };

      const { data, error } = await createPaymentIntent(
        patientInfo?.id!,
        price * 100,
        metadata,
        navigator.userAgent,
        true,
        true
      );

      // Handle error if any
      if (error || !data) {
        console.error('Error creating payment intent:', error);
        setError(error || 'Failed to create payment intent');
        return;
      }

      // Extract client_secret and proceed with Klarna payment
      const { client_secret, intent_id } = data;

      if (!client_secret) {
        setError('Client secret not found');
        return;
      }

      const medicationRequest: PrescriptionRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 6 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 6 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: medications?.[0]?.price! + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        coupon_code: discountApplied || null,
        number_of_month_requested: 6,
        is_bundled: isBundled,
        type:
          medicationName === 'Oral Semaglutide'
            ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
            : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        matrix_id: medications[0].matrixId,
        is_visible: false,
        uncaptured_payment_intent_id: intent_id,
      };

      const foundPR = patientPrescriptionRequests?.find(
        (p: { medication_quantity_id: number | null | undefined }) =>
          p.medication_quantity_id === medicationRequest.medication_quantity_id
      );
      if (patientPrescriptionRequests?.length && foundPR) {
        medicationRequest.id = foundPR.id;
      }

      if (medicationName === 'Oral Semaglutide') {
        const medicationQuantityId = await supabase
          .from('medication_quantity')
          .select(
            'id, medication_dosage!inner(dosage!inner(dosage), medication!inner(name))'
          )
          .eq('medication_dosage.medication.name', 'Oral GLP1 Medication')
          .eq('medication_dosage.dosage.dosage', '3 mg')
          .maybeSingle()
          .then(({ data }) => data?.id);

        medicationRequest.medication_quantity_id = medicationQuantityId;
      }

      const prescriptionRequest = await supabase
        .from('prescription_request')
        .upsert(medicationRequest)
        .select()
        .maybeSingle();

      const redirect = router.asPath.replaceAll('&', '~');

      const klarnaData = await stripe?.confirmKlarnaPayment(client_secret, {
        return_url: Router.asPath.includes('/patient-portal')
          ? `${window.location.origin}/patient-portal/weight-loss-treatment/responses-reviewed?payment_id=${intent_id}&redirect-if-failed=${redirect}`
          : `${window.location.origin}/post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1?redirect-if-failed=${redirect}`,
      });
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in handleKlarnaPayment:', error);
    } finally {
      setKlarnaLoading(false);
    }
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

  const handleApplyCouponCode = async () => {
    if (redeemedCouponCodes?.find(c => c.code === couponCode && c.redeemed)) {
      return toast.error('Discount code has already been used.');
    }

    if (redeemedCouponCodes?.find(c => c.code === couponCode && !c.redeemed)) {
      setDiscountApplied(couponCode);
      setCouponCode('');
      return toast.success('Discount code has been applied!');
    } else {
      const apply = await applyCouponCode.mutateAsync({
        code: DOMPurify.sanitize(couponCode, {
          USE_PROFILES: { html: false },
        }),
        profile_id: patientInfo?.profile_id!,
        redeemed: false,
      });

      if (apply.error) {
        return toast.error('Discount code does not exist.');
      }

      if (apply.status === 201) {
        setDiscountApplied(couponCode);
        setCouponCode('');
        return toast.success('Discount code has been applied!');
      }
    }
  };

  async function getIsDiscountAvailable() {
    const intakes = patientIntakes?.find(i => !i.completed_at);
    const wlIntake: any = (intakes?.questionnaire_response as [])?.find(
      (r: any) => r.questionnaire_name === 'weight-loss'
    );

    if (
      !wlIntake ||
      differenceInDays(new Date(), new Date(wlIntake?.created_at || '')) < 7
    )
      return;
    if ([297, 449].includes(weightLossSubscription?.price || 0)) return;
    if (patientPrescriptionRequests?.find(r => r.medication_quantity_id === 98))
      return;

    setIsDiscountAvailable(true);
  }

  useEffect(() => {
    if (patientIntakes?.length && weightLossSubscription) {
      getIsDiscountAvailable();
    }
  }, [patientIntakes, weightLossSubscription, vwoClient.activate]);

  useEffect(() => {
    if (
      redeemedCouponCodes?.length &&
      redeemedCouponCodes.find(c => c.code === 'ZEALTHY10' && !c.redeemed)
    ) {
      setIsDiscountAvailable(true);
      setDiscountApplied('ZEALTHY10');
    }
  }, [redeemedCouponCodes]);

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
            {checkoutHeader}
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
            {!bulkCoaching && !existingBulkSubscription && (
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
                    $
                    {medications?.[0]?.name
                      ?.toLowerCase()
                      .includes('semaglutide')
                      ? '297'
                      : '449'}
                  </Typography>
                  {`$${
                    medications?.[0]?.name
                      ?.toLowerCase()
                      .includes('semaglutide')
                      ? '237'
                      : '359'
                  } per month`}
                </Typography>
                <Typography variant="body1">
                  {`Next ${months} months upfront with discount applied`}
                </Typography>

                <Stack>
                  <Typography variant="body1">
                    ${formatNumber(price)} Due If Prescribed*
                  </Typography>
                  <Typography variant="body1" fontStyle="italic">
                    {`(The amount is for your Zealthy weight loss membership for the next ${months} months. as a reminder, your membership includes medical services, care coordination, and semaglutide medication delivered straight to your door.)`}
                  </Typography>
                </Stack>
              </Box>
            )}
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
                {`6 month supply`}
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
            mb="1rem"
            sx={{ color: '#008A2E' }}
          >
            {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
              ? `On average, people lose 10.9% of their weight taking Semaglutide for 6 months**`
              : `On average, people lose 14% of their weight taking Tirzepatide for 6 months**`}
          </Typography>

          {discountApplied ? (
            <Typography mb="1rem" textAlign="center">
              You will receive a 10% discount on your order if prescribed.
            </Typography>
          ) : null}
          {isDiscountAvailable ? (
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
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                  marginBottom: '0.5rem',
                }}
              >
                {'Apply discount code'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <TextField
                  fullWidth
                  label="Enter code"
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handleApplyCouponCode}>Apply</Button>
              </Box>
            </Box>
          ) : null}
          <Box sx={{ textAlign: 'center' }}>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              loading={klarnaLoading}
              disabled={klarnaLoading}
              onClick={handleKlarnaSelection}
              sx={{
                backgroundColor: '#ffffff',
                color: '#000000',
                width: '100%',
                marginBottom: 2,
              }}
            >
              <Typography fontWeight={700}>Pay with</Typography>
              <Image
                alt="klarna-badge"
                src={klarnaBadge}
                width={100}
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </LoadingButton>
            <LoadingButton
              sx={{ width: '100%', margin: '0.5rem 0' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {!['IN', 'MN'].includes(patientInfo?.region || '') &&
              medications?.[0]?.price !== 297 &&
              medications?.[0]?.price !== 449 &&
              medications?.[0]?.price !== 249 &&
              medications?.[0]?.price !== 1045 &&
              medications?.[0]?.price !== 1485
                ? 'Pay $0 today'
                : `Confirm order - ${
                    !existingBulkSubscription ||
                    weightLossSubscription?.status === 'canceled' ||
                    isBundled
                      ? `$${price} due today`
                      : '$0 due today'
                  }`}
            </LoadingButton>

            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', marginTop: '0.5rem' }}
            >
              {`*This is what Zealthy expects to last 6 months. If you are determined not to be eligible by your provider, you will be able to get a refund. If you choose to pay with Klarna, you can split this purchase into equal installments of $${Math.round(
                price / 7
              )}-$${Math.round(
                price / 4
              )} typically paid monthly, which you will pay across equal installments every 30 days or every 2 weeks until you have paid the $${price} in full. This includes the next 2 months of your membership and the total cost of the 5 month supply of medication.`}
            </Typography>
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
};

export default WeightLossBulkSixMonthAddOn;
