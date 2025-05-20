import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { details } from './data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  useAllVisiblePatientSubscription,
  useCompoundMatrix,
  useLanguage,
  usePatient,
  usePatientOrders,
  useVWOVariationName,
} from '@/components/hooks/data';
import {
  RecurringWeightLossMedicationAddOn,
  RecurringWeightLossBulkAddOn,
  SameMedication,
} from '@/components/shared/AddOnPayment';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { useTitrationSelectionLookup } from '@/components/hooks/useTitrationSelectionLookup';
import Spinner from '@/components/shared/Loading/Spinner';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import UsStates from '@/constants/us-states';
import {
  choseSemaglutideColoradoEvent,
  choseTirzepatideColoradoEvent,
  prescriptionRequestedEvent,
} from '@/utils/freshpaint/events';
import { useVWO } from '@/context/VWOContext';
import { format } from 'date-fns';
import { capitalize } from '@/utils/capitalize';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import medicationAttributeName from '@/utils/medicationAttributeName';
import DOMPurify from 'dompurify';
import CompoundDisclaimer from '@/components/shared/CompoundDisclaimer';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useABTest } from '@/context/ABZealthyTestContext';

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
  body3?: string;
  disclaimers?: string[];
};
type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  dose?: string | null;
  mgSavings?: string | null;
  singlePaymentTitle?: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};
type CompoundDetailProps = {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    mgSavings: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
};
interface Props {
  nextPage: (nextPage?: string) => void;
}
const WeightLossRefillRecurringTreatment = ({ nextPage }: Props) => {
  const vwoClient = useVWO();
  const { data: patient } = usePatient();
  const ABZTest = useABTest();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { updatePatient } = usePatientAsync();
  const { name, question_name, code } = Router.query;
  const { data: patientOrders, isFetched } = usePatientOrders();
  const [skipTitration, setSkipTitration] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const review = searchParams?.get('review');
  const { addMedication } = useVisitActions();
  const [medicationSelected, setMedicationSelected] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('true');
  const [checked, setChecked] = useState<string>('');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  const { data: patientInfo } = usePatient();
  const [displayMore, setDisplayMore] = useState<boolean>(false);
  const [learnMore, setLearnMore] = useState(false);
  const [learnSingleMore, setLearnSingleMore] = useState(false);
  const [learnSameMore, setLearnSameMore] = useState(false);
  const [learnAltMonthly, setLearnAltMonthly] = useState(false);
  const [learnAltMultiMonth, setLearnAltMultiMonth] = useState(false);
  const [otherOptions, setOtherOptions] = useState(false);
  const { data: compoundMatrixMed } = useCompoundMatrix();
  const { data: patientSubscription } = useAllVisiblePatientSubscription();
  const [otherMedicationMedData, setOtherMedicationMedData] =
    useState<any>(null);
  const [variationName3452, setVariationName3452] = useState<string>('');
  const [campaignKey, setCampaignKey] = useState('');
  const { data: vwoVariationName } = useVWOVariationName(campaignKey);
  const supabase = useSupabaseClient<Database>();
  const { medications } = useVisitState();
  const medicationName = medicationAttributeName(medications?.[0]?.name);

  let variationName = null;

  const activateVariant = async () => {
    if (
      vwoClient &&
      patientInfo?.id &&
      ['FL'].includes(patientInfo?.region || '')
    ) {
      variationName = await vwoClient?.activate('3463', patientInfo);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [vwoClient, patientInfo?.id, patientInfo?.region]);
  console.log(variationName, 'variationName');

  useEffect(() => {
    if (
      patientInfo?.id &&
      ['MS', 'OH', 'GA'].includes(patientInfo?.region || '')
    ) {
      setCampaignKey('3452');
    }
  }, [patientInfo?.id, patientInfo?.region]);

  useEffect(() => {
    if (vwoVariationName && campaignKey === '3452') {
      setVariationName3452(vwoVariationName?.variation_name || '');
    }
  }, [vwoVariationName, campaignKey]);
  console.log('variation3452:', variationName3452);

  //used for upgrading to bulk multi plan with higher dosage
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);

  const recurringMedication = patientSubscription?.find(
    s => s.product === 'Recurring Weight Loss Medication'
  );
  const isMonthlyRecurring = recurringMedication?.interval_count === 30;

  const recentOrder = patientOrders?.find(
    o =>
      ['semaglutide', 'tirzepatide']?.includes(
        o?.prescription?.medication?.toLowerCase()?.split(' ')?.[0] || ''
      ) &&
      o.total_price &&
      !['cancel', 'cancelled', 'canceled', 'PAYMENT_FAILED'].includes(
        o?.order_status?.toLowerCase()!
      )
  );

  const nextMed = useTitrationSelection(
    recentOrder?.prescription?.dosage_instructions ?? null,
    skipTitration
  );

  const singleMed = useTitrationSelectionLookup(
    medicationSelected as string,
    currMonth as number,
    singlePlan || (bulkPlan as string),
    recentOrder?.total_dose ?? undefined
  );

  const recentOrderCompoundDetails = compoundMatrixMed
    ?.filter(med => {
      return (
        med?.subscription_plan ===
          `${recentOrder?.total_dose?.split(' ')?.[0].toLowerCase()}_${
            isMonthlyRecurring ? 'monthly' : 'multi_month'
          }` &&
        med?.current_month ===
          ((currMonth || 0) < 5 ? (currMonth || 0) - 1 : 456) &&
        med?.active &&
        med?.states?.includes(
          UsStates.find(s => s.abbreviation === patientInfo?.region)?.name || ''
        )
      );
    })
    .map(detail => {
      return {
        title: `No change to your medication subscription price (${
          isMonthlyRecurring
            ? `$${
                variationName3452 === 'Variation-1'
                  ? recurringMedication?.price
                  : recentOrder?.total_price
              }/month`
            : `$${
                variationName3452 === 'Variation-1'
                  ? recurringMedication?.price
                  : recentOrder?.total_price
              } every 3 months`
        }) ${
          variationName3452 === 'Variation-1' && !isMonthlyRecurring
            ? `or dosage`
            : ''
        }`,
        subtitle: `Check in with your provider and keep your medication subscription the same.`,
        medication: `${
          recentOrder?.total_dose +
          ' ' +
          `(${extractWeeklyDosage(detail?.dose ?? '')})`
        }`,
        // }${ temporarily commenting this out during order refactor ES-5615
        //   detail?.shipment_breakdown?.length === 3 &&
        //   detail?.pharmacy === 'Empower'
        //     ? ` (3 vials included - ${singleMed?.shipments
        //         ?.split(',')
        //         .join(', ')})`
        //     : detail?.shipment_breakdown?.length === 3 &&
        //       !['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
        //     ? ` (3 vials included in shipment - ${singleMed?.shipments
        //         ?.split(',')
        //         .join(', ')})`
        //     : detail?.shipment_breakdown?.length === 3 &&
        //       ['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
        //     ? ` (3 shipments - ${singleMed?.shipments?.split(',').join(', ')})`
        //     : ''
        // }`,
        dose: detail?.dose,
        medData: {
          name: `${capitalize(
            detail?.subscription_plan?.split('_')[0]
          )} weekly injections`,
          type: MedicationType.WEIGHT_LOSS,
          price: detail?.price,
          discounted_price:
            detail?.shipment_breakdown?.length === 3
              ? detail?.price / 3
              : false,
          dosage: `${detail?.vial_size?.trim()}${
            detail?.shipment_breakdown?.length === 3 &&
            detail?.pharmacy === 'Empower'
              ? ` (3 vials included - ${detail?.shipment_breakdown?.join(
                  ', '
                )})`
              : detail?.shipment_breakdown?.length === 3 &&
                !['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
              ? ` (3 vials included in shipment - ${detail?.shipment_breakdown?.join(
                  ', '
                )})`
              : detail?.shipment_breakdown?.length === 3 &&
                ['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
              ? ` (3 shipments - ${detail?.shipment_breakdown?.join(', ')})`
              : ''
          }`,
          dose: detail?.dose,
          quantity: 1,
          recurring: {
            interval: 'day',
            interval_count: isMonthlyRecurring ? 30 : 90,
          },
          medication_quantity_id: 98,
        },
      };
    });

  const alternativeMonthlyCompoundDetails = compoundMatrixMed
    ?.filter(med => {
      return (
        med?.subscription_plan ===
          `${
            medicationSelected?.toLowerCase() === 'semaglutide'
              ? 'tirzepatide'
              : 'semaglutide'
          }_monthly` &&
        med.active &&
        med?.states?.includes(
          UsStates.find(s => s.abbreviation === patientInfo?.region)?.name || ''
        )
      );
    })
    .map(detail => {
      return {
        title: `Switch to 1-month supply of ${
          medicationSelected?.toLowerCase() === 'semaglutide'
            ? 'tirzepatide'
            : 'semaglutide'
        }`,
        subtitle: `Request an update to your medication subscription to change from ${medicationSelected?.toLowerCase()} to a 1-month supply of ${
          medicationSelected?.toLowerCase() === 'semaglutide'
            ? 'tirzepatide'
            : 'semaglutide'
        }`,
        medication: `${capitalize(detail?.subscription_plan?.split('_')[0])} ${
          detail?.vial_size
        }${
          detail?.shipment_breakdown?.length === 3 &&
          detail?.pharmacy === 'Empower'
            ? ` (3 vials included - ${detail?.shipment_breakdown?.join(', ')})`
            : detail?.shipment_breakdown?.length === 3 &&
              !['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
            ? ` (3 vials included in shipment - ${detail?.shipment_breakdown?.join(
                ', '
              )})`
            : detail?.shipment_breakdown?.length === 3 &&
              ['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
            ? ` (3 shipments - ${detail?.shipment_breakdown?.join(', ')})`
            : ''
        }`,
        dose: detail?.dose,
        medData: {
          name: `${capitalize(
            detail?.subscription_plan?.split('_')[0]
          )} weekly injections`,
          type: MedicationType.WEIGHT_LOSS,
          price: detail?.price,
          discounted_price: false,
          dosage: `${detail?.vial_size?.trim()}`,
          dose: detail?.dose,
          quantity: 1,
          recurring: {
            interval: 'day',
            interval_count: 30,
          },
          medication_quantity_id: 98,
        },
      };
    });

  console.log(alternativeMonthlyCompoundDetails, 'altMonthlyComdeta');
  const alternativeMultiMonthCompoundDetails = compoundMatrixMed
    ?.filter(med => {
      return (
        med?.subscription_plan ===
          `${
            medicationSelected?.toLowerCase() === 'semaglutide'
              ? 'tirzepatide'
              : 'semaglutide'
          }_multi_month` &&
        med.active &&
        med?.current_month === 1 &&
        med?.states?.includes(
          UsStates.find(s => s.abbreviation === patientInfo?.region)?.name || ''
        )
      );
    })
    .map(detail => {
      return {
        title: `Switch to 3-month supply of ${
          medicationSelected?.toLowerCase() === 'semaglutide'
            ? 'tirzepatide'
            : 'semaglutide'
        }`,
        subtitle: `Request an update to your medication subscription to change from ${medicationSelected?.toLowerCase()} to a 3-month supply of ${
          medicationSelected?.toLowerCase() === 'semaglutide'
            ? 'tirzepatide'
            : 'semaglutide'
        }`,
        medication: `${capitalize(detail?.subscription_plan?.split('_')[0])} ${
          detail?.vial_size
        }${
          detail?.shipment_breakdown?.length === 3 &&
          detail?.pharmacy === 'Empower'
            ? ` (3 vials included - ${detail?.shipment_breakdown?.join(', ')})`
            : detail?.shipment_breakdown?.length === 3 &&
              !['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
            ? ` (3 vials included in shipment - ${detail?.shipment_breakdown?.join(
                ', '
              )})`
            : detail?.shipment_breakdown?.length === 3 &&
              ['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
            ? ` (3 shipments - ${detail?.shipment_breakdown?.join(', ')})`
            : ''
        }`,
        dose: detail?.dose,
        medData: {
          name: `${capitalize(
            detail?.subscription_plan?.split('_')[0]
          )} weekly injections`,
          type: MedicationType.WEIGHT_LOSS,
          price: detail?.price,
          discounted_price:
            detail?.shipment_breakdown?.length === 3
              ? detail?.price / 3
              : false,
          dosage: `${detail?.vial_size?.trim()}${
            detail?.shipment_breakdown?.length === 3 &&
            detail?.pharmacy === 'Empower'
              ? ` (3 vials included - ${detail?.shipment_breakdown?.join(
                  ', '
                )})`
              : detail?.shipment_breakdown?.length === 3 &&
                !['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
              ? ` (3 vials included in shipment - ${detail?.shipment_breakdown?.join(
                  ', '
                )})`
              : detail?.shipment_breakdown?.length === 3 &&
                ['Red Rock', 'Belmar'].includes(detail?.pharmacy || '')
              ? ` (3 shipments - ${detail?.shipment_breakdown?.join(', ')})` // if this component is used again in the future, will need to replicate the logic from Weightlosstreatment for the shipment breakdown
              : ''
          }`,
          dose: detail?.dose,
          quantity: 1,
          recurring: {
            interval: 'day',
            interval_count: 90,
          },
          medication_quantity_id: 98,
        },
      };
    });
  console.log(alternativeMultiMonthCompoundDetails, 'altmutliComdeta');

  const handleChange = (value: string) => {
    setDisplayError(false);
    setChecked(value);
  };

  async function handleConfirmMed() {
    setLoading(true);
    Router.push(
      {
        query: {
          name: name ?? '',
          code,
          question_name,
          med: medicationSelected,
          quantity: true,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  useEffect(() => {
    if (checked === 'skip') {
      if (!!medicationSelected && compoundDetails) {
        addMedication(
          recurringMedication?.interval_count === 30
            ? compoundDetails?.[medicationSelected].medData
            : compoundDetails?.[medicationSelected].medBulkData
        );
      }
    }
  }, [
    checked,
    medicationSelected,
    compoundDetails,
    recurringMedication?.interval_count,
  ]);

  async function handleConfirmQuantity() {
    if (!checked.length) {
      return setDisplayError(true);
    }
    setDisplayError(false);

    if (checked === 'skip') {
      const medicationRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: 'REQUESTED',
        note: `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - ${
          recurringMedication?.interval_count === 30 ? '1 month' : '3 months'
        }. Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: recurringMedication?.price || 0,
        shipping_method: 1,
        charge: true,
      };
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .insert(medicationRequest)
        .select()
        .maybeSingle();
      console.log(prescriptionRequest, 'pres123');
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
            queue_type: 'Provider',
          })
          .select()
          .maybeSingle()
          .then(({ data }) => data);
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);

        recurringMedication?.interval_count === 30
          ? await Promise.allSettled([
              vwoClient?.track(
                '3452',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '7895',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '7458',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '8078',
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
                '5867',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '5053',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '6303',
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
              vwoClient?.track(
                '5751',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              ABZTest.trackMetric(
                'Clone_5871',
                patient?.profile_id!,
                '1MonthPrescriptionRequestSubmitted'
              ),
              ABZTest.trackMetric(
                '6465_new',
                patient?.profile_id!,
                '1MonthPrescriptionRequestSubmitted'
              ),
              vwoClient?.track(
                '5751',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '5777',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                'Clone_4687',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '4918',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '6826',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
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
                '7752',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '7746-2',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '7934',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '4798',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '7960',
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
                '7935',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '8676',
                '1MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '9363',
                '1MonthPrescriptionRequestSubmitted',
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
            ])
          : await Promise.allSettled([
              vwoClient?.track(
                '7895',
                '3MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '3452',
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
                '5871_new',
                '3MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track(
                '5053',
                '3MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              ABZTest.trackMetric(
                '5871_new',
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
                '5777',
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
                '6826',
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
                '7746-2',
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
                '8676',
                '3MonthPrescriptionRequestSubmitted',
                patientInfo
              ),
              vwoClient?.track('8676', 'bundled3MonthUpsell', patientInfo),
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
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medications?.[0]?.name,
          recurringMedication?.interval_count === 30 ? '1-month' : '3-months'
        );
        toast.success('Prescription request has been submitted');
        return Router.push('/patient-portal');
      }
    }

    if (!!medicationSelected && (compoundDetails || otherMedicationMedData)) {
      addMedication(
        checked === 'bulk'
          ? compoundDetails?.[medicationSelected].medBulkData
          : checked === 'single'
          ? compoundDetails?.[medicationSelected].medData
          : checked === 'same'
          ? recentOrderCompoundDetails?.[0]?.medData
          : checked === 'altMonthly'
          ? alternativeMonthlyCompoundDetails?.[0]?.medData
          : checked === 'altMulti'
          ? alternativeMultiMonthCompoundDetails?.[0]?.medData
          : otherMedicationMedData
      );
    }

    Router.push(
      {
        query: {
          name: name ?? '',
          code,
          question_name,
          med: medicationSelected,
          review: true,
          refill: true,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }
  console.log(
    Math.round(
      (recentOrder?.total_price || 0) /
        parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
    ) -
      Math.round(
        (singlePlan ? singleMed?.price : nextMed?.price) /
          (singlePlan
            ? parseFloat(singleMed?.med?.vial_size?.split(' ')[0] || '0')
            : parseFloat(nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'))
      ),
    'mgSaving'
  );
  async function selectMedication(med: MedProps) {
    Router.push(
      {
        query: {
          name: name ?? '',
          code,
          question_name,
          med: med.brand,
        },
      },
      undefined,
      { shallow: true }
    );
    if (patientInfo?.region === 'CO') {
      med.brand === 'Semaglutide'
        ? choseSemaglutideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles.last_name || '',
            patientInfo?.profiles.email || ''
          )
        : choseTirzepatideColoradoEvent(
            patientInfo?.profiles?.first_name || '',
            patientInfo?.profiles.last_name || '',
            patientInfo?.profiles.email || ''
          );
    }
    window.scrollTo({ top: 0, left: 0 });
  }
  console.log(singleMed, 'singleMed123');
  console.log(bulkPlan, 'bulk', singlePlan, 'single');
  console.log(recentOrder?.total_price, 'recentPrice');
  console.log(
    nextMed?.price,
    'nextMedprice',
    singleMed?.price,
    'singleMedPrice'
  );
  console.log(
    Math.round((nextMed?.price - (recentOrder?.total_price || 0)) / 3),
    '3month',
    Math.round((singleMed?.price - (recentOrder?.total_price || 0)) / 3),
    '1 month'
  );
  console.log(
    Math.round((135 - 108) * 2 + (nextMed?.price * 3 - singleMed?.price)),
    '3Savingmonth',
    Math.round((135 - 108) * 2 + (singleMed?.price * 3 - nextMed?.price)),
    '1SavingMonth'
  );
  console.log(
    Math.round(
      (recentOrder?.total_price || 0) /
        parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
    ) -
      Math.round(
        (singlePlan ? singleMed?.price : nextMed?.price) /
          (singlePlan
            ? parseFloat(singleMed?.med?.vial_size?.split(' ')[0] || '0')
            : parseFloat(nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'))
      ),
    'mgSavingTotal123'
  );

  const monthlyMgSavingTotal =
    Math.round(
      (recentOrder?.total_price || 0) /
        parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
    ) -
    Math.round(
      (singlePlan ? singleMed?.price : nextMed?.price) /
        (singlePlan
          ? parseFloat(singleMed?.med?.vial_size?.split(' ')[0] || '0')
          : parseFloat(nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'))
    );
  const quarterlySavingTotal = singlePlan
    ? Math.round(nextMed?.price / 3 - (recentOrder?.total_price || 0) / 3)
    : Math.round(singleMed?.price / 3 - (recentOrder?.total_price || 0) / 3);

  async function fetchCompoundDetails() {
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving: bulkPlan
          ? Math.round(
              (135 - 108) * 2 + (nextMed?.price * 3 - singleMed?.price)
            )
          : Math.round(
              (135 - 108) * 2 + (singleMed?.price * 3 - nextMed?.price)
            ),
        price: singlePlan ? singleMed?.price : nextMed?.price,
        discountedPrice: singlePlan
          ? Math.round(nextMed?.price / 3)
          : Math.round(singleMed?.price / 3),
        name: medicationSelected || '',
        title: isMonthlyRecurring
          ? `Switch to 3-month supply for an additional $${
              singlePlan
                ? Math.round(nextMed?.price - singleMed?.price)
                : Math.round(singleMed?.price - nextMed?.price)
            } on your next payment (save $${
              bulkPlan
                ? Math.round(
                    (135 - 108) * 2 + nextMed?.price - singleMed?.price / 3
                  )
                : Math.round(
                    (135 - 108) * 2 + singleMed?.price - nextMed?.price / 3
                  )
            }/month).`
          : variationName3452 == 'Variation-1'
          ? `Increase your dosage with no change to your medication subscription price ($${recurringMedication?.price} every 3 months)`
          : `Increase your monthly dosage ${
              quarterlySavingTotal > 0
                ? `for an additional $${
                    singlePlan
                      ? Math.round(
                          nextMed?.price / 3 -
                            (recentOrder?.total_price || 0) / 3
                        )
                      : Math.round(
                          singleMed?.price / 3 -
                            (recentOrder?.total_price || 0) / 3
                        )
                  } per month (save $${
                    (Math.round(
                      (recentOrder?.total_price || 0) /
                        parseFloat(
                          recentOrder?.total_dose?.split(' ')[1] || '0'
                        )
                    ) -
                      Math.round(
                        (singlePlan ? nextMed?.price : singleMed?.price) /
                          (singlePlan
                            ? parseFloat(
                                nextMed?.selectedMed?.vial_size?.split(
                                  ' '
                                )[0] || '0'
                              )
                            : parseFloat(
                                singleMed?.med?.vial_size?.split(' ')[0] || '0'
                              ))
                      )) *
                    (singlePlan
                      ? parseFloat(
                          nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'
                        )
                      : parseFloat(
                          singleMed?.med?.vial_size?.split(' ')[0] || '0'
                        ))
                  } with lower cost per mg)`
                : ''
            }`,
        singleTitle:
          variationName3452 === 'Variation-1'
            ? 'Increase your monthly dosage for no additional cost'
            : `Increase your monthly dosage for an additional $${
                singlePlan
                  ? Math.round(
                      (singleMed?.price - (recentOrder?.total_price || 0)) / 3
                    )
                  : Math.round(nextMed?.price - (recentOrder?.total_price || 0))
              } per month ${
                monthlyMgSavingTotal > 0
                  ? `(save $${
                      Math.round(
                        (recentOrder?.total_price || 0) /
                          parseFloat(
                            recentOrder?.total_dose?.split(' ')[1] || '0'
                          )
                      ) -
                      Math.round(
                        (singlePlan ? singleMed?.price : nextMed?.price) /
                          (singlePlan
                            ? parseFloat(
                                singleMed?.med?.vial_size?.split(' ')[0] || '0'
                              )
                            : parseFloat(
                                nextMed?.selectedMed?.vial_size?.split(
                                  ' '
                                )[0] || '0'
                              ))
                      )
                    } with lower cost per mg)`
                  : ''
              }`,
        dosage: bulkPlan
          ? `${singleMed?.med?.vial_size?.trim()}${
              singleMed.med?.shipment_breakdown?.length === 3 &&
              singleMed?.med?.pharmacy === 'Empower'
                ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`
          : `${nextMed?.selectedMed?.vial_size?.trim()}${
              nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
              nextMed?.selectedMed?.pharmacy === 'Empower'
                ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`,
        singleDosage: singlePlan
          ? `${singleMed?.med?.vial_size?.trim()}${
              singleMed?.med?.shipment_breakdown?.length === 3 &&
              singleMed?.med?.pharmacy === 'Empower'
                ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : singleMed?.med?.shipment_breakdown?.length === 3 &&
                  singleMed?.med?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`
          : `${nextMed?.selectedMed?.vial_size?.trim()}${
              nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
              nextMed?.selectedMed?.pharmacy === 'Empower'
                ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                  nextMed?.selectedMed?.pharmacy === 'Red Rock'
                ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                    ', '
                  )})`
                : ''
            }`,
        singleDescription: `Save on $ per mg of medication when you increase your dosage (if approved by provider)`,
        mgSavings:
          quarterlySavingTotal > 0
            ? `Your cost per mg of ${medicationSelected} will decrease from $${Math.round(
                (recentOrder?.total_price || 0) /
                  parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
              )} to $${Math.round(
                (singlePlan ? nextMed?.price : singleMed?.price) /
                  (singlePlan
                    ? parseFloat(
                        nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'
                      )
                    : parseFloat(
                        singleMed?.med?.vial_size?.split(' ')[0] || '0'
                      ))
              )}`
            : '',
        body1:
          'You’ll get 20% off the next 3 months of your weight loss membership. This means your next 3 months of membership will be just $108/month.',
        body2:
          'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
        medData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS,
          price: singlePlan ? singleMed.price : nextMed?.price,
          dosage: singlePlan
            ? `${singleMed?.med?.vial_size?.trim()}${
                singleMed?.med?.shipment_breakdown?.length === 3 &&
                singleMed?.med?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`
            : `${nextMed?.selectedMed?.vial_size?.trim()}${
                nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                nextMed?.selectedMed?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`,
          dose: singlePlan ? singleMed?.med?.dose : nextMed?.selectedMed?.dose,
          mgSavings:
            monthlyMgSavingTotal > 0
              ? `Your cost per mg of ${medicationSelected} will decrease from $${Math.round(
                  (recentOrder?.total_price || 0) /
                    parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
                )} to $${Math.round(
                  (singlePlan ? singleMed?.price : nextMed?.price) /
                    (singlePlan
                      ? parseFloat(
                          singleMed?.med?.vial_size?.split(' ')[0] || '0'
                        )
                      : parseFloat(
                          nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'
                        ))
                )}`
              : '',
          singlePaymentTitle: `Most members increase their dosage at this point. ${
            monthlyMgSavingTotal > 0
              ? `If you increase your dosage, you will save $${
                  Math.round(
                    (recentOrder?.total_price || 0) /
                      parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
                  ) -
                  Math.round(
                    (singlePlan ? singleMed?.price : nextMed?.price) /
                      (singlePlan
                        ? parseFloat(
                            singleMed?.med?.vial_size?.split(' ')[0] || '0'
                          )
                        : parseFloat(
                            nextMed?.selectedMed?.vial_size?.split(' ')[0] ||
                              '0'
                          ))
                  )
                } per mg of ${medicationSelected?.toLowerCase()}`
              : ''
          }`,
          quantity: 1,
          recurring: {
            interval: 'day',
            interval_count: 30,
          },
          medication_quantity_id: 98,
        },
        medBulkData: {
          name: `${medicationSelected} weekly injections`,
          type: MedicationType.WEIGHT_LOSS,
          price: singlePlan ? singleMed.price : nextMed?.price,
          discounted_price: singlePlan
            ? nextMed?.price / 3
            : singleMed?.price / 3,
          dosage: singlePlan
            ? `${nextMed?.selectedMed?.vial_size?.trim()}${
                nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                nextMed?.selectedMed?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : nextMed?.selectedMed?.shipment_breakdown?.length === 3 &&
                    nextMed?.selectedMed?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${nextMed?.selectedMed?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`
            : `${singleMed?.med?.vial_size?.trim()}${
                singleMed?.med?.shipment_breakdown?.length === 3 &&
                singleMed?.med?.pharmacy === 'Empower'
                  ? ` (3 vials included - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy !== 'Red Rock'
                  ? ` (3 vials included in shipment - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : singleMed?.med?.shipment_breakdown?.length === 3 &&
                    singleMed?.med?.pharmacy === 'Red Rock'
                  ? ` (3 shipments - ${singleMed?.med?.shipment_breakdown?.join(
                      ', '
                    )})`
                  : ''
              }`,
          dose: singlePlan ? nextMed?.selectedMed?.dose : singleMed?.med?.dose,
          mgSavings:
            quarterlySavingTotal > 0
              ? `Your cost per mg of ${medicationSelected} will decrease from $${Math.round(
                  (recentOrder?.total_price || 0) /
                    parseFloat(recentOrder?.total_dose?.split(' ')[1] || '0')
                )} to $${Math.round(
                  (singlePlan ? nextMed?.price : singleMed?.price) /
                    (singlePlan
                      ? parseFloat(
                          nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'
                        )
                      : parseFloat(
                          singleMed?.med?.vial_size?.split(' ')[0] || '0'
                        ))
                )}`
              : '',
          quantity: 1,
          recurring: {
            interval: 'day',
            interval_count: 90,
          },
          medication_quantity_id: 98,
        },
      },
    };
    setCompoundDetails(object);
  }

  function extractWeeklyDosage(instruction: string) {
    if (!instruction || typeof instruction !== 'string') return null;
    const dosageMatch = instruction?.match(/(\d+(\.\d+)?) ?mg/);
    if (dosageMatch) {
      let dosage = dosageMatch[1];
      return `${dosage} mg per week`;
    }
    return null;
  }

  useEffect(() => {
    if (nextMed) {
      setCurrMonth(nextMed.currentMonth);
      let plan = nextMed.currentPlan;

      if (plan === 'semaglutide_multi_month') {
        setSinglePlan('semaglutide_multi_month');
      }
      if (plan === 'semaglutide_monthly') {
        setBulkPlan('semaglutide_multi_month');
      }
      if (plan === 'semaglutide_monthly') {
        setBulkPlan('semaglutide_multi_month');
      }
      if (plan === 'tirzepatide_multi_month') {
        setSinglePlan('tirzepatide_multi_month');
      }
      if (plan === 'tirzepatide_monthly') {
        setBulkPlan('tirzepatide_multi_month');
      }
      if (plan === 'tirzepatide_monthly') {
        setBulkPlan('tirzepatide_multi_month');
      }
    }
  }, [nextMed, singleMed?.med]);

  useEffect(() => {
    if (singleMed?.med && nextMed?.selectedMed) {
      fetchCompoundDetails();
    }
  }, [
    singleMed?.med,
    nextMed?.selectedMed,
    skipTitration,
    learnMore,
    learnSingleMore,
    medicationSelected,
    Router.asPath,
  ]);
  console.log(
    parseFloat(nextMed?.selectedMed?.vial_size?.split(' ')[0] || '0'),
    'vialSize'
  );
  console.log(patientOrders?.length, 'order123', isFetched, 'ISFETCHED');
  console.log(Router?.asPath, 'asPath');

  useEffect(() => {
    if (
      (isFetched || patientOrders?.length) &&
      Router?.asPath?.includes('RECURRING_TREATMENT_OPTIONS')
    ) {
      setMedicationSelected(
        patientOrders
          ?.find(o =>
            ['semaglutide', 'tirzepatide']?.includes(
              o?.prescription?.medication?.toLowerCase()?.split(' ')?.[0] || ''
            )
          )
          ?.prescription?.medication?.split(' ')?.[0] || ''
      );
    }
  }, [isFetched, patientOrders]);
  const sortMedications = (medications: MedProps[], preferredMed: string) => {
    if (!preferredMed) return medications;
    // Find the index of the preferred medication
    const preferredIndex = medications.findIndex(
      medication =>
        medication.brand?.toLowerCase() === preferredMed.toLowerCase()
    );

    // If the preferred medication is found, move it to the front
    if (preferredIndex !== -1) {
      const preferredMedication = medications[preferredIndex];
      medications.splice(preferredIndex, 1);
      medications.unshift(preferredMedication);
    }

    return medications;
  };
  async function handleGLP1Refill() {
    resetQuestionnaires();
    addQuestionnaires(mapCareToQuestionnaires(['Weight Loss Refill']));
    Router.push('/patient-portal/questionnaires-v2/weight-loss-refill');
  }
  const medName =
    patientOrders
      ?.find(o =>
        ['semaglutide', 'tirzepatide']?.includes(
          o?.prescription?.medication?.toLowerCase()?.split(' ')?.[0] || ''
        )
      )
      ?.prescription?.medication?.split(' ')?.[0] || '';

  const handleDisplay = () => {
    setDisplayMore(displayMore => !displayMore);
  };

  const language = useLanguage();
  let lockIn =
    'Lock in 20%+ by upgrading your medication subscription to a 3-month supply?';
  let canHelp =
    'We can help with your refill. Your provider will review and make sure that you receive the appropriate dosage.';
  let canHelpSave =
    'We can help you save on $ per mg of medication. Your provider will review and make sure that you receive the appropriate dosage.';
  let limitedTime =
    'For a limited time, Zealthy is offering a 20% discount on your next 3 months of membership if you get a 3 month supply.';
  let increaseDosage =
    "Don't want to increase your dosage? Save $ by staying at your current dosage.";
  let stayCurrentDosage =
    'Changed your mind and want to increase your dosage? See options for higher doses, which most members choose.';

  if (language === 'esp') {
    lockIn =
      '¿Asegura un 20%+ de ahorro al actualizar tu suscripción de medicamentos a un suministro de 3 meses?';
    canHelp =
      'Podemos ayudarte con tu reposición. Tu proveedor revisará y se asegurará de que recibas la dosis adecuada.';
    canHelpSave =
      'Podemos ayudarte a ahorrar en $ por mg de medicamento. Tu proveedor revisará y se asegurará de que recibas la dosis adecuada.';
    limitedTime =
      'Por tiempo limitado, Zealthy está ofreciendo un 20% de descuento en tus próximos 3 meses de membresía si obtienes un suministro de 3 meses.';
    increaseDosage =
      '¿No quieres aumentar tu dosis? Ahorra $ manteniéndote en tu dosis actual.';
    stayCurrentDosage =
      '¿Cambiaste de opinión y quieres aumentar tu dosis? Ve opciones para dosis más altas, que es lo que la mayoría de los miembros eligen.';
  }

  return (
    <Container maxWidth="sm">
      {review && (
        <>
          {!['bulk', 'altMulti', 'same', 'skip'].includes(checked) ? (
            <RecurringWeightLossMedicationAddOn
              onNext={() => Router.push('/patient-portal')}
              isRefill
            />
          ) : checked === 'same' ? (
            <SameMedication
              onNext={() => Router.push('/patient-portal')}
              recurringMedicationSub={recurringMedication || null}
              patient={patientInfo}
            />
          ) : checked === 'skip' ? (
            <Spinner />
          ) : (
            <RecurringWeightLossBulkAddOn
              onNext={() => Router.push('/patient-portal')}
            />
          )}
        </>
      )}
      {medicationSelected && (!nextMed || !singleMed || !compoundDetails) ? (
        <Spinner />
      ) : (
        <>
          {medicationSelected && !review && quantity && compoundDetails && (
            <Box>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {isMonthlyRecurring
                  ? lockIn
                  : variationName3452 === 'Variation-1'
                  ? language === 'esp'
                    ? 'Podemos ayudarte con tu reposición. Tu proveedor revisará y se asegurará de que recibas la dosis adecuada.'
                    : 'We can help with your refill. Your provider will review and make sure that you receive the appropriate dosage.'
                  : language === 'esp'
                  ? 'Podemos ayudarte a ahorrar en $ por mg de medicamento. Tu proveedor revisará y se asegurará de que recibas la dosis adecuada.'
                  : 'We can help you save on $ per mg of medication. Your provider will review and make sure that you receive the appropriate dosage.'}
              </Typography>
              <Stack spacing={2} mb={3}>
                <Typography variant="subtitle1">
                  {language === 'esp'
                    ? `${
                        isMonthlyRecurring ? 'Por tiempo limitado, ' : ''
                      } Zealthy está ofreciendo un 20% de descuento en tus
                    próximos 3 meses de membresía si obtienes un suministro de 3 meses.`
                    : `${
                        isMonthlyRecurring ? 'For a limited time, ' : ''
                      } Zealthy is offering a 20% discount on your
                    next 3 months of membership if you get a 3 month supply.`}
                </Typography>
                {variationName && variationName === 'Variation-1' && (
                  <Link
                    onClick={() => setSkipTitration(!skipTitration)}
                    style={{
                      textDecoration: 'underline',
                      color: '#373B3D',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {skipTitration
                      ? language === 'esp'
                        ? '¿Cambiaste de opinión y quieres aumentar tu dosis? Ve opciones para dosis más altas, que es lo que la mayoría de los miembros eligen.'
                        : 'Changed your mind and want to increase your dosage? See options for higher doses, which most members choose.'
                      : language === 'esp'
                      ? '¿No quieres aumentar tu dosis? Ahorra $ manteniéndote en tu dosis actual.'
                      : "Don't want to increase your dosage? Save $ by staying at your current dosage."}
                  </Link>
                )}
                {isMonthlyRecurring ? (
                  <Typography variant="subtitle1">
                    {`Want to switch from ${medicationSelected.toLowerCase()} to ${
                      medicationSelected === 'Semaglutide'
                        ? 'tirzepatide'
                        : 'semaglutide'
                    }?`}{' '}
                    <Link
                      onClick={() => {
                        setCompoundDetails(null);
                        setMedicationSelected(
                          medicationSelected === 'Semaglutide'
                            ? 'Tirzepatide'
                            : 'Semaglutide'
                        );
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      {'See these options.'}
                    </Link>
                  </Typography>
                ) : null}
              </Stack>
              <Box
                sx={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '1rem',
                  gap: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  handleChange('bulk');
                }}
              >
                {((['Variation-1', 'Control']?.includes(variationName3452) ||
                  !variationName3452) &&
                  isMonthlyRecurring) ||
                (variationName3452 !== 'Variation-1' && !isMonthlyRecurring) ? (
                  <Box
                    sx={{
                      borderRadius: '0.75rem',
                      background: '#F7F9A5',
                      display: 'flex',
                      width: '17rem',
                      height: '3.25rem',
                      padding: '1rem 1.25rem',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      alignSelf: 'center',
                      fontWeight: 600,
                    }}
                  >{`Best Value`}</Box>
                ) : null}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <Checkbox
                    value={checked}
                    checked={checked === 'bulk'}
                    inputProps={{
                      'aria-label': 'controlled',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="h3" fontWeight="600" mb="0.3rem">
                        {compoundDetails[medicationSelected]?.title}
                      </Typography>
                    </Box>

                    {variationName3452 !== 'Variation-1' ? (
                      <Typography variant="body1" fontSize="14px !important">
                        <Typography
                          component="span"
                          variant="body1"
                          fontSize="14px !important"
                          sx={{
                            marginRight: '0.2rem',
                            width: '20px',
                          }}
                        >
                          {`Next Payment: `}
                        </Typography>
                        {`${format(
                          recurringMedication?.current_period_end &&
                            !isNaN(
                              new Date(
                                recurringMedication.current_period_end
                              ).getTime()
                            )
                            ? new Date(recurringMedication.current_period_end)
                            : new Date(),
                          'MMMM d, yyyy'
                        )}`}
                      </Typography>
                    ) : null}

                    <Typography variant="body1" fontSize="14px !important">
                      {`${
                        compoundDetails[medicationSelected]?.name
                      } ${compoundDetails[medicationSelected]?.dosage.replace(
                        'mgs',
                        'mg'
                      )}`}
                    </Typography>
                    <Typography fontSize="14px !important">
                      {compoundDetails[medicationSelected]?.mgSavings}
                    </Typography>

                    {currMonth && medications?.[0]?.name ? (
                      <CompoundDisclaimer
                        currentMonth={currMonth}
                        medication={medications[0]?.name}
                        styles={{
                          marginBottom: '1rem',
                          marginTop: '1rem',
                        }}
                      />
                    ) : null}

                    {learnMore ? (
                      <>
                        <Typography
                          variant="body1"
                          mb="1rem"
                          fontSize="0.75rem !important"
                        >
                          {compoundDetails?.[medicationSelected]?.body1}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                        >
                          {compoundDetails?.[medicationSelected]?.body2}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                        >
                          {"What's included:"}
                        </Typography>
                        <List
                          sx={{
                            listStyleType: 'disc',
                            pl: 3,
                            marginBottom: '8px',
                          }}
                        >
                          <ListItem
                            sx={{
                              fontSize: '0.75rem !important',
                              display: 'list-item',
                              padding: 0,
                            }}
                          >
                            {singlePlan
                              ? `${
                                  nextMed?.selectedMed?.shipment_breakdown
                                    ?.length === 3 &&
                                  nextMed?.selectedMed?.pharmacy !==
                                    'Red Rock' &&
                                  nextMed?.selectedMed?.pharmacy !== 'Belmar'
                                    ? `3 ${medicationSelected} vials in 1 package (${nextMed?.selectedMed?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : nextMed?.selectedMed?.shipment_breakdown
                                        ?.length === 3 &&
                                      (nextMed?.selectedMed?.pharmacy ===
                                        'Red Rock' ||
                                        nextMed?.selectedMed?.pharmacy ===
                                          'Belmar')
                                    ? `3 ${medicationSelected} vials in 3 packages (${nextMed?.selectedMed?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : nextMed?.selectedMed?.duration_in_days ===
                                        90 &&
                                      nextMed?.selectedMed?.number_of_vials ===
                                        2
                                    ? `2 ${medicationSelected} vials in 1 package (${nextMed?.selectedMed?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : nextMed?.selectedMed?.duration_in_days ===
                                        90 &&
                                      nextMed?.selectedMed?.number_of_vials ===
                                        1
                                    ? `${medicationSelected} ${nextMed?.selectedMed?.shipment_breakdown?.[0]} (1 vial)`
                                    : ''
                                }`
                              : `${
                                  singleMed?.med?.shipment_breakdown?.length ===
                                    3 &&
                                  singleMed?.med?.pharmacy !== 'Red Rock' &&
                                  singleMed?.med?.pharmacy !== 'Belmar'
                                    ? `3 ${medicationSelected} vials in 1 package (${singleMed?.med?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : singleMed?.med?.shipment_breakdown
                                        ?.length === 3 &&
                                      (singleMed?.med?.pharmacy ===
                                        'Red Rock' ||
                                        singleMed?.med?.pharmacy === 'Belmar')
                                    ? `3 ${medicationSelected} vials in 3 packages (${singleMed?.med?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : singleMed?.med?.duration_in_days === 90 &&
                                      singleMed?.med?.number_of_vials === 2
                                    ? `2 ${medicationSelected} vials in 1 package (${singleMed?.med?.shipment_breakdown?.join(
                                        ', '
                                      )})`
                                    : singleMed?.med?.duration_in_days === 90 &&
                                      singleMed?.med?.number_of_vials === 1
                                    ? `${medicationSelected} ${singleMed?.med?.shipment_breakdown?.[0]} (1 vial)`
                                    : ''
                                }`}
                          </ListItem>
                          <ListItem
                            sx={{
                              fontSize: '0.75rem !important',
                              display: 'list-item',
                              padding: 0,
                            }}
                          >
                            {'Injection needles'}
                          </ListItem>
                          <ListItem
                            sx={{
                              fontSize: '0.75rem !important',
                              display: 'list-item',
                              padding: 0,
                            }}
                          >
                            {'Alcohol pads'}
                          </ListItem>
                          <ListItem
                            sx={{
                              fontSize: '0.75rem !important',
                              display: 'list-item',
                              padding: 0,
                            }}
                          >
                            {
                              'Injection instructions pamphlet (video will be in your Zealthy home page)'
                            }
                          </ListItem>
                          <ListItem
                            sx={{
                              fontSize: '0.75rem !important',
                              display: 'list-item',
                              padding: 0,
                            }}
                          >
                            {
                              'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                            }
                          </ListItem>
                        </List>
                        <Typography
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                        >
                          Injection instructions and video will be in your
                          Zealthy home page once prescribed:
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          fontSize="0.75rem !important"
                          mb="1rem"
                          sx={{
                            '.subtitle': {
                              color: '#989898',
                              fontFamily: 'Inter',
                              fontSize: '0.625rem',
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
                            __html: DOMPurify.sanitize(
                              String(
                                singlePlan
                                  ? nextMed?.selectedMed?.dose
                                  : singleMed?.med?.dose
                              )
                            ),
                          }}
                        />
                        <Typography
                          fontSize="0.75rem !important"
                          fontStyle="italic"
                          mb="1rem"
                        >
                          {medicationSelected
                            ?.toLowerCase()
                            ?.includes('semaglutide')
                            ? `**This is based on data from a 2022 study published the American Medical Association titled "Weight Loss Outcomes Associated With Semaglutide Treatment for Patients With Overweight or Obesity.`
                            : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </Box>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setLearnMore(more => !more)}
                >
                  {learnMore ? 'View less' : 'Learn more'}
                  {learnMore ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </Button>
              </Box>

              {isMonthlyRecurring ? (
                <Box
                  sx={{
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    background: '#ffffff',
                    boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '3rem',
                    gap: '1.5rem',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleChange(
                      variationName3452 !== 'Variation-1' ? 'single' : 'skip'
                    )
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <Checkbox
                      value={checked}
                      checked={
                        variationName3452 !== 'Variation-1'
                          ? checked === 'single'
                          : checked === 'skip'
                      }
                      inputProps={{
                        'aria-label': 'controlled',
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="h3" fontWeight="600" mb="0.3rem">
                          {compoundDetails[medicationSelected]?.singleTitle}
                        </Typography>
                      </Box>
                      {monthlyMgSavingTotal > 0 ? (
                        <Typography
                          variant="body1"
                          fontSize="14px !important"
                          fontWeight={700}
                        >
                          {
                            compoundDetails[medicationSelected]
                              ?.singleDescription
                          }
                        </Typography>
                      ) : null}
                      <Typography variant="body1">
                        {' '}
                        {`${
                          compoundDetails[medicationSelected]?.name
                        } ${compoundDetails[
                          medicationSelected
                        ]?.singleDosage.replace('mgs', 'mg')}`}{' '}
                        (
                        {extractWeeklyDosage(
                          compoundDetails[medicationSelected]?.medData?.dose ??
                            ''
                        )}
                        )
                      </Typography>
                      {monthlyMgSavingTotal > 0 ? (
                        <Typography fontSize="14px !important" mb="1rem">
                          {
                            compoundDetails[medicationSelected]?.medData
                              ?.mgSavings
                          }
                        </Typography>
                      ) : null}
                      {learnSingleMore ? (
                        <>
                          <Typography
                            variant="body1"
                            fontSize="0.75rem !important"
                          >
                            {"What's included:"}
                          </Typography>
                          <List
                            sx={{
                              listStyleType: 'disc',
                              pl: 3,
                              marginBottom: '8px',
                            }}
                          >
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {`${
                                compoundDetails?.[medicationSelected]?.name
                              } ${compoundDetails?.[
                                medicationSelected
                              ]?.singleDosage?.replace('mgs', 'mg')}`}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {'Injection needles'}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {'Alcohol pads'}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {
                                'Injection instructions pamphlet (video will be in your Zealthy home page)'
                              }
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {
                                'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                              }
                            </ListItem>
                          </List>
                          <Typography
                            variant="body1"
                            fontSize="0.75rem !important"
                            mb="1rem"
                          >
                            Injection instructions and video will be in your
                            Zealthy home page once prescribed:
                          </Typography>
                          <Typography
                            component="div"
                            variant="body1"
                            fontSize="0.75rem !important"
                            mb="1rem"
                            sx={{
                              '.subtitle': {
                                color: '#989898',
                                fontFamily: 'Inter',
                                fontSize: '0.625rem',
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
                              __html: DOMPurify.sanitize(
                                String(
                                  singlePlan
                                    ? singleMed?.med?.dose
                                    : nextMed?.selectedMed?.dose
                                )
                              ),
                            }}
                          />
                        </>
                      ) : null}
                    </Box>
                  </Box>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => setLearnSingleMore(more => !more)}
                  >
                    {learnSingleMore ? 'View less' : 'Learn more'}
                    {learnSingleMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </Box>
              ) : null}
              {variationName3452 === 'Variation-1' && !isMonthlyRecurring ? (
                <Box
                  sx={{
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    background: '#ffffff',
                    boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '1rem',
                    gap: '1.5rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleChange('same')}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <Checkbox
                      value={checked}
                      checked={checked === 'same'}
                      inputProps={{
                        'aria-label': 'controlled',
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="h3" fontWeight="600" mb="0.3rem">
                          {recentOrderCompoundDetails?.[0]?.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        mb="1rem"
                        fontSize="14px !important"
                      >
                        {recentOrderCompoundDetails?.[0]?.subtitle}
                      </Typography>
                      <Typography variant="body1" mb="1rem">
                        {recentOrderCompoundDetails?.[0]?.medication}
                      </Typography>
                      {learnSameMore ? (
                        <>
                          {' '}
                          <Typography
                            variant="body1"
                            fontSize="0.75rem !important"
                          >
                            {"What's included:"}
                          </Typography>
                          <List
                            sx={{
                              listStyleType: 'disc',
                              pl: 3,
                              marginBottom: '8px',
                            }}
                          >
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {`${recentOrder?.total_dose}`}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {'Injection needles'}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {'Alcohol pads'}
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {
                                'Injection instructions pamphlet (video will be in your Zealthy home page)'
                              }
                            </ListItem>
                            <ListItem
                              sx={{
                                fontSize: '0.75rem !important',
                                display: 'list-item',
                                padding: 0,
                              }}
                            >
                              {
                                'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                              }
                            </ListItem>
                          </List>
                          <Typography
                            variant="body1"
                            fontSize="0.75rem !important"
                            mb="1rem"
                          >
                            Injection instructions and video will be in your
                            Zealthy home page once prescribed:
                          </Typography>
                          <Typography
                            component="div"
                            variant="body1"
                            fontSize="0.75rem !important"
                            mb="1rem"
                            sx={{
                              '.subtitle': {
                                color: '#989898',
                                fontFamily: 'Inter',
                                fontSize: '0.625rem',
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
                              __html: DOMPurify.sanitize(
                                String(recentOrderCompoundDetails?.[0]?.dose)
                              ),
                            }}
                          />
                        </>
                      ) : null}
                    </Box>
                  </Box>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => setLearnSameMore(more => !more)}
                  >
                    {learnSameMore ? 'View less' : 'Learn more'}
                    {learnSameMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </Box>
              ) : null}
              {otherOptions ? (
                <>
                  {((['Variation-1', 'Control']?.includes(variationName3452) ||
                    !variationName3452) &&
                    isMonthlyRecurring) ||
                  (variationName3452 !== 'Variation-1' &&
                    !isMonthlyRecurring) ? (
                    <Box
                      sx={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        background: '#ffffff',
                        boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '3rem',
                        gap: '1.5rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleChange('same')}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <Checkbox
                          value={checked}
                          checked={checked === 'same'}
                          inputProps={{
                            'aria-label': 'controlled',
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h3"
                              fontWeight="600"
                              mb="0.3rem"
                            >
                              {recentOrderCompoundDetails?.[0]?.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            mb="1rem"
                            fontSize="14px !important"
                          >
                            {recentOrderCompoundDetails?.[0]?.subtitle}
                          </Typography>
                          <Typography variant="body1" mb="1rem">
                            {recentOrderCompoundDetails?.[0]?.medication}
                          </Typography>
                          {learnSameMore ? (
                            <>
                              {' '}
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                              >
                                {"What's included:"}
                              </Typography>
                              <List
                                sx={{
                                  listStyleType: 'disc',
                                  pl: 3,
                                  marginBottom: '8px',
                                }}
                              >
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {`${recentOrder?.total_dose}`}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Injection needles'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Alcohol pads'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Injection instructions pamphlet (video will be in your Zealthy home page)'
                                  }
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                                  }
                                </ListItem>
                              </List>
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                              >
                                Injection instructions and video will be in your
                                Zealthy home page once prescribed:
                              </Typography>
                              <Typography
                                component="div"
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                                sx={{
                                  '.subtitle': {
                                    color: '#989898',
                                    fontFamily: 'Inter',
                                    fontSize: '0.625rem',
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
                                  __html: DOMPurify.sanitize(
                                    String(
                                      recentOrderCompoundDetails?.[0]?.dose
                                    )
                                  ),
                                }}
                              />
                            </>
                          ) : null}
                        </Box>
                      </Box>
                      <Button
                        variant="text"
                        fullWidth
                        onClick={() => setLearnSameMore(more => !more)}
                      >
                        {learnSameMore ? 'View less' : 'Learn more'}
                        {learnSameMore ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Button>
                    </Box>
                  ) : null}

                  {alternativeMonthlyCompoundDetails?.length ? (
                    <Box
                      sx={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        background: '#ffffff',
                        boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '3rem',
                        gap: '1.5rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleChange('altMulti')}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <Checkbox
                          value={checked}
                          checked={checked === 'altMulti'}
                          inputProps={{
                            'aria-label': 'controlled',
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h3"
                              fontWeight="600"
                              mb="0.3rem"
                            >
                              {alternativeMultiMonthCompoundDetails?.[0]?.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            mb="1rem"
                            fontSize="14px !important"
                          >
                            {
                              alternativeMultiMonthCompoundDetails?.[0]
                                ?.subtitle
                            }
                          </Typography>
                          <Typography variant="body1" mb="1rem">
                            {
                              alternativeMultiMonthCompoundDetails?.[0]
                                ?.medication
                            }
                          </Typography>
                          {learnAltMultiMonth ? (
                            <>
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                              >
                                {"What's included:"}
                              </Typography>
                              <List
                                sx={{
                                  listStyleType: 'disc',
                                  pl: 3,
                                  marginBottom: '8px',
                                }}
                              >
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {`${alternativeMultiMonthCompoundDetails?.[0]?.medication
                                    ?.split(' ')
                                    ?.splice(0, 3)
                                    ?.join(' ')}`}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Injection needles'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Alcohol pads'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Injection instructions pamphlet (video will be in your Zealthy home page)'
                                  }
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                                  }
                                </ListItem>
                              </List>
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                              >
                                Injection instructions and video will be in your
                                Zealthy home page once prescribed:
                              </Typography>
                              <Typography
                                component="div"
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                                sx={{
                                  '.subtitle': {
                                    color: '#989898',
                                    fontFamily: 'Inter',
                                    fontSize: '0.625rem',
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
                                  __html: DOMPurify.sanitize(
                                    String(
                                      alternativeMultiMonthCompoundDetails?.[0]
                                        ?.dose
                                    )
                                  ),
                                }}
                              />
                            </>
                          ) : null}
                        </Box>
                      </Box>
                      <Button
                        variant="text"
                        fullWidth
                        onClick={() => setLearnAltMultiMonth(more => !more)}
                      >
                        {learnAltMultiMonth ? 'View less' : 'Learn more'}
                        {learnAltMultiMonth ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Button>
                    </Box>
                  ) : null}
                  {isMonthlyRecurring &&
                  alternativeMonthlyCompoundDetails?.length ? (
                    <Box
                      sx={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        background: '#ffffff',
                        boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '3rem',
                        gap: '1.5rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleChange('altMonthly')}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <Checkbox
                          value={checked}
                          checked={checked === 'altMonthly'}
                          inputProps={{
                            'aria-label': 'controlled',
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h3"
                              fontWeight="600"
                              mb="0.3rem"
                            >
                              {alternativeMonthlyCompoundDetails?.[0]?.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            mb="1rem"
                            fontSize="14px !important"
                          >
                            {alternativeMonthlyCompoundDetails?.[0]?.subtitle}
                          </Typography>
                          <Typography variant="body1" mb="1rem">
                            {alternativeMonthlyCompoundDetails?.[0]?.medication}
                          </Typography>
                          {learnAltMonthly ? (
                            <>
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                              >
                                {"What's included:"}
                              </Typography>
                              <List
                                sx={{
                                  listStyleType: 'disc',
                                  pl: 3,
                                  marginBottom: '8px',
                                }}
                              >
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {`${alternativeMonthlyCompoundDetails?.[0]?.medication
                                    ?.split(' ')
                                    ?.splice(0, 3)
                                    ?.join(' ')}`}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Injection needles'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {'Alcohol pads'}
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Injection instructions pamphlet (video will be in your Zealthy home page)'
                                  }
                                </ListItem>
                                <ListItem
                                  sx={{
                                    fontSize: '0.75rem !important',
                                    display: 'list-item',
                                    padding: 0,
                                  }}
                                >
                                  {
                                    'Consistent support from your care team to ensure you’re achieving your weight loss goals'
                                  }
                                </ListItem>
                              </List>
                              <Typography
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                              >
                                Injection instructions and video will be in your
                                Zealthy home page once prescribed:
                              </Typography>
                              <Typography
                                component="div"
                                variant="body1"
                                fontSize="0.75rem !important"
                                mb="1rem"
                                sx={{
                                  '.subtitle': {
                                    color: '#989898',
                                    fontFamily: 'Inter',
                                    fontSize: '0.625rem',
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
                                  __html: DOMPurify.sanitize(
                                    String(
                                      alternativeMonthlyCompoundDetails?.[0]
                                        ?.dose
                                    )
                                  ),
                                }}
                              />
                            </>
                          ) : null}
                        </Box>
                      </Box>
                      <Button
                        variant="text"
                        fullWidth
                        onClick={() => setLearnAltMonthly(more => !more)}
                      >
                        {learnAltMonthly ? 'View less' : 'Learn more'}
                        {learnAltMonthly ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Button>
                    </Box>
                  ) : null}
                </>
              ) : null}

              <Button
                variant="text"
                sx={{
                  color: '#111111',
                  marginBottom: '2rem',
                }}
                fullWidth
                onClick={() => setOtherOptions(more => !more)}
              >
                {`See ${otherOptions ? 'fewer' : 'more'} options`}{' '}
                {otherOptions ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
              </Button>
              <Button
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={handleConfirmQuantity}
              >
                Continue
              </Button>
              {displayError && (
                <ErrorMessage>
                  Please select one of the options above to continue.
                </ErrorMessage>
              )}
            </Box>
          )}
          {medicationSelected && !review && !quantity && (
            <>
              <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
                {details[medicationSelected]?.title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '3rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Overview'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#777777',
                      flexBasis: '75%',
                    }}
                  >
                    {details[medicationSelected].overview}
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Results'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#777777',
                      flexBasis: '75%',
                    }}
                  >
                    {details[medicationSelected].results}
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
                <Box
                  sx={{
                    display: 'flex',
                    marginBottom: '0.5rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1rem !important',
                      flexBasis: '25%',
                    }}
                  >
                    {'Cost'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexBasis: '75%',
                    }}
                  >
                    {details[medicationSelected].cost.map((text, idx) => (
                      <Typography
                        key={`cost-${idx}`}
                        sx={{
                          fontSize: '0.875rem ',
                          color: '#777777',
                          flexBasis: '75%',
                          marginBottom: '1rem',
                        }}
                      >
                        {text}
                      </Typography>
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ marginBottom: '0.5rem' }} />
              </Box>
              <LoadingButton
                type="button"
                loading={loading}
                disabled={loading}
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={handleConfirmMed}
              >
                Select medication and continue
              </LoadingButton>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  gap: '1rem',
                }}
              >
                {details[medicationSelected]?.disclaimers?.map((text, idx) => (
                  <Typography
                    key={`disclaimer-${idx}`}
                    sx={{
                      fontSize: '0.7rem !important',
                      color: '#777777',
                      fontStyle: 'italic',
                    }}
                  >
                    {text}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </>
      )}
      {!medicationSelected && !review && (
        <>
          <Spinner />
        </>
      )}
    </Container>
  );
};

export default WeightLossRefillRecurringTreatment;
