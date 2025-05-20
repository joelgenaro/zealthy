import {
  CouponCodeRedeemProps,
  useLanguage,
  usePatient,
  usePatientAddress,
  usePatientDefaultPayment,
  usePatientIncompleteVisits,
  usePatientInvoices,
  usePatientUnpaidInvoices,
  useActiveWeightLossSubscription,
  useVWOVariationName,
} from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import {
  useRedeemCouponCode,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePayment } from '@/components/hooks/usePayment';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitState } from '@/components/hooks/useVisit';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Loading from '@/components/shared/Loading/Loading';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { useVariant } from '@/context/ABTestContext';
import { useABTest } from '@/context/ABZealthyTestContext';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { useVWO } from '@/context/VWOContext';
import { Pathnames } from '@/types/pathnames';
import { calculatePatientStatus } from '@/utils/calculatePatientStatus';
import {
  purchaseEvent,
  purchaseGlp1Event,
  uniquePurchaseEvent,
} from '@/utils/freshpaint/events';
import {
  getCheckoutInvoiceDescription,
  getCheckoutInvoiceProduct,
} from '@/utils/getCheckoutInvoiceDescription';
import { Button, Stack, Box } from '@mui/material';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  ConfirmCardPaymentData,
  ConfirmCardSetupData,
} from '@stripe/stripe-js';
import axios from 'axios';
import { differenceInCalendarYears, parseISO } from 'date-fns';
import Router from 'next/router';
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { uuid } from 'uuidv4';
import PaymentMethods from '../PaymentMethods';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { handleUpdateOpenInvoices } from './utils/handleUpdateOpenInvoices';
import { createDraftInvoicePayment } from './utils/createDraftInvoicePayment';
import {
  usePatientDocuments,
  usePatientLabWorks,
} from '@/components/hooks/data';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { CreateSubscriptionInput } from '@/types/api/create-subscriptions';
import { bmgPurchaseEvent, bmgUniquePurchaseEvent } from '@/utils/bmg/events';
import { useFlowState } from '@/components/hooks/useFlow';

interface PaymentFormProps {
  amount: number;
  buttonText?: string;
  couponCode?: CouponCodeRedeemProps;
  medicationQuantityId?: number;
  setIsPromoApplied?: (applied: boolean) => void | undefined;
  isFirstPurchase?: boolean;
}

const freeConsultWeightLossMembership = {
  id: 4,
  name: 'Zealthy Weight Loss Membership',
  price: 135,
  planId:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1Q8o7yAO83GerSecnOAO4LVo'
      : 'price_1QHb3FAO83GerSecD3q3okny',
  recurring: { interval: 'month', interval_count: 1 },
  type: CoachingType.WEIGHT_LOSS,
};

const PaymentForm = ({
  amount,
  buttonText = 'Confirm',
  couponCode,
  medicationQuantityId,
  isFirstPurchase,
  setIsPromoApplied,
}: PaymentFormProps) => {
  const user = useUser();
  const vwoClientInstance = useVWO();
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasCalledApi = useRef(false);
  const stripe = useStripe();
  const {
    checkout,
    voidInvoices,
    createInvoicePayment,
    createPaymentIntent,
    createSubscriptionKlarna,
  } = usePayment();
  const elements = useElements();
  const { data: patient } = usePatient();
  const { data: patientAddress } = usePatientAddress();
  const { id: visitId, medications } = useVisitState();
  const updatePatient = useUpdatePatient();
  const redeemCoupon = useRedeemCouponCode();
  const { data: incompleteVisits } = usePatientIncompleteVisits();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: insuranceDocuments } = usePatientDocuments();
  const { data: labWorks } = usePatientLabWorks();
  const { data: activeWlMembership } = useActiveWeightLossSubscription();
  const insuranceDocumentsLength = insuranceDocuments?.length || 0;
  const labWorksLength = labWorks?.length || 0;
  const prepMedicationId =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 508 : 472;
  const { data: patientOpenInvoices } = usePatientUnpaidInvoices();
  const { data: firstMonthWeightLossMembership } = usePatientInvoices(39);
  const { addCoaching, resetCoaching } = useCoachingActions();
  const { currentFlow } = useFlowState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const language = useLanguage();
  const careSelections = useSelector(store =>
    store.visit.selectedCare.careSelections.map(item => item.reason).join(', ')
  );
  const coaching = useSelector(store => store.coaching);
  const consultation = useSelector(store => store.consultation);
  const medication = useSelector(store => store.visit.medications[0]);
  const sexPlusHairMedication = useSelector(store =>
    store.visit.medications.find(m => m.type === MedicationType.SEX_PLUS_HAIR)
  );
  const ABZTest = useABTest();
  const { isVariation1 } = useVariant();
  const { data: variation8205 } = useVWOVariationName('8205');

  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const uniqueKey = useMemo(() => uuid(), []);

  const fullName = useMemo(() => {
    return `${patient?.profiles?.first_name} ${patient?.profiles.last_name}`;
  }, [patient?.profiles]);
  const patientAge = differenceInCalendarYears(
    new Date(),
    parseISO(patient?.profiles?.birth_date || '')
  );

  const is8552_2 = !!vwoClientInstance.getVariationName(
    '8552_2',
    String(patient?.id)
  );
  let mostRecentVisit;

  if (visitId) {
    mostRecentVisit = incompleteVisits?.find(visit => visit.id === visitId);
  } else {
    mostRecentVisit = incompleteVisits?.[0];
  }

  const visitCare = mostRecentVisit?.specific_care;
  const visitInsurance = mostRecentVisit?.potential_insurance;

  const metadata = {
    medicationQuantityId,
  };

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null &&
    !Router.asPath.includes('weight-loss-compound-refill');

  const invoiceDescription = useMemo(() => {
    const medicationName = medication?.name || ' ';
    const coachingName = coaching?.[0]?.name || ' ';

    return getCheckoutInvoiceDescription(
      specificCare || calculatedSpecificCare || visitCare || '',
      potentialInsurance || visitInsurance || '',
      medicationName,
      coachingName
    );
  }, [
    specificCare,
    calculatedSpecificCare,
    potentialInsurance,
    visitCare,
    visitInsurance,
  ]);

  const { region } = usePatientState();
  const selectedRegion = sessionStorage.getItem('region-ed');

  function getEventName(selection: string) {
    const eventNames: any = {
      'Anxiety or depression': 'purchase-success-aad',
      'Birth control': 'purchase-success-bc',
      'Primary care': 'purchase-success-pc',
      'Hair loss': 'purchase-success-hl',
      'Medicaid Access Florida': 'purchase-success-access-md',
      'Medicare Access Florida': 'purchase-success-access-mc',
      Enclomiphene: 'payment-success-enclomiphene',
      'Erectile dysfunction': 'purchase-success-ed',
      Acne: 'purchase-success-sc',
      Rosacea: 'purchase-success-sc',
      'Hyperpigmentation Dark Spots': 'purchase-success-sc',
      'Fine Lines & Wrinkles': 'purchase-success-sc',
      'Hair Loss': 'purchase-success-female-hl',
      Prep: 'purchase-success-prp',
      Sleep: 'purchase-insomnia',
      'Sex + Hair': 'purchase-sex-hair',
      'Weight Loss Free Consult': 'wl-free-consult-purchased-3',
      Menopause: 'purchase-menopause',
    };

    return eventNames[selection];
  }

  let eventName =
    getEventName(careSelections) || getEventName(potentialInsurance || '');

  const handleLabkitOrder = useCallback(async () => {
    window.VWO.event('labKitRequestedEnclomiphene');

    const prescriptionRequestPayload = medications
      .filter(m => m.type === 'Enclomiphene')
      .map(m => {
        return {
          medication_quantity_id: m?.medication_quantity_id || undefined,
          discounted_price: m?.discounted_price,
          patient_id: patient?.id,
          total_price: m?.price,
          region: patient?.region,
          specific_medication: m?.display_name,
          status: 'PRE_INTAKES',
          note: m?.note,
          type: m?.type,
          quantity: m?.quantity,
        };
      });

    try {
      const resp = await axios.post(
        '/api/tasso/place-order',
        {
          patient,
          patientAddress,
          patientAge,
          prescriptionRequest: prescriptionRequestPayload,
          userId: user?.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return { data: resp.data, error: null };
    } catch (err: any) {
      console.error(err);
      return { data: null, error: err };
    }
  }, [patient, patientAddress, patientAge]);

  const onSuccess = useCallback(
    async (transaction_id: string) => {
      const promises = [
        updatePatient.mutateAsync({
          status: calculatePatientStatus(
            PatientStatus.PAYMENT_SUBMITTED,
            patient?.status as PatientStatus
          ),
        }),
        !eventName
          ? ['Semaglutide Bundled', 'Tirzepatide Bundled'].includes(
              potentialInsurance || ''
            )
            ? purchaseGlp1Event(
                patient?.profiles?.id!,
                patient?.profiles?.email!,
                patient?.profiles?.phone_number!,
                patient?.profiles?.first_name!,
                patient?.profiles?.last_name!,
                patient?.region!,
                careSelections,
                calculatedSpecificCare,
                specificCare!,
                potentialInsurance!,
                transaction_id,
                variant || ''
              )
            : purchaseEvent(
                patient?.profiles?.id!,
                patient?.profiles?.email!,
                patient?.profiles?.phone_number!,
                patient?.profiles?.first_name!,
                patient?.profiles?.last_name!,
                patient?.region!,
                careSelections,
                calculatedSpecificCare,
                specificCare!,
                potentialInsurance!,
                transaction_id,
                variant || ''
              )
          : uniquePurchaseEvent(
              eventName,
              patient?.profiles?.id!,
              patient?.profiles?.email!,
              patient?.profiles?.phone_number!,
              patient?.profiles?.first_name!,
              patient?.profiles?.last_name!,
              patient?.region!,
              patient?.profiles?.birth_date!,
              patient?.profiles?.gender!,
              specificCare!,
              careSelections,
              calculatedSpecificCare,
              potentialInsurance!,
              variant || '',
              medication || ''
            ),
        !eventName
          ? bmgPurchaseEvent(
              patient?.profiles?.email!,
              patient?.profiles?.phone_number!,
              patient?.profiles?.first_name!,
              patient?.profiles?.last_name!,
              patient?.region!,
              careSelections!,
              calculatedSpecificCare!,
              specificCare!,
              potentialInsurance!,
              patientAddress?.zip_code!,
              patient?.profiles?.utm_parameters!,
              variant!
            )
          : bmgUniquePurchaseEvent(
              eventName,
              patient?.profiles?.email!,
              patient?.profiles?.phone_number!,
              patient?.profiles?.first_name!,
              patient?.profiles?.last_name!,
              patient?.region!,
              careSelections!,
              calculatedSpecificCare!,
              specificCare!,
              potentialInsurance!,
              patient?.profiles?.utm_parameters!,
              patientAddress?.zip_code!
            ),
        redeemCoupon?.mutate({ id: couponCode?.id!, redeemed: true }),
      ];

      if (language === 'esp') {
        window.freshpaint?.track('weight-loss-spanish-active');
      }

      window.VWO?.event('Purchase');

      if (eventName === 'purchase-success-ed') window.VWO?.event('purchaseEd');
      if (eventName === 'purchase-insomnia') {
        window.VWO?.event('purchaseInsomnia');
      }
      if (eventName === 'purchase-menopause')
        window.VWO?.event('purchase-menopause');
      if (eventName === 'purchase-success-female-hl')
        window.VWO?.event('purchase-female-hl');
      if (eventName === 'payment-success-enclomiphene' && patient) {
        window.VWO?.event('purchase-enclomiphene');
        await Promise.allSettled([
          vwoClientInstance?.track('7865_3', 'purchase-enclomiphene', patient),
        ]);
      }
      if (eventName === 'purchase-success-sc') {
        window.VWO?.event('purchase-success-sc');
      }
      if (amount === 72.5) window.VWO?.event('labKitRequestedEnclomiphene');

      if (eventName === 'purchase-success-sc' && careSelections === 'Acne')
        window.VWO?.event('purchaseAcne');
      if (eventName === 'purchase-success-sc' && careSelections === 'Rosacea')
        window.VWO?.event('purchaseRosacea');
      if (
        eventName === 'purchase-success-sc' &&
        careSelections === 'Hyperpigmentation Dark Spots'
      )
        window.VWO?.event('purchaseMelasma');
      if (
        eventName === 'purchase-success-sc' &&
        careSelections === 'Fine Lines & Wrinkles'
      )
        window.VWO?.event('purchaseAntiAging');

      if (patient) {
        await Promise.allSettled([
          vwoClientInstance?.track('5476', 'Purchase', patient),
          vwoClientInstance?.track('6822-2', 'Purchase', patient),
          vwoClientInstance?.track('6822-3', 'Purchase', patient),
          ABZTest.trackMetric('99', patient?.profile_id, 'Purchase'),
          ABZTest.trackMetric('5871_new', patient?.profile_id, 'Purchase'),
          vwoClientInstance?.track('5867', 'Purchase', patient),
          vwoClientInstance?.track('5871_new', 'Purchase', patient),
          vwoClientInstance?.track('6303', 'Purchase', patient),
          vwoClientInstance?.track('7153_01', 'Purchase', patient),
          vwoClientInstance?.track('7153_05', 'Purchase', patient),
          vwoClientInstance?.track('6888', 'Purchase', patient),
          vwoClientInstance?.track('5252', 'Purchase', patient),
          vwoClientInstance?.track('3454', 'Purchase', patient),
          vwoClientInstance?.track('3596', 'Purchase', patient),
          vwoClientInstance?.track('4022', 'Purchase', patient),
          vwoClientInstance?.track('5777', 'Purchase', patient),
          vwoClientInstance?.track('3620-2', 'Purchase', patient),
          vwoClientInstance?.track('7458', 'Purchase', patient),
          vwoClientInstance?.track('8078', 'Purchase', patient),
          vwoClientInstance?.track('4287', 'Purchase', patient),
          vwoClientInstance?.track('4260', 'purchase-enclomiphene', patient),
          vwoClientInstance?.track('4381', 'Purchase', patient),
          vwoClientInstance?.track('Clone_4687', 'Purchase', patient),
          vwoClientInstance?.track('7766', 'purchaseInsomnia', patient),
          vwoClientInstance?.track('5386', 'purchaseEd', patient),
          vwoClientInstance?.track('ED5618', 'purchaseEd', patient),
          vwoClientInstance?.track('15618', 'purchaseEd', patient),
          vwoClientInstance?.track('6399', 'purchaseEd', patient),
          vwoClientInstance?.track('5618', 'purchaseEd', patient),
          vwoClientInstance?.track('4918', 'Purchase', patient),
          vwoClientInstance?.track('5071', 'Purchase', patient),
          vwoClientInstance?.track('4935', 'Purchase', patient),
          vwoClientInstance.track('5751', 'Purchase', patient),
          vwoClientInstance?.track('5484', 'Purchase', patient),
          vwoClientInstance?.track('5284', 'Purchase', patient),
          vwoClientInstance?.track('6792', 'Purchase', patient),
          vwoClientInstance?.track('5483', 'Purchase', patient),
          vwoClientInstance?.track('6825', 'Purchase', patient),
          vwoClientInstance?.track('15685', 'bundledPurchase', patient),
          vwoClientInstance?.track('7930', 'bundledPurchase', patient),
          vwoClientInstance?.track('Clone_6775', 'Purchase', patient),
          vwoClientInstance?.track('Clone_6775_2', 'Purchase', patient),
          vwoClientInstance?.track('5053', 'Purchase', patient),
          vwoClientInstance?.track('75801', 'Purchase', patient),
          vwoClientInstance?.track('7452', 'Purchase', patient),
          vwoClientInstance?.track('4798', 'Purchase', patient),
          vwoClientInstance?.track('7752', 'Purchase', patient),
          vwoClientInstance?.track('7743', 'Purchase', patient),
          vwoClientInstance?.track('7895', 'Purchase', patient),
          vwoClientInstance?.track('7746-2', 'Purchase', patient),
          vwoClientInstance?.track('7934', 'Purchase', patient),
          vwoClientInstance?.track('7960', 'Purchase', patient),
          vwoClientInstance?.track('7380', 'Purchase', patient),
          vwoClientInstance?.track('6935', 'Purchase', patient),
          vwoClientInstance?.track('8201', 'Purchase', patient),
          vwoClientInstance?.track('8552', 'Purchase', patient),
          vwoClientInstance?.track('9363', 'Purchase', patient),
          vwoClientInstance?.track('9057_1', 'Purchase', patient),
          vwoClientInstance?.track('9057_2', 'Purchase', patient),
          vwoClientInstance?.track('9057_3', 'Purchase', patient),
          vwoClientInstance?.track('8279_6', 'purchaseEd', patient),
          vwoClientInstance?.track('8279_6', 'paymentSuccessEd', patient),
        ]);
        if (is8552_2) {
          await Promise.all([
            vwoClientInstance?.track('8552_2', 'Purchase', patient),
          ]);
        }
      }

      if (
        patient &&
        specificCare === SpecificCareOption.SEX_PLUS_HAIR &&
        is8552_2
      ) {
        await Promise.all([
          vwoClientInstance?.track('8552_2', 'purchaseSH', patient),
          vwoClientInstance?.track('8205', 'Purchase', patient),
        ]);
      }
      if (
        patient &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variation8205?.variation_name === 'Variation-3' &&
        medication?.price === 190
      ) {
        await Promise.all([
          vwoClientInstance?.track(
            '8205',
            'oneMonthEnclomipheneRequested',
            patient
          ),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variation8205?.variation_name === 'Variation-3' &&
        medication?.price === 420
      ) {
        await Promise.all([
          vwoClientInstance?.track(
            '8205',
            'threeMonthEnclomipheneRequested',
            patient
          ),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variation8205?.variation_name === 'Variation-3' &&
        medication?.price === 1188
      ) {
        await Promise.all([
          vwoClientInstance?.track(
            '8205',
            'twelveMonthEnclomipheneRequested',
            patient
          ),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.HAIR_LOSS &&
        is8552_2
      ) {
        await Promise.all([
          vwoClientInstance?.track('8552_2', 'purchaseMaleHl', patient),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.FEMALE_HAIR_LOSS &&
        is8552_2
      ) {
        await Promise.all([
          vwoClientInstance?.track('8552_2', 'purchase-female-hl', patient),
        ]);
      }

      if (patient && specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION) {
        if (
          patient &&
          ['KS', 'KY', 'LA', 'MA', 'MD', 'MI'].includes(
            selectedRegion || patient?.region || region || ''
          )
        ) {
          await vwoClientInstance?.activate('8552_2', patient);
        }
        await Promise.allSettled([
          vwoClientInstance?.track('5483', 'purchaseEd', patient),
          vwoClientInstance?.track('5483-2', 'purchaseEd', patient),
          vwoClientInstance?.track('8552', 'purchaseEd', patient),
          vwoClientInstance?.track(
            '8552',
            'prescriptionRequestSubmittedEd',
            patient
          ),
          vwoClientInstance?.track('8552_2', 'purchaseEd', patient),
        ]);
      }

      if (patient && specificCare === SpecificCareOption.BIRTH_CONTROL) {
        await Promise.allSettled([
          vwoClientInstance?.track(
            '5483',
            'payment-success-birth-control',
            patient
          ),
          vwoClientInstance?.track('8552', 'purchaseBirthControl', patient),
          vwoClientInstance?.track('8284', 'purchaseBirthControl', patient),
          vwoClientInstance?.track(
            '8284',
            'payment-success-birth-control',
            patient
          ),
          vwoClientInstance?.track(
            '8552',
            'payment-success-birth-control',
            patient
          ),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION
      ) {
        await Promise.all([
          vwoClientInstance?.track('7865_2', 'purchaseMh', patient),
          vwoClientInstance?.track('8552', 'purchaseMhCoach', patient),
        ]);
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION &&
        is8552_2
      ) {
        await Promise.all([
          vwoClientInstance?.track('8552_2', 'purchaseMh', patient),
        ]);
      }

      if (patient && specificCare === SpecificCareOption.PRE_WORKOUT) {
        await Promise.all([
          vwoClientInstance?.track('8552', 'paymentSuccessPreWorkout', patient),
        ]);
        if (is8552_2) {
          await Promise.all([
            vwoClientInstance?.track('8552_2', 'purchasePreWorkout', patient),
          ]);
        }
      }

      if (patient && amount === 630) {
        await Promise.all([
          vwoClientInstance?.track('5481', 'bundledPurchase', patient),
          vwoClientInstance?.track('7930', 'bundledPurchase', patient),
          vwoClientInstance?.track('5481', 'bundled3MonthUpsell', patient),
          vwoClientInstance?.track('7743', 'bundled3MonthUpsell', patient),
          vwoClientInstance?.track('7930', 'bundled3MonthUpsell', patient),
        ]);
      }

      if (patient && amount === 446) {
        await Promise.all([
          vwoClientInstance?.track('8676', 'bundled3MonthUpsell', patient),
          vwoClientInstance?.track(
            '8676',
            'bundled3MonthsPrescriptionRequest',
            patient
          ),
        ]);
      }

      if (patient && amount === 0) {
        await Promise.all([
          vwoClientInstance?.track(
            '8676',
            'bundled1MonthPrescriptionRequest',
            patient
          ),
        ]);
      }

      if (patient && (amount === 217 || amount === 349 || amount === 149)) {
        await Promise.all([
          vwoClientInstance?.track('6792', 'bundledPurchase', patient),
          vwoClientInstance?.track('4313', 'bundledPurchase', patient),
          vwoClientInstance?.track('4004', 'bundledPurchase', patient),
          vwoClientInstance?.track('7930', 'bundledPurchase', patient),
          vwoClientInstance?.track(
            'Clone_Clone_4313',
            'bundledPurchase',
            patient
          ),
          vwoClientInstance?.track('4004', 'bundledPurchase', patient),
          vwoClientInstance?.track('5481', 'bundledPurchase', patient),
          vwoClientInstance?.track('7743', 'bundledPurchase', patient),
          vwoClientInstance?.track('8676', 'bundledPurchase', patient),
          vwoClientInstance?.track(
            '8676',
            'bundled1MonthPrescriptionRequest',
            patient
          ),
        ]);
      }

      if (patient && amount === 39) {
        await Promise.all([
          ABZTest.trackMetric('5871_new', patient?.profile_id, 'Purchase'),
          vwoClientInstance?.track('5871_new', 'Purchase', patient),
          vwoClientInstance?.track('4295', 'Purchase', patient),
          vwoClientInstance?.track('7153_01', 'Purchase', patient),
          vwoClientInstance?.track('7153_05', 'Purchase', patient),
          vwoClientInstance?.track('8288', 'Purchase', patient),
          vwoClientInstance?.track('4537', 'Purchase', patient),
          vwoClientInstance?.track('4624', 'Purchase', patient),
          vwoClientInstance?.track('4918', 'Purchase', patient),
          vwoClientInstance?.track('6031', 'Purchase', patient),
          vwoClientInstance?.track('6337', 'Purchase', patient),
          vwoClientInstance?.track('6826', 'Purchase', patient),
          vwoClientInstance?.track('Clone_6775', 'Purchase', patient),
          vwoClientInstance?.track('Clone_6775_2', 'Purchase', patient),
          vwoClientInstance?.track('5053', 'Purchase', patient),
          vwoClientInstance?.track('4798', 'Purchase', patient),
          vwoClientInstance?.track('7752', 'Purchase', patient),
          vwoClientInstance?.track('7743', 'Purchase', patient),
          vwoClientInstance?.track('5483', 'Purchase', patient),
          vwoClientInstance?.track('7960', 'Purchase', patient),
          vwoClientInstance?.track('7380', 'Purchase', patient),
          vwoClientInstance?.track('7935', 'Purchase', patient),
        ]);
      }

      if (patient && consultation?.[0]?.price === 72.5) {
        window.VWO.event('labKitRequestedEnclomiphene');
        await Promise.all([
          vwoClientInstance?.track(
            '7865_3',
            'labKitRequestedEnclomiphene',
            patient
          ),
          vwoClientInstance?.track(
            '8205',
            'labKitRequestedEnclomiphene',
            patient
          ),
        ]);
      }
      if (specificCare === 'Prep' && insuranceDocumentsLength > 0) {
        const { data: taskResponse, error: taskError } = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id,
            queue_type: 'Provider (QA)',
          })
          .select()
          .maybeSingle();

        const { data: prescriptionReponse, error: prescriptionError } =
          await supabase.from('prescription_request').insert({
            patient_id: patient?.id,
            status: 'REQUESTED',
            region: patient?.region,
            shipping_method: 1,
            note: 'Truvada',
            total_price: 0,
            specific_medication: 'Truvada',
            medication_quantity_id: prepMedicationId,
            queue_id: taskResponse?.id,
          });
      }

      if (specificCare === 'Sex + Hair' && sexPlusHairMedication) {
        const { data: taskResponse, error: taskError } = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id,
            queue_type: 'Provider (QA)',
          })
          .select()
          .maybeSingle();

        if (taskError) {
          console.error('Error creating task:', taskError);
          return;
        }

        const { data: prescriptionResponse, error: prescriptionError } =
          await supabase.from('prescription_request').insert({
            patient_id: patient?.id,
            status: 'REQUESTED',
            region: patient?.region,
            shipping_method: 1,
            note: 'EDHL Medication',
            total_price: sexPlusHairMedication.price,
            specific_medication: sexPlusHairMedication.name,
            medication_quantity_id:
              sexPlusHairMedication.medication_quantity_id,
            queue_id: taskResponse?.id,
          });

        if (prescriptionError) {
          console.error('Error creating prescription:', prescriptionError);
          return;
        }
      }

      if (specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT) {
        //Go to second checkout page if this is the first
        if (!coaching.length) {
          addCoaching(freeConsultWeightLossMembership);
          Router.push('/checkout/free-consult-membership');
          return;
        }
      }

      if (
        (patientOpenInvoices?.filter(i => i.amount_due === 39)?.length ?? 0) > 0
      ) {
        await handleUpdateOpenInvoices(supabase, patient?.id!);
      }

      if (variant6471) {
        await createDraftInvoicePayment(patient!, hasCalledApi);
      }
      return Promise.all(promises).then(() => {
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        consultation?.[0]?.price === 72.5
          ? Router.push(Pathnames.CHECKOUT_SCHEDULE_APPOINTMENT)
          : Router.push(Pathnames.CHECKOUT_CREATE_SUBSCRIPTIONS);
        return;
      });
    },
    [
      language,
      eventName,
      updatePatient,
      patient,
      potentialInsurance,
      careSelections,
      calculatedSpecificCare,
      specificCare,
      redeemCoupon,
      couponCode?.id,
      vwoClientInstance,
      amount,
      consultation,
      currentFlow,
    ]
  );

  const handlePaymentIntent = useCallback(
    async (
      clientSecret: string,
      payment_method: ConfirmCardPaymentData['payment_method']
    ) => {
      const result = await stripe!.confirmCardPayment(clientSecret, {
        payment_method,
      });

      if (result.error) {
        setError(
          result.error.message || 'Something went wrong, Please try again'
        );
        await voidInvoices(patient?.id!);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        if (
          specificCare === SpecificCareOption.ENCLOMIPHENE &&
          consultation?.[0]?.price === 72.5
        ) {
          await handleLabkitOrder();
        }
        await onSuccess(result.paymentIntent.id);
      }
    },
    [onSuccess, stripe, patient, voidInvoices]
  );

  const handleSetupIntent = useCallback(
    async (
      clientSecret: string,
      payment_method: ConfirmCardSetupData['payment_method']
    ) => {
      const result = await stripe!.confirmCardSetup(clientSecret, {
        payment_method,
      });

      if (result.error) {
        setError(
          result.error.message || 'Something went wrong, Please try again'
        );
        setLoading(false);
        return;
      }

      if (result.setupIntent.status === 'succeeded') {
        await onSuccess(result.setupIntent.id);
      }

      return;
    },
    [onSuccess, stripe]
  );

  const handlePayment: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();

      if (!stripe || !elements || !patient) return;
      if (
        firstMonthWeightLossMembership &&
        firstMonthWeightLossMembership.length > 0 &&
        specificCare === 'Weight loss'
      )
        return Router.push(Pathnames.CHECKOUT_CREATE_SUBSCRIPTIONS);

      setError('');

      setLoading(true);
      const metadata: Record<string, unknown> = {
        zealthy_care: specificCare || careSelections || visitCare,
        zealthy_patient_id: patient.id,
        zealthy_product_name: getCheckoutInvoiceProduct(
          specificCare || calculatedSpecificCare || visitCare || '',
          potentialInsurance || visitInsurance || ''
        ),
      };

      if (coaching[0]) {
        metadata.zealthy_subscription_id = coaching[0].id;
      }

      if (isVariation1 || variant === '5865') {
        const { data, error } = await createInvoicePayment(
          patient.id,
          217 * 100,
          metadata,
          'First Month Semaglutide Membership',
          true,
          uniqueKey
        );
      }

      const { data, error } = await checkout(
        amount,
        metadata,
        invoiceDescription
      );

      if (error) {
        setError(error?.message || 'Something went wrong. Please try again');
        await voidInvoices(patient.id);
        setLoading(false);
        return;
      }

      const defaultPaymentMethod = paymentMethod
        ? paymentMethod.id
        : {
            card: elements!.getElement(CardElement)!,
            billing_details: {
              name: fullName,
            },
            metadata: {
              initial: 'true',
            },
          };

      if (data.type === 'payment_intent') {
        await handlePaymentIntent(data.client_secret, defaultPaymentMethod);
      } else {
        await handleSetupIntent(data.client_secret, defaultPaymentMethod);
      }
    },
    [
      stripe,
      elements,
      specificCare,
      careSelections,
      visitCare,
      patient,
      calculatedSpecificCare,
      potentialInsurance,
      visitInsurance,
      coaching,
      checkout,
      amount,
      invoiceDescription,
      paymentMethod,
      fullName,
      voidInvoices,
      handlePaymentIntent,
      handleSetupIntent,
    ]
  );

  useEffect(() => {
    if (patient?.region === 'IL') {
      vwoClientInstance.activate('4381', patient!);
    }

    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
      patient &&
      ['TN', 'PA'].includes(patient?.region || '')
    ) {
      vwoClientInstance?.activate('5476', patient!);
    }
  }, [patient, vwoClientInstance, specificCare]);

  if (!stripe || !elements) {
    return <Loading />;
  }

  let savingPaymentTitle = 'Saving payment information...';
  let savingPaymentDescription = 'This will take a few seconds.';

  if (language === 'esp') {
    savingPaymentTitle = 'guardando su informacion de pago';
    savingPaymentDescription = 'esto tomara unos segundos';
  }

  //To the next person working on Klarna, if you want to make it reusuable -
  //make the data that is passed into the api and the return url dynamic (maybe based on specifcCare?)
  const handleKlarna = async () => {
    if (Router.pathname === '/checkout/free-consult-membership') {
      //For setting up recurring payments through a subscription
      handleKlarnaSubscription();
    } else {
      //When creating a one time charge with klarna
      handleKlarnaPayment();
    }
  };

  const handleKlarnaSubscription = async () => {
    if (!stripe || !elements || !patient) {
      return;
    }
    try {
      setLoading(true);

      const subscription: CreateSubscriptionInput = {
        planId: freeConsultWeightLossMembership.planId,
        id: freeConsultWeightLossMembership.id,
        recurring: {
          interval: freeConsultWeightLossMembership.recurring.interval,
          interval_count:
            freeConsultWeightLossMembership.recurring.interval_count,
        },
      };

      const { data, error: klarnaSubscriptionError } =
        await createSubscriptionKlarna(patient?.id, subscription);

      if (klarnaSubscriptionError || !data?.client_secret) {
        setError(klarnaSubscriptionError || 'Failed to create payment intent.');
        setLoading(false);
        return;
      }

      resetCoaching(); //So an additional subscription does not get created in /checkout/create-subscriptions

      const { error: klarnaError } = await stripe.confirmKlarnaPayment(
        data?.client_secret,
        {
          payment_method: {
            billing_details: {
              email: patient.profiles.email!,
              address: {
                country: 'US',
              },
            },
          },
          return_url: `${window.location.origin}${Pathnames.CHECKOUT_CREATE_SUBSCRIPTIONS}`,
          mandate_data: {
            customer_acceptance: {
              type: 'online',
              online: {
                infer_from_client: true,
              },
            },
          },
        }
      );

      setLoading(false);
      return;
    } catch (err) {
      setError((err as Error).message || 'Payment failed: Please try again.');
      setLoading(false);
    }
  };

  const handleKlarnaPayment = async () => {
    if (!stripe || !elements || !patient) {
      return;
    }
    try {
      setLoading(true);
      const freeConsultMedication = medications.find(
        m => m.medication_quantity_id === 98
      );

      const metadata = {
        zealthy_medication_name: freeConsultMedication?.name,
        zealthy_care: 'Weight Loss Free Consult',
        reason: 'free-consult',
        zealthy_patient_id: patient.id,
        zealthy_product_name: freeConsultMedication?.name,
      };
      const { data, error: intentError } = await createPaymentIntent(
        patient?.id,
        amount * 100,
        metadata,
        navigator.userAgent,
        true,
        true
      );

      if (intentError || !data?.client_secret) {
        setError(intentError || 'Failed to create payment intent.');
        setLoading(false);
        return;
      }
      if (
        !coaching.length &&
        specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT
      ) {
        addCoaching(freeConsultWeightLossMembership);
      }

      const { error: stripeError } = await stripe.confirmKlarnaPayment(
        data?.client_secret,
        {
          return_url: `${window.location.origin}/checkout/free-consult-membership`,
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      return Router.push(Pathnames.CHECKOUT_CREATE_SUBSCRIPTIONS);
    } catch (err) {
      setError((err as Error).message || 'Payment failed: Please try again.');
      setLoading(false);
    }
  };

  return (
    <Stack component="form" onSubmit={handlePayment} gap="20px">
      <PaymentMethods
        defaultPaymentMethod={paymentMethod || null}
        totalAmount={amount}
        onError={setError}
        onSuccess={onSuccess}
      />
      {loading && (
        <LoadingModal
          title={savingPaymentTitle}
          description={savingPaymentDescription}
        />
      )}
      {error ? (
        language === 'esp' && error === 'Your card number is incomplete.' ? (
          <ErrorMessage>Su número de tarjeta está incompleto.</ErrorMessage>
        ) : (
          <ErrorMessage>{error}</ErrorMessage>
        )
      ) : null}

      {specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT ? (
        <Button
          variant="outlined"
          sx={{
            color: 'black',
            borderColor: 'lightgray',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              borderColor: 'gray',
            },
          }}
          onClick={handleKlarna}
        >
          Continue with
          <Box
            component="img"
            src="/images/free-consult/klarna-badge.png"
            alt="Klarna"
            sx={{
              height: 50,
              ml: -1,
            }}
          />
        </Button>
      ) : null}

      <Button disabled={loading} size="medium" type="submit" fullWidth>
        {specificCare === 'Mental health'
          ? `Pay $${amount} today`
          : specificCare === 'Preworkout'
          ? 'Confirm - Pay $0 today'
          : specificCare === 'Sex + Hair'
          ? 'Confirm - Pay $0 today'
          : specificCare === 'Enclomiphene'
          ? `Confirm - Pay $${amount === 72.5 ? '72.50' : '0'} today`
          : specificCare === 'Prep'
          ? 'Request Truvada 3 Month'
          : specificCare === SpecificCareOption.SLEEP
          ? 'Pay $0 today'
          : buttonText}
      </Button>
    </Stack>
  );
};

export default PaymentForm;
