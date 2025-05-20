import React, {
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
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { uuid } from 'uuidv4';
import {
  EditDeliveryAddress,
  UpdatePayment,
} from '../../../../UpdatePatientInfo';
import { useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router, { useRouter } from 'next/router';
import CheckIcon from '@mui/icons-material/Check';
import {
  useAllVisiblePatientSubscription,
  useRedeemedCouponCode,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  useVWOVariationName,
  usePatientIntakes,
  usePatientOrders,
  usePatientCouponCodes,
  useIsEligibleForZealthy10,
} from '@/components/hooks/data';
import axios from 'axios';
import { addMonths, differenceInDays } from 'date-fns';
import PatientPaymentMethod from '../../../../PatientPaymentMethod';
import { usePayment } from '@/components/hooks/usePayment';
import PaymentEditModal from '../../../../PaymentEditModal';
import ErrorMessage from '../../../../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import toast from 'react-hot-toast';
import SubscriptionRestartModal from '../../../../SubscriptionRestartModal';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleQuarterlyEvent,
  prescriptionRequestedReorderQuarterlyEvent,
  weightLossDiscountCodeApplied,
} from '@/utils/freshpaint/events';
import {
  useApplyCouponCode,
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import BasicModal from '../../../../BasicModal';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { useVWO } from '@/context/VWOContext';
import PaymentPageBanner from '../../../../PaymentPageBanner';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { wholeOrFloat } from '@/utils/wholeOrFloat';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import DOMPurify from 'dompurify';
import { useABTest } from '@/context/ABZealthyTestContext';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { oralSemaglutideBundled } from '@/constants/rules/post-checkout-intake';
import Image from 'next/image';
import klarnaBadge from '../../../../../../../public/images/klarna-badge.png';
import { loadStripe } from '@stripe/stripe-js';
import { usePathname } from 'next/navigation';

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
  onNext?: () => void;
}

export function WeightLossBulkAddOn({ onNext }: ConfirmationProps) {
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const { code } = Router.query;
  const [error, setError] = useState('');
  const vwoClient = useVWO();
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { data: patientInfo } = usePatient();
  const { createInvoicePayment, createPaymentIntent } = usePayment();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const applyCouponCode = useApplyCouponCode();
  const isMobile = useIsMobile();
  const ABZTest = useABTest();

  const pathname = usePathname();

  const isRequestCompound = pathname?.includes(
    'patient-portal/weight-loss-treatment'
  );
  const isPostCheckout = pathname?.includes('post-checkout');
  const isPostCheckoutOrCompoundRefill = isRequestCompound || isPostCheckout;

  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const { data: patientOrders } = usePatientOrders();

  const { data: redeemedCouponCodes, isLoading: redeemedCouponCodesLoading } =
    useRedeemedCouponCode();
  const { data: patientIntakes } = usePatientIntakes();
  const [page, setPage] = useState<string>('confirm');
  const { data: patientCareTeam } = usePatientCareTeam();
  const { medications } = useVisitState();
  const { data: paymentMethod } = usePatientDefaultPayment();

  const [loading, setLoading] = useState<boolean>(false);
  const [klarnaLoading, setKlarnaLoading] = useState<boolean>(false);
  const [paymentSelection, setPaymentSelection] = useState<string>('');
  const [shippingId, setShippingId] = useState<string>('1');
  const [openCanceled, setOpenCanceled] = useState(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openMeidcareAttestationModal, setOpenMedicareAttestationModal] =
    useState(false);
  const { data: patientSubscriptions = [], refetch } =
    useAllVisiblePatientSubscription();
  const { data: unpaidInvoices } = usePatientUnpaidInvoices();
  const { data: couponCodes } = usePatientCouponCodes();
  const [isPrePayVariant, setIsPrePayVariant] = useState(false);
  const [isRecurringVariant, setIsRecurringVariant] = useState(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isDiscountAvailable, setIsDiscountAvailable] =
    useState<boolean>(false);
  const [discountApplied, setDiscountApplied] = useState<string>('');
  const router = useRouter();

  const [variationName3542, setVariationName3542] =
    useState<string>('Variation-1');
  const [variationName3780, setVariationName3780] =
    useState<string>('Variation-1');
  const [variationName3594, setVariationName3594] = useState<string>('');
  const [variationName3452, setVariationName3452] = useState<string>('');
  const [variationName4318, setVariationName4318] = useState<string>('');
  const { data: isEligibleForZealthy10 } = useIsEligibleForZealthy10();
  const [campaignKey, setCampaignKey] = useState('');
  const { data: vwoVariationName } = useVWOVariationName(campaignKey);
  const medicationName = medicationAttributeName(medications?.[0]?.name);
  const { data: variation7742 } = useVWOVariationName('7742');
  const { data: variation7746_3 } = useVWOVariationName('7746_3');

  const isVariation7746_3 = variation7746_3?.variation_name === 'Variation-1';

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
    };
    activateVariants();
  }, [patientInfo?.id, patientInfo?.region, vwoClient]);

  const handleKlarnaSelection = async () => {
    setPaymentSelection('klarna');
  };

  useEffect(() => {
    if (paymentSelection === 'klarna') {
      handleSubmit();
      setPaymentSelection('');
    }
  }, [paymentSelection]);

  useEffect(() => {
    if (patientInfo?.id && ['IN', 'MN'].includes(patientInfo?.region || '')) {
      setCampaignKey('3594');
    }
    if (patientInfo?.id && !['IN', 'MN'].includes(patientInfo?.region || '')) {
      setCampaignKey('3780');
    }
    if (
      patientInfo?.id &&
      ['MS', 'OH', 'GA'].includes(patientInfo?.region || '')
    ) {
      setCampaignKey('3452-2');
    }
  }, [patientInfo?.id, patientInfo?.region]);

  useEffect(() => {
    if (vwoVariationName && campaignKey === '3594') {
      setVariationName3594(vwoVariationName?.variation_name || '');
    }
    if (vwoVariationName && campaignKey === '3780') {
      setVariationName3780(vwoVariationName?.variation_name || '');
    }
    if (vwoVariationName && campaignKey === '3452-2') {
      setVariationName3452(vwoVariationName?.variation_name || '');
    }
  }, [vwoVariationName, campaignKey]);

  useEffect(() => {
    if (!['IN', 'MN'].includes(patientInfo?.region || '') && !isBundled) {
      setIsPrePayVariant(true);
    }
  }, [patientInfo?.region]);

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  const uniqueKey = useMemo(() => uuid(), [failed]);

  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);

  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const medicareAccess = useSelector(store => store.coaching).find(
    c => c.name === 'Z-Plan by Zealthy Weight Loss Access Program'
  );

  const isBundled =
    medications?.[0]?.price === 297 ||
    medications?.[0]?.price === 449 ||
    medications?.[0]?.price === 249;

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

  const semaglutideOralBundled =
    useSelector(store => store.coaching).find(
      c => c.name === 'Zealthy Weight Loss + Oral Semaglutide Tablets'
    ) ||
    (weightLossSubscription?.price === 249 ? weightLossSubscription : false);

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
    if (
      existingBulkSubscription &&
      weightLossSubscription?.status !== 'canceled' &&
      !isBundled
    )
      return 0;
    return (
      (medicareAccess ||
      weightLossSubscription?.subscription?.name ===
        'Zealthy Weight Loss Access'
        ? 126
        : semaglutideBundled
        ? 446
        : semaglutideOralBundled
        ? 400
        : tirzepatideBundled
        ? (medications[0]?.discounted_price || 1) * 2
        : 216) + (shippingId === '2' ? 15 : 0)
    );
  }, [
    existingBulkSubscription,
    weightLossSubscription?.status,
    weightLossSubscription?.subscription?.name,
    medicareAccess,
    semaglutideBundled,
    semaglutideOralBundled,
    tirzepatideBundled,
    medications,
    isBundled,
    shippingId,
  ]);
  console.log(medications, 'medications');
  const controlTotal = medications?.[0]?.discounted_price ?? 0;

  const controlTotal3Months = Math.floor(controlTotal * 3);

  const prePayTotal =
    controlTotal3Months + price + (shippingId === '2' ? 15 : 0);

  const months: number = 2;

  const onBack = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (
      Router.asPath.includes('/patient-portal/weight-loss-treatment/bundled')
    ) {
      Router.push(
        '/patient-portal/questionnaires-v2/weight-loss-compound-refill/REFILL_RESPONSES_REVIEWED'
      );
    } else {
      Router.push(Pathnames.PATIENT_PORTAL);
    }
  }, [onNext]);

  const onSuccess = useCallback(
    async (newSubscription?: any) => {
      window.VWO?.event('3MonthPrescriptionRequestSubmitted');
      setLoading(true);
      if (vwoClient && patientInfo?.id) {
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
            '3542',
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
            'Clone_7077',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),

          vwoClient?.track(
            '6303',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3463',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5867',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3357',
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
            '3780',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5751',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '3594',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          ABZTest.trackMetric(
            '6465_new',
            patient?.profile_id!,
            '3MonthPrescriptionRequestSubmitted'
          ),
          vwoClient?.track(
            '8288',
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
          vwoClient?.track(
            '4798',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5483',
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
          vwoClient?.track('3543', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('4002', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('7930', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('3722', 'non-bundled3MonthUpsell', patientInfo),
          vwoClient?.track('4313', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('4935', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('5765', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('6792', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('5481', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('7743', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track(
            'Clone_Clone_4313',
            'bundled3MonthUpsell',
            patientInfo
          ),
          vwoClient?.track('15685', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('8676', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track(
            '8676',
            'bundled3MonthsPrescriptionRequest',
            patientInfo
          ),

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
            '4666',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '5053',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4289-1',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),

          vwoClient?.track(
            '4318',
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
          vwoClient?.track(
            '4381',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),

          vwoClient?.track('4320', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('7458', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track('8078', 'prescriptionRequestSubmitted', patientInfo),

          vwoClient?.track('5053', 'prescriptionRequestSubmitted', patientInfo),
          vwoClient?.track(
            '4624',
            '3MonthPrescriptionRequestSubmitted',
            patient
          ),
          vwoClient?.track(
            'Clone_4687',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '4918',
            '3MonthPrescriptionRequestSubmitted',
            patient
          ),
          vwoClient?.track(
            '6826',
            '3MonthPrescriptionRequestSubmitted',
            patient
          ),
          vwoClient?.track(
            'Clone_6775',
            '3MonthPrescriptionRequestSubmitted',
            patient
          ),
          vwoClient?.track(
            'Clone_6775_2',
            '3MonthPrescriptionRequestSubmitted',
            patient
          ),
          vwoClient?.track(
            '75801',
            '3MonthPrescriptionRequestSubmitted',
            patient
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
            '8469',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9363',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '9502',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
        ]);
      }

      if (code) {
        await supabase
          .from('single_use_appointment')
          .update({ used: true })
          .eq('id', code);
      }

      if (
        existingBulkSubscription &&
        !Router.asPath.includes('weight-loss-bundle-reorder')
      ) {
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
          is_bundled: isBundled,
          note: isBundled
            ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
            : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
          specific_medication: medications?.[0]?.name,
          type:
            medications?.[0]?.name === 'Oral Semaglutide'
              ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
              : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          total_price: price + (shippingId === '2' ? 15 : 0),
          shipping_method: parseInt(shippingId, 10),
          care_team: patientCareTeam?.map((e: any) => e.clinician_id),
          number_of_month_requested: 3,
          matrix_id: medications[0].matrixId,
          ...(medications[0].name === 'Oral Semaglutide' && {
            oral_matrix_id: medications[0].matrixId,
          }),
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
              task_type: isPostCheckoutOrCompoundRefill
                ? 'PRESCRIPTION_REQUEST'
                : 'PRESCRIPTION_REFILL',
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
          let applyCredit;

          if (!isPrePayVariant) {
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
          }

          onBack();
        } else {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
        }
      } else {
        let applyCredit;

        if (!isPrePayVariant) {
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
        }

        if (applyCredit?.status === 200 || isPrePayVariant) {
          const price =
            (medications?.[0]?.discounted_price as number) * 3 ||
            medications?.[0]?.price ||
            0;
          const medicationRequest: PrescriptionRequest = {
            patient_id: patientInfo?.id,
            region: patientInfo?.region,
            medication_quantity_id: medications?.[0].medication_quantity_id,
            type:
              medications?.[0]?.name === 'Oral Semaglutide'
                ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
            status: Router.asPath.includes('/patient-portal')
              ? 'REQUESTED'
              : 'PRE_INTAKES',
            is_bundled: isBundled,
            note: isBundled
              ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
              : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
            specific_medication: medications?.[0]?.name,
            total_price: price + (shippingId === '2' ? 15 : 0),
            shipping_method: parseInt(shippingId, 10),
            care_team: patientCareTeam?.map((e: any) => e.clinician_id),
            coupon_code: discountApplied || null,
            number_of_month_requested: 3,
            matrix_id: medications[0].matrixId,
            ...(medications[0].name === 'Oral Semaglutide' && {
              oral_matrix_id: medications[0].matrixId,
            }),
          };

          const foundPR = patientPrescriptionRequests?.find(
            p =>
              p.medication_quantity_id ===
              medicationRequest.medication_quantity_id
          );

          if (patientPrescriptionRequests?.length && foundPR) {
            medicationRequest.id = foundPR.id;
          }

          const { data: prescriptionRequest, error } = await supabase
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

          if (prescriptionRequest) {
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
                  task_type: isPostCheckoutOrCompoundRefill
                    ? 'PRESCRIPTION_REQUEST'
                    : 'PRESCRIPTION_REFILL',
                  patient_id: patientInfo?.id,
                  queue_type: 'Provider (QA)',
                })
                .select()
                .maybeSingle()
                .then(({ data }) => data);
              await supabase
                .from('prescription_request')
                .update({ queue_id: addToQueue?.id })
                .eq('id', prescriptionRequest.id);
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
      vwoClient,
      patientInfo,
      code,
      existingBulkSubscription,
      patient,
      supabase,
      medications,
      isBundled,
      shippingId,
      patientCareTeam,
      medicationName,
      onBack,
      isPrePayVariant,
      weightLossSubscription?.status,
      weightLossSubscription?.current_period_end,
      weightLossSubscription?.reference_id,
      discountApplied,
      patientPrescriptionRequests,
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
        price === 216
          ? '2 Months Weight Loss Membership'
          : [446, 498].includes(price)
          ? '2 Months Weight Loss Semaglutide Membership'
          : price === 400
          ? '2 Months Weight Loss Oral Semaglutide Bundled Membership'
          : price === medications[0]?.discounted_price
          ? '2 Months Weight Loss Tirzepatide Membership'
          : '2 Months Weight Loss Membership',
        isBundled ? false : isPrePayVariant ? true : false,
        uniqueKey
      );
      console.log(`price${price} ${typeof price}`);
      if (price === 0) {
        await Promise.all([
          vwoClient?.track(
            '8676',
            'bundled1MonthPrescriptionRequest',
            patientInfo
          ),
        ]);
      }

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

  const handleKlarnaPayment = async () => {
    try {
      setKlarnaLoading(true);
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      const metadata = {
        zealthy_medication_name: isBundled
          ? `${medications?.[0]?.name} Bundled`
          : `${medications?.[0]?.name} compound 3 months`,
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
        is_bundled: isBundled,
        is_visible: false,
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        type:
          medications?.[0]?.name === 'Oral Semaglutide'
            ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
            : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        total_price: price + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        number_of_month_requested: 3,
        uncaptured_payment_intent_id: intent_id,
        matrix_id: medications[0].matrixId,
        ...(medications[0].name === 'Oral Semaglutide' && {
          oral_matrix_id: medications[0].matrixId,
        }),
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
          : `${window.location.origin}/post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1`,
      });
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in handleKlarnaPayment:', error);
    } finally {
      setKlarnaLoading(false);
    }
  };

  const handleSubmit = () => {
    window.VWO?.event('purchase_upsell_weight_loss_bulk');
    setLoading(true);
    if (
      !optIn &&
      !semaglutideBundled &&
      !tirzepatideBundled &&
      !semaglutideOralBundled &&
      variationName3542 !== 'Variation-2' &&
      !['IN', 'MN'].includes(patientInfo?.region || '')
    ) {
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
            {variationName3594 !== 'Variation-1'
              ? `Your discount for 3 months of ${medications?.[0]?.name} ${
                  !existingBulkSubscription
                    ? `and the next ${months} months of your membership has been applied.`
                    : semaglutideBundled ||
                      tirzepatideBundled ||
                      semaglutideOralBundled
                    ? '+ medical care has been applied'
                    : 'has been applied.'
                }  ${
                  isPrePayVariant
                    ? 'You won’t be charged for either unless your provider approves your Rx request & we’re ready to ship it to you.'
                    : semaglutideBundled ||
                      tirzepatideBundled ||
                      semaglutideOralBundled
                    ? 'If you are not eligible for medication, you will be refunded.'
                    : 'You won’t be charged for medication unless your provider approves your Rx request.'
                }`
              : `Pre-pay for your discounted next 2 months of membership. You’ll be charged for medication when your provider approves your Rx request.`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              marginBottom: '1rem',
              bgcolor: '#F6EFE3',
            }}
          >
            {
              <Box sx={{ marginBottom: '16px' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    mb: 1,
                  }}
                >
                  {`Pre-pay next 2 months of membership`}
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
                    {medicareAccess
                      ? medicareAccess?.price
                      : texasPromo
                      ? texasPromo?.price
                      : semaglutideBundled
                      ? '297'
                      : semaglutideOralBundled
                      ? '249'
                      : tirzepatideBundled
                      ? '449'
                      : '135'}
                  </Typography>
                  {medicareAccess
                    ? '$63 per month'
                    : semaglutideBundled
                    ? '$223 per month'
                    : semaglutideOralBundled
                    ? '$200 per month'
                    : tirzepatideBundled
                    ? `$${medications[0].discounted_price} per month`
                    : `$108 per month`}
                </Typography>
                <Typography variant="body1">
                  {`Next ${months} months upfront with discount applied`}
                </Typography>
                <Stack>
                  {isBundled ? (
                    <Typography fontWeight={600} mt={1} mb={1}>
                      ${price} Due If Prescribed
                    </Typography>
                  ) : (
                    <Typography variant="body1" mt={1} mb={1}>
                      ${price} Due If Prescribed
                    </Typography>
                  )}

                  <Typography variant="body1" fontStyle="italic">
                    {isBundled
                      ? `(The amount is for your Zealthy weight loss membership for the next 2 months. as a reminder, your membership includes medical services, care coordination, and ${medications?.[0]?.name} medication delivered straight to your door.)`
                      : `(The amount is for your Zealthy weight loss membership for
                      the next 2 months. As a reminder, your membership includes
                      medical services, care coordination, coaching, and access
                      to affordable GLP-1 medications shipped to your home. You
                      will only pay the next 2 months of your membership if
                      prescribed this 3 month supply.)`}
                  </Typography>
                </Stack>
              </Box>
            }
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  mb: 1,
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
              {semaglutideBundled ||
              tirzepatideBundled ||
              semaglutideOralBundled ? null : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      marginBottom: '2px',
                    }}
                  >
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        textDecoration: 'line-through',
                        marginRight: '1.5rem',
                        width: '20px',
                      }}
                    >
                      {`$${medications?.[0]?.price}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        ...(discountApplied
                          ? {
                              textDecoration: 'line-through',
                              marginRight: '1.5rem',
                              width: '20px',
                            }
                          : {}),
                      }}
                    >{`$${Math.floor(controlTotal)}`}</Typography>
                    {discountApplied
                      ? `$${wholeOrFloat(
                          controlTotal *
                            (1 - couponToDiscountAmount[discountApplied])
                        )}`
                      : null}
                    <Typography variant="body1">/month</Typography>
                  </Box>
                  {!['IN', 'MN'].includes(patientInfo?.region || '') ? (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '0.3rem',
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            marginBottom: '2px',
                            ...(discountApplied
                              ? {
                                  textDecoration: 'line-through',
                                  marginRight: '1rem',
                                  width: '20px',
                                }
                              : {}),
                          }}
                        >
                          {`$${controlTotal3Months}`}
                        </Typography>
                        {discountApplied
                          ? `$${wholeOrFloat(
                              controlTotal3Months *
                                (1 - couponToDiscountAmount[discountApplied])
                            )}`
                          : null}
                        <Typography variant="subtitle1">
                          Due If Prescribed
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontStyle="italic">
                        (The amount is for medication only and we expect it to
                        last 3 months. You will only pay if prescribed.)
                      </Typography>
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '0.3rem',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{
                          marginBottom: '2px',
                          ...(discountApplied
                            ? {
                                textDecoration: 'line-through',
                                marginRight: '1rem',
                                width: '20px',
                              }
                            : {}),
                        }}
                      >
                        {`$${controlTotal3Months}`}
                      </Typography>
                      {discountApplied
                        ? wholeOrFloat(
                            controlTotal3Months *
                              (1 - couponToDiscountAmount[discountApplied])
                          )
                        : null}
                      <Typography variant="body1">
                        {' '}
                        Due If Prescribed*
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
            {['Variation-1', 'Variation-2']?.includes(variationName3452) ? (
              <>
                <PaymentPageBanner is3Month />
                <br></br>
              </>
            ) : null}
            {medications?.[0]?.dose ? (
              <Box sx={{ marginBottom: '16px' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    mb: 1,
                  }}
                >
                  {'Weekly dosage'}
                </Typography>
                <Typography
                  component="div"
                  variant="subtitle1"
                  fontSize="0.75rem !important"
                  sx={{
                    '.subtitle': {
                      fontFamily: 'Inter',
                      fontSize: '1rem',
                      fontStyle: 'bold',
                      fontWeight: '700',
                      lineHeight: '1.25rem',
                      letterSpacing: '-0.00375rem',
                      marginBottom: '3px',
                    },
                    '>p': {
                      marginTop: 0,
                      marginBottom: '3px',
                      fontSize: '1rem',
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: String(medications?.[0]?.dose),
                  }}
                />
              </Box>
            ) : null}
            {!['IN', 'MN'].includes(patientInfo?.region || '') &&
              !isBundled && (
                <>
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
                    {!['IN', 'MN'].includes(patientInfo?.region || '') ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '0.3rem',
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            marginBottom: '2px',
                            ...(discountApplied
                              ? {
                                  textDecoration: 'line-through',
                                  marginRight: '1rem',
                                  width: '20px',
                                }
                              : {}),
                          }}
                        >
                          {`$${prePayTotal}`}
                        </Typography>
                        {discountApplied ? (
                          <Typography variant="body1">
                            {`$${wholeOrFloat(
                              prePayTotal *
                                (1 - couponToDiscountAmount[discountApplied])
                            )}`}
                          </Typography>
                        ) : null}
                        <Typography variant="body1">
                          Due If Prescribed
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          sx={{ marginBottom: '2px' }}
                        >
                          {`$${prePayTotal} Due If Prescribed`}
                        </Typography>
                      </>
                    )}
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
                  </Box>
                </>
              )}
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
            <Typography sx={{ marginBottom: '16px' }}>United States</Typography>
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
              <Stack gap="16px" mb={1.5}>
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
          {variationName3594 !== 'Variation-1' && !semaglutideOralBundled ? (
            <Typography
              fontWeight={700}
              textAlign="center"
              mb="1rem"
              sx={{ color: '#008A2E' }}
            >
              {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
                ? `On average, people lose 7% of their weight in ${
                    Router.asPath.includes('post-checkout')
                      ? 'their first '
                      : ''
                  }3 months with semaglutide**`
                : `On average, people lose 8% of their body weight in ${
                    Router.asPath.includes('post-checkout')
                      ? 'their first '
                      : ''
                  }3 months of using tirzepatide**`}
            </Typography>
          ) : null}
          {['Variation-1'].includes(variationName3594) ? (
            <Typography
              fontWeight={700}
              textAlign="center"
              sx={{ color: '#008A2E' }}
            >
              {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
                ? `On average, people lose 5% of their weight when taking semaglutide for 3 months after their first 3 months on semaglutide`
                : `On average, people lose 7% of their weight when taking tirzepatide for 3 months after their first 3 months. `}
            </Typography>
          ) : null}
          {discountApplied ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
              }}
            >
              <TextField
                fullWidth
                disabled
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {`${
                      couponToDiscountAmount[discountApplied] * 100
                    }% Additional Discount (on top of 20% discount)`}

                    <CheckIcon
                      style={{
                        fontSize: '24px',
                        color: 'green',

                        position: 'relative',
                        top: isMobile ? '-6px' : '-5px',
                        right: '0px',
                      }}
                    />
                  </Box>
                }
                InputLabelProps={{
                  sx: {
                    display: 'flex',
                    justifyContent: 'center',
                    color: 'black !important',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '15px',
                    marginLeft: '0px',
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
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
              />
            </Box>
          ) : null}
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
                <Button
                  sx={{ width: '100px', marginLeft: '15px' }}
                  onClick={handleApplyCouponCode}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          ) : null}
          <Box sx={{ textAlign: 'center' }}>
            {!semaglutideBundled &&
            !tirzepatideBundled &&
            !semaglutideOralBundled &&
            variationName3542 !== 'Variation-2' &&
            !['IN', 'MN'].includes(patientInfo?.region || '') ? (
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
            ) : null}
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {medicationName.toLowerCase().includes('semaglutide') &&
            !Router.asPath.includes('refill') ? (
              <LoadingButton
                loading={klarnaLoading}
                disabled={klarnaLoading}
                onClick={() => {
                  handleKlarnaSelection();
                }}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  marginBottom: 2,
                  width: '100%',
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
            ) : null}
            <LoadingButton
              sx={{ width: '100%', margin: '0.5rem 0' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {!['IN', 'MN'].includes(patientInfo?.region || '') &&
              medications?.[0]?.price !== 297 &&
              medications?.[0]?.price !== 449 &&
              medications?.[0]?.price !== 249
                ? 'Pay $0 today'
                : `Confirm order - ${
                    !existingBulkSubscription ||
                    weightLossSubscription?.status === 'canceled' ||
                    isBundled
                      ? `$${price} due today`
                      : '$0 due today'
                  }`}
            </LoadingButton>
            {['IN', 'MN'].includes(patientInfo?.region || '') &&
            isPrePayVariant ? (
              <Stack gap={2}>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {`*You will be charged $${
                    discountApplied
                      ? wholeOrFloat(
                          controlTotal3Months *
                            (1 - couponToDiscountAmount[discountApplied])
                        )
                      : controlTotal3Months
                  } if you are prescribed
                  compounded ${medications?.[0]?.name}.`}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {` This includes the next 2
                  months of your membership and the total cost of the 3 month
                  supply of medication. This is what Zealthy expects to last 3
                  month, your provider may recommend a different dosage amount,
                  which would change the price.`}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {`You will not be responsible for any portion of this amount if
                  you are not prescribed.`}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {`However, if prescribed, the charge for your medication will
                  not be eligible for a refund, since we send it directly to the
                  pharmacy to begin the packaging and shipping process.`}
                </Typography>
              </Stack>
            ) : semaglutideBundled || tirzepatideBundled ? (
              <Typography
                variant="subtitle2"
                fontSize="0.75rem !important"
                sx={{
                  fontStyle: 'italic',
                  marginTop: '0.5rem',
                }}
              >
                {!Router.asPath.includes('refill') &&
                medications?.[0]?.name.toLowerCase().includes('semaglutide')
                  ? `*This is what Zealthy expects to last 3 months. If you are determined not to be eligible by your provider, you will be able to get a refund. If you choose to pay with Klarna, you can split this purchase into equal installments of $${Math.round(
                      price / 7
                    )}-$${Math.round(
                      price / 4
                    )} typically paid monthly, which you will pay across equal installments every 30 days or every 2 weeks until you have paid the $${price} in full. This includes the next 2 months of your membership and the total cost of the 3 month supply of medication.`
                  : '*This is what Zealthy expects to last 3 months. If you are determined not to be eligible by your provider, you will be able to get a refund.'}
              </Typography>
            ) : isRecurringVariant &&
              !variationName3594 &&
              !oralSemaglutideBundled ? (
              <Stack gap={1.5} fontStyle="italic">
                <Typography variant="subtitle2" fontSize="0.75rem !important">
                  {`*You will be charged $${
                    !['IN', 'MN'].includes(patientInfo?.region || '')
                      ? discountApplied
                        ? wholeOrFloat(
                            prePayTotal *
                              (1 - couponToDiscountAmount[discountApplied])
                          )
                        : prePayTotal
                      : discountApplied
                      ? wholeOrFloat(
                          controlTotal3Months *
                            (1 - couponToDiscountAmount[discountApplied])
                        )
                      : controlTotal3Months
                  } if you are
                  prescribed compounded semaglutide. This is what Zealthy
                  expects to last 3 month. Your provider may recommend a
                  different dosage amount, which would change the price.`}
                </Typography>
                {['IN', 'MN'].includes(patientInfo?.region || '') ? (
                  <Typography variant="subtitle2" fontSize="0.75rem !important">
                    {Router.asPath.includes('/patient-portal')
                      ? `If prescribed, your medication subscription, which currently renews at $${controlTotal3Months} every 90 days, will be updated to the higher dosage, which means it will renew at $${controlTotal3Months} every 90 days.`
                      : `If prescribed, you are purchasing an automatically-renewing subscription and will be charged $${
                          discountApplied
                            ? wholeOrFloat(
                                controlTotal3Months *
                                  (1 - couponToDiscountAmount[discountApplied])
                              )
                            : controlTotal3Months
                        } for the first 90 days and ${controlTotal3Months} every 90 days until you cancel.`}
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle2"
                    fontSize="0.75rem !important"
                  >{`If prescribed, you are purchasing an automatically-renewing subscription and will be charged $${
                    discountApplied
                      ? wholeOrFloat(
                          prePayTotal *
                            (1 - couponToDiscountAmount[discountApplied])
                        )
                      : prePayTotal
                  } for the first 90 days, which is the medication portion of the charge mentioned above, and $${prePayTotal} every 90 days thereafter until you cancel.`}</Typography>
                )}
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
            ) : !oralSemaglutideBundled ? (
              <>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{
                    fontStyle: 'italic',
                    marginBottom: '0.5rem',
                  }}
                >{`*You will be charged an additional $${controlTotal3Months} if you are prescribed compounded ${medications?.[0]?.name}.`}</Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {
                    'This is what Zealthy expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price.'
                  }
                </Typography>
              </>
            ) : (
              <>
                {' '}
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {
                    'This is what Zealthy expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price.'
                  }
                </Typography>{' '}
              </>
            )}
            {
              <Typography
                fontSize="0.75rem !important"
                fontStyle="italic"
                mt="1rem"
              >
                {medications?.[0]?.name.toLowerCase().includes('semaglutide')
                  ? `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                  : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
              </Typography>
            }
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
            price={controlTotal3Months}
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
            price={controlTotal3Months}
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

  // Below is the old checkout before pushing 7742 var 1 live - keeping incase ug need to revert back to it
  // return (
  //   <Container maxWidth="sm">
  //     {page === 'confirm' && (
  //       <>
  //         <Typography
  //           variant="h2"
  //           sx={{
  //             marginBottom: '16px',
  //           }}
  //         >
  //           {variationName3594 !== 'Variation-1'
  //             ? `Your discount for 3 months of ${medications?.[0]?.name} ${
  //                 !existingBulkSubscription
  //                   ? `and the next ${months} months of your membership has been applied.`
  //                   : semaglutideBundled || tirzepatideBundled
  //                   ? '+ medical care has been applied'
  //                   : 'has been applied.'
  //               }  ${
  //                 isPrePayVariant
  //                   ? 'You won’t be charged for either unless your provider approves your Rx request & we’re ready to ship it to you.'
  //                   : semaglutideBundled || tirzepatideBundled
  //                   ? 'If you are not eligible for medication, you will be refunded.'
  //                   : 'You won’t be charged for medication unless your provider approves your Rx request.'
  //               }`
  //             : `Pre-pay for your discounted next 2 months of membership. You’ll be charged for medication when your provider approves your Rx request.`}
  //         </Typography>
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             flexDirection: 'column',
  //             alignItems: 'flex-start',
  //             padding: '24px',
  //             background: '#FFFFFF',
  //             border: '1px solid #D8D8D8',
  //             borderRadius: '16px',
  //             marginBottom: '1rem',
  //           }}
  //         >
  //           {
  //             <Box sx={{ marginBottom: '16px' }}>
  //               <Typography
  //                 variant="h3"
  //                 sx={{
  //                   fontSize: '16px !important',
  //                   fontWeight: '600',
  //                   lineHeight: '24px !important',
  //                   color: '#989898',
  //                 }}
  //               >
  //                 {`Pre-pay next ${months} months of membership`}
  //               </Typography>
  //               <Typography variant="body1">
  //                 <Typography
  //                   component="span"
  //                   variant="body1"
  //                   sx={{
  //                     textDecoration: 'line-through',
  //                     marginRight: '0.2rem',
  //                     width: '20px',
  //                   }}
  //                 >
  //                   $
  //                   {medicareAccess
  //                     ? medicareAccess?.price
  //                     : texasPromo
  //                     ? texasPromo?.price
  //                     : semaglutideBundled
  //                     ? '297'
  //                     : semaglutideOralBundled
  //                     ? '249'
  //                     : tirzepatideBundled
  //                     ? '449'
  //                     : '135'}
  //                 </Typography>
  //                 {medicareAccess
  //                   ? '$63 per month'
  //                   : semaglutideBundled
  //                   ? '$223 per month'
  //                   : semaglutideOralBundled
  //                   ? '$200 per month'
  //                   : tirzepatideBundled
  //                   ? `$${medications[0].discounted_price} per month`
  //                   : `$108 per month`}
  //               </Typography>
  //               <Typography variant="body1">
  //                 {`Next ${months} months upfront with discount applied`}
  //               </Typography>
  //               <Stack>
  //                 {isBundled ? (
  //                   <Typography fontWeight={600}>
  //                     ${price} Due If Prescribed*
  //                   </Typography>
  //                 ) : (
  //                   <Typography variant="body1">
  //                     ${price} Due If Prescribed
  //                   </Typography>
  //                 )}

  //                 <Typography variant="body1" fontStyle="italic">
  //                   {isBundled
  //                     ? `(The amount is for your Zealthy weight loss membership for the next 2 months. as a reminder, your membership includes medical services, care coordination, and ${medications?.[0]?.name} medication delivered straight to your door.)`
  //                     : `(The amount is for your Zealthy weight loss membership for
  //                     the next 2 months. As a reminder, your membership includes
  //                     medical services, care coordination, coaching, and access
  //                     to affordable GLP-1 medications shipped to your home. You
  //                     will only pay the next 2 months of your membership if
  //                     prescribed this 3 month supply.)`}
  //                 </Typography>
  //               </Stack>
  //             </Box>
  //           }
  //           <Box sx={{ marginBottom: '16px' }}>
  //             <Typography
  //               variant="h3"
  //               sx={{
  //                 fontSize: '16px !important',
  //                 fontWeight: '600',
  //                 lineHeight: '24px !important',
  //                 color: '#989898',
  //               }}
  //             >
  //               {'Your medication'}
  //             </Typography>
  //             <Typography variant="subtitle1">
  //               {`${medications?.[0]?.name}`}
  //             </Typography>
  //             <Typography variant="subtitle1">
  //               {medications?.[0]?.dosage?.replace('mgs', 'mg')}
  //             </Typography>
  //             <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
  //               {`3 month supply`}
  //             </Typography>
  //             {semaglutideBundled ||
  //             tirzepatideBundled ||
  //             semaglutideOralBundled ? null : (
  //               <>
  //                 <Box
  //                   sx={{
  //                     display: 'flex',
  //                     flexDirection: 'row',
  //                     marginBottom: '2px',
  //                   }}
  //                 >
  //                   <Typography
  //                     component="span"
  //                     variant="body1"
  //                     sx={{
  //                       textDecoration: 'line-through',
  //                       marginRight: '1.5rem',
  //                       width: '20px',
  //                     }}
  //                   >
  //                     {`$${medications?.[0]?.price}`}
  //                   </Typography>
  //                   <Typography
  //                     variant="body1"
  //                     sx={{
  //                       ...(discountApplied
  //                         ? {
  //                             textDecoration: 'line-through',
  //                             marginRight: '1.5rem',
  //                             width: '20px',
  //                           }
  //                         : {}),
  //                     }}
  //                   >{`$${Math.floor(controlTotal)}`}</Typography>
  //                   {discountApplied
  //                     ? `$${wholeOrFloat(
  //                         controlTotal *
  //                           (1 - couponToDiscountAmount[discountApplied])
  //                       )}`
  //                     : null}
  //                   <Typography variant="body1">/month</Typography>
  //                 </Box>
  //                 {!['IN', 'MN'].includes(patientInfo?.region || '') ? (
  //                   <>
  //                     <Box
  //                       sx={{
  //                         display: 'flex',
  //                         flexDirection: 'row',
  //                         gap: '0.3rem',
  //                       }}
  //                     >
  //                       <Typography
  //                         variant="subtitle1"
  //                         sx={{
  //                           marginBottom: '2px',
  //                           ...(discountApplied
  //                             ? {
  //                                 textDecoration: 'line-through',
  //                                 marginRight: '1rem',
  //                                 width: '20px',
  //                               }
  //                             : {}),
  //                         }}
  //                       >
  //                         {`$${controlTotal3Months}`}
  //                       </Typography>
  //                       {discountApplied
  //                         ? `$${wholeOrFloat(
  //                             controlTotal3Months *
  //                               (1 - couponToDiscountAmount[discountApplied])
  //                           )}`
  //                         : null}
  //                       <Typography variant="subtitle1">
  //                         Due If Prescribed
  //                       </Typography>
  //                     </Box>
  //                     <Typography variant="body1" fontStyle="italic">
  //                       (The amount is for medication only and we expect it to
  //                       last 3 months. You will only pay if prescribed.)
  //                     </Typography>
  //                   </>
  //                 ) : (
  //                   <Box
  //                     sx={{
  //                       display: 'flex',
  //                       flexDirection: 'row',
  //                       gap: '0.3rem',
  //                     }}
  //                   >
  //                     <Typography
  //                       variant="subtitle1"
  //                       fontWeight="600"
  //                       sx={{
  //                         marginBottom: '2px',
  //                         ...(discountApplied
  //                           ? {
  //                               textDecoration: 'line-through',
  //                               marginRight: '1rem',
  //                               width: '20px',
  //                             }
  //                           : {}),
  //                       }}
  //                     >
  //                       {`$${controlTotal3Months}`}
  //                     </Typography>
  //                     {discountApplied
  //                       ? wholeOrFloat(
  //                           controlTotal3Months *
  //                             (1 - couponToDiscountAmount[discountApplied])
  //                         )
  //                       : null}
  //                     <Typography variant="body1">
  //                       {' '}
  //                       Due If Prescribed*
  //                     </Typography>
  //                   </Box>
  //                 )}
  //               </>
  //             )}
  //           </Box>
  //           {['Variation-1', 'Variation-2']?.includes(variationName3452) ? (
  //             <>
  //               <PaymentPageBanner is3Month />
  //               <br></br>
  //             </>
  //           ) : null}
  //           {medications?.[0]?.dose ? (
  //             <Box sx={{ marginBottom: '16px' }}>
  //               <Typography
  //                 variant="h3"
  //                 sx={{
  //                   fontSize: '16px !important',
  //                   fontWeight: '600',
  //                   lineHeight: '24px !important',
  //                   color: '#989898',
  //                 }}
  //               >
  //                 {'Weekly dosage'}
  //               </Typography>
  //               <Typography
  //                 component="div"
  //                 variant="subtitle1"
  //                 fontSize="0.75rem !important"
  //                 sx={{
  //                   '.subtitle': {
  //                     color: '#989898',
  //                     fontFamily: 'Inter',
  //                     fontSize: '1rem',
  //                     fontStyle: 'normal',
  //                     fontWeight: '700',
  //                     lineHeight: '1.25rem',
  //                     letterSpacing: '-0.00375rem',
  //                     marginBottom: '3px',
  //                   },
  //                   '>p': {
  //                     marginTop: 0,
  //                     marginBottom: '3px',
  //                     fontSize: '1rem',
  //                   },
  //                 }}
  //                 dangerouslySetInnerHTML={{
  //                   __html: String(medications?.[0]?.dose),
  //                 }}
  //               />
  //             </Box>
  //           ) : null}
  //           {!['IN', 'MN'].includes(patientInfo?.region || '') &&
  //             !isBundled && (
  //               <>
  //                 <Box sx={{ marginBottom: '16px' }}>
  //                   <Typography
  //                     variant="h3"
  //                     sx={{
  //                       fontSize: '16px !important',
  //                       fontWeight: '600',
  //                       lineHeight: '24px !important',
  //                       color: '#989898',
  //                     }}
  //                   >
  //                     {'Total'}
  //                   </Typography>
  //                   {!['IN', 'MN'].includes(patientInfo?.region || '') ? (
  //                     <Box
  //                       sx={{
  //                         display: 'flex',
  //                         flexDirection: 'row',
  //                         gap: '0.3rem',
  //                       }}
  //                     >
  //                       <Typography
  //                         variant="subtitle1"
  //                         sx={{
  //                           marginBottom: '2px',
  //                           ...(discountApplied
  //                             ? {
  //                                 textDecoration: 'line-through',
  //                                 marginRight: '1rem',
  //                                 width: '20px',
  //                               }
  //                             : {}),
  //                         }}
  //                       >
  //                         {`$${prePayTotal}`}
  //                       </Typography>
  //                       {discountApplied ? (
  //                         <Typography variant="body1">
  //                           {`$${wholeOrFloat(
  //                             prePayTotal *
  //                               (1 - couponToDiscountAmount[discountApplied])
  //                           )}`}
  //                         </Typography>
  //                       ) : null}
  //                       <Typography variant="body1">
  //                         Due If Prescribed
  //                       </Typography>
  //                     </Box>
  //                   ) : (
  //                     <>
  //                       <Typography
  //                         variant="subtitle1"
  //                         fontWeight="600"
  //                         sx={{ marginBottom: '2px' }}
  //                       >
  //                         {`$${prePayTotal} Due If Prescribed`}
  //                       </Typography>
  //                     </>
  //                   )}
  //                 </Box>
  //                 <Box sx={{ marginBottom: '16px' }}>
  //                   <Typography
  //                     variant="h3"
  //                     sx={{
  //                       fontSize: '16px !important',
  //                       fontWeight: '600',
  //                       lineHeight: '24px !important',
  //                       color: '#989898',
  //                     }}
  //                   >
  //                     {'Total due today'}
  //                   </Typography>
  //                   <Typography
  //                     variant="subtitle1"
  //                     fontWeight="600"
  //                     sx={{ marginBottom: '2px' }}
  //                   >
  //                     {`$0`}
  //                   </Typography>
  //                 </Box>
  //               </>
  //             )}

  //           <Box sx={{ marginBottom: '16px' }}>
  //             <Typography
  //               component="h4"
  //               sx={{
  //                 color: '#989898',
  //                 marginBottom: '16px',
  //                 fontSize: '16px !important',
  //                 fontWeight: '600',
  //                 lineHeight: '24px !important',
  //               }}
  //             >
  //               Delivery options
  //             </Typography>
  //             <FormControl>
  //               <RadioGroup
  //                 aria-labelledby="delivery-options"
  //                 defaultValue="standard"
  //                 name="radio-buttons-group"
  //                 value={shippingId}
  //                 onChange={handleChange}
  //               >
  //                 <FormControlLabel
  //                   value="1"
  //                   control={<Radio />}
  //                   sx={{ marginBottom: '10px' }}
  //                   label={
  //                     <>
  //                       <Typography
  //                         sx={{
  //                           fontWeight: '600',
  //                           fontSize: '14px !important',
  //                           lineHeight: '20px',
  //                           letterSpacing: '-0.006em',
  //                           color: '#1B1B1B',
  //                         }}
  //                       >
  //                         UPS Mail Innovations - $0
  //                       </Typography>
  //                       <Typography>Usually arrives in 5-8 days</Typography>
  //                     </>
  //                   }
  //                 />
  //                 <FormControlLabel
  //                   value="2"
  //                   control={<Radio />}
  //                   sx={{ marginBottom: '16px' }}
  //                   label={
  //                     <>
  //                       <Typography
  //                         sx={{
  //                           fontWeight: '600',
  //                           fontSize: '14px !important',
  //                           lineHeight: '20px',
  //                           letterSpacing: '-0.006em',
  //                           color: '#1B1B1B',
  //                         }}
  //                       >
  //                         UPS Next Day Air Saver - $15
  //                       </Typography>
  //                       <Typography>Usually arrives in 3-5 days</Typography>
  //                     </>
  //                   }
  //                 />
  //               </RadioGroup>
  //             </FormControl>
  //           </Box>
  //           <Box sx={{ marginBottom: '16px' }}>
  //             <Typography
  //               variant="h3"
  //               sx={{
  //                 fontSize: '16px !important',
  //                 fontWeight: '600',
  //                 lineHeight: '24px !important',
  //                 color: '#989898',
  //               }}
  //             >
  //               {'Delivery address'}
  //             </Typography>
  //             <Typography>{patientAddress?.address_line_1}</Typography>
  //             <Typography>{patientAddress?.address_line_2}</Typography>
  //             <Typography>
  //               {patientAddress?.city}, {patientAddress?.state}
  //             </Typography>
  //             <Typography>{patientAddress?.zip_code}</Typography>
  //             <Typography sx={{ marginBottom: '16px' }}>
  //               United States
  //             </Typography>
  //             <Link
  //               onClick={() => setPage('delivery-address')}
  //               sx={{ fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}
  //             >
  //               {'Edit'}
  //             </Link>
  //           </Box>
  //           {paymentMethod ? (
  //             <>
  //               <Typography
  //                 variant="h3"
  //                 sx={{
  //                   fontSize: '16px !important',
  //                   fontWeight: '600',
  //                   lineHeight: '24px !important',
  //                   color: '#989898',
  //                 }}
  //               >
  //                 {'Payment'}
  //               </Typography>
  //               <Stack gap="16px">
  //                 <PatientPaymentMethod paymentMethod={paymentMethod} />
  //                 <Link
  //                   onClick={handleOpen}
  //                   sx={{
  //                     fontWeight: '600',
  //                     fontSize: '16px',
  //                     cursor: 'pointer',
  //                   }}
  //                 >
  //                   {'Edit'}
  //                 </Link>
  //               </Stack>
  //             </>
  //           ) : null}
  //         </Box>
  //         {variationName3594 !== 'Variation-1' && !semaglutideOralBundled ? (
  //           <Typography
  //             fontWeight={700}
  //             textAlign="center"
  //             mb="1rem"
  //             sx={{ color: '#008A2E' }}
  //           >
  //             {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
  //               ? `On average, people lose 7% of their weight in ${
  //                   Router.asPath.includes('post-checkout')
  //                     ? 'their first '
  //                     : ''
  //                 }3 months with semaglutide**`
  //               : `On average, people lose 8% of their body weight in ${
  //                   Router.asPath.includes('post-checkout')
  //                     ? 'their first '
  //                     : ''
  //                 }3 months of using tirzepatide**`}
  //           </Typography>
  //         ) : null}
  //         {['Variation-1'].includes(variationName3594) ? (
  //           <Typography
  //             fontWeight={700}
  //             textAlign="center"
  //             sx={{ color: '#008A2E' }}
  //           >
  //             {medications?.[0]?.name?.toLowerCase().includes('semaglutide')
  //               ? `On average, people lose 5% of their weight when taking semaglutide for 3 months after their first 3 months on semaglutide`
  //               : `On average, people lose 7% of their weight when taking tirzepatide for 3 months after their first 3 months. `}
  //           </Typography>
  //         ) : null}
  //         {discountApplied ? (
  //           <Box
  //             sx={{
  //               display: 'flex',
  //               flexDirection: 'row',
  //               width: '100%',
  //             }}
  //           >
  //             <TextField
  //               fullWidth
  //               disabled
  //               label={
  //                 <Box
  //                   sx={{
  //                     display: 'flex',
  //                     justifyContent: 'center',
  //                   }}
  //                 >
  //                   {`${
  //                     couponToDiscountAmount[discountApplied] * 100
  //                   }% Additional Discount (on top of 20% discount)`}

  //                   <CheckIcon
  //                     style={{
  //                       fontSize: '24px',
  //                       color: 'green',

  //                       position: 'relative',
  //                       top: isMobile ? '-6px' : '-5px',
  //                       right: '0px',
  //                     }}
  //                   />
  //                 </Box>
  //               }
  //               InputLabelProps={{
  //                 sx: {
  //                   display: 'flex',
  //                   justifyContent: 'center',
  //                   color: 'black !important',
  //                   fontWeight: 'bold',
  //                   fontSize: isMobile ? '13px' : '15px',
  //                   marginLeft: '0px',
  //                 },
  //               }}
  //               inputProps={{
  //                 style: { color: 'green !important', textAlign: 'center' },
  //                 '::placeholder': {},
  //               }}
  //               value={couponCode}
  //               onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
  //             />
  //           </Box>
  //         ) : null}
  //         {isDiscountAvailable && !discountApplied ? (
  //           <Box
  //             sx={{
  //               display: 'flex',
  //               flexDirection: 'column',
  //               alignItems: 'flex-start',
  //               padding: '24px',
  //               background: '#FFFFFF',
  //               border: '1px solid #D8D8D8',
  //               borderRadius: '16px',
  //               marginBottom: '1rem',
  //             }}
  //           >
  //             <Typography
  //               variant="h3"
  //               sx={{
  //                 fontSize: '16px !important',
  //                 fontWeight: '600',
  //                 lineHeight: '24px !important',
  //                 color: '#989898',
  //                 marginBottom: '0.5rem',
  //               }}
  //             >
  //               {'Apply discount code'}
  //             </Typography>
  //             <Box
  //               sx={{
  //                 display: 'flex',
  //                 flexDirection: 'row',
  //                 justifyContent: 'space-between',
  //                 width: '100%',
  //               }}
  //             >
  //               <TextField
  //                 fullWidth
  //                 label="Enter code"
  //                 sx={{
  //                   fontWeight: '600',
  //                   fontSize: '16px',
  //                   cursor: 'pointer',
  //                 }}
  //                 value={couponCode}
  //                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
  //               />
  //               <Button
  //                 sx={{ width: '100px', marginLeft: '15px' }}
  //                 onClick={handleApplyCouponCode}
  //               >
  //                 Apply
  //               </Button>
  //             </Box>
  //           </Box>
  //         ) : null}
  //         <Box sx={{ textAlign: 'center' }}>
  //           {!semaglutideBundled &&
  //           !tirzepatideBundled &&
  //           !semaglutideOralBundled &&
  //           variationName3542 !== 'Variation-2' &&
  //           !['IN', 'MN'].includes(patientInfo?.region || '') ? (
  //             <Box
  //               sx={{
  //                 borderRadius: '1rem',
  //                 display: 'flex',
  //                 alignItems: 'flex-start',
  //                 textAlign: 'start',
  //                 marginBottom: '1rem',
  //               }}
  //             >
  //               <FormControlLabel
  //                 sx={{
  //                   margin: '0',
  //                   marginTop: '20px',
  //                   alignItems: 'flex-start',
  //                   '& .MuiFormControlLabel-label': {
  //                     letterSpacing: '-0.006em',
  //                     lineHeight: '1.25rem',
  //                   },
  //                 }}
  //                 control={
  //                   <Checkbox
  //                     size="small"
  //                     checked={optIn}
  //                     onChange={handleOptIn}
  //                     sx={{
  //                       padding: 0,
  //                       color: '#1B1B1B',
  //                       marginRight: '16px',
  //                     }}
  //                   />
  //                 }
  //                 label="By proceeding, you confirm you’re aware that Compound GLP-1 is not included in the price of the membership."
  //               />
  //             </Box>
  //           ) : null}
  //           {error ? <ErrorMessage>{error}</ErrorMessage> : null}
  //           {medicationName.toLowerCase().includes('semaglutide') &&
  //           !Router.asPath.includes('refill') ? (
  //             <LoadingButton
  //               loading={klarnaLoading}
  //               disabled={klarnaLoading}
  //               onClick={() => {
  //                 handleKlarnaSelection();
  //               }}
  //               sx={{
  //                 backgroundColor: '#ffffff',
  //                 color: '#000000',
  //                 marginBottom: 2,
  //                 width: '100%',
  //               }}
  //             >
  //               <Typography fontWeight={700}>Pay with</Typography>
  //               <Image
  //                 alt="klarna-badge"
  //                 src={klarnaBadge}
  //                 width={100}
  //                 style={{
  //                   height: 'auto',
  //                   maxWidth: '100%',
  //                   objectFit: 'contain',
  //                 }}
  //               />
  //             </LoadingButton>
  //           ) : null}
  //           <LoadingButton
  //             sx={{ width: '100%', margin: '0.5rem 0' }}
  //             loading={loading}
  //             disabled={loading}
  //             onClick={handleSubmit}
  //           >
  //             {!['IN', 'MN'].includes(patientInfo?.region || '') &&
  //             medications?.[0]?.price !== 297 &&
  //             medications?.[0]?.price !== 449 &&
  //             medications?.[0]?.price !== 249
  //               ? 'Pay $0 today'
  //               : `Confirm order - ${
  //                   !existingBulkSubscription ||
  //                   weightLossSubscription?.status === 'canceled' ||
  //                   isBundled
  //                     ? `$${price} due today`
  //                     : '$0 due today'
  //                 }`}
  //           </LoadingButton>
  //           {['IN', 'MN'].includes(patientInfo?.region || '') &&
  //           isPrePayVariant ? (
  //             <Stack gap={2}>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic' }}
  //               >
  //                 {`*You will be charged $${
  //                   discountApplied
  //                     ? wholeOrFloat(
  //                         controlTotal3Months *
  //                           (1 - couponToDiscountAmount[discountApplied])
  //                       )
  //                     : controlTotal3Months
  //                 } if you are prescribed
  //                 compounded ${medications?.[0]?.name}.`}
  //               </Typography>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic' }}
  //               >
  //                 {` This includes the next 2
  //                 months of your membership and the total cost of the 3 month
  //                 supply of medication. This is what Zealthy expects to last 3
  //                 month, your provider may recommend a different dosage amount,
  //                 which would change the price.`}
  //               </Typography>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic' }}
  //               >
  //                 {`You will not be responsible for any portion of this amount if
  //                 you are not prescribed.`}
  //               </Typography>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic' }}
  //               >
  //                 {`However, if prescribed, the charge for your medication will
  //                 not be eligible for a refund, since we send it directly to the
  //                 pharmacy to begin the packaging and shipping process.`}
  //               </Typography>
  //             </Stack>
  //           ) : semaglutideBundled ||
  //             tirzepatideBundled ||
  //             oralSemaglutideBundled ? (
  //             <Typography
  //               variant="subtitle2"
  //               fontSize="0.75rem !important"
  //               sx={{ fontStyle: 'italic', marginTop: '0.5rem' }}
  //             >
  //               {!Router.asPath.includes('refill')
  //                 ? `*This is what Zealthy expects to last 3 months. If you are determined not to be eligible by your provider, you will be able to get a refund. If you choose to pay with Klarna, you can split this purchase into equal installments of $${Math.round(
  //                     price / 7
  //                   )}-$${Math.round(
  //                     price / 4
  //                   )} typically paid monthly, which you will pay across equal installments every 30 days or every 2 weeks until you have paid the $${price} in full. This includes the next 2 months of your membership and the total cost of the 3 month supply of medication.`
  //                 : '*This is what Zealthy expects to last 3 months. If you are determined not to be eligible by your provider, you will be able to get a refund.'}
  //             </Typography>
  //           ) : isRecurringVariant &&
  //             !variationName3594 &&
  //             !oralSemaglutideBundled ? (
  //             <Stack gap={1.5} fontStyle="italic">
  //               <Typography variant="subtitle2" fontSize="0.75rem !important">
  //                 {`*You will be charged $${
  //                   !['IN', 'MN'].includes(patientInfo?.region || '')
  //                     ? discountApplied
  //                       ? wholeOrFloat(
  //                           prePayTotal *
  //                             (1 - couponToDiscountAmount[discountApplied])
  //                         )
  //                       : prePayTotal
  //                     : discountApplied
  //                     ? wholeOrFloat(
  //                         controlTotal3Months *
  //                           (1 - couponToDiscountAmount[discountApplied])
  //                       )
  //                     : controlTotal3Months
  //                 } if you are
  //                 prescribed compounded semaglutide. This is what Zealthy
  //                 expects to last 3 month. Your provider may recommend a
  //                 different dosage amount, which would change the price.`}
  //               </Typography>
  //               {['IN', 'MN'].includes(patientInfo?.region || '') ? (
  //                 <Typography variant="subtitle2" fontSize="0.75rem !important">
  //                   {Router.asPath.includes('/patient-portal')
  //                     ? `If prescribed, your medication subscription, which currently renews at $${controlTotal3Months} every 90 days, will be updated to the higher dosage, which means it will renew at $${controlTotal3Months} every 90 days.`
  //                     : `If prescribed, you are purchasing an automatically-renewing subscription and will be charged $${
  //                         discountApplied
  //                           ? wholeOrFloat(
  //                               controlTotal3Months *
  //                                 (1 - couponToDiscountAmount[discountApplied])
  //                             )
  //                           : controlTotal3Months
  //                       } for the first 90 days and ${controlTotal3Months} every 90 days until you cancel.`}
  //                 </Typography>
  //               ) : (
  //                 <Typography
  //                   variant="subtitle2"
  //                   fontSize="0.75rem !important"
  //                 >{`If prescribed, you are purchasing an automatically-renewing subscription and will be charged $${
  //                   discountApplied
  //                     ? wholeOrFloat(
  //                         prePayTotal *
  //                           (1 - couponToDiscountAmount[discountApplied])
  //                       )
  //                     : prePayTotal
  //                 } for the first 90 days, which is the medication portion of the charge mentioned above, and $${prePayTotal} every 90 days thereafter until you cancel.`}</Typography>
  //               )}
  //               <Typography variant="subtitle2" fontSize="0.75rem !important">
  //                 {`As part of your subscription, you will receive a 90-day supply
  //                 of the prescription product(s) prescribed to you. The
  //                 prescription product(s) associated with your subscription will
  //                 be shipped to your address every 90 days. A partner pharmacy
  //                 will refill and ship your prescription product(s) on the same
  //                 continuous basis during the subscription period. We will
  //                 notify you of any actions you need to take to ensure that the
  //                 prescription product(s) associated with your subscription
  //                 remains active. It is your responsibility to complete these
  //                 actions. Unless you have canceled, your subscription will
  //                 automatically renew even if you have not taken the required
  //                 actions to ensure that the prescription product(s) associated
  //                 with your subscription remains active.`}
  //               </Typography>
  //               <Typography variant="subtitle2" fontSize="0.75rem !important">
  //                 {`Your subscription will renew unless you cancel at least 2 days
  //                 before the next renewal date.`}
  //               </Typography>
  //               <Typography variant="subtitle2" fontSize="0.75rem !important">
  //                 {`You can view your renewal date and cancel your subscription(s)
  //                 through your account or by contacting customer support at
  //                 support@getzealthy.com. If you cancel, it will take effect at
  //                 the end of the current subscription period and, if applicable,
  //                 you will continue to get the active prescription product(s)
  //                 associated with your subscription until the end of the
  //                 subscription period.`}
  //               </Typography>
  //             </Stack>
  //           ) : !oralSemaglutideBundled ? (
  //             <>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic', marginBottom: '0.5rem' }}
  //               >{`*You will be charged an additional $${controlTotal3Months} if you are prescribed compounded ${medications?.[0]?.name}.`}</Typography>
  //               <Typography
  //                 variant="subtitle2"
  //                 fontSize="0.75rem !important"
  //                 sx={{ fontStyle: 'italic' }}
  //               >
  //                 {
  //                   'This is what Zealthy expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price.'
  //                 }
  //               </Typography>
  //             </>
  //           ) : null}
  //           {!semaglutideOralBundled ? (
  //             <Typography
  //               fontSize="0.75rem !important"
  //               fontStyle="italic"
  //               mt="1rem"
  //             >
  //               {medications?.[0]?.name.toLowerCase().includes('semaglutide')
  //                 ? `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
  //                 : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
  //             </Typography>
  //           ) : null}
  //         </Box>
  //         <PaymentEditModal
  //           onClose={handleClose}
  //           open={openPaymentModal}
  //           title="Add new payment method to order your GLP-1 medication"
  //           handlePrescriptionRequest={handlePrescriptionRequest}
  //           setOpenUpdatePayment={setOpenUpdatePayment}
  //           handlePayAllInvoices={handlePayAllInvoices}
  //         />
  //         <SubscriptionRestartModal
  //           titleOnSuccess={'Your subscription has been reactivated.'}
  //           onConfirm={handleCanceled}
  //           onClose={handleCanceledClose}
  //           title={
  //             Router.asPath.includes('/bundled')
  //               ? `Reactivate your weight loss + ${
  //                   medications?.[0]?.name?.split(' ')[0]
  //                 } membership to order medication?`
  //               : 'Reactivate your weight loss membership to order medication?'
  //           }
  //           description={[
  //             'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.',
  //             'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
  //           ]}
  //           medication={medications[0]}
  //           price={controlTotal3Months}
  //           open={openCanceled}
  //           buttonText="Yes, reactivate and order"
  //         />
  //         <SubscriptionRestartModal
  //           titleOnSuccess={'Your subscription has been reactivated.'}
  //           open={openScheduledForCancelation}
  //           title={
  //             Router.asPath.includes('/bundled')
  //               ? `Reactivate your weight loss + ${
  //                   medications?.[0]?.name?.split(' ')[0]
  //                 } membership to order medication?`
  //               : 'Reactivate your weight loss membership to order medication?'
  //           }
  //           description={[
  //             'In order to order medication, you need to have an active Weight Loss membership that is not scheduled for cancellation within the next month, since this will allow your provider to monitor your care during the entire period of taking your medication.',
  //             'Once you confirm below, your Zealthy Weight Loss subscription will no longer be scheduled for cancellation. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
  //           ]}
  //           medication={medications[0]}
  //           price={controlTotal3Months}
  //           onConfirm={handleScheduledForCancelation}
  //           onClose={handleScheduledForCancelationClose}
  //           buttonText="Yes, reactivate and order"
  //         />
  //         <BasicModal isOpen={openUpdatePayment} useMobileStyle={false}>
  //           <Typography variant="h3" textAlign="center">
  //             You must add updated payment information to submit your GLP-1
  //             medication order.
  //           </Typography>
  //           <Typography textAlign="center">
  //             In order to order medication, you need to have valid payment
  //             information.
  //           </Typography>
  //           <Typography textAlign="center">
  //             You will only pay for medication if prescribed.
  //           </Typography>
  //           <Stack gap="10px">
  //             <LoadingButton
  //               size="small"
  //               onClick={() => {
  //                 setOpenPaymentModal(true);
  //               }}
  //             >
  //               Update payment and continue
  //             </LoadingButton>
  //             <Button
  //               size="small"
  //               variant="outlined"
  //               onClick={() => history.back()}
  //             >
  //               Cancel
  //             </Button>
  //           </Stack>
  //         </BasicModal>
  //         <MedicareAttestationModal
  //           open={openMeidcareAttestationModal}
  //           submitRequest={handlePrescriptionRequest}
  //         />
  //       </>
  //     )}
  //     {page === 'delivery-address' && (
  //       <>
  //         <EditDeliveryAddress goHome={() => setPage('confirm')} />
  //       </>
  //     )}
  //     {page === 'update-payment' && (
  //       <>
  //         <UpdatePayment
  //           stripeCustomerId={patientPayment?.customer_id}
  //           patientId={patientInfo?.id}
  //           goHome={() => {
  //             refetchPatientPayment();
  //             setPage('confirm');
  //           }}
  //         />
  //       </>
  //     )}
  //   </Container>
  // );
}
