import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { uuid } from 'uuidv4';
import { EditDeliveryAddress, UpdatePayment } from '../../UpdatePatientInfo';
import { useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router, { useRouter } from 'next/router';
import {
  useAllVisiblePatientSubscription,
  useRedeemedCouponCode,
  usePatient,
  usePatientCareTeam,
  usePatientPayment,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  usePatientIntakes,
  usePatientPriorAuths,
  PriorAuth,
  useVWOVariationName,
  usePatientOrders,
  useLanguage,
  usePatientAddress,
  usePatientCouponCodes,
  useIsEligibleForZealthy10,
} from '@/components/hooks/data';
import axios from 'axios';
import { differenceInDays, subDays, isAfter } from 'date-fns';
import { usePayment } from '@/components/hooks/usePayment';
import PaymentEditModal from '../../PaymentEditModal';
import ErrorMessage from '../../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import toast from 'react-hot-toast';
import SubscriptionRestartModal from '../../SubscriptionRestartModal';
import { weightLossDiscountCodeApplied } from '@/utils/freshpaint/events';
import {
  useApplyCouponCode,
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import BasicModal from '../../BasicModal';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { useVWO } from '@/context/VWOContext';
import medicationAttributeName from '@/utils/medicationAttributeName';
import TextField from '@mui/material/TextField';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { wholeOrFloat } from '@/utils/wholeOrFloat';
import DOMPurify from 'dompurify';
import CompoundDisclaimer from '../../CompoundDisclaimer';
import { useIntakeState } from '@/components/hooks/useIntake';
import DeliveryAddress from '../_utils/DeliveryAddress';
import ShippingOptions from '../_utils/ShippingOptions';
import PaymentMethod from '../_utils/PaymentMethod';
import { useSearchParams } from 'next/navigation';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { shouldActivate6031 } from '@/utils/vwo-utils/activationCondition';
import { List, ListItem } from '@mui/material';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useABTest } from '@/context/ABZealthyTestContext';
import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import klarnaBadge from 'public/images/klarna-badge.png';
import MedicationAndDosageSixOrTwelveMonth from '../_utils/MedicationAndDosageSixOrTwelveMonth';

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

interface ConfirmationProps {
  videoUrl?: string;
  onNext?: () => void;
  oneMonthPrice: number;
}

type PatientPriorAuthStatus = Pick<
  PriorAuth,
  'prescription_request_id' | 'status' | 'created_at'
>;

export function WeightLossTwelveMonth({
  videoUrl,
  onNext,
  oneMonthPrice,
}: ConfirmationProps) {
  const isMobile = useIsMobile();
  const supabase = useSupabaseClient<Database>();
  const { code, name: questionnaireName } = Router.query;
  const [error, setError] = useState('');
  const vwoClient = useVWO();
  const [failed, setFailed] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { data: patientInfo } = usePatient();
  const { data: patientOrders } = usePatientOrders();

  const { createPaymentIntent, createInvoicePayment } = usePayment();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const applyCouponCode = useApplyCouponCode();
  const [couponCode, setCouponCode] = useState<string>('');
  const [is2PADenied, setIs2PADenied] = useState(false);
  const { updateActionItem } = useMutatePatientActionItems();
  const { data: patient } = usePatient();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const { data: redeemedCouponCodes, isLoading: redeemedCouponCodesLoading } =
    useRedeemedCouponCode();
  const { data: couponCodes } = usePatientCouponCodes();
  const [page, setPage] = useState<string>('confirm');
  const { data: patientCareTeam } = usePatientCareTeam();
  const { medications } = useVisitState();
  const { data: patientPriorAuth } = usePatientPriorAuths();
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
  const [discountApplied, setDiscountApplied] = useState<string>('');
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  let metaData: object | null;
  const [paymentSelection, setPaymentSelection] = useState<string>('');

  const [isDiscountAvailable, setIsDiscountAvailable] =
    useState<boolean>(false);
  const medicationName = medicationAttributeName(medications?.[0]?.name);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const language = useLanguage();
  const router = useRouter();
  const isRefill = Router.asPath.includes('weight-loss-compound-refill');

  const { data: isEligibleForZealthy10 } = useIsEligibleForZealthy10();

  const { data: variation9502 } = useVWOVariationName('9502');

  const hasWeightLossMed = patientOrders?.some(
    order =>
      order?.prescription?.medication?.toLowerCase().includes('semaglutide') ||
      order?.prescription?.medication?.toLowerCase().includes('tirzepatide')
  );

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  const uncapturedPaymentIntentId = searchParams?.get('payment_id');

  useEffect(() => {
    if (uncapturedPaymentIntentId) {
      console.log('UNCAPTURE', uncapturedPaymentIntentId);
      setPage('responses-reviewed');
    }
  }, [uncapturedPaymentIntentId]);

  const hasCalledApi = useRef(false);

  const sixtyDaysAgo = subDays(new Date(), 60);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription = useMemo(
    () =>
      weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0],
    [weightLossSubs]
  );

  const medicareAccess = useSelector(store => store.coaching).find(
    c => c.name === 'Z-Plan by Zealthy Weight Loss Access Program'
  );

  const compoundMeds = [
    'Semaglutide weekly injections',
    'Tirzepatide weekly injections',
    'Liraglutide weekly injections',
  ];

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

  //currently these 3 will only ever be true if it is a variant user in test 4601.
  const hasWeightLoss3Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 3-Month Weight Loss'
  );
  const hasWeightLoss6Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 6-Month Weight Loss'
  );
  const hasWeightLoss12Month = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy 12-Month Weight Loss'
  );

  const hasMultiMonthWeightLoss =
    hasWeightLoss3Month || hasWeightLoss6Month || hasWeightLoss12Month;

  const handleClose = useCallback(() => setOpenPaymentModal(false), []);
  const handleOpen = useCallback(() => setOpenPaymentModal(true), []);
  const handleOptIn: ChangeEventHandler<HTMLInputElement> = e =>
    setOptIn(e.target.checked);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingId((event.target as HTMLInputElement).value);
  };

  const handleComplete = async () => {
    setLoading(true);
    await updateActionItem({
      patient_id: patientInfo?.id!,
      completed: true,
      completed_at: new Date().toISOString(),
      type: 'COMPOUND_MEDICATION_REQUEST',
    });
    if (variant === 'medication-too-expensive-cancellation') {
      Router.replace(Pathnames.PATIENT_PORTAL);
    } else {
      Router.replace(Pathnames.PATIENT_PORTAL_PAYMENT_SUCCESS);
    }
  };

  const subPeriodEnd = new Date(
    weightLossSubscription?.current_period_end || ''
  );
  const daysToPeriodEnd = differenceInDays(subPeriodEnd, new Date());
  const existingBulkSubscription = useMemo(() => {
    return (
      daysToPeriodEnd > 330 && weightLossSubscription?.status !== 'canceled'
    );
  }, [weightLossSubscription?.status, daysToPeriodEnd]);

  const subscriptionPrice = useMemo(() => {
    if (
      existingBulkSubscription &&
      weightLossSubscription?.status !== 'canceled'
    )
      return 0;
    return 1089;
  }, [
    weightLossSubscription,
    existingBulkSubscription,
    medicareAccess,
    semaglutideBundled,
    tirzepatideBundled,
    hasMultiMonthWeightLoss,
  ]);

  const medicationPrice = medications?.[0]?.price!;

  const prePayTotal =
    medicationPrice + subscriptionPrice + (shippingId === '2' ? 15 : 0);

  const months: number = 11;

  const isBundled =
    medications?.[0]?.price === 249 ||
    medications?.[0]?.price === 297 ||
    medications?.[0]?.price === 449;

  const activeRecurringMedicationSubscription = useMemo(() => {
    return patientSubscriptions?.filter(
      sub =>
        sub.product?.toLowerCase().includes('recurring weight loss') &&
        sub.status === 'active'
    );
  }, [patientSubscriptions]);

  const isRecurringMedicationRefill =
    activeRecurringMedicationSubscription &&
    activeRecurringMedicationSubscription.length >= 1 &&
    (questionnaireName === 'weight-loss-compound-refill' ||
      Router.asPath.includes('/patient-portal/weight-loss-treatment/compound'));

  const handleApplyCouponCode = async () => {
    if (redeemedCouponCodes?.find(c => c.code === couponCode && c.redeemed)) {
      return toast.error('Discount code has already been used.');
    }

    if (redeemedCouponCodes?.find(c => c.code === couponCode && !c.redeemed)) {
      setDiscountApplied(couponCode);
      setCouponCode('');
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

  useEffect(() => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    if (patientPriorAuth) {
      const paDeniedInstances = patientPriorAuth.filter(
        (auth: PriorAuth) =>
          auth.status === 'PA Denied' &&
          isAfter(new Date(auth.created_at), sixtyDaysAgo)
      );

      const hasSamePrescriptionReqId = paDeniedInstances.some(
        (
          auth: PatientPriorAuthStatus,
          index: number,
          self: PatientPriorAuthStatus[]
        ) =>
          self.some(
            (a: PatientPriorAuthStatus, i: number) =>
              i !== index &&
              a.prescription_request_id === auth.prescription_request_id
          )
      );
      console.log('is2pahassameprescription', hasSamePrescriptionReqId);

      const hasOldDeniedInstance = paDeniedInstances.some(
        (auth: PriorAuth) => new Date(auth.created_at) <= fifteenDaysAgo
      );

      if (hasSamePrescriptionReqId && hasOldDeniedInstance) {
        console.log('Incomplete intake is too old');
        setIs2PADenied(false);
      } else {
        setIs2PADenied(hasSamePrescriptionReqId);
      }
    }
  }, [patientPriorAuth, sixtyDaysAgo]);

  const { data: variation5476, isLoading: isLoading5476 } =
    useVWOVariationName('5476');

  const onBack = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (Router.asPath.includes('patient-portal')) {
      setPage('responses-reviewed');
      setLoading(false);
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

      if (isRecurringMedicationRefill) {
        await axios.post('/api/cancel-recurring-medication-subscription', {
          subscriptionId:
            activeRecurringMedicationSubscription?.[0]?.reference_id,
          patientId: patientInfo?.id,
        });
      }

      const medicationRequest: PrescriptionRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 12 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 12 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: medications?.[0]?.price! + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        coupon_code: discountApplied || null,
        number_of_month_requested: 12,
        is_bundled: isBundled,
        type:
          medicationSelected === 'Oral Semaglutide'
            ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
            : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        matrix_id: medications[0].matrixId,
      };

      const foundPR = patientPrescriptionRequests?.find(
        (p: { medication_quantity_id: number | null | undefined }) =>
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

      window.VWO?.event('12MonthPrescriptionRequestSubmitted');

      await Promise.allSettled([
        vwoClient.track(
          '9363',
          '12MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '8685',
          '12MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track('9363', '12MonthGlp1PaidFor', patientInfo),
        vwoClient.track(
          '9502',
          '12MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track('9502', '12MonthGlp1PaidFor', patientInfo),
      ]);

      if (discountApplied) {
        weightLossDiscountCodeApplied(
          patientInfo?.profiles?.id!,
          patientInfo?.profiles?.email!
        );
      }

      if (prescriptionRequest.data) {
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
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    },
    [
      vwoClient,
      patientInfo,
      code,
      existingBulkSubscription,
      supabase,
      medications,
      isBundled,
      shippingId,
      patientCareTeam,
      medicationName,
      onBack,
      weightLossSubscription?.status,
      weightLossSubscription?.current_period_end,
      weightLossSubscription?.reference_id,
      discountApplied,
      patientPrescriptionRequests,
    ]
  );

  const handleKlarnaPayment = async () => {
    try {
      setKlarnaLoading(true);
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      const metadata = {
        zealthy_medication_name: isBundled
          ? `${medications?.[0]?.name} Bundled`
          : `${medications?.[0]?.name} compound 12 months`,
        zealthy_care: 'Weight loss',
        zealthy_patient_email: patientInfo?.profiles?.email,
        zealthy_subscription_id: weightLossSubscription?.subscription.id,
        reason: `weight-loss-bulk`,
        zealthy_patient_id: patientInfo?.id,
        zealthy_product_name:
          medications?.[0]?.name === 'Oral Semaglutide'
            ? medications?.[0]?.name
            : semaglutideBundled
            ? 'Weight Loss Semaglutide Bundled'
            : tirzepatideBundled
            ? 'Weight Loss Tirzepatide Bundled'
            : texasPromo
            ? 'Weight Loss Texas'
            : medicareAccess
            ? 'Weight Loss Medicare Access'
            : 'Weight Loss',
      };

      const { data, error } = await createPaymentIntent(
        patientInfo?.id!,
        prePayTotal * 100,
        metadata,
        navigator.userAgent,
        true,
        false
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

      const patientName = `${patientInfo?.profiles?.first_name} ${patientInfo?.profiles?.last_name}`;

      const medicationRequest: PrescriptionRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 12 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 12 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: medications[0].price! + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        coupon_code: discountApplied || null,
        number_of_month_requested: 12,
        is_visible: false,
        uncaptured_payment_intent_id: intent_id,
        is_bundled: isBundled,
        type:
          medicationSelected === 'Oral Semaglutide'
            ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
            : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        matrix_id: medications[0].matrixId,
      };

      const foundPR = patientPrescriptionRequests?.find(
        (p: { medication_quantity_id: number | null | undefined }) =>
          p.medication_quantity_id === medicationRequest.medication_quantity_id
      );
      if (patientPrescriptionRequests?.length && foundPR) {
        medicationRequest.id = foundPR.id;
      }

      if (medicationSelected === 'Oral Semaglutide') {
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
          : `${window.location.origin}/post-checkout/questionnaires-v2/vouched-verification/V_IDENTITY_Q1?redirect-if-failed=${redirect}`,
      });
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in handleKlarnaPayment:', error);
    } finally {
      setKlarnaLoading(false);
    }
  };

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

    onSuccess(newSubscription);
    refetch();
    return;
  };

  const handleKlarnaSelection = async () => {
    setPaymentSelection('klarna');
  };

  const handleSubmit = () => {
    window.VWO?.event('purchase_upsell_weight_loss_bulk');
    setLoading(true);

    if (is2PADenied) {
      window.freshpaint?.track('two-pa-denials-ordered');
      console.log('fresh paint event fired two-pa-denials-ordered');
    }

    if (!optIn && !semaglutideBundled && !tirzepatideBundled) {
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
    if (paymentSelection === 'klarna') {
      return handleKlarnaPayment();
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

  useEffect(() => {
    if (paymentSelection === 'klarna') {
      handleSubmit();
      setPaymentSelection('');
    }
  }, [paymentSelection]);

  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [isVariation5476Ready, setIsVariation5476Ready] = useState(false);
  useEffect(() => {
    if (!isLoading5476 && medications[0]) {
      setIsReadyToRender(true);
    } else {
      setIsReadyToRender(false);
    }
  }, [isLoading5476, medications]);

  useEffect(() => {
    if (variation5476) {
      setIsVariation5476Ready(true);
    } else {
      setIsVariation5476Ready(false);
    }
  }, [variation5476]);

  // logic to generate the header text for the page
  // note that the logic is dependent on variation6031 so
  // will await the loading of the variation before generating the text

  const getMedicationTranslation = (medicationName: any, language: string) => {
    if (language !== 'esp') return medicationName;

    switch (medicationName) {
      case 'Semaglutide weekly injections':
        return 'Inyecciones semanales de semaglutida';
      case 'Tirzepatide weekly injections':
        return 'Inyecciones semanales de tirzepatida';
      case 'Liraglutide weekly injections':
        return 'Inyecciones semanales de liraglutida';
      case 'Semaglutide':
        return 'Semaglutida';
      case 'Tirzepatide':
        return 'Tirzepatida';
      default:
        return medicationName;
    }
  };

  const getSpanishText = (outputText: string, medicationName: string) => {
    if (language !== 'esp') return outputText;

    outputText = outputText.replace(
      medicationName,
      getMedicationTranslation(medicationName, 'esp')
    );

    return outputText
      .replace(
        '15% of your body weight loss, within reach!',
        '¡15% de pérdida de peso corporal a tu alcance!'
      )
      .replace(
        '20% of your body weight loss, within reach!',
        '¡20% de pérdida de peso corporal a tu alcance!'
      )
      .replace(
        /Your (\d+)% discount for 12 months of/g,
        'Tu descuento del $1% por 12 meses de'
      )
      .replace('Your discount for 12 months of', 'Tu descuento por 12 meses de')
      .replace('Semaglutide ', 'Semaglutida ')
      .replace('Tirzepatide ', 'Tirzepatida ')
      .replace(
        /and the next (\d+) months of your membership/g,
        'y los próximos $1 meses de tu membresía'
      )
      .replace('+ medical care', '+ atención médica')
      .replace('has been applied.', 'ha sido aplicado.')
      .replace("You won't be charged until", 'No se te cobrará hasta que')
      .replace(
        "You won't be charged for either unless",
        'No se te cobrará a menos que'
      )
      .replace(
        'your provider approves your Rx',
        'tu proveedor apruebe tu receta'
      )
      .replace(
        " request & we're ready to ship it to you",
        ' y estemos listos para enviártela'
      )
      .replace(
        'If you are not eligible for medication, you will be refunded.',
        'Si no eres elegible para el medicamento, se te hará un reembolso.'
      )
      .replace(
        "You won't be charged for medication unless your provider approves your Rx request.",
        'No se te cobrará el medicamento hasta que tu proveedor apruebe tu solicitud de receta.'
      );
  };

  const listItems =
    semaglutideBundled || tirzepatideBundled
      ? [
          {
            title: 'Provider review: ',
            body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive your fill shipped to your home. Your Rx is included in your membership.',
          },
          {
            title: 'Check your email and SMS: ',
            body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
          },
          {
            body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
          },
        ]
      : compoundMeds.some(m => m.includes(medications[0].name))
      ? [
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
        ]
      : [
          {
            title: 'Provider review: ',
            body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, it will be sent to your local pharmacy listed in your profile.',
          },
          {
            title: 'Check your email and SMS: ',
            body: 'Check your email and SMS: We’ll send you a message if your Provider has any questions or when your refill has been submitted to your pharmacy.',
          },
          {
            body: 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your refill. If you would prefer to have your Rx sent to a different pharmacy then update it using this link.',
          },
        ];

  let totalDose: string | null;
  let med: string | undefined | null;
  if (patientOrders && patientOrders.length > 0) {
    totalDose = patientOrders[0].total_dose;
    med = totalDose?.split(' ')[0];
    metaData = {
      zealthy_medication_name: med,
      zealthy_care: 'Weight loss',
      zealthy_prescription_id: patientOrders[0].prescription?.id,
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `weight-loss-bulk`,
      zealthy_patient_id: patient?.id,
    };
  }

  const couponToDiscountAmount = useMemo<{ [key: string]: number }>(() => {
    return {
      'FLASH-SALE': 0.2,
      ZEALTHY10: 0.1,
    };
  }, []);

  useEffect(() => {
    if (isEligibleForZealthy10 && !discountApplied) {
      setCouponCode('ZEALTHY10');
      setIsDiscountAvailable(true);
    }
  }, [isEligibleForZealthy10, discountApplied]);

  useEffect(() => {
    if (
      isEligibleForZealthy10 &&
      !discountApplied &&
      couponCode &&
      isDiscountAvailable &&
      !redeemedCouponCodesLoading
    ) {
      handleApplyCouponCode();
    }
  }, [
    couponCode,
    isEligibleForZealthy10,
    discountApplied,
    isDiscountAvailable,
    redeemedCouponCodesLoading,
  ]);

  let responsesReviewedTitle = 'Your responses are being reviewed!';
  let responsesReviewedDescription =
    "Your Zealthy Provider may reach out to you if they have any additional questions. Here's what's next:";
  let continueButtonText = 'Continue';
  let payTodayText = 'Due Today';
  let applyDiscountCodeText = 'Apply discount code';
  let enterCodeText = 'Enter code';
  let applyButtonText = 'Apply';
  let additionalDiscountText = `${
    couponToDiscountAmount[discountApplied] * 100
  }% Additional Discount (on top of 20% discount)`;
  let compoundDisclosureText =
    "By proceeding, you confirm you're aware that Compound GLP-1 is not included in the price of the membership.";
  let prepayMembershipText = 'Pre-pay next {0} months of membership';
  let totalIfPrescribedText = 'Total if prescribed';
  let medicationSupplyText = '{0} 12 month supply';
  let addNewPaymentMethodText =
    'Add new payment method to order your GLP-1 medication';
  let subscriptionReactivatedText = 'Your subscription has been reactivated.';
  let reactivateWeightLossMembershipText =
    'Reactivate your weight loss membership to order medication?';
  let reactivateWeightLossBundledMembershipText =
    'Reactivate your weight loss + {0} membership to order medication?';
  let reactivateMembershipDescriptionPart1 =
    'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.';
  let reactivateMembershipDescriptionPart2 =
    'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.';
  let reactivateButtonText = 'Yes, reactivate and order';
  let updatePaymentTitleText =
    'You must add updated payment information to submit your GLP-1 medication order.';
  let updatePaymentDescriptionText =
    'In order to order medication, you need to have valid payment information.';
  let updatePaymentNoteText = 'You will only pay for medication if prescribed.';
  let updatePaymentButtonText = 'Update payment and continue';
  let cancelButtonText = 'Cancel';
  let chargedIfPrescribedTextKlarna =
    '*You will be charged ${0} if you are prescribed compounded {1}; however, if you choose to pay with Klarna, you can split this into equal installments typically paid monthly, which you will only begin to pay if you are prescribed compounded {1} and you will pay across equal installments every 30 days or every 2 weeks until you have paid the ${0} in full. This includes the next 11 months of your membership and the total cost of the 12 month supply of medication. This is what Zealthy expects to last 12 months. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.';

  let semaglutideStudyReferenceText =
    '**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”';
  let tirzepatideStudyReferenceText =
    '**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”';

  if (language === 'esp') {
    responsesReviewedTitle = '¡Tus respuestas están siendo revisadas!';
    responsesReviewedDescription =
      'Tu proveedor de Zealthy puede contactarte si tiene alguna pregunta adicional. Esto es lo que sigue:';
    continueButtonText = 'Continuar';
    payTodayText = 'A pagar hoy';
    applyDiscountCodeText = 'Aplicar código de descuento';
    enterCodeText = 'Ingresar código';
    applyButtonText = 'Aplicar';
    additionalDiscountText =
      '10% de descuento adicional (sobre el 20% de descuento)';
    compoundDisclosureText =
      'Al continuar, confirmas que eres consciente de que el GLP-1 compuesto no está incluido en el precio de la membresía.';
    prepayMembershipText =
      'Pago anticipado de los próximos {0} meses de membresía';
    totalIfPrescribedText = 'Total si se receta';
    medicationSupplyText = '{0} suministro de 3 meses';
    addNewPaymentMethodText =
      'Agregar nuevo método de pago para pedir su medicamento GLP-1';
    subscriptionReactivatedText = 'Su suscripción ha sido reactivada.';
    reactivateWeightLossMembershipText =
      '¿Reactivar su membresía de pérdida de peso para pedir medicamento?';
    reactivateWeightLossBundledMembershipText =
      '¿Reactivar su membresía de pérdida de peso + {0} para pedir medicamento?';
    reactivateMembershipDescriptionPart1 =
      'Para pedir medicamento, necesita tener una membresía de Pérdida de Peso activa, que cubre el desarrollo de su plan de tratamiento por parte de su proveedor y asegura que está recibiendo atención de alta calidad.';
    reactivateMembershipDescriptionPart2 =
      'Una vez que confirme a continuación, su suscripción de Pérdida de Peso de Zealthy se volverá activa nuevamente. Esto le permitirá recibir atención, incluyendo medicamentos GLP-1 si es apropiado para la pérdida de peso, obtener acceso continuo a nuestro equipo de coordinación para ayudar a hacer los medicamentos más asequibles, y comenzar a trabajar con su entrenador nuevamente.';
    reactivateButtonText = 'Sí, reactivar y pedir';
    updatePaymentTitleText =
      'Debe agregar información de pago actualizada para enviar su pedido de medicamento GLP-1.';
    updatePaymentDescriptionText =
      'Para pedir medicamento, necesita tener información de pago válida.';
    updatePaymentNoteText = 'Solo pagará por el medicamento si se le receta.';
    updatePaymentButtonText = 'Actualizar pago y continuar';
    cancelButtonText = 'Cancelar';
    semaglutideStudyReferenceText =
      '**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad".';
    tirzepatideStudyReferenceText =
      '**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad".';
  }

  return (
    <Box sx={{ maxWidth: '540px', width: '100%' }}>
      {page === 'responses-reviewed' && (
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
            onClick={handleComplete}
          >
            {continueButtonText}
          </LoadingButton>
        </Box>
      )}
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
            }}
          >
            {variation9502?.variation_name === 'Variation-2'
              ? ''
              : `Your discount for 12 months of ${medicationName} weekly injections and the next 11 months of your membership has been applied. You won’t be charged for either unless your provider approves your Rx request & we’re ready to ship it to you.`}
          </Typography>
          <Stack width="100%" alignItems="flex-start" gap="16px">
            {
              <MedicationAndDosageSixOrTwelveMonth
                videoUrl={videoUrl}
                medication={medications[0]}
                isBulk
                monthsSupply={12}
              />
            }
            <Stack padding={'0 16px'} gap={'16px'}>
              <DeliveryAddress onChange={() => setPage('delivery-address')} />
              <ShippingOptions selected={shippingId} onSelect={handleChange} />
              <PaymentMethod onChange={handleOpen} />
              <Divider sx={{ width: '100%', marginY: '8px' }}>
                {'Pay if prescribed'}
              </Divider>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography>
                  {medicationSupplyText.replace('{0}', medicationName)}
                </Typography>
                <Typography textAlign="right">
                  <Typography
                    component="span"
                    sx={{
                      textDecoration: 'line-through',
                      marginRight: '0.2rem',
                    }}
                  >
                    {`$${oneMonthPrice}/month`}
                  </Typography>
                  {`$${Math.round(
                    discountApplied
                      ? (1 - couponToDiscountAmount[discountApplied]) *
                          medications[0].discounted_price!
                      : medications[0].discounted_price!
                  )}/month`}
                  <Typography sx={{ mt: '8px', whiteSpace: 'nowrap' }}>
                    {`$${medicationPrice} `}
                    {<span>due if prescribed</span>}
                  </Typography>
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography>
                  {prepayMembershipText.replace('{0}', String(months))}
                </Typography>
                <Typography textAlign="right">
                  <Typography
                    component="span"
                    sx={{
                      textDecoration: 'line-through',
                      marginRight: '0.2rem',
                    }}
                  >
                    {`$135/month`}
                  </Typography>
                  {`$99/month`}
                  <Typography sx={{ mt: '8px', whiteSpace: 'nowrap' }}>
                    {`$${'1089'} `}
                    {<span>due if prescribed</span>}
                  </Typography>
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography>{totalIfPrescribedText}</Typography>
                {discountApplied ? (
                  <>
                    <Typography>
                      {' '}
                      <Typography
                        component="span"
                        sx={{
                          textDecoration: 'line-through',
                          marginRight: '0.2rem',
                          width: '20px',
                        }}
                      >
                        {`$${prePayTotal}`}
                      </Typography>
                      {`$${wholeOrFloat(
                        prePayTotal *
                          (1 - couponToDiscountAmount[discountApplied])
                      )}`}
                    </Typography>
                  </>
                ) : (
                  `$${prePayTotal}`
                )}
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
                margin="16px 0"
              >
                <Typography variant="h3">{payTodayText}</Typography>
                <Typography variant="h3">$0.00</Typography>
              </Stack>
              <Stack>
                {isDiscountAvailable && !discountApplied ? (
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
                      {applyDiscountCodeText}
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
                        label={enterCodeText}
                        sx={{
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: 'pointer',
                        }}
                        value={couponCode}
                        onChange={e =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                      />
                      <Button
                        sx={{
                          width: '100px',
                          marginLeft: '15px',
                        }}
                        onClick={handleApplyCouponCode}
                      >
                        {applyButtonText}
                      </Button>
                    </Box>
                  </Box>
                ) : null}
                <Typography
                  fontWeight={700}
                  textAlign="center"
                  mb="1rem"
                  sx={{ color: '#008A2E' }}
                >
                  {medicationSelected === 'Tirzepatide'
                    ? 'On average, people lose 20% of their weight in their first year with tirzepatide**'
                    : 'On average, people lose 14.9% of their weight in their first year with semaglutide**'}
                </Typography>

                {discountApplied ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      marginTop: '16px',
                    }}
                  >
                    <TextField
                      fullWidth
                      disabled
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            fontSize: '13px',
                            justifyContent: 'center',
                            paddingLeft: '2.3rem',
                            paddingRight: '2rem',
                          }}
                        >
                          {additionalDiscountText}
                          <CheckIcon
                            style={{
                              alignContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              fontSize: '24px',
                              color: 'green',
                              position: 'relative',
                              top: isMobile ? '-6px' : '-5px',
                              right: '-1px',
                            }}
                          />
                        </Box>
                      }
                      InputLabelProps={{
                        sx: {
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          color: 'black !important',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '12px' : '14px',
                          marginLeft: isMobile ? '3px' : '0px',
                        },
                      }}
                      inputProps={{
                        style: {
                          color: 'green !important',
                          textAlign: 'center',
                        },
                        '::placeholder': {},
                      }}
                      value={couponCode}
                      onChange={e =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                    />
                  </Box>
                ) : null}
              </Stack>
              {
                <FormControlLabel
                  sx={{
                    margin: '0',
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
                  label={compoundDisclosureText}
                />
              }
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              <LoadingButton
                loading={klarnaLoading}
                disabled={klarnaLoading}
                onClick={() => {
                  handleKlarnaSelection();
                }}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
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
                Pay $0 Today
              </LoadingButton>
              <Stack gap={1.5} fontStyle="italic" textAlign="left">
                <Typography variant="subtitle2" fontSize="0.75rem !important">
                  {chargedIfPrescribedTextKlarna
                    .replace(/\{0\}/g, `${prePayTotal}`)
                    .replace(/\{1\}/g, medicationName)}
                </Typography>
                <Typography fontSize="0.75rem !important" fontStyle="italic">
                  {medications?.[0]?.name.toLowerCase().includes('semaglutide')
                    ? semaglutideStudyReferenceText
                    : tirzepatideStudyReferenceText}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <PaymentEditModal
            onClose={handleClose}
            open={openPaymentModal}
            title={addNewPaymentMethodText}
            handlePrescriptionRequest={handlePrescriptionRequest}
            setOpenUpdatePayment={setOpenUpdatePayment}
            handlePayAllInvoices={handlePayAllInvoices}
          />
          <SubscriptionRestartModal
            titleOnSuccess={subscriptionReactivatedText}
            onConfirm={handleCanceled}
            onClose={handleCanceledClose}
            title={
              Router.asPath.includes('/bundled')
                ? reactivateWeightLossBundledMembershipText.replace(
                    '{0}',
                    medications?.[0]?.name?.split(' ')[0]
                  )
                : reactivateWeightLossMembershipText
            }
            description={[
              reactivateMembershipDescriptionPart1,
              reactivateMembershipDescriptionPart2,
            ]}
            medication={medications[0]}
            price={medicationPrice}
            open={openCanceled}
            buttonText={reactivateButtonText}
          />
          <SubscriptionRestartModal
            titleOnSuccess={subscriptionReactivatedText}
            open={openScheduledForCancelation}
            title={
              Router.asPath.includes('/bundled')
                ? reactivateWeightLossBundledMembershipText.replace(
                    '{0}',
                    medications?.[0]?.name?.split(' ')[0]
                  )
                : reactivateWeightLossMembershipText
            }
            description={[
              reactivateMembershipDescriptionPart1,
              reactivateMembershipDescriptionPart2,
            ]}
            medication={medications[0]}
            price={medicationPrice}
            onConfirm={handleScheduledForCancelation}
            onClose={handleScheduledForCancelationClose}
            buttonText={reactivateButtonText}
          />
          <BasicModal isOpen={openUpdatePayment} useMobileStyle={false}>
            <Typography variant="h3" textAlign="center">
              {updatePaymentTitleText}
            </Typography>
            <Typography textAlign="center">
              {updatePaymentDescriptionText}
            </Typography>
            <Typography textAlign="center">{updatePaymentNoteText}</Typography>
            <Stack gap="10px">
              <LoadingButton
                size="small"
                onClick={() => {
                  setOpenPaymentModal(true);
                }}
              >
                {updatePaymentButtonText}
              </LoadingButton>
              <Button
                size="small"
                variant="outlined"
                onClick={() => history.back()}
              >
                {cancelButtonText}
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
    </Box>
  );
}
