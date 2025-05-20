import {
  PriorAuth,
  useAllVisiblePatientSubscription,
  useIsEligibleForZealthy10,
  useLanguage,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientCouponCodes,
  usePatientIntakes,
  usePatientOrders,
  usePatientPayment,
  usePatientPriorAuths,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  useRedeemedCouponCode,
  useVWOVariationName,
} from '@/components/hooks/data';
import {
  useApplyCouponCode,
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { usePayment } from '@/components/hooks/usePayment';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitState } from '@/components/hooks/useVisit';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useABTest } from '@/context/ABZealthyTestContext';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleQuarterlyEvent,
  prescriptionRequestedReorderQuarterlyEvent,
  weightLossDiscountCodeApplied,
} from '@/utils/freshpaint/events';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { shouldActivate6031 } from '@/utils/vwo-utils/activationCondition';
import { wholeOrFloat } from '@/utils/wholeOrFloat';
import CheckIcon from '@mui/icons-material/Check';
import { List, ListItem } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/system';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';
import { addMonths, differenceInDays, isAfter, subDays } from 'date-fns';
import DOMPurify from 'dompurify';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import Router, { useRouter } from 'next/router';
import klarnaBadge from '../../../../../../../public/images/klarna-badge.png';
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { uuid } from 'uuidv4';
import getConfig from '../../../../../../../config';
import BasicModal from '../../../../BasicModal';
import CompoundDisclaimer from '../../../../CompoundDisclaimer';
import ErrorMessage from '../../../../ErrorMessage';
import PaymentEditModal from '../../../../PaymentEditModal';
import SubscriptionRestartModal from '../../../../SubscriptionRestartModal';
import {
  EditDeliveryAddress,
  UpdatePayment,
} from '../../../../UpdatePatientInfo';
import DeliveryAddress from '../../../_utils/DeliveryAddress';
import MedicationAndDosage from '../../../_utils/MedicationAndDosage';
import MedicationAndDosageV2 from '../../../_utils/MedicationAndDosageV2';
import PaymentMethod from '../../../_utils/PaymentMethod';
import ShippingOptions from '../../../_utils/ShippingOptions';

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
  currentMonth: number | null;
}

type PatientPriorAuthStatus = Pick<
  PriorAuth,
  'prescription_request_id' | 'status' | 'created_at'
>;

export function WeightLossBulkAddOnV2({
  videoUrl,
  onNext,
  currentMonth,
}: ConfirmationProps) {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  const isMobile = useIsMobile();
  const supabase = useSupabaseClient<Database>();
  const { code, name: questionnaireName } = Router.query;
  const [error, setError] = useState('');
  const vwoClient = useVWO();
  const stripe = useStripe();
  const [failed, setFailed] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { data: patientInfo } = usePatient();
  const { data: patientOrders } = usePatientOrders();
  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
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
  const { data: patientIntakes } = usePatientIntakes();
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
  const bulkParams = searchParams?.get('checked');
  const reviewParams = searchParams?.get('review');
  const language = useLanguage();
  const ABZTest = useABTest();
  const router = useRouter();
  const isRefill = Router.asPath.includes('weight-loss-compound-refill');

  const pathname = usePathname();

  const isRequestCompound = pathname?.includes(
    'patient-portal/weight-loss-treatment'
  );
  const isPostCheckout = pathname?.includes('post-checkout');
  const isPostCheckoutOrCompoundRefill = isRequestCompound || isPostCheckout;

  const { data: variation7746_1 } = useVWOVariationName('7746');
  const { data: variation7746_2 } = useVWOVariationName('7746-2');
  const { data: variation7746_3 } = useVWOVariationName('7746-3');
  const isVariation7746_1 = variation7746_1?.variation_name === 'Variation-1';
  const isVariation7746_2 = variation7746_2?.variation_name === 'Variation-1';
  const isPatientPortal = Router.asPath.includes('patient-portal');

  const { data: isEligibleForZealthy10 } = useIsEligibleForZealthy10();

  const hasWeightLossMed = patientOrders?.some(
    order =>
      order?.prescription?.medication?.toLowerCase().includes('semaglutide') ||
      order?.prescription?.medication?.toLowerCase().includes('tirzepatide')
  );

  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );

  const uncapturedPaymentIntentId = searchParams?.get('payment_id');

  const { data: variation9502 } = useVWOVariationName('9502');

  useEffect(() => {
    if (uncapturedPaymentIntentId) {
      console.log('UNCAPTURE', uncapturedPaymentIntentId);
      setPage('responses-reviewed');
    }
  }, [uncapturedPaymentIntentId]);

  const uniqueKey = useMemo(() => uuid(), [failed]);
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

  const [isPrePayVariant, setIsPrePayVariant] = useState(true);

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
    Router.replace(Pathnames.PATIENT_PORTAL_PAYMENT_SUCCESS);
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

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null &&
    !Router.asPath.includes('weight-loss-compound-refill');

  const price = useMemo(() => {
    if (
      existingBulkSubscription &&
      weightLossSubscription?.status !== 'canceled'
    )
      return 0;
    return medicareAccess ||
      weightLossSubscription?.subscription?.name ===
        'Zealthy Weight Loss Access'
      ? 126
      : hasMultiMonthWeightLoss
      ? 0
      : semaglutideBundled
      ? 446
      : tirzepatideBundled
      ? 718
      : 216;
  }, [
    weightLossSubscription,
    existingBulkSubscription,
    medicareAccess,
    semaglutideBundled,
    tirzepatideBundled,
    hasMultiMonthWeightLoss,
  ]);

  const controlTotal3Months = medications?.[0]?.price!;

  const prePayTotal = !variant6471
    ? controlTotal3Months + price + (shippingId === '2' ? 15 : 0)
    : controlTotal3Months + price + (shippingId === '2' ? 15 : 0) + 49;

  const shouldDisplayPrepay = controlTotal3Months !== prePayTotal;
  const months: number = 2;

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

  const medPrice = medications[0].price;
  console.log(medPrice, 'medPrice');
  console.log(medications[0], 'medications');

  const { data: variation5476, isLoading: isLoading5476 } =
    useVWOVariationName('5476');
  // we use `vwoClient.getVariationName` to ensure that getting the variation
  // is synchronous; however, this hook doesn't filter out users who were not
  // activated into the test, so we have to filter these users out with `shouldActivate6031`
  const isVariation6031Variation1 =
    shouldActivate6031({
      patientRegion: patientInfo?.region!,
      careOption: specificCare,
      insuranceOption: potentialInsurance,
    }) &&
    vwoClient.getVariationName('6031', String(patientInfo?.id)) ===
      'Variation-1';

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
            '6623',
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
            '5053',
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
          vwoClient?.track('7743', 'bundled3MonthUpsell', patientInfo),
          vwoClient?.track('7930', 'bundled3MonthUpsell', patientInfo),
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
            patient?.profile_id!,
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
            '8201',
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
            '7935',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track(
            '8685',
            '3MonthPrescriptionRequestSubmitted',
            patientInfo
          ),
          vwoClient?.track('9363', '3MonthCompoundGlp-1PaidFor', patientInfo),
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
          vwoClient?.track('9502', '3MonthCompoundGlp-1PaidFor', patientInfo),
        ]);
      }

      if (code) {
        if (typeof code !== 'string') {
          return;
        }
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

      if (existingBulkSubscription) {
        const price =
          (medications?.[0]?.discounted_price as number) * 3 ||
          medications?.[0]?.price ||
          0;
        const medicationRequest = {
          patient_id: patientInfo?.id,
          region: patientInfo?.region,
          medication_quantity_id: medications?.[0].medication_quantity_id,
          status: 'REQUESTED',
          note: isBundled
            ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
            : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
          specific_medication: medications?.[0]?.name,
          total_price: price + (shippingId === '2' ? 15 : 0),
          shipping_method: parseInt(shippingId, 10),
          care_team: patientCareTeam?.map((e: any) => e.clinician_id),
          matrix_id: medications[0].matrixId,
        };

        const prescriptionRequest = await supabase
          .from('prescription_request')
          .insert(medicationRequest)
          .select()
          .maybeSingle();

        if (prescriptionRequest.data && patientInfo) {
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
          onBack();
        } else {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
        }
      } else {
        let applyCredit;

        //check that this is falsy. default to true?

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
            coupon_code: discountApplied || null,
            number_of_month_requested: 3,
            is_bundled: isBundled,
            type:
              medicationSelected === 'Oral Semaglutide'
                ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
            matrix_id: medications[0].matrixId,
          };

          const foundPR = patientPrescriptionRequests?.find(
            (p: { medication_quantity_id: number | null | undefined }) =>
              p.medication_quantity_id ===
              medicationRequest.medication_quantity_id
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
          console.log(prescriptionRequest, 'prfin123');
          if (discountApplied) {
            weightLossDiscountCodeApplied(
              patientInfo?.profiles?.id!,
              patientInfo?.profiles?.email!
            );
          }

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
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: price + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
        coupon_code: discountApplied || null,
        number_of_month_requested: 3,
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

    const metadata = {
      zealthy_medication_name: isBundled
        ? `${medications?.[0]?.name} Bundled`
        : `${medications?.[0]?.name} compound 3 months`,
      zealthy_care: 'Weight loss',
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `weight-loss-bulk`,
      zealthy_patient_id: patientInfo.id,
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

    if (price > 0) {
      const { data, error } = await createInvoicePayment(
        patientInfo.id,
        price * 100,
        metadata,
        price === 216
          ? '2 Months Weight Loss Membership'
          : price === 446
          ? '2 Months Weight Loss Semaglutide Membership'
          : price === 718
          ? '2 Months Weight Loss Tirzepatide Membership'
          : '2 Months Weight Loss Membership',
        isBundled ? false : isPrePayVariant ? true : false,
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
      onSuccess(newSubscription);
    }
    refetch();
    return;
  };

  const handleKlarnaSelection = async () => {
    setPaymentSelection('klarna');
  };

  const createDraftInvoicePayment = async () => {
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;
    try {
      const response = await axios.post(
        '/api/service/payment/create-invoice-payment',
        {
          patientId: patient?.id,
          amount: Math.round(216.0 * 100),
          metadata: metaData,
          description: '2 Months Weight Loss Membership',
          doNotCharge: true,
          idempotencyKey: null,
        }
      );
      console.log({ response });
    } catch (err) {
      console.error('there was an error');
    }
  };

  const handleSubmit = () => {
    window.VWO?.event('purchase_upsell_weight_loss_bulk');
    setLoading(true);

    if (is2PADenied) {
      window.freshpaint?.track('two-pa-denials-ordered');
      console.log('fresh paint event fired two-pa-denials-ordered');
    }

    if (optIn && !isBundled) {
      createDraftInvoicePayment();
    }

    if (!optIn && !semaglutideBundled && !tirzepatideBundled && !variant6471) {
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
        /Your (\d+)% discount for 3 months of/g,
        'Tu descuento del $1% por 3 meses de'
      )
      .replace('Your discount for 3 months of', 'Tu descuento por 3 meses de')
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

  const generateHeaderTextBasedOnActiveVariants = useMemo(() => {
    if (variation9502?.variation_name === 'Variation-2') {
      return '';
    }
    const medicationName = medications?.[0]?.name;
    const isMedOneOfSemaglutideOrTirzepatide = [
      'semaglutide',
      'tirzepatide',
    ].some(medName => medicationName.toLowerCase().includes(medName));
    const isSemaglutide = medicationName.toLowerCase().includes('semaglutide');
    const isTirzepatide = medicationName.toLowerCase().includes('tirzepatide');
    const isOralSemaglutide =
      medicationSelected?.toLowerCase().includes('oral semaglutide') ?? false;
    let outputText = '';

    if (isVariation6031Variation1 && isMedOneOfSemaglutideOrTirzepatide) {
      outputText += isSemaglutide ? '15%' : isTirzepatide ? '20%' : '';
      outputText += ' of your body weight loss, within reach! ';
    }

    outputText += `Your ${
      isVariation6031Variation1 ? '20% ' : ''
    }discount for 3 months of `;

    if (isVariation6031Variation1) {
      if (isSemaglutide) {
        outputText += 'Semaglutide ';
      } else if (isTirzepatide) {
        outputText += 'Tirzepatide ';
      }
    } else {
      outputText += `${medicationName} `;
    }

    if (existingBulkSubscription) {
      outputText += `and the next ${months} months of your membership `;
    }

    if (semaglutideBundled || tirzepatideBundled || isOralSemaglutide) {
      outputText += '+ medical care ';
    }

    outputText += 'has been applied. ';

    if (isPrePayVariant) {
      outputText += `You won't be charged `;
      outputText += `${
        isVariation6031Variation1 ? 'until ' : 'for either unless '
      }`;
      outputText += `your provider approves your Rx`;
      outputText += `${
        isVariation6031Variation1
          ? ''
          : " request & we're ready to ship it to you"
      }.`;
    } else if (semaglutideBundled || tirzepatideBundled || isOralSemaglutide) {
      outputText +=
        'If you are not eligible for medication, you will be refunded.';
    } else {
      outputText +=
        "You won't be charged for medication unless your provider approves your Rx request.";
    }

    return language === 'esp'
      ? getSpanishText(outputText, medicationName)
      : outputText;
  }, [medications, language]);

  const listItems =
    semaglutideBundled || tirzepatideBundled
      ? [
          {
            title: 'Provider review: ',
            body: `It generally takes 1-3 business days for your ${siteName} provider to review your responses and refill your medication. If your Rx is refilled, you will receive your fill shipped to your home. Your Rx is included in your membership.`,
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
            body: `It generally takes 1-3 business days for your ${siteName} provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.`,
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
            body: `It generally takes 1-3 business days for your ${siteName} provider to review your responses and refill your medication. If your Rx is refilled, it will be sent to your local pharmacy listed in your profile.`,
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
  let responsesReviewedDescription = `Your ${siteName} Provider may reach out to you if they have any additional questions. Here's what's next:`;
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
  let payZeroTodayText = 'Pay $0 today';
  let confirmOrderText = 'Confirm order';
  let onlyPayIfPrescribedText = 'Only pay if prescribed';
  let onlyPayIfPrescribed6471Text = 'Only pay if prescribed*';
  let monthSupplyText = '3 month supply';
  let onlyDueIfPrescribedText = '(Only due if prescribed*)';
  let prepayMembershipText = 'Pre-pay next {0} months of membership';
  let totalIfPrescribedText = 'Total if prescribed';
  let medicationSupplyText = '{0} 3 month supply';
  let addNewPaymentMethodText =
    'Add new payment method to order your GLP-1 medication';
  let subscriptionReactivatedText = 'Your subscription has been reactivated.';
  let reactivateWeightLossMembershipText =
    'Reactivate your weight loss membership to order medication?';
  let reactivateWeightLossBundledMembershipText =
    'Reactivate your weight loss + {0} membership to order medication?';
  let reactivateMembershipDescriptionPart1 =
    'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.';
  let reactivateMembershipDescriptionPart2 = `Once you confirm below, your ${siteName} Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.`;
  let reactivateButtonText = 'Yes, reactivate and order';
  let updatePaymentTitleText =
    'You must add updated payment information to submit your GLP-1 medication order.';
  let updatePaymentDescriptionText =
    'In order to order medication, you need to have valid payment information.';
  let updatePaymentNoteText = 'You will only pay for medication if prescribed.';
  let updatePaymentButtonText = 'Update payment and continue';
  let cancelButtonText = 'Cancel';
  let chargedIfPrescribedText = `*You will be charged $\{0} if you are prescribed compounded {1}. This includes the next 2 months of your membership and the total cost of the 3 month supply of medication. This is what ${siteName} expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.`;
  let chargedIfPrescribedText6623 = `*You will be charged $\{0} if you are prescribed compounded {1}; however, if you choose to pay with Klarna, you can split this into equal installments of $\{3}-$\{2} typically paid monthly, which you will only begin to pay if you are prescribed compounded {5} and you will pay across equal installments every 30 days or every 2 weeks until you have paid the $\{4} in full. This includes the next 2 months of your membership and the total cost of the 3 month supply of medication. This is what ${siteName} expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.`;
  let chargedIfPrescribedText6471 = `*You will not be charged initially but, if prescribed, will be charged the $39 you already consented to for your discounted first month of membership, including medical care, coaching, and more, and $\{0} for compounded {1} including shipping and all materials needed (only if prescribed). This includes the next 2 months of your membership and the total cost of the 3 month supply of medication. This is what ${siteName} expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.`;
  let semaglutideStudyReferenceText =
    '**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”';
  let tirzepatideStudyReferenceText =
    '**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”';

  if (language === 'esp') {
    responsesReviewedTitle = '¡Tus respuestas están siendo revisadas!';
    responsesReviewedDescription = `Tu proveedor de ${siteName} puede contactarte si tiene alguna pregunta adicional. Esto es lo que sigue:`;
    continueButtonText = 'Continuar';
    payTodayText = 'A pagar hoy';
    applyDiscountCodeText = 'Aplicar código de descuento';
    enterCodeText = 'Ingresar código';
    applyButtonText = 'Aplicar';
    additionalDiscountText =
      '10% de descuento adicional (sobre el 20% de descuento)';
    compoundDisclosureText =
      'Al continuar, confirmas que eres consciente de que el GLP-1 compuesto no está incluido en el precio de la membresía.';
    payZeroTodayText = 'Pagar $0 hoy';
    confirmOrderText = 'Confirmar pedido';
    onlyPayIfPrescribedText = 'Solo paga si se receta';
    monthSupplyText = 'suministro de 3 meses';
    onlyDueIfPrescribedText = '(Solo si se receta*)';
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
    reactivateMembershipDescriptionPart2 = `Una vez que confirme a continuación, su suscripción de Pérdida de Peso de ${siteName} se volverá activa nuevamente. Esto le permitirá recibir atención, incluyendo medicamentos GLP-1 si es apropiado para la pérdida de peso, obtener acceso continuo a nuestro equipo de coordinación para ayudar a hacer los medicamentos más asequibles, y comenzar a trabajar con su entrenador nuevamente.`;
    reactivateButtonText = 'Sí, reactivar y pedir';
    updatePaymentTitleText =
      'Debe agregar información de pago actualizada para enviar su pedido de medicamento GLP-1.';
    updatePaymentDescriptionText =
      'Para pedir medicamento, necesita tener información de pago válida.';
    updatePaymentNoteText = 'Solo pagará por el medicamento si se le receta.';
    updatePaymentButtonText = 'Actualizar pago y continuar';
    cancelButtonText = 'Cancelar';
    chargedIfPrescribedText = `*Se le cobrará $\{0} si se le receta {1} compuesto. Esto incluye los próximos 2 meses de su membresía y el costo total del suministro de medicamento para 3 meses. Esto es lo que ${siteName} espera que dure 3 meses. Su proveedor puede recomendar una cantidad de dosis diferente, lo que cambiaría el precio. No será responsable de ninguna parte de esta cantidad si no se le receta.`;
    semaglutideStudyReferenceText =
      '**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad".';
    tirzepatideStudyReferenceText =
      '**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad".';
  }

  const weightLossPercentageText = useMemo(() => {
    console.log('medicationSelected', medicationSelected);
    if (medicationSelected?.toLowerCase().includes('semaglutide')) {
      if (!isRefill && !isPatientPortal) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 6.9% of their body weight in their first 3 months with semaglutide**';
        } else {
          return 'On average, people lose 2.3% of their weight after 1 month on Semaglutide**';
        }
      }

      if (!isRefill && isPatientPortal && isVariation7746_2) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 6.9% of their body weight in their first 3 months with semaglutide**';
        } else {
          return 'On average, people lose 2.3% of their weight after 1 month on Semaglutide**';
        }
      }

      if (isRefill) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 5% of their body weight in their first 3 months with semaglutide**';
        } else {
          return 'On average, people lose 2.3% of their weight after 1 month on Semaglutide**';
        }
      }

      if (isRefill) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 5% of their body weight in their first 3 months with semaglutide**';
        } else {
          return 'On average, people lose 2% of their weight after 1 month on Semaglutide**';
        }
      }

      if (isPatientPortal) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 7% of their body weight in their first 3 months with semaglutide**';
        } else {
          return 'On average, people lose 2% of their weight after 1 month on Semaglutide**';
        }
      }

      if (bulkParams === 'bulk') {
        return 'On average, people lose 7% of their body weight in their first 3 months with semaglutide**';
      } else {
        return 'On average, people lose 2% of their weight after 1 month on Semaglutide**';
      }
    } else {
      if (!isRefill && !isPatientPortal) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 8% of their body weight in their first 3 months with Tirzepatide**';
        } else {
          return 'On average, people lose 2.7% of their weight after 1 month on Tirzepatide**';
        }
      }

      if (!isRefill && isPatientPortal && isVariation7746_2) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 8% of their body weight in their first 3 months with Tirzepatide**';
        } else {
          return 'On average, people lose 2.7% of their weight after 1 month on Tirzepatide**';
        }
      }

      if (isRefill) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 7% of their body weight in their first 3 months with Tirzepatide**';
        } else {
          return 'On average, people lose 2.3% of their weight after 1 month on Tirzepatide**';
        }
      }

      if (isRefill) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 7% of their body weight in their first 3 months with Tirzepatide**';
        } else {
          return 'On average, people lose 3% of their weight after 1 month on Tirzepatide**';
        }
      }

      if (isPatientPortal) {
        if (bulkParams === 'bulk') {
          return 'On average, people lose 8% of their body weight in their first 3 months with Tirzepatide**';
        } else {
          return 'On average, people lose 3% of their weight after 1 month on Tirzepatide**';
        }
      }

      if (bulkParams === 'bulk') {
        return 'On average, people lose 8% of their body weight in their first 3 months with Tirzepatide**';
      } else {
        return 'On average, people lose 3% of their weight after 1 month on Tirzepatide**';
      }
    }
  }, [
    bulkParams,
    isPatientPortal,
    isRefill,
    isVariation7746_1,
    isVariation7746_2,
    medicationSelected,
  ]);

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
            {generateHeaderTextBasedOnActiveVariants}
          </Typography>
          <Stack width="100%" alignItems="flex-start" gap="16px">
            {isLoading5476
              ? null
              : isReadyToRender &&
                (isVariation5476Ready ? (
                  variation5476?.variation_name === 'Variation-1' ? (
                    <MedicationAndDosageV2 medication={medications[0]} isBulk />
                  ) : (
                    <MedicationAndDosage
                      videoUrl={videoUrl}
                      medication={medications[0]}
                      isBulk
                    />
                  )
                ) : (
                  <MedicationAndDosage
                    videoUrl={videoUrl}
                    medication={medications[0]}
                    isBulk
                  />
                ))}
            <Stack padding={'0 16px'} gap="16px">
              <DeliveryAddress onChange={() => setPage('delivery-address')} />
              <ShippingOptions selected={shippingId} onSelect={handleChange} />
              <PaymentMethod onChange={handleOpen} />
              <Divider sx={{ width: '100%' }}>
                {!variant6471
                  ? onlyPayIfPrescribedText
                  : onlyPayIfPrescribed6471Text}
              </Divider>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography>
                  {medicationSupplyText.replace('{0}', medicationName)}
                </Typography>
                <Typography textAlign="right" width="120px">
                  {controlTotal3Months === 0
                    ? `$${medPrice}`
                    : `$${controlTotal3Months}`}
                  {variant6471 ? null : (
                    <span
                      style={{
                        fontStyle: 'italic',
                      }}
                    >
                      {onlyDueIfPrescribedText}
                    </span>
                  )}
                </Typography>
              </Stack>
              {!hasMultiMonthWeightLoss && shouldDisplayPrepay ? (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography>
                    {prepayMembershipText.replace('{0}', String(months))}
                  </Typography>
                  <Typography textAlign="right" width="120px">
                    {`$216 `}
                    {variant6471 ? null : (
                      <span
                        style={{
                          fontStyle: 'italic',
                        }}
                      >
                        {onlyDueIfPrescribedText}
                      </span>
                    )}
                  </Typography>
                </Stack>
              ) : null}
              {variant6471 && shouldDisplayPrepay ? (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography>{`First month membership`}</Typography>
                  <Typography textAlign="right" width="120px">
                    {`$39 `}
                  </Typography>
                </Stack>
              ) : null}
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography>{totalIfPrescribedText}</Typography>
                {medPrice && controlTotal3Months === 0 ? (
                  <Typography>{`$${medPrice + 216}`}</Typography>
                ) : !discountApplied ? (
                  <Typography>{`$${prePayTotal}`}</Typography>
                ) : null}
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
                ) : null}
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
                {currentMonth && medications?.[0]?.name ? (
                  <CompoundDisclaimer
                    medication={medications?.[0]?.name}
                    currentMonth={currentMonth}
                    styles={{
                      color: ['Zealthy', 'FitRx'].includes(siteName ?? '')
                        ? '#008A2E'
                        : theme.palette.primary.light,
                    }}
                  />
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
                  sx={{
                    color: ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#008A2E'
                      : theme.palette.primary.light,
                  }}
                >
                  {weightLossPercentageText}
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
              {!variant6471 ? (
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
              ) : null}
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
                {medications?.[0]?.price !== 297 &&
                medications?.[0]?.price !== 449
                  ? payZeroTodayText
                  : `${confirmOrderText} - ${
                      !existingBulkSubscription ||
                      weightLossSubscription?.status === 'canceled'
                        ? `$${price}.00`
                        : language === 'esp'
                        ? '$0 a pagar hoy'
                        : '$0 due today'
                    }`}
              </LoadingButton>
              <Stack gap={1.5} fontStyle="italic" textAlign="left">
                <Typography variant="subtitle2" fontSize="0.75rem !important">
                  {`${chargedIfPrescribedText6623
                    .replace(
                      '{0}',
                      String(
                        medications?.[0].currMonth === 1 &&
                          bulkParams === 'bulk' &&
                          reviewParams === 'true' &&
                          discountApplied
                          ? wholeOrFloat(
                              (1 - couponToDiscountAmount[discountApplied]) *
                                prePayTotal
                            )
                          : prePayTotal
                      )
                    )
                    .replace(
                      '{1}',
                      medications?.[0]?.name
                        .toLowerCase()
                        .split(' ')
                        .slice(0, 1)
                        .join(' ')
                    )
                    .replace(
                      '{2}',
                      String(
                        Math.round(
                          ((medications?.[0]?.currMonth === 1 &&
                          bulkParams === 'bulk' &&
                          reviewParams === 'true' &&
                          discountApplied
                            ? wholeOrFloat(
                                (1 - couponToDiscountAmount[discountApplied]) *
                                  prePayTotal
                              )
                            : prePayTotal) as number) / 4
                        )
                      )
                    )
                    .replace(
                      '{3}',
                      String(
                        Math.round(
                          ((medications?.[0]?.currMonth === 1 &&
                          bulkParams === 'bulk' &&
                          reviewParams === 'true' &&
                          discountApplied
                            ? wholeOrFloat(
                                (1 - couponToDiscountAmount[discountApplied]) *
                                  prePayTotal
                              )
                            : prePayTotal) as number) / 7
                        )
                      )
                    )
                    .replace(
                      '{4}',
                      String(
                        medications?.[0].currMonth === 1 &&
                          bulkParams === 'bulk' &&
                          reviewParams === 'true' &&
                          discountApplied
                          ? wholeOrFloat(
                              (1 - couponToDiscountAmount[discountApplied]) *
                                prePayTotal
                            )
                          : prePayTotal
                      )
                    )
                    .replace(
                      '{5}',
                      medications?.[0]?.name
                        .toLowerCase()
                        .split(' ')
                        .slice(0, 1)
                        .join(' ')
                    )}`}
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
            price={controlTotal3Months}
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
            price={controlTotal3Months}
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
