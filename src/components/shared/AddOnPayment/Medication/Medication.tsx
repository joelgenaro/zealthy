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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { EditDeliveryAddress } from '../../UpdatePatientInfo';
import { useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import {
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  usePatientPriorAuths,
  usePatientUnpaidInvoices,
  usePreIntakePrescriptionRequest,
  useRedeemedCouponCode,
  usePatientOrders,
  useVWOVariationName,
  useWeightLossSubscription,
  PriorAuth,
  useActiveWeightLossSubscription,
  useAllVisiblePatientSubscription,
  useLanguage,
  useIsEligibleForZealthy10,
  usePatientPrescriptions,
} from '@/components/hooks/data';
import { toast } from 'react-hot-toast';
import PaymentEditModal from '../../PaymentEditModal';
import PatientPaymentMethod from '../../PatientPaymentMethod';
import SubscriptionRestartModal from '../../SubscriptionRestartModal';
import {
  useApplyCouponCode,
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleMonthlyEvent,
  prescriptionRequestedReorderMonthlyEvent,
  purchasedSemaglutideColoradoEvent,
  purchasedTirzepatideColoradoEvent,
  weightLossDiscountCodeApplied,
} from '@/utils/freshpaint/events';
import ErrorMessage from '../../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import BasicModal from '../../BasicModal';
import axios from 'axios';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import MedicareAttestationModal from '@/components/screens/PatientPortal/components/MedicareAttestationModal';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import { useVWO } from '@/context/VWOContext';
import PaymentPageBanner from '../../PaymentPageBanner';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { subDays, isAfter } from 'date-fns';
import { wholeOrFloat } from '@/utils/wholeOrFloat';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import DOMPurify from 'dompurify';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePathname, useSearchParams } from 'next/navigation';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useABTest } from '@/context/ABZealthyTestContext';
import getConfig from '../../../../../config';
import { useTheme } from '@mui/system';
import Router, { useRouter } from 'next/router';

interface ConfirmationProps {
  videoUrl?: string;
  onNext?: () => void;
  isAdjustment?: boolean;
  isRefill?: boolean;
}

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Insert'];

export default function MedicationAddOn({
  videoUrl,
  onNext,
  isAdjustment = false,
}: ConfirmationProps) {
  const vwoClient = useVWO();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { code, name: questionnaireName } = Router.query;
  const { specificCare, potentialInsurance } = useIntakeState();
  const [openCanceled, setOpenCanceled] = useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const [page, setPage] = useState<string>('confirm');
  const [open, setOpen] = useState(false);
  const { data: patientOrders } = usePatientOrders();
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState('');
  const [openMeidcareAttestationModal, setOpenMedicareAttestationModal] =
    useState(false);
  const { data: patientCareTeam } = usePatientCareTeam();
  const { data: patientInfo } = usePatient();
  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: weightLossSubscription, refetch } = useWeightLossSubscription();
  const { data: activeWeightLossSubscription } =
    useActiveWeightLossSubscription();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const { data: patientSubscriptions, refetch: refetchPatientSubscriptions } =
    useAllVisiblePatientSubscription();
  const language = useLanguage();
  const { data: patientPriorAuth } = usePatientPriorAuths();
  const renewSubscription = useRenewSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const { data: unpaidInvoices } = usePatientUnpaidInvoices();
  const { data: patientPaymentProfile } = usePatientPayment();
  const { data: redeemedCouponCodes, isLoading: redeemedCouponCodesLoading } =
    useRedeemedCouponCode();
  const compoundPatientPrescriptions = usePatientPrescriptions().data?.filter(
    presc => presc.medication_quantity_id === 98
  );
  const { updateActionItem } = useMutatePatientActionItems();
  const { medications } = useVisitState();
  const [loading, setLoading] = useState<boolean>(false);
  const { data: variation7746_1 } = useVWOVariationName('7746');
  const { data: variation7746_2 } = useVWOVariationName('7746-2');
  const { data: variation7746_3 } = useVWOVariationName('7746-3');

  const isVariation7746_1 = variation7746_1?.variation_name === 'Variation-1';
  const isVariation7746_2 = variation7746_2?.variation_name === 'Variation-1';
  const isVariation7746_3 = variation7746_3?.variation_name === 'Variation-1';

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  const [shippingId, setShippingId] = useState<string>('1');
  const [couponCode, setCouponCode] = useState<string>('');
  const [isDiscountAvailable, setIsDiscountAvailable] =
    useState<boolean>(false);
  const [discountApplied, setDiscountApplied] = useState<string>('');
  const [variationName3542, setVariationName3542] =
    useState<string>('Variation-1');
  const [variationName3780, setVariationName3780] = useState<string>('');
  const [variationName3594, setVariationName3594] = useState<string>('');
  const [variationName3452, setVariationName3452] = useState<string>('');
  const [variationName3722, setVariationName3722] = useState<string>('');
  const [variationName4318, setVariationName4318] = useState<string>('');
  const { data: variation75801 } = useVWOVariationName('75801');
  const { data: variation4798 } = useVWOVariationName('4798');
  const { data: variation9502 } = useVWOVariationName('9502');
  const { data: isEligibleForZealthy10 } = useIsEligibleForZealthy10();
  const ABZTest = useABTest();
  const { data: patient } = usePatient();
  const pathname = usePathname();

  const isCompoundRefill = router.asPath?.includes(
    'weight-loss-compound-refill'
  );
  const isRequestCompound = router.asPath?.includes(
    'patient-portal/weight-loss-treatment'
  );
  const isPostCheckout = pathname?.includes('post-checkout');
  const isPostCheckoutOrCompoundRefill = isPostCheckout || isRequestCompound;

  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (Router.pathname.includes('/post-checkout/questionnaires-v2')) {
      setShowVideo(true);
    }
  }, [Router.pathname]);

  const isMobile = useIsMobile();
  const { variant } = useIntakeState();
  const hasCalledApi = useRef(false);

  const dose = medications?.[0]?.dose;
  const dosage = dose?.match(/(\d+(\.\d+)?)\s*mg/)?.[1] ?? null;

  const [campaignKey, setCampaignKey] = useState('');
  const { data: vwoVariationName } = useVWOVariationName(campaignKey);
  const medicationName = medicationAttributeName(medications?.[0]?.name);
  const applyCouponCode = useApplyCouponCode();
  const isPatient65OrOlder = isPatientSixtyFivePlus(
    patientInfo?.profiles?.birth_date || ''
  );
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');

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

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null &&
    !Router.asPath.includes('weight-loss-compound-refill');

  const totalDue = Math.floor(
    (medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0)
  );

  const variant6471Total =
    Math.floor((medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0)) +
    49;

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

  const medicareAccess = useSelector(store => store.coaching).find(
    c => c.name === 'Z-Plan by Zealthy Weight Loss Access Program'
  );

  const texasPromo = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy Weight Loss (Texas)'
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingId((event.target as HTMLInputElement).value);
  };
  const handleOptIn: ChangeEventHandler<HTMLInputElement> = e =>
    setOptIn(e.target.checked);

  const handlePrescriptionRequest = async () => {
    window.VWO?.event('1MonthPrescriptionRequestSubmitted');
    setLoading(true);
    const medicationRequest: PrescriptionRequest = {
      patient_id: patientInfo?.id,
      region: patientInfo?.region,
      medication_quantity_id: medications?.[0].medication_quantity_id,
      status: Router.asPath.includes('/patient-portal')
        ? 'REQUESTED'
        : 'PRE_INTAKES',
      specific_medication: medications?.[0].name,
      note:
        !isBundled && !compoundMeds.includes(medications[0].name)
          ? `${medications?.[0].name} ${
              isAdjustment
                ? `THIS IS ADJUSTMENT TO CURRENT PRESCRIPTION: New Dosage: ${medications[0].dosage}, New Quantity: ${medications[0].quantity}, Name: ${medications[0].name}, New Refill schedule: renew every ${medications[0].recurring.interval_count} ${medications[0].recurring.interval}`
                : `Weight loss brand GLP1 - NOT BUNDLED - 1 month. Dosage: ${medications[0].dosage}`
            }`
          : isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 1 month. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 1 month.  Dosage: ${medications[0].dosage}`,
      total_price:
        (medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0),
      shipping_method: parseInt(shippingId, 10),
      care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      is_adjustment: isAdjustment,
      coupon_code: discountApplied || null,
      is_bundled: isBundled && isPostCheckout,
      number_of_month_requested: 1,
      type:
        medicationSelected === 'Oral Semaglutide'
          ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
          : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      matrix_id: medications[0].matrixId,
      ...(medications[0].name === 'Oral Semaglutide' && {
        oral_matrix_id: medications[0].matrixId,
      }),
    };

    if (code) {
      if (typeof code !== 'string') {
        return;
      }

      await supabase
        .from('single_use_appointment')
        .update({ used: true })
        .eq('id', code);
    }
    if (discountApplied) {
      weightLossDiscountCodeApplied(
        patientInfo?.profiles?.id!,
        patientInfo?.profiles?.email!
      );
    }
    if (vwoClient && patientInfo?.id) {
      await Promise.allSettled([
        vwoClient?.track(
          '6465',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track('6140', '', patientInfo),
        vwoClient?.track(
          '6303',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '6822-2',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '6822-3',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3542',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5867',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3463',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3357',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3780',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5053',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3594',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '3452',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '8288',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5871_new',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        ABZTest.trackMetric(
          '5871_new',
          patient?.profile_id!,
          '1MonthPrescriptionRequestSubmitted'
        ),

        ABZTest.trackMetric(
          '6465_new',
          patient?.profile_id!,
          '1MonthPrescriptionRequestSubmitted'
        ),
        vwoClient?.track(
          '3452-2',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4295',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4287',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4666',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4289-1',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4381',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4601',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5751',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4624',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track('4381', 'prescriptionRequestSubmitted', patientInfo),

        vwoClient?.track('7458', 'prescriptionRequestSubmitted', patientInfo),
        vwoClient?.track('8078', 'prescriptionRequestSubmitted', patientInfo),

        vwoClient?.track('5053', 'prescriptionRequestSubmitted', patientInfo),
        vwoClient?.track(
          'Clone_4687',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5071',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4935',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5484',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '6826',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5829',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '6337',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '6028',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        ABZTest.trackMetric(
          '6988',
          patient?.profile_id!,
          '1MonthPrescriptionRequestSubmitted'
        ),
        vwoClient?.track(
          'Clone_6775',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          'Clone_6775_2',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '75801',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '4798',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '7895',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '7960',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '780101',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5483',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '5483',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '8201',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '7743',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '7935',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '8685',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track('9363', '1MonthGlp1MedicationPaidFor', patientInfo),
        vwoClient?.track(
          '8676',
          'bundled1MonthPrescriptionRequest',
          patientInfo
        ),
        vwoClient?.track(
          '9057_1',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '9057_2',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '9057_3',
          '1MonthPrescriptionRequestSubmitted',
          patientInfo
        ),
        vwoClient?.track(
          '9502',
          'bundled1MonthPrescriptionRequest',
          patientInfo
        ),
      ]);
    }

    if (isRecurringMedicationRefill) {
      await axios.post('/api/cancel-recurring-medication-subscription', {
        subscriptionId:
          activeRecurringMedicationSubscription?.[0]?.reference_id,
        patientId: patientInfo?.id,
      });
    }

    if (
      Router.asPath.includes('/patient-portal') ||
      Router.asPath.includes('/manage-prescriptions')
    ) {
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .insert(medicationRequest)
        .select()
        .maybeSingle();

      if (prescriptionRequest.status === 201 && prescriptionRequest?.data?.id) {
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
        toast.success(
          'Your prescription request has been successfully submitted!'
        );
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName!,
          '1-month'
        );
        if (isBundled) {
          prescriptionRequestedReorderBundleMonthlyEvent(
            patientInfo?.profiles?.email!,
            medications?.[0]?.name,
            '1 Month',
            medications?.[0]?.dosage!
          );
        }
        if (
          Router.asPath.includes('weight-loss-compound-refill') &&
          patientInfo?.region === 'CO' &&
          medications?.[0]?.name?.toLowerCase()?.includes('semaglutide')
        ) {
          purchasedSemaglutideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles?.last_name || '',
            patientInfo?.profiles?.email || ''
          );
        }
        if (
          Router.asPath.includes('weight-loss-compound-refill') &&
          patientInfo?.region === 'CO' &&
          medications?.[0]?.name?.toLowerCase()?.includes('tirzepatide')
        ) {
          purchasedTirzepatideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles?.last_name || '',
            patientInfo?.profiles?.email || ''
          );
        } else {
          if (Router.asPath.includes('weight-loss-compound-refill')) {
            prescriptionRequestedReorderMonthlyEvent(
              patientInfo?.profiles?.email!,
              medications?.[0]?.name,
              '1 Month',
              medications?.[0]?.dosage!
            );
          }
        }
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    } else {
      const foundPR = patientPrescriptionRequests?.find(
        p =>
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

      const { data, error } = await supabase
        .from('prescription_request')
        .upsert(medicationRequest)
        .select()
        .maybeSingle();

      if (!error && patientInfo) {
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName!,
          '1-month'
        );

        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    }
  };

  const onBack = () => {
    if (onNext) {
      onNext();
    } else {
      setPage('responses-reviewed');
      window.scrollTo(0, 0);
      setLoading(false);
    }
  };

  const handleCanceledClose = useCallback(() => {
    setOpenCanceled(false);
  }, []);

  const handleScheduledForCancelationClose = useCallback(() => {
    setOpenScheduledForCancelation(false);
  }, []);

  const handleScheduledForCancelation = useCallback(async () => {
    //stop cancelation
    await reactivateSubscription.mutateAsync(
      weightLossSubscription!.reference_id!
    );
    //create prescription request
    await handlePrescriptionRequest();
    refetch();
  }, [
    reactivateSubscription,
    weightLossSubscription,
    handlePrescriptionRequest,
  ]);

  const handleCanceled = useCallback(async () => {
    await renewSubscription.mutateAsync(weightLossSubscription);
    refetch();
    await handlePrescriptionRequest();
  }, [refetch, renewSubscription, weightLossSubscription]);

  const metadata = {
    zealthy_medication_name: isBundled
      ? `${medications?.[0]?.name} Bundled`
      : `${medications?.[0]?.name} compound 1 month`,
    zealthy_care: 'Weight loss',
    zealthy_subscription_id: weightLossSubscription?.subscription.id,
    reason: `weight-loss`,
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

  const is2PADenied = useMemo(() => {
    const now = new Date();
    const sixtyDaysAgo = subDays(now, 60);
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    if (patientPriorAuth) {
      const paDeniedInstances = patientPriorAuth.filter(
        (auth: PriorAuth) =>
          auth.status === 'PA Denied' &&
          isAfter(new Date(auth.created_at), sixtyDaysAgo)
      );

      const hasSamePrescriptionReqId = paDeniedInstances.some(
        (auth: PriorAuth, index: number, self: PriorAuth[]) =>
          self.some(
            (a: PriorAuth, i: number) =>
              i !== index &&
              a.prescription_request_id === auth.prescription_request_id
          )
      );

      if (hasSamePrescriptionReqId) {
        const mostRecentDenial = paDeniedInstances.reduce((latest, current) =>
          isAfter(new Date(current.created_at), new Date(latest.created_at))
            ? current
            : latest
        );

        const fifteenDaysAgo = subDays(now, 15);
        const isWithinFifteenDays = isAfter(
          new Date(mostRecentDenial.created_at),
          fifteenDaysAgo
        );

        if (isWithinFifteenDays && compoundPatientPrescriptions?.length === 0) {
          return true;
        }
      }
    }
    return false;
  }, [patientPriorAuth]);

  const handleSubmit = () => {
    if (is2PADenied) {
      window.freshpaint?.track('two-pa-denials-ordered');
      console.log('fresh paint event fired two-pa-denials-ordered');
    }

    if (
      !optIn &&
      !['IN', 'MN'].includes(patientInfo?.region ?? '') &&
      variation9502?.variation_name === 'Variation-2' &&
      !isCompoundRefill
    )
      return setError(
        'In order to proceed you will need to select the box above to confirm you have read the terms'
      );
    if (
      weightLossSubscription?.status === 'scheduled_for_cancelation' &&
      activeWeightLossSubscription?.status !== 'active'
    ) {
      return setOpenScheduledForCancelation(true);
    }

    if (
      weightLossSubscription?.status === 'canceled' &&
      activeWeightLossSubscription?.status !== 'active'
    ) {
      return setOpenCanceled(true);
    }

    if ((unpaidInvoices?.length ?? 0) > 0) {
      return setOpenUpdatePayment(true);
    }

    if (isPatient65OrOlder) {
      return setOpenMedicareAttestationModal(true);
    }

    return handlePrescriptionRequest();
  };

  const handlePayAllInvoices = async () => {
    await axios.post(`/api/stripe/utils/authorization/issued`, {
      unpaidInvoices: unpaidInvoices,
      stripeCustomerId: patientPaymentProfile?.customer_id,
    });
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

  useEffect(() => {
    const activateABTest = async () => {
      if (
        vwoClient &&
        patientInfo?.id &&
        !['TX'].includes(patientInfo?.region || '')
      ) {
        const variationName =
          (await vwoClient?.activate('3542', patientInfo)) || '';
        setVariationName3542(variationName);
      }
      if (
        vwoClient &&
        patientInfo?.id &&
        !['IN', 'MN']?.includes(patientInfo?.region || '') &&
        !Router.pathname.includes('/patient-portal')
      ) {
        setVariationName3780(
          (await vwoClient?.activate('3780', patientInfo)) || ''
        );
      }

      if (
        vwoClient &&
        patientInfo?.id &&
        !['PA', 'OH', 'MS']?.includes(patientInfo?.region || '') &&
        !Router.pathname.includes('/patient-portal')
      ) {
        setVariationName3722(
          (await vwoClient?.activate('3722', patientInfo)) || ''
        );
      }
    };
    activateABTest();
  }, [patientInfo?.id, patientInfo?.region, vwoClient, patientInfo]);

  useEffect(() => {
    if (patientInfo?.id && ['IN', 'MN'].includes(patientInfo?.region || '')) {
      setCampaignKey('3594');
    }
    if (
      patientInfo?.id &&
      !['IN', 'MN'].includes(patientInfo?.region || '') &&
      Router.pathname.includes('/patient-portal')
    ) {
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

  let responseReviewTitle = 'Your responses are being reviewed!';
  let responseReviewDescription =
    "Your Zealthy Provider may reach out to you if they have any additional questions. Here's what's next:";
  let continueButtonText = 'Continue';
  let yourMedicationText = 'Your medication';
  let duePrescribedText = 'Due If Prescribed*';
  let weeklyDosageText = 'Weekly dosage';
  let deliveryOptionsText = 'Delivery options';
  let editText = 'Edit';
  let paymentText = 'Payment';
  let applyDiscountCodeText = 'Apply discount code';
  let enterCodeText = 'Enter code';
  let applyText = 'Apply';
  let discountAppliedText = 'Discount Applied';
  let confirmOrderText = 'Confirm order - $0 due today';
  let reactivateSubscriptionTitle =
    'Reactivate your weight loss membership to order medication?';
  let reactivateSubscriptionDescription = [
    'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.',
    'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
  ];
  let reactivateButtonText = 'Yes, reactivate and order';
  let updatePaymentTitle =
    'You must add updated payment information to submit your GLP-1 medication order.';
  let updatePaymentDescription =
    'In order to order medication, you need to have valid payment information.';
  let updatePaymentNote = 'You will only pay for medication if prescribed.';
  let updatePaymentButtonText = 'Update payment and continue';
  let cancelButtonText = 'Cancel';
  let chargedIfPrescribedTextPostCheckout =
    '*You will be charged ${0} if you are prescribed compounded {1}. This should last at least a month, and will likely last longer at the typical starting dosage of {2} mg per week. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.';
  let chargedIfPrescribedTextRefill =
    '*You will be charged ${0} if you are prescribed compounded {1}. This is what Zealthy expects to last a month. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.';
  let chargedIfPrescribedText = Router.router?.asPath.includes('post-checkout')
    ? chargedIfPrescribedTextPostCheckout
    : chargedIfPrescribedTextRefill;
  let opipText =
    '*You will not be charged initially but, if prescribed, will be charged the $39 you already consented to for your discounted first month of membership, including medical care, coaching, and more, and ${0} for compounded {1} including shipping and all materials needed (only if prescribed). This is what Zealthy expects to last a month. Your provider may recommend a different dosage amount, which would change the price. You will not be responsible for any portion of this amount if you are not prescribed.';
  let medicationAddedText =
    "{0} has been added to your cart. You won't be charged unless your provider approves your Rx request.";
  let medicationAddedBundledText =
    '{0} has been added. You will not pay unless you expedite shipping since you are on the doctor + {1} plan, and the Rx is included in your membership.';
  let monthSupplyText = '1 month supply';
  let refillEveryText = 'Refill every {0}';
  let deliveryAddressText = 'Delivery address';
  let unitedStatesText = 'United States';
  let upsMailInnovationsText = 'UPS Mail Innovations - $0';
  let upsNextDayAirSaverText = 'UPS Next Day Air Saver - $15';
  let usuallyArrivesInText = 'Usually arrives in {0} days';
  let weightLossAverageText =
    'On average, people lose {0}% of their weight after 1 month on {1}.**';
  let compoundGLP1ConfirmationText =
    "By proceeding, you confirm you're aware that Compound GLP-1 is not included in the price of the membership.";
  let studyReferenceTextSemaglutide =
    '**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”';
  let studyReferenceTextTirzepatide =
    '**This is based on data from a 2022 study published in the New England Journal of Medicine titled "Tirzepatide Once Weekly for the Treatment of Obesity."';
  let addNewPaymentMethodText =
    'Add new payment method to order your GLP-1 medication';
  let watchVideo = ' Watch this video. ';
  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director?`;

  if (language === 'esp') {
    watchVideo = ' Mira este video. ';
    videoText = `¿Quieres aprender más sobre semaglutida y tirzepatida en ${siteName} de parte de nuestro Director Médico?`;
    responseReviewTitle = '¡Sus respuestas están siendo revisadas!';
    responseReviewDescription =
      'Su proveedor de Zealthy puede comunicarse con usted si tiene alguna pregunta adicional. Esto es lo que sigue:';
    continueButtonText = 'Continuar';
    yourMedicationText = 'Su medicamento';
    duePrescribedText = 'A pagar si se receta*';
    weeklyDosageText = 'Dosis semanal';
    deliveryOptionsText = 'Opciones de envío';
    editText = 'Editar';
    paymentText = 'Pago';
    applyDiscountCodeText = 'Aplicar código de descuento';
    enterCodeText = 'Ingresar código';
    applyText = 'Aplicar';
    discountAppliedText = 'Descuento Aplicado';
    confirmOrderText = 'Confirmar pedido - $0 a pagar hoy';
    reactivateSubscriptionTitle =
      '¿Reactivar su membresía de pérdida de peso para pedir medicamentos?';
    reactivateSubscriptionDescription = [
      'Para pedir medicamentos, necesita tener una membresía activa de Pérdida de Peso, que cubre el desarrollo de su plan de tratamiento por parte de su proveedor y asegura que esté recibiendo atención de alta calidad.',
      'Una vez que confirme a continuación, su suscripción de Pérdida de Peso de Zealthy se activará nuevamente. Esto le permitirá recibir atención, incluida la medicación GLP-1 si es apropiada para la pérdida de peso, obtener acceso continuo a nuestro equipo de coordinación para ayudar a hacer que los medicamentos sean más asequibles, y comenzar a trabajar con su entrenador nuevamente.',
    ];
    reactivateButtonText = 'Sí, reactivar y pedir';
    updatePaymentTitle =
      'Debe agregar información de pago actualizada para enviar su pedido de medicamento GLP-1.';
    updatePaymentDescription =
      'Para pedir medicamentos, necesita tener información de pago válida.';
    updatePaymentNote = 'Solo pagará por el medicamento si se le receta.';
    updatePaymentButtonText = 'Actualizar pago y continuar';
    cancelButtonText = 'Cancelar';

    medicationAddedText =
      '{0} han sido agregadas a su carrito. No se le cobrará a menos que su proveedor apruebe su solicitud de receta.';
    medicationAddedBundledText =
      '{0} han sido agregadas. No pagará a menos que expida el envío, ya que está en el plan de doctor + {1}, y la receta está incluida en su membresía.';
    monthSupplyText = 'Suministro para 1 mes';
    refillEveryText = 'Rellenar cada {0}';
    deliveryAddressText = 'Dirección de entrega';
    unitedStatesText = 'Estados Unidos';
    upsMailInnovationsText = 'UPS Mail Innovations - $0';
    upsNextDayAirSaverText = 'UPS Entrega al Día Siguiente - $15';
    usuallyArrivesInText = 'Generalmente llega en {0} días';
    weightLossAverageText =
      'En promedio, las personas pierden el {0}% de su peso después de 1 mes con {1}.**';
    compoundGLP1ConfirmationText =
      'Al continuar, confirma que es consciente de que el GLP-1 compuesto no está incluido en el precio de la membresía.';
    chargedIfPrescribedText =
      '*Se le cobrará ${0} si se le receta {1} compuesto. Esto es lo que Zealthy espera que dure un mes. Su proveedor puede recomendar una cantidad de dosis diferente, lo que cambiaría el precio. No será responsable de ninguna parte de este monto si no se le receta.';
    studyReferenceTextSemaglutide =
      '**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con Semaglutida para pacientes con sobrepeso u obesidad".';
    studyReferenceTextTirzepatide =
      '**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad".';
    addNewPaymentMethodText =
      'Agregar nuevo método de pago para pedir su medicamento GLP-1';
    chargedIfPrescribedText =
      '*Se le cobrará ${0} si se le receta {1} compuesto. Esto es lo que Zealthy espera que dure un mes. Su proveedor puede recomendar una cantidad de dosis diferente, lo que cambiaría el precio. No será responsable de ninguna parte de este monto si no se le receta.';
  }

  const getMedicationTranslation = (
    medicationName: string,
    language: string
  ) => {
    if (language !== 'esp') return medicationName;

    switch (medicationName) {
      case 'Semaglutide weekly injections':
        return 'Inyecciones semanales de semaglutida';
      case 'Tirzepatide weekly injections':
        return 'Inyecciones semanales de tirzepatida';
      case 'Liraglutide weekly injections':
        return 'Inyecciones semanales de liraglutida';
      default:
        return medicationName;
    }
  };

  const getIntervalTranslation = (interval: string, count: number): string => {
    if (language !== 'esp') return interval;

    const translations: Record<string, { singular: string; plural: string }> = {
      week: {
        singular: 'semana',
        plural: 'semanas',
      },
      month: {
        singular: 'mes',
        plural: 'meses',
      },
    };

    if (interval in translations) {
      return count > 1
        ? translations[interval].plural
        : translations[interval].singular;
    }

    return interval;
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

  const videoPosterLink =
    isPostCheckout ||
    (['Variation-1', 'Variation-2'].includes(
      variation9502?.variation_name || ''
    ) &&
      isCompoundRefill)
      ? ''
      : 'https://api.getzealthy.com/storage/v1/object/public/images/programs/thumbnail.png';

  return (
    <Box>
      {page === 'responses-reviewed' && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {responseReviewTitle}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {responseReviewDescription}
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
            {isBundled
              ? medicationAddedBundledText
                  .replace(
                    '{0}',
                    language === 'esp'
                      ? getMedicationTranslation(
                          medications?.[0]?.name,
                          language
                        )
                      : medications?.[0]?.name
                  )
                  .replace(
                    '{1}',
                    language === 'esp'
                      ? getMedicationTranslation(
                          medications?.[0]?.name,
                          language
                        )?.toLowerCase()
                      : medications?.[0]?.name?.toLowerCase()
                  )
              : variation9502?.variation_name === 'Variation-2'
              ? ''
              : medicationAddedText.replace(
                  '{0}',
                  language === 'esp'
                    ? getMedicationTranslation(medications?.[0]?.name, language)
                    : medications?.[0]?.name
                )}
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
              marginBottom: '16px',
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
                {yourMedicationText}
              </Typography>
              <Typography>
                {`${medications?.[0]?.name} ${medications?.[0]?.dosage?.replace(
                  'mgs',
                  'mg'
                )}`}
              </Typography>
              <Typography variant="subtitle1"></Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {(medications?.[0]?.recurring?.interval_count ?? 0) === 0
                  ? monthSupplyText
                  : refillEveryText.replace(
                      '{0}',
                      (medications?.[0]?.recurring?.interval_count ?? 0) > 1
                        ? `${
                            medications?.[0]?.recurring?.interval_count
                          } ${getIntervalTranslation(
                            medications?.[0]?.recurring.interval,
                            medications?.[0]?.recurring?.interval_count
                          )}`
                        : getIntervalTranslation(
                            medications?.[0]?.recurring.interval,
                            1
                          )
                    )}
              </Typography>
              {semaglutideBundled || tirzepatideBundled ? null : (
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
                    {`$${totalDue}`}
                  </Typography>
                  {discountApplied ? (
                    <Typography variant="body1">
                      {`$${wholeOrFloat(
                        totalDue * (1 - couponToDiscountAmount[discountApplied])
                      )}`}
                    </Typography>
                  ) : null}
                  <Typography variant="body1">{duePrescribedText}</Typography>
                </Box>
              )}
            </Box>

            <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
              {videoText}
              <span
                style={{ color: 'blue', cursor: 'pointer' }}
                onClick={() => setShowVideo(!showVideo)}
              >
                {watchVideo}
              </span>
            </Typography>

            {showVideo && (
              <Box sx={{ marginTop: '1rem' }}>
                <video
                  width="100%"
                  controls
                  preload="auto"
                  poster={videoPosterLink}
                >
                  <source
                    src={
                      ['Variation-1', 'Variation-2'].includes(
                        variation9502?.variation_name || ''
                      ) && isCompoundRefill
                        ? 'https://api.getzealthy.com/storage/v1/object/public/videos//Zealthy%20Klarna%20Wide%202.mp4'
                        : videoUrl
                    }
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </Box>
            )}
            {['Variation-1', 'Variation-2']?.includes(variationName3452) ? (
              <>
                <PaymentPageBanner />
                <br></br>
              </>
            ) : null}
            {(variationName3594 === 'Variation-1' ||
              !['IN', 'MN'].includes(patientInfo?.region || '')) &&
            medications?.[0]?.dose ? (
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
                  {weeklyDosageText}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    '.subtitle': {
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '1.25rem',
                      letterSpacing: '-0.00375rem',
                      marginBottom: '3px',
                    },
                    '>p': {
                      marginTop: 0,
                      marginBottom: '16px',
                      '&:last-child': {
                        marginBottom: '0px',
                      },
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: String(medications?.[0].dose)?.replace(/"|"/g, '"'),
                  }}
                />
              </Box>
            ) : null}

            {['Variation-1', 'Variation-2'].includes(
              variation4798?.variation_name ?? ''
            ) && (
              <Box
                sx={{
                  bgcolor: '#b7e4c7',
                  borderRadius: 2,
                  padding: '0.5rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#333333',
                  marginTop: -1,
                  marginBottom: 1,
                }}
              >
                These prices will never increase, even if your dose does.
              </Box>
            )}

            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898', marginBottom: '16px' }}
              >
                {deliveryOptionsText}
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
                          {upsMailInnovationsText}
                        </Typography>
                        <Typography>
                          {usuallyArrivesInText.replace(
                            '{0}',
                            compoundMeds.includes(medications?.[0]?.name)
                              ? '5-8'
                              : '2-5'
                          )}
                        </Typography>
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
                          {upsNextDayAirSaverText}
                        </Typography>
                        <Typography>
                          {usuallyArrivesInText.replace(
                            '{0}',
                            compoundMeds.includes(medications?.[0]?.name)
                              ? '3-5'
                              : '1-2'
                          )}
                        </Typography>
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
                {deliveryAddressText}
              </Typography>
              <Typography>{patientAddress?.address_line_1}</Typography>
              <Typography>{patientAddress?.address_line_2}</Typography>
              <Typography>
                {patientAddress?.city}, {patientAddress?.state}
              </Typography>
              <Typography>{patientAddress?.zip_code}</Typography>
              <Typography sx={{ marginBottom: '16px' }}>
                {unitedStatesText}
              </Typography>
              <Link
                onClick={() => setPage('delivery-address')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {editText}
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
                  {paymentText}
                </Typography>
                <Stack gap="16px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={() => setOpen(o => !o)}
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {editText}
                  </Link>
                </Stack>
              </>
            ) : null}
          </Box>

          {medicationSelected?.toLowerCase() !== 'oral semaglutide' && (
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
              {weightLossAverageText
                .replace(
                  '{0}',
                  medications?.[0]?.name?.toLowerCase().includes('semaglutide')
                    ? variation9502?.variation_name === 'Variation-2' &&
                      isCompoundRefill
                      ? '2'
                      : isPostCheckoutOrCompoundRefill || isVariation7746_2
                      ? '2.3'
                      : isCompoundRefill
                      ? '2.3'
                      : '2'
                    : variation9502?.variation_name === 'Variation-2' &&
                      isCompoundRefill
                    ? '3'
                    : isPostCheckoutOrCompoundRefill || isVariation7746_2
                    ? '2.7'
                    : isCompoundRefill
                    ? isVariation7746_3
                      ? '2.7'
                      : '3'
                    : '3'
                )
                .replace(
                  '{1}',
                  medications?.[0]?.name?.toLowerCase().includes('semaglutide')
                    ? 'Semaglutide'
                    : 'Tirzepatide'
                )}
            </Typography>
          )}

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
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button
                  sx={{ width: '100px', marginLeft: '15px' }}
                  onClick={handleApplyCouponCode}
                >
                  {applyText}
                </Button>
              </Box>
            </Box>
          ) : isDiscountAvailable && discountApplied ? (
            <>
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
                    marginBottom: '0.5rem',
                  }}
                ></Typography>
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
                          height: '100%',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: isMobile ? '16px' : '20px',
                            fontWeight: '600',
                          }}
                        >
                          {couponToDiscountAmount[discountApplied] * 100}%{' '}
                          {discountAppliedText}
                        </Typography>
                        <CheckIcon
                          style={{
                            fontSize: '28px',
                            color: 'green',
                            marginLeft: isMobile ? '7px' : '10px',
                            position: 'relative',
                            top: isMobile ? '-8px' : '-5px',
                          }}
                        />{' '}
                      </Box>
                    }
                    InputLabelProps={{
                      sx: {
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        color: 'black !important',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: isMobile ? '14px' : '18px',
                      },
                    }}
                    inputProps={{
                      style: {
                        color: 'green !important',
                        textAlign: 'center',
                      },
                      '::placeholder': {},
                    }}
                    sx={{
                      fontWeight: '400',
                      fontSize: '28px',
                      cursor: 'pointer',
                      marginRight: '10px',
                      textAlign: 'center',
                    }}
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  />
                </Box>
              </Box>
            </>
          ) : null}
          <Box sx={{ textAlign: 'center' }}>
            {!variant6471 ? (
              variation9502?.variation_name === 'Variation-2' &&
              isCompoundRefill ? null : (
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
                    label={compoundGLP1ConfirmationText}
                  />
                </Box>
              )
            ) : null}

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%', marginBottom: '36px' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {confirmOrderText}
            </LoadingButton>
            {semaglutideBundled || tirzepatideBundled ? null : (
              <Stack gap={1.5} fontStyle="italic">
                <Typography variant="subtitle2" fontSize="0.75rem !important">
                  {!variant6471
                    ? chargedIfPrescribedText
                        .replace(
                          '{0}',
                          String(
                            variant6471
                              ? variant6471Total
                              : discountApplied
                              ? wholeOrFloat(
                                  totalDue *
                                    (1 -
                                      couponToDiscountAmount[discountApplied])
                                )
                              : totalDue
                          )
                        )
                        .replace(
                          '{1}',
                          medications?.[0]?.name.toLowerCase().split(' ')[0]
                        )
                        .replace('{2}', dosage ?? '')
                    : opipText
                        .replace(
                          '{0}',
                          String(
                            discountApplied
                              ? wholeOrFloat(
                                  totalDue *
                                    (1 -
                                      couponToDiscountAmount[discountApplied])
                                )
                              : totalDue
                          )
                        )
                        .replace(
                          '{1}',
                          medications?.[0]?.name.toLowerCase().split(' ')[0]
                        )}
                </Typography>
                {medicationSelected !== 'Oral Semaglutide' && (
                  <Typography fontSize="0.75rem !important" fontStyle="italic">
                    {medications?.[0]?.name
                      .toLowerCase()
                      .includes('semaglutide')
                      ? studyReferenceTextSemaglutide
                      : studyReferenceTextTirzepatide}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
          <PaymentEditModal
            onClose={() => setOpenPaymentModal(o => !o)}
            open={openPaymentModal}
            title={addNewPaymentMethodText}
            handlePrescriptionRequest={handlePrescriptionRequest}
            setOpenUpdatePayment={setOpenUpdatePayment}
            handlePayAllInvoices={handlePayAllInvoices}
          />
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
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        onConfirm={handleCanceled}
        onClose={handleCanceledClose}
        title={reactivateSubscriptionTitle}
        description={reactivateSubscriptionDescription}
        medication={medications[0]}
        open={openCanceled}
        buttonText={reactivateButtonText}
      />
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        open={openScheduledForCancelation}
        title={reactivateSubscriptionTitle}
        description={reactivateSubscriptionDescription}
        medication={medications[0]}
        onConfirm={handleScheduledForCancelation}
        onClose={handleScheduledForCancelationClose}
        buttonText={reactivateButtonText}
      />
      <BasicModal isOpen={openUpdatePayment} useMobileStyle={false}>
        <Typography variant="h3" textAlign="center">
          {updatePaymentTitle}
        </Typography>
        <Typography textAlign="center">{updatePaymentDescription}</Typography>
        <Typography textAlign="center">{updatePaymentNote}</Typography>
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
    </Box>
  );
}
