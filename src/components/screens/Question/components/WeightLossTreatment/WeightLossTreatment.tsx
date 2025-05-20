import {
  CompoundMatrixProps,
  useAllPatientPrescriptionRequest,
  useCompoundMatrix,
  useIsBundled,
  useLanguage,
  usePatient,
  usePatientPrescriptions,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useAnswerAction, useAnswerState } from '@/components/hooks/useAnswer';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useSelector } from '@/components/hooks/useSelector';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { WeightLossSixMonth } from '@/components/shared/AddOnPayment/WeightLossSixMonth/WeightLossSixMonth';
import { WeightLossTwelveMonth } from '@/components/shared/AddOnPayment/WeightLossTwelveMonth.tsx/WeightLossTwelveMonth';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Spinner from '@/components/shared/Loading/Spinner';
import {
  WeightLossMedDetails as details,
  WeightLossMedDetailsSpanish as detailsSpanish,
} from '@/constants/medication-details';
import ABTestContext from '@/context/ABTestContext';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/system';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import Router, { useRouter } from 'next/router';
import SkipBrandName from 'public/images/7085-skip-brand-name.png';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import getConfig from '../../../../../../config';
import NowWhat from '../NowWhat';
import { TreatmentILVModal } from './components/TreatmentILVModal';
import WeightLossOptions from './components/WeightLossOptions';
import WeightLossOptions7746 from './components/WeightLossOptions7746';
import WeightLossOptions7861Var2 from './components/WeightLossOptions7861Var2';
import WeightLossOptions8116 from './components/WeightLossOptions8116';
import {
  compoundFirstMedications,
  compoundFirstMedicationsSpanish,
  compoundMedications,
  compoundMedicationsSpanish,
  compoundMedicationsTirzepatide,
  compoundMedicationsTirzepatideSpanish,
  medicationsCA,
  medicationsCASpanish,
  medicationsDiabetes,
  medicationsDiabetesCA,
  medicationsDiabetesCASpanish,
  medicationsDiabetesSpanish,
  medicationsWithCompound,
  medicationsWithCompoundSaxendaFirst,
  medicationsWithCompoundSaxendaFirstSpanish,
  medicationsWithCompoundSpanish,
  medicationsWithCompoundVictozaFirst,
  medicationsWithCompoundVictozaFirstSpanish,
  nonGLP1Eligible,
  nonGLP1EligibleSpanish,
} from './data';

const multiMonthDosage = `
  <p class=\"subtitle\">Month 1 (Weeks 1-4)</p>\n
  <p>1 capsule per day - 3 mg per capsule</p>\n
  <p class=\"subtitle\">Month 2 (Weeks 5-8)</p>\n
  <p>1 capsule per day - 6 mg per capsule</p>\n
  <p class=\"subtitle\">Month +3 (Weeks 9+)</p>\n
  <p>1 capsule per day - 9 mg per capsule</p>`;

const singleMonthDosage = '1 capsule per day - 3 mg per capsule ';

const membershipSavings = (135 - 108) * 2;

interface WeightLossMedicalProps {
  videoUrl?: string;
  nextPage: (nextPage?: string) => void;
}

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
};
type MedObjectProps = {
  name: string;
  type: MedicationType;
  price?: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  dose?: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
  currMonth: number | null | undefined;
  matrixId: number;
};

export type CompoundDetailProps = {
  [key: string]: {
    saving: number;
    title: string;
    singleTitle: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
    medSixMonthData?: MedObjectProps;
    medTwelveMonthData?: MedObjectProps;
  };
};

const WeightLossTreatment = ({
  videoUrl,
  nextPage,
}: WeightLossMedicalProps) => {
  const vwoClient = useVWO();
  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const [showIlvModal, setShowIlvModal] = useState<boolean>(false);
  const medicationSelected = searchParams?.get('med') ?? '';
  const id = searchParams?.get('id');
  const type = searchParams?.get('type');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const nowwhat = searchParams?.get('nowwhat');
  const { data: patient } = usePatient();
  const { data: variant8288 } = useVWOVariationName('8288');
  const { data: prescriptionRequests } = useAllPatientPrescriptionRequest();
  const variant7743 = vwoClient.getVariationName('7743', String(patient?.id));
  const isVariant7743 =
    variant7743 === 'Variation-1' &&
    window.location.href.includes('WEIGHT-LOSS-TREATMENT-B');
  const [seeMore, setSeeMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const { potentialInsurance, variant } = useIntakeState();
  const { data: isBundled } = useIsBundled();
  const answers = useAnswerState();
  const [currMonth, setCurrMonth] = useState<number | null>(null);
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();
  const isMobile = useIsMobile();
  const { data: variation4798 } = useVWOVariationName('4798');
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const { addPotentialInsurance } = useIntakeActions();

  const { data: variation7746_1 } = useVWOVariationName('7746');
  const { data: variation7746_2 } = useVWOVariationName('7746-2');
  const { data: variation7746_3 } = useVWOVariationName('7746-3');

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();
  const pathname = usePathname();

  const [variant4799, setVariant4799] = useState('');
  const { data: variation7861 } = useVWOVariationName('7861_1');
  const { data: variation7380 } = useVWOVariationName('7380');
  const [variationsLoading, setVariationsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { question_name } = router.query;
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question_name as string,
    questionnaire: 'weight-loss-post-v2',
    header: 'Compound GLP-1 Selection Page',
  });

  const language = useLanguage();
  const bulkCoaching = useSelector(store => store.coaching).find(
    c => c.discounted_price === 264
  );
  const [timer, setTimer] = useState<NodeJS.Timeout | undefined>();
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  const { addMedication } = useVisitActions();
  const { medications } = useVisitState();
  const [checked, setChecked] = useState<string>(
    medications?.[0]?.recurring?.interval_count === 3
      ? 'bulked'
      : medications?.[0]?.recurring?.interval_count === 1
      ? 'single'
      : ''
  );

  const getShipmentText = useCallback(
    (med: CompoundMatrixProps): string => {
      const idxToString = ['first', 'second', 'third', 'fourth'];
      const compoundMeds = compoundMatrix
        ?.find(row => row.id === med.id)
        ?.compound_option.map(option => {
          return option.compound_medication;
        });
      const medsByThreeMonthSupplies = new Array(med.duration_in_days! / 90)
        .fill(0)
        .map(_ => new Array());
      let month = 0;

      // Group vials by 3 month order
      if (compoundMeds && compoundMeds?.length) {
        compoundMeds?.forEach((medOption, idx) => {
          const vialMgs = Number(
            ((med?.shipment_breakdown?.[idx] ?? '0 mg') as string).split(' ')[0]
          );
          month += medOption.duration_in_days! / 30;
          medsByThreeMonthSupplies[Math.floor((month - 1) / 3)].push(vialMgs);
        });
      }

      // Generate string
      return medsByThreeMonthSupplies
        ?.reduce((sections, vials, idx) => {
          const sum = vials.reduce((sum, mgs) => sum + mgs, 0);
          sections.push(
            `${sum} mg (${vials.length} vial${
              vials.length > 1 ? 's' : ''
            } for ${idxToString[idx]} 3 month supply)`
          );
          return sections;
        }, [])!
        .join(', ');
    },
    [compoundMatrix]
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

  const hasMultiWeightLoss =
    hasWeightLoss3Month || hasWeightLoss6Month || hasWeightLoss12Month;

  const glp1MedicationDose = useMemo(() => {
    let drug: any;
    let brand: any;
    let dosage: any;
    let withinMonth: any;
    let within1To2Months: any;
    if (language === 'esp') {
      brand = (answers['WEIGHT_L_POST_Q20']?.answer as CodedAnswer[])?.[0]
        ?.valueCoding;
      dosage = (
        answers?.[`${drug?.code}/WL_GLP_1_Q1`]?.answer as CodedAnswer[]
      )?.[0]?.valueCoding?.display;
      withinMonth =
        (answers?.[`${drug?.code}/WL_GLP_1_Q2`]?.answer as CodedAnswer[])?.[0]
          ?.valueCoding?.display === 'Within the past month';
      return drug?.display?.length && dosage?.length && withinMonth
        ? { dosage, drug: drug?.display }
        : { dosage: null, drug: null };
    } else {
      drug = (answers['WEIGHT_L_POST_Q20']?.answer as CodedAnswer[])?.[0]
        ?.valueCoding;
      dosage = (
        answers?.[`${drug?.code}/WL_GLP_1_Q1`]?.answer as CodedAnswer[]
      )?.[0]?.valueCoding?.display;
      withinMonth =
        (answers?.[`${drug?.code}/WL_GLP_1_Q2`]?.answer as CodedAnswer[])?.[0]
          ?.valueCoding?.display === 'Within the past month';
      within1To2Months =
        (answers?.[`${drug?.code}/WL_GLP_1_Q2`]?.answer as CodedAnswer[])?.[0]
          ?.valueCoding?.display === 'Within the past 1-2 months';

      return drug?.display?.length &&
        dosage?.length &&
        (withinMonth || within1To2Months)
        ? { dosage, drug: drug?.display }
        : { dosage: null, drug: null };
    }
  }, [answers, language]);

  const next3MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_multi_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
  const next1MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_monthly',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
  const next6MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_six_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );
  const next12MonthDosage = useNextDosage(
    patient!,
    medicationSelected?.toLowerCase() + '_twelve_month',
    compoundMatrix!,
    medicationSelected!,
    patientPrescriptions,
    true,
    answers
  );

  const isGlp1Ineligible = patient?.glp1_ineligible;
  const hasDiabetes = useMemo(() => {
    const { answer } =
      answers?.['WEIGHT_L_Q7'] ||
      answers?.['WEIGHT_L_POST_Q4'] ||
      answers?.['WEIGHT_L_4758_POST_Q'] ||
      '';

    if (answer && isCodedAnswer(answer)) {
      return answer.some(a => a?.valueCoding?.display === 'Type 2 diabetes');
    }

    return false;
  }, [answers]);

  let medicationOptions: any = medications;

  if (id === 'compound') {
    if (type === 'Mounjaro' || (type === 'skip' && hasDiabetes)) {
      medicationOptions =
        language === 'esp'
          ? compoundMedicationsTirzepatideSpanish
          : compoundMedicationsTirzepatide;
    } else if (type === 'Zepbound') {
      medicationOptions =
        language === 'esp'
          ? compoundMedicationsTirzepatideSpanish
          : compoundMedicationsTirzepatide;
    } else {
      medicationOptions =
        language === 'esp' ? compoundMedicationsSpanish : compoundMedications;
    }
  } else if (isGlp1Ineligible) {
    medicationOptions =
      language === 'esp' ? nonGLP1EligibleSpanish : nonGLP1Eligible;
  } else if (patient?.insurance_skip && glp1MedicationDose?.drug) {
    medicationOptions = [
      'wegovy (semaglutide)',
      'ozempic (semaglutide)',
      'compound semaglutide',
    ].includes(glp1MedicationDose?.drug?.toLowerCase())
      ? language === 'esp'
        ? compoundMedicationsSpanish
        : compoundMedications
      : language === 'esp'
      ? compoundMedicationsTirzepatideSpanish
      : compoundMedicationsTirzepatide;
  } else if (variant8288?.variation_name === 'Variation-1') {
    const doNotShowMedOptions = language === 'esp';
  } else if (patient?.insurance_skip) {
    medicationOptions =
      language === 'esp' ? compoundMedicationsSpanish : compoundMedications;
  } else if (glp1MedicationDose?.drug) {
    const medicationsArray =
      language === 'esp'
        ? compoundFirstMedicationsSpanish
        : compoundFirstMedications;

    if (glp1MedicationDose?.drug?.toLowerCase()?.includes('wegovy')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Wegovy'
      );
      const filteredCompoundMedications = medicationsArray.filter(
        med => med.brand === 'Semaglutide' || med.brand === 'Semaglutida'
      );
      const remainingMedications = medicationsArray.filter(
        med =>
          med.brand !== 'Wegovy' &&
          med.brand !== 'Semaglutide' &&
          med.brand !== 'Semaglutida'
      );
      medicationOptions = [
        ...filteredMedications,
        ...filteredCompoundMedications,
        ...remainingMedications,
      ];
    } else if (glp1MedicationDose?.drug?.toLowerCase()?.includes('rybelsus')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Rybelsus'
      );
      const filteredCompoundMedications = medicationsArray.filter(
        med => med.brand === 'Semaglutide' || med.brand === 'Semaglutida'
      );
      const remainingMedications = medicationsArray.filter(
        med =>
          med.brand !== 'Rybelsus' &&
          med.brand !== 'Semaglutide' &&
          med.brand !== 'Semaglutida'
      );
      medicationOptions = [
        ...filteredMedications,
        ...filteredCompoundMedications,
        ...remainingMedications,
      ];
    } else if (glp1MedicationDose?.drug?.toLowerCase().includes('ozempic')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Ozempic'
      );
      const filteredCompoundMedications = medicationsArray.filter(
        med => med.brand === 'Semaglutide' || med.brand === 'Semaglutida'
      );
      const remainingMedications = medicationsArray.filter(
        med =>
          med.brand !== 'Ozempic' &&
          med.brand !== 'Semaglutide' &&
          med.brand !== 'Semaglutida'
      );
      medicationOptions = [
        ...filteredMedications,
        ...filteredCompoundMedications,
        ...remainingMedications,
      ];
    } else if (glp1MedicationDose?.drug?.toLowerCase()?.includes('mounjaro')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Mounjaro'
      );
      const filteredCompoundMedications = medicationsArray.filter(
        med => med.brand === 'Tirzepatide' || med.brand === 'Tirzepatida'
      );
      const remainingMedications = medicationsArray.filter(
        med =>
          med.brand !== 'Mounjaro' &&
          med.brand !== 'Tirzepatide' &&
          med.brand !== 'Tirzepatida'
      );
      medicationOptions = [
        ...filteredMedications,
        ...filteredCompoundMedications,
        ...remainingMedications,
      ];
    } else if (glp1MedicationDose?.drug?.toLowerCase().includes('saxenda')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Saxenda'
      );
      const remainingMedications = medicationsArray.filter(
        med => med.brand !== 'Saxenda'
      );
      medicationOptions = [...filteredMedications, ...remainingMedications];
    } else if (glp1MedicationDose?.drug?.toLowerCase()?.includes('victoza')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Victoza'
      );
      const remainingMedications = medicationsArray.filter(
        med => med.brand !== 'Victoza'
      );
      medicationOptions = [...filteredMedications, ...remainingMedications];
    } else if (glp1MedicationDose?.drug?.toLowerCase()?.includes('trulicity')) {
      const filteredMedications = medicationsArray.filter(
        med => med.brand === 'Trulicity'
      );
      const remainingMedications = medicationsArray.filter(
        med => med.brand !== 'Trulicity'
      );
      medicationOptions = [...filteredMedications, ...remainingMedications];
    } else if (
      glp1MedicationDose?.drug.toLowerCase()?.includes('compound tirzepatide')
    ) {
      medicationOptions =
        language === 'esp'
          ? compoundMedicationsTirzepatideSpanish
          : compoundMedicationsTirzepatide;
    } else if (
      glp1MedicationDose?.drug.toLowerCase()?.includes('compound semaglutide')
    ) {
      medicationOptions =
        language === 'esp'
          ? compoundFirstMedicationsSpanish
          : compoundFirstMedications;
    }
  } else if (hasDiabetes) {
    medicationOptions = ['WI'].includes(patient?.region || '')
      ? language === 'esp'
        ? medicationsDiabetesCASpanish
        : medicationsDiabetesCA
      : language === 'esp'
      ? medicationsDiabetesSpanish
      : medicationsDiabetes;
  } else if (variant === 'Victoza' || variant === 'Liraglutide') {
    medicationOptions =
      language === 'esp'
        ? medicationsWithCompoundVictozaFirstSpanish
        : medicationsWithCompoundVictozaFirst;
  } else if (variant === 'Saxenda') {
    medicationOptions =
      language === 'esp'
        ? medicationsWithCompoundSaxendaFirstSpanish
        : medicationsWithCompoundSaxendaFirst;
  } else if (variant === 'Liraglutide') {
    medicationOptions =
      language === 'esp'
        ? medicationsWithCompoundSaxendaFirstSpanish
        : medicationsWithCompoundSaxendaFirst;
  } else {
    medicationOptions = ['WI']?.includes(patient?.region || '')
      ? language === 'esp'
        ? medicationsCASpanish
        : medicationsCA
      : language === 'esp'
      ? medicationsWithCompoundSpanish
      : medicationsWithCompound;
  }

  const handleChange = (value: string) => {
    setChecked(value);
  };

  useEffect(() => {
    if (
      (checked === 'six-month' ||
        checked === 'twelve-month' ||
        checked === 'bulk') &&
      (variation7861?.variation_name === 'Variation-1' ||
        variation7861?.variation_name === 'Variation-2' ||
        variant === 'medication-too-expensive-cancellation' ||
        variant === 'twelve-month')
    ) {
      handleConfirmQuantity();
    }
  }, [checked, variation7861]);

  const isCompoundRefill = pathname?.includes('weight-loss-compound-refill');
  const isRequestCompound = pathname?.includes(
    'patient-portal/weight-loss-treatment'
  );
  const isPostCheckout = pathname?.includes('post-checkout');

  const isUpdose = pathname?.includes('quantity=true');

  const isPostCheckoutOrCompoundRefill = isPostCheckout || isCompoundRefill;

  const isVariation7746_2 =
    variation7746_2?.variation_name === 'Variation-1' && isRequestCompound;
  const isVariation7746_3 =
    variation7746_3?.variation_name === 'Variation-1' && isCompoundRefill;

  async function fetchCompoundDetails() {
    const object: CompoundDetailProps = {
      [`${medicationSelected}`]: {
        saving: Math.round(
          membershipSavings +
            (next1MonthDosage?.price! * 3 - next3MonthDosage?.price!)
        ),
        name: medicationSelected || '',
        title:
          language === 'esp'
            ? '20% de descuento en un suministro de medicamento para 3 meses'
            : '20% off on a 3 month supply of medication',
        singleTitle:
          language === 'esp'
            ? 'Suministro de medicamento para 1 mes'
            : '1 month supply of medication',
        singleDescription: `$${next1MonthDosage?.price} for your next month of ${medicationSelected}`,
        body1: hasMultiWeightLoss
          ? ''
          : language === 'esp'
          ? 'Obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía serán de solo $108/mes.'
          : "You'll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.",
        body2: hasMultiWeightLoss
          ? ''
          : language === 'esp'
          ? `Para recibir un suministro de 3 meses de su medicamento, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`
          : `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
        medData: {
          name:
            medicationSelected === 'Oral Semaglutide'
              ? medicationSelected
              : `${medicationSelected} weekly injections`,
          type:
            medicationSelected === 'Oral Semaglutide'
              ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
              : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: ('Oral Semaglutide' === medicationSelected
            ? next3MonthDosage?.price
            : next1MonthDosage?.price) as number,

          dosage:
            medicationSelected === 'Oral Semaglutide'
              ? '3 mg'
              : `${next1MonthDosage?.med?.vial_size?.trim()}${
                  next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                  next1MonthDosage?.med?.pharmacy === 'Empower'
                    ? ` (3 vials included - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                      next1MonthDosage?.med?.pharmacy !== 'Red Rock'
                    ? ` (3 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                      next1MonthDosage?.med?.pharmacy === 'Red Rock'
                    ? ` (3 shipments - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next1MonthDosage?.med?.number_of_vials === 2
                    ? ` (2 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next1MonthDosage?.med?.number_of_vials === 1 &&
                      next1MonthDosage?.med?.duration_in_days === 90
                    ? ``
                    : ''
                }`,
          dose:
            medicationSelected === 'Oral Semaglutide'
              ? singleMonthDosage
              : `${next1MonthDosage?.med?.dose}`,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
          currMonth: next1MonthDosage?.med?.current_month,
          matrixId: next1MonthDosage?.med?.id!,
        },
        medSixMonthData: next6MonthDosage?.med
          ? {
              name:
                medicationSelected === 'Oral Semaglutide'
                  ? medicationSelected
                  : `${medicationSelected} weekly injections`,
              type:
                medicationSelected === 'Oral Semaglutide'
                  ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                  : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
              price: next6MonthDosage?.price,

              discounted_price: next6MonthDosage?.price! / 6,
              dosage:
                medicationSelected === 'Oral Semaglutide'
                  ? '18 mg (3 bottles included - 3 mg, 6 mg, 9 mg)'
                  : `${getShipmentText(next6MonthDosage?.med!)}`,
              dose: `${next6MonthDosage?.med?.dose}`,
              quantity: 1,
              recurring: {
                interval: 'month',
                interval_count: 6,
              },
              medication_quantity_id: 98,
              currMonth: next6MonthDosage?.currentMonth,
              matrixId: next6MonthDosage?.med?.id!,
            }
          : undefined,
        medTwelveMonthData: next12MonthDosage?.med
          ? {
              name:
                medicationSelected === 'Oral Semaglutide'
                  ? medicationSelected
                  : `${medicationSelected} weekly injections`,
              type:
                medicationSelected === 'Oral Semaglutide'
                  ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
                  : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
              price: next12MonthDosage?.price,

              discounted_price: next12MonthDosage?.price! / 12,
              dosage:
                medicationSelected === 'Oral Semaglutide'
                  ? '18 mg (3 bottles included - 3 mg, 6 mg, 9 mg)'
                  : `${getShipmentText(next12MonthDosage?.med!)}`,
              dose: `${next12MonthDosage?.med?.dose}`,
              quantity: 1,
              recurring: {
                interval: 'month',
                interval_count: 12,
              },
              medication_quantity_id: 98,
              currMonth: next12MonthDosage?.currentMonth,
              matrixId: next12MonthDosage?.med?.id!,
            }
          : undefined,
        medBulkData: {
          name:
            medicationSelected === 'Oral Semaglutide'
              ? medicationSelected
              : `${medicationSelected} weekly injections`,
          type:
            medicationSelected === 'Oral Semaglutide'
              ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
              : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price:
            medicationSelected === 'Oral Semaglutide'
              ? next1MonthDosage?.price
              : next3MonthDosage?.price,

          discounted_price:
            'Oral Semaglutide' === medicationSelected
              ? next1MonthDosage?.price! / 3
              : next3MonthDosage?.price! / 3,
          dosage:
            medicationSelected === 'Oral Semaglutide'
              ? '18 mg (3 bottles included - 3 mg, 6 mg, 9 mg)'
              : `${next3MonthDosage?.med?.vial_size?.trim()}${
                  next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                  next3MonthDosage?.med?.pharmacy === 'Empower'
                    ? ` (3 vials included - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                      next3MonthDosage?.med?.pharmacy !== 'Red Rock'
                    ? ` (3 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                      next3MonthDosage?.med?.pharmacy === 'Red Rock'
                    ? ` (3 shipments - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next3MonthDosage?.med?.number_of_vials === 2
                    ? ` (2 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                        ', '
                      )})`
                    : next3MonthDosage?.med?.number_of_vials === 1 &&
                      next3MonthDosage?.med?.duration_in_days === 90
                    ? ``
                    : ''
                }`,
          dose:
            medicationSelected === 'Oral Semaglutide'
              ? multiMonthDosage
              : `${next3MonthDosage?.med?.dose}`,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 98,
          currMonth: next3MonthDosage?.currentMonth,
          matrixId: next3MonthDosage?.med?.id!,
        },
      },
    };
    setCompoundDetails(object);
  }

  useEffect(() => {
    if (next1MonthDosage?.med && next3MonthDosage?.med) {
      fetchCompoundDetails();
    }
  }, [next1MonthDosage?.med, next3MonthDosage?.med, medicationSelected]);

  async function handleConfirmMed() {
    setLoading(true);
    setSeeMore(false);

    if (id === 'compound') {
      if (bulkCoaching || potentialInsurance !== 'OH') {
        Router.push(
          {
            pathname:
              '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
            query: {
              id: id,
              med: medicationSelected,
              quantity: true,
            },
          },
          undefined,
          { shallow: true }
        );
      } else {
        if (!!medicationSelected && compoundDetails) {
          addMedication(compoundDetails[medicationSelected].medData);

          Router.push(
            {
              pathname:
                '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
              query: {
                id: id,
                med: medicationSelected,
                review: true,
              },
            },
            undefined,
            { shallow: true }
          );
        }
      }
    } else {
      const existingRequest = prescriptionRequests?.find(
        r => r.status === 'PRE_INTAKES'
      );

      if (existingRequest?.id) {
        await supabase
          .from('prescription_request')
          .update({
            specific_medication: medicationSelected,
            note: medicationSelected,
            medication_quantity_id: id === 'non-glp1' ? 125 : 124,
          })
          .eq('id', existingRequest?.id);
      }

      if (patient?.insurance_skip) {
        return nextPage();
      }

      Router.push(
        {
          pathname:
            '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
          query: { id: 'compound', type: medicationSelected },
        },
        undefined,
        { shallow: true }
      );
    }
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  async function handleConfirmQuantity() {
    setSeeMore(false);
    if (!!medicationSelected && compoundDetails) {
      if (checked === 'six-month') {
        addMedication(compoundDetails[medicationSelected].medSixMonthData!);
      } else if (checked === 'twelve-month') {
        addMedication(compoundDetails[medicationSelected].medTwelveMonthData!);
      } else {
        addMedication(
          checked === 'bulk'
            ? compoundDetails[medicationSelected].medBulkData
            : compoundDetails[medicationSelected].medData
        );
      }
    }

    const quantity = {
      'six-month': 'Six months',
      'twelve-month': 'Twelve months',
      bulk: 'Three months',
      single: 'One month',
    }[checked];
    submitFreeTextAnswer({ text: medicationSelected + ', ' + quantity });
    setShouldRedirect(true);
  }

  useEffect(() => {
    if (answers[question_name as string] && shouldRedirect) {
      Router.push(
        {
          pathname:
            '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
          query: {
            id: id,
            med: medicationSelected,
            review: true,
            checked: checked,
          },
        },
        undefined,
        { shallow: true }
      );
      window.scrollTo({ top: 0, left: 0 });
      return;
    }
  }, [
    answers,
    question_name,
    medicationSelected,
    checked,
    id,
    shouldRedirect,
    Router,
  ]);

  async function selectMedication(med: MedProps) {
    if (language === 'esp' && med.brand === 'Semaglutida') {
      med.brand = 'Semaglutide';
    } else if (language === 'esp' && med.brand === 'Tirzepatida') {
      med.brand = 'Tirzepatide';
    } else if (language === 'esp' && med.brand === 'Semaglutida Oral') {
      med.brand = 'Oral Semaglutide';
    } else if (language === 'esp' && med.brand === 'Metformina') {
      med.brand = 'Metformin';
    } else if (language === 'esp' && med.brand === 'Bupropión y Naltrexona') {
      med.brand = 'Bupropion and Naltrexone';
    } else if (language === 'esp' && med.brand === 'Liraglutida') {
      med.brand = 'liraglutide';
    }
    if (isVariant7743) {
      const careType =
        med.brand === 'Semaglutide'
          ? PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
          : PotentialInsuranceOption.TIRZEPATIDE_BUNDLED;
      addPotentialInsurance(careType);
      createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
        careType,
      });
    }
    console.log(med.brand);
    Router.push(
      {
        pathname:
          '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
        query: {
          id: med.body1.toLowerCase().includes('non-glp-1')
            ? 'non-glp1'
            : med.body1.toLowerCase().includes('glp-1')
            ? 'glp1'
            : ['Semaglutide', 'Tirzepatide', 'Oral Semaglutide'].includes(
                med.brand
              )
            ? 'compound'
            : id,
          med: med.brand,
          ...(med.brand !== 'Wegovy' && { quantity: true }),
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }

  async function handleOnSkip() {
    setSeeMore(false);
    submitFreeTextAnswer({ text: 'SKIPPED' });
    if (
      id === 'compound' ||
      patient?.insurance_skip ||
      isGlp1Ineligible ||
      variant8288?.variation_name === 'Variation-1'
    ) {
      return nextPage();
    }
    Router.push(
      {
        pathname:
          '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
        query: { id: 'compound', type: 'skip' },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }

  function getFold(i: number) {
    if (patient?.insurance_skip) return i < 2;
    return i < 1;
  }

  const Redirect = () => {
    useEffect(() => {
      Router.push(
        {
          pathname:
            '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
          query: {
            id: id,
            med: medicationSelected,
            quantity: true,
          },
        },
        undefined,
        { shallow: true }
      );
    }, [checked]);

    return <></>;
  };

  let averageWeightLossText = medicationSelected
    ?.toLowerCase()
    ?.includes('semaglutide')
    ? `On average, people lose 2% of their weight after 1 month on Semaglutide**`
    : `On average, people lose 3% of their weight after 1 month on Tirzepatide**`;

  let threeMonthAverageWeightLossText = medicationSelected
    ?.toLowerCase()
    ?.includes('semaglutide')
    ? `On average, people lose 7% of their weight in their first 3 months of Semaglutide**`
    : `On average, people lose 8% of their weight in their first 3 months of Tirzepatide**`;

  let instructionsText = 'Instructions:';
  let injectionInstructionsText = `Injection instructions and video will be in your ${siteName} home page once prescribed:`;
  let clickHereText = 'Click here';
  let titleText =
    'We make GLP-1 medication affordable for you & ship to your door.';
  let insuranceSkipText1 = `As a ${siteName} Weight Loss member, you can get affordable out of pocket medications shipped to your door.`;
  let insuranceSkipText2 =
    'Medication prices may vary based on quantity and dosing.';
  let insuranceText1 = `Your ${siteName} care team will help you minimize out of pocket costs. This includes filing paperwork - like prior authorizations - with your insurance so that your insurance covers your medication.`;
  let insuranceText2 =
    'If a prior authorization is approved, your medication will cost as little as $0/month.';
  let insuranceText3 = `As a ${siteName} Weight Loss member, you can also get affordable out of pocket medications shipped to your door, which typically will make sense for those who would like to get started right away and may continue to make sense if your prior authorization is not approved.`;
  let insuranceText4 =
    'Medication prices may vary based on insurance coverage, quantity, and dosing.';
  let continueButtonText = 'Continue to specify requested medication';
  let overviewText = 'Overview';
  let resultsText = 'Results';
  let costText = 'Cost';
  let metforminNotIncludedText =
    'Metformin is included in your membership at no additional cost.';
  let selectMedicationButtonText = 'Select medication and continue';
  let quantitySelectionTitle =
    "Tell us how much medication you'd like to receive.";
  let quantitySelectionSubtitle = `For a limited time, ${siteName} is offering a 20% discount on your medication ${
    potentialInsurance !== 'OH' &&
    !(hasWeightLoss12Month || hasWeightLoss3Month || hasWeightLoss6Month)
      ? 'and the next 2 months of your membership'
      : ''
  } if you purchase a 3 month supply.`;
  let limitedTimeText = '';
  if (medicationSelected !== null) {
    limitedTimeText =
      language === 'esp'
        ? `Por tiempo limitado ahorre $${compoundDetails?.[medicationSelected]?.saving}`
        : `For a limited time save $${compoundDetails?.[medicationSelected]?.saving}`;
  }
  let learnMoreText = 'Learn more';
  let viewLessText = 'View less';
  let continueText = 'Continue';
  let mostPopular = 'Most popular';
  let preferredTreatmentText = isVariant7743
    ? 'Since you have indicated that you do not plan to use insurance, our affordable semaglutide or tirzepatide options may be right for you.'
    : 'Select a preferred treatment option.';
  let willOnlyPayText = isVariant7743 ? '' : 'You will only pay if prescribed.';
  let confirmPreferredTreatmentText = `By confirming your preferred treatment, your ${siteName} provider will be able to prescribe and order GLP-1 medication that is medically appropriate for you.`;
  let glp1nonEligibleText =
    'You are unlikely to be eligible for this medication.';
  let viewMoreText = 'View more';
  let continueWithoutSelectingText = 'Continue without selecting';
  let reviewTreatment = 'Review treatment';
  let skipText = 'to skip this step.';
  let variant7743Text = {
    Semaglutide: 'Limited time: Get this medication for $217 the first month.',
    Tirzepatide: 'Limited time: Get this medication for $349 the first month.',
  };
  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director? Watch this video.`;

  if (language === 'esp') {
    videoText = `¿Quieres aprender más sobre semaglutida y tirzepatida en ${siteName} de parte de nuestro Director Médico? Mira este video.`;
    clickHereText = 'haga clic aquí';
    skipText = 'para saltar este paso';
    metforminNotIncludedText =
      'La metformina está incluida en su membresía sin costo adicional.';
    averageWeightLossText = medicationSelected
      ?.toLowerCase()
      ?.includes('semaglutide')
      ? `En promedio, las personas pierden 2% de su peso después de 1 mes con Semaglutida**`
      : `En promedio, las personas pierden 2% de su peso después de 1 mes con Tirzepatida**`;

    instructionsText = 'Instrucciones:';
    injectionInstructionsText = `Las instrucciones de inyección y el video estarán en su página de inicio de ${siteName} una vez recetado:`;
    glp1nonEligibleText =
      'Es poco probable que sea elegible para este medicamento.';
    selectMedicationButtonText = 'Selecciona la mediación y continua';
    continueWithoutSelectingText = 'Continua sin seleccionar';
    mostPopular = 'Mas popular';
    titleText =
      'Hacemos que la medicación GLP-1 sea accesible para usted y la enviamos a su puerta.';
    insuranceSkipText1 = `Como miembro de ${siteName} Weight Loss, puede obtener medicamentos accesibles sin cobertura enviados a su puerta.`;
    insuranceSkipText2 =
      'Los precios de los medicamentos pueden variar según la cantidad y la dosis.';
    insuranceText1 = `Su equipo de atención de ${siteName} le ayudará a minimizar los costos de bolsillo. Esto incluye presentar documentación, como autorizaciones previas, con su seguro para que su seguro cubra su medicamento.`;
    insuranceText2 =
      'Si se aprueba una autorización previa, su medicamento costará tan poco como $0/mes.';
    insuranceText3 = `Como miembro de ${siteName} Weight Loss, también puede obtener medicamentos accesibles sin cobertura enviados a su puerta, lo que típicamente tendrá sentido para aquellos que deseen comenzar de inmediato y puede seguir teniendo sentido si su autorización previa no es aprobada.`;
    insuranceText4 =
      'Los precios de los medicamentos pueden variar según la cobertura del seguro, la cantidad y la dosis.';
    continueButtonText = 'Continuar para especificar el medicamento solicitado';
    overviewText = 'Resumen';
    resultsText = 'Resultados';
    costText = 'Costo';
    selectMedicationButtonText = 'Seleccionar medicamento y continuar';
    quantitySelectionTitle = 'Díganos cuánto medicamento le gustaría recibir.';
    quantitySelectionSubtitle = `Por tiempo limitado, ${siteName} está ofreciendo un 20% de descuento en su medicamento ${
      potentialInsurance !== 'OH' &&
      !(hasWeightLoss12Month || hasWeightLoss3Month || hasWeightLoss6Month)
        ? 'y los próximos 2 meses de su membresía'
        : ''
    } si compra un suministro de 3 meses.`;
    if (medicationSelected !== null) {
      limitedTimeText = `Por tiempo limitado ahorre $${compoundDetails?.[medicationSelected]?.saving}`;
    }
    learnMoreText = 'Aprender más';
    viewLessText = 'Ver menos';
    continueText = 'Continuar';
    preferredTreatmentText = 'Seleccione una opción de tratamiento preferida.';
    willOnlyPayText = 'Solo pagará si se le receta.';
    confirmPreferredTreatmentText = `Al confirmar su tratamiento preferido, su proveedor de ${siteName} podrá recetar y ordenar medicamentos GLP-1 que sean médicamente apropiados para usted.`;
    viewMoreText = 'Ver más';
    continueWithoutSelectingText = 'Continuar sin seleccionar';
    reviewTreatment = 'revisar tratamiento';
  }

  medicationOptions = medicationOptions.filter(
    (med: { brand: string }) => med.brand !== 'Oral Semaglutide'
  );
  function updateCostString(str: string, newCost: number): string {
    if (!str) return str;
    return str.replace(/\$\d+/g, `$${newCost}`);
  }

  const semaglutideCompoundDetails = compoundDetails?.['Semaglutide'];
  const semaglutideDetails = details?.['Semaglutide'];
  const semaglutideOption = medicationOptions.find(
    (m: any) => m.brand === 'Semaglutide'
  );
  const tirzepatideCompoundDetails = compoundDetails?.['Tirzepatide'];
  const tirzepatideDetails = details?.['Tirzepatide'];
  const tirzepatideOption = medicationOptions.find(
    (m: any) => m.brand === 'Tirzepatide'
  );

  function updateDetails(
    option: any,
    details: any,
    compoundDetails: any,
    cost: number,
    bulkCost: number,
    medicationName: string
  ) {
    if (option) option.body3 = updateCostString(option.body3, cost);

    if (compoundDetails) {
      compoundDetails.singleDescription = `$${cost} for your next month of ${medicationName}`;
      compoundDetails.medData.price = cost;
      compoundDetails.medBulkData.price = bulkCost;
      compoundDetails.medBulkData.discounted_price = bulkCost / 3;
      compoundDetails.saving = cost * 3 - bulkCost + 54;
    }

    if (details) {
      details.cost = [
        `As a Zealthy member, the cost of the medication is as little as $${cost}/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home, which is included in the price.`,
      ];
      ['costCA', 'costCT', 'costCTV2'].forEach(key => {
        if (details[key])
          details[key] = details[key].map((str: string) =>
            updateCostString(str, cost)
          );
      });
    }
  }

  type VariationConfig = {
    semaglutide: { cost: number; bulkCost: number };
    tirzepatide: { cost: number; bulkCost: number };
  };

  const variationMap: Record<'Variation-1' | 'Variation-2', VariationConfig> = {
    'Variation-1': {
      semaglutide: { cost: 249, bulkCost: 599 },
      tirzepatide: { cost: 419, bulkCost: 1059 },
    },
    'Variation-2': {
      semaglutide: { cost: 199, bulkCost: 454 },
      tirzepatide: { cost: 329, bulkCost: 670 },
    },
  };

  const variation =
    variationMap[
      variation4798?.variation_name as 'Variation-1' | 'Variation-2'
    ];

  if (variation) {
    const { semaglutide, tirzepatide } = variation;

    updateDetails(
      semaglutideOption,
      semaglutideDetails,
      semaglutideCompoundDetails,
      semaglutide.cost,
      semaglutide.bulkCost,
      'Semaglutide'
    );
    updateDetails(
      tirzepatideOption,
      tirzepatideDetails,
      tirzepatideCompoundDetails,
      tirzepatide.cost,
      tirzepatide.bulkCost,
      'Tirzepatide'
    );
  }

  useEffect(() => {
    if (!compoundDetails || !medicationSelected) return;
    if (!compoundDetails?.[medicationSelected!]) {
      fetchCompoundDetails();
      return;
    }
    const checked = Router.query['checked'];
    if (checked === 'six-month') {
      addMedication(compoundDetails[medicationSelected].medSixMonthData!);
    } else if (checked === 'twelve-month') {
      addMedication(compoundDetails[medicationSelected].medTwelveMonthData!);
    } else {
      addMedication(
        checked === 'bulk'
          ? compoundDetails[medicationSelected].medBulkData
          : compoundDetails[medicationSelected].medData
      );
    }
  }, [Router.query['checked'], compoundDetails, medicationSelected]);

  useEffect(() => {
    timer ? clearTimeout(timer) : null;
    const onMedSelectionPage = !medicationSelected && !review;
    const onMedDetailsPage = medicationSelected && !review && !quantity;
    const onMedQuantityPage = medicationSelected && quantity;
    if (onMedSelectionPage || onMedDetailsPage || onMedQuantityPage) {
      const timer = setTimeout(() => setShowIlvModal(true), 20000);
      setTimer(timer);
    }

    if (
      Router.query['checked'] === 'single' ||
      Router.query['checked'] === 'bulk'
    ) {
      const timer = setTimeout(() => setShowIlvModal(true), 40000);
      setTimer(timer);
    }
  }, [medicationSelected, review, quantity, Router.query['checked']]);

  useEffect(() => {
    if (review && !compoundDetails) {
      Router.push(
        {
          pathname:
            '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
          query: {
            id: id,
            med: medicationSelected,
            quantity: true,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [review, compoundDetails]);

  if (variationsLoading || (review && !compoundDetails)) {
    return <Spinner />;
  }

  return (
    <Container maxWidth="sm">
      {medicationSelected && review && Router.query['checked'] !== '' && (
        <ABTestContext value={variant4799}>
          {nowwhat && variation7380?.variation_name === 'Variation-1' ? (
            <NowWhat nextPage={nextPage} />
          ) : Router.query['checked'] === 'single' ? (
            <MedicationAddOn videoUrl={videoUrl} onNext={nextPage} />
          ) : Router.query['checked'] === 'bulk' ? (
            <WeightLossBulkAddOn
              videoUrl={videoUrl}
              onNext={nextPage}
              currentMonth={currMonth}
            />
          ) : Router.query['checked'] === 'six-month' ? (
            <WeightLossSixMonth
              oneMonthPrice={next1MonthDosage?.price!}
              onNext={nextPage}
            />
          ) : Router.query['checked'] === 'twelve-month' ? (
            <WeightLossTwelveMonth
              oneMonthPrice={next1MonthDosage?.price!}
              onNext={nextPage}
            />
          ) : (
            <Box>
              <Redirect />
              <Spinner />
            </Box>
          )}
        </ABTestContext>
      )}
      {medicationSelected && !review && !quantity && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {language === 'esp'
              ? detailsSpanish?.[medicationSelected]?.title
              : details?.[medicationSelected]?.title}
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
                {overviewText}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {language === 'esp'
                  ? detailsSpanish[medicationSelected].overview
                  : details[medicationSelected].overview}
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
                {resultsText}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                }}
              >
                {language === 'esp'
                  ? detailsSpanish[medicationSelected].results
                  : details[medicationSelected].results}
              </Typography>
            </Box>
            <Divider sx={{ marginBottom: '0.5rem' }} />
            {
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
                  {costText}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexBasis: '75%',
                  }}
                >
                  {patient?.region !== 'NJ' &&
                  patient?.region !== 'TX' &&
                  medicationSelected === 'Tirzepatide'
                    ? (language === 'esp'
                        ? detailsSpanish[medicationSelected].costCA
                        : details[medicationSelected].cost
                      )?.map((text, idx) => (
                        <Typography
                          key={`cost-${idx}`}
                          sx={{
                            fontSize: '0.875rem',
                            color: '#777777',
                            flexBasis: '75%',
                            marginBottom: '1rem',
                          }}
                        >
                          {(['Variation-1', 'Variation-2'].includes(
                            variation7861?.variation_name!
                          ) || variant === 'twelve-month'
                            ? text.replace('216', '200').replace('151', '70')
                            : text
                          )
                            .split(
                              'For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere).'
                            )
                            .map((part, partIdx, parts) => (
                              <React.Fragment key={partIdx}>
                                {part}
                                {partIdx < parts.length - 1 && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontWeight: 800,
                                      color: '#444444',
                                    }}
                                  >
                                    For a limited time, you can get
                                    grandfathered in at this price (compare to
                                    $300-$1K+ per month elsewhere).
                                  </Typography>
                                )}
                              </React.Fragment>
                            ))}
                        </Typography>
                      ))
                    : (language === 'esp'
                        ? detailsSpanish[medicationSelected].cost
                        : details[medicationSelected].cost
                      ).map((text, idx) => (
                        <Typography
                          key={`cost-${idx}`}
                          sx={{
                            fontSize: '0.875rem',
                            color: '#777777',
                            flexBasis: '75%',
                            marginBottom: '1rem',
                          }}
                        >
                          {(['Variation-1', 'Variation-2'].includes(
                            variation7861?.variation_name!
                          ) || variant === 'twelve-month'
                            ? text.replace('216', '200').replace('151', '70')
                            : text
                          )
                            .split(
                              'For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere).'
                            )
                            .map((part, partIdx, parts) => (
                              <React.Fragment key={partIdx}>
                                {part}
                                {partIdx < parts.length - 1 && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontWeight: 800,
                                      color: '#444444',
                                    }}
                                  >
                                    For a limited time, you can get
                                    grandfathered in at this price (compare to
                                    $300-$1K+ per month elsewhere).
                                  </Typography>
                                )}
                              </React.Fragment>
                            ))}
                        </Typography>
                      ))}
                </Box>
              </Box>
            }
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
            {selectMedicationButtonText}
          </LoadingButton>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            {language === 'esp'
              ? detailsSpanish[medicationSelected]?.disclaimers?.map(
                  (text, idx) => (
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
                  )
                )
              : details[medicationSelected]?.disclaimers?.map((text, idx) => (
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

      {medicationSelected &&
      quantity &&
      (!next3MonthDosage || !next1MonthDosage || !compoundDetails) ? (
        <Spinner />
      ) : variant === 'twelve-month' ? (
        <WeightLossOptions8116
          checked={checked}
          handleChange={handleChange}
          handleConfirmQuantity={handleConfirmQuantity}
          compoundDetails={compoundDetails!}
        />
      ) : variation7861?.variation_name === 'Variation-2' ? (
        <WeightLossOptions7861Var2
          videoUrl={videoUrl}
          checked={checked}
          handleChange={handleChange}
          handleConfirmQuantity={handleConfirmQuantity}
          compoundDetails={compoundDetails!}
        />
      ) : isPostCheckoutOrCompoundRefill || isVariation7746_2 ? (
        <WeightLossOptions7746
          videoUrl={videoUrl}
          checked={checked}
          handleChange={handleChange}
          handleConfirmQuantity={handleConfirmQuantity}
          compoundDetails={compoundDetails!}
          isUpdose={isUpdose}
        />
      ) : (
        <WeightLossOptions
          videoUrl={videoUrl}
          checked={checked}
          handleChange={handleChange}
          handleConfirmQuantity={handleConfirmQuantity}
          compoundDetails={compoundDetails!}
        />
      )}
      {!medicationSelected && !review && (
        <>
          {id === 'compound' ? (
            <Stack gap="1rem" mb="2rem">
              {type !== 'skip' ? (
                <>
                  <Typography variant="h2">
                    {language === 'esp'
                      ? `Su solicitud para ${
                          type || 'weight loss medication'
                        } será enviada una vez que complete las preguntas restantes`
                      : `Your request for ${
                          type || 'weight loss medication'
                        } will be
                    submitted once you complete the remaining questions.`}
                  </Typography>
                  <Typography variant="h2">
                    {language === 'esp'
                      ? type === 'Wegovy'
                        ? 'Dado que puede llevar tiempo que su seguro apruebe su Wegovy o que le ayudemos a encontrarlo, podemos ayudarle a comenzar con semaglutida, el ingrediente activo de Wegovy, sin demora.'
                        : type === 'Mounjaro'
                        ? 'Si desea comenzar ahora sin demoras del seguro, puede solicitar tirzepatida, el ingrediente activo de Mounjaro.'
                        : type === 'Zepbound'
                        ? 'Si desea comenzar ahora sin demoras del seguro, puede solicitar tirzepatida, el ingrediente activo de Zepbound.'
                        : 'Dado que puede llevar tiempo que su seguro apruebe su medicamento, podemos ayudarle a comenzar con semaglutida, el ingrediente activo de Wegovy y Ozempic, sin demora.'
                      : type === 'Wegovy'
                      ? 'Since it can take time for us to get your insurance to approve your Wegovy or to help you find it, we can help you get started with semaglutide, Wegovy’s active ingredient, without delay.'
                      : type === 'Mounjaro'
                      ? 'If you want to get started now without insurance delay, you can order tirzepatide, Mounjaro’s active ingredient.'
                      : type === 'Zepbound'
                      ? 'If you want to get started now without insurance delay, you can order tirzepatide, Zepbound’s active ingredient.'
                      : 'Since it can take time for us to get your insurance to approve your medication, we can help you get started with semaglutide, the active ingredient in Wegovy and Ozempic, without delay.'}
                  </Typography>
                </>
              ) : (
                <Typography variant="h2">
                  {language === 'esp'
                    ? '¿Quiere comenzar con una pérdida de peso duradera más rápidamente? Puede solicitar semaglutida o tirzepatida sin demoras del seguro.'
                    : 'Want to get started on lasting weight loss more quickly? You can order semaglutide or tirzepatide without insurance delays.'}
                </Typography>
              )}
            </Stack>
          ) : isGlp1Ineligible ? (
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {language === 'esp'
                ? 'Dado que es posible que no sea elegible para medicamentos GLP-1 según sus respuestas, el metformin puede ser la opción adecuada para usted.'
                : 'Since you may not be eligible for GLP-1 medication based on your responses, metformin may be the right option for you.'}
            </Typography>
          ) : variant8288?.variation_name === 'Variation-1' ? (
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {language === 'esp'
                ? `Dado que ha indicado que no planea usar seguro, nuestras opciones asequibles de semaglutida o tirzepatida pueden ser adecuadas para usted.`
                : `Next, we will submit a Wegovy request for you and a provider will create your treatment plan for Wegovy or another GLP-1 medication, if appropriate.`}
            </Typography>
          ) : patient?.insurance_skip ? (
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {language === 'esp'
                ? `Dado que ha indicado que no planea usar seguro, nuestras opciones asequibles de semaglutida o tirzepatida pueden ser adecuadas para usted.`
                : 'Select a preferred treatment option.'}
            </Typography>
          ) : (
            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              {preferredTreatmentText}
            </Typography>
          )}

          {id === 'compound' ? (
            <Stack gap="1rem" mb="2rem">
              <Typography variant="body1">{willOnlyPayText}</Typography>
              <Typography variant="body1">
                {language === 'esp'
                  ? type === 'skip'
                    ? `Como miembro del programa de pérdida de peso de ${siteName}, puede recibir su medicamento, como semaglutida o tirzepatida, enviado a su puerta cada mes por tan solo $151/mes y no necesita esperar la cobertura del seguro.`
                    : type === 'Mounjaro' || type === 'Zepbound'
                    ? `Muchos miembros del programa de pérdida de peso de ${siteName} comenzarán con tirzepatida mientras esperan que el proceso simplificado de ${siteName} logre la cobertura de su ${type}, y luego tendrán la opción de continuar con tirzepatida o cambiar a ${type}. Este camino también funciona para muchos miembros que no pueden encontrar la dosis inicial de ${type} en las farmacias cercanas, ya que ${siteName} enviará tirzepatida directamente a su hogar, incluyendo la dosis inicial. Tirzepatida es el ingrediente activo en ${type}.`
                    : type === 'Ozempic' || type === 'Wegovy'
                    ? `Muchos miembros del programa de pérdida de peso de ${siteName} comenzarán con semaglutida mientras esperan que el proceso simplificado de ${siteName} logre la cobertura de su ${type}, y luego tendrán la opción de continuar con semaglutida o cambiar a ${type}. Este camino también funciona para muchos miembros que no pueden encontrar la dosis inicial de ${type} en las farmacias cercanas, ya que ${siteName} enviará semaglutida directamente a su hogar, incluyendo la dosis inicial. Semaglutida es el ingrediente activo en ${type}.`
                    : `Muchos miembros del programa de pérdida de peso de ${siteName} comenzarán con semaglutida mientras esperan que el proceso simplificado de ${siteName} logre la cobertura de su ${type}, y luego tendrán la opción de continuar con semaglutida o cambiar a ${type}. Este camino también funciona para muchos miembros que no pueden encontrar la dosis inicial de ${type} en las farmacias cercanas, ya que ${siteName} enviará semaglutida directamente a su hogar, incluyendo la dosis inicial. Semaglutida es el ingrediente activo en Wegovy y Ozempic.`
                  : type === 'skip'
                  ? `As a ${siteName} weight loss member, you can have your medication, such as semaglutide or tirzepatide, shipped to your door every month for as little as $${
                      variation4798?.variation_name === 'Variation-1'
                        ? '249'
                        : variation4798?.variation_name === 'Variation-2'
                        ? '199'
                        : '151'
                    }/month and you do not need to wait for insurance coverage.`
                  : type === 'Mounjaro' || type === 'Zepbound'
                  ? `Many ${siteName} weight loss members will start with tirzepatide as they wait for ${siteName}'s streamlined process to get their ${type} covered, and then they'll have the option to continue tirzepatide or switch to ${type}. This path also works for many members who are unable to find the starter dose of ${type} at pharmacies near them, as ${siteName} will ship tirzepatide directly to your home including at the starter dose. Tirzepatide is the active ingredient in ${type}.`
                  : type === 'Ozempic' || type === 'Wegovy'
                  ? `Many ${siteName} weight loss members will start with semaglutide as they wait for ${siteName}'s streamlined process to get their ${type} covered, and then they'll have the option to continue semaglutide or switch to ${type}. This path also works for many members who are unable to find the starter dose of ${type} at pharmacies near them, as ${siteName} will ship semaglutide directly to your home including at the starter dose. Semaglutide is the active ingredient in ${type}.`
                  : `Many ${siteName} weight loss members will start with semaglutide as they wait for ${siteName}'s streamlined process to get their ${type} covered, and then they'll have the option to continue semaglutide or switch to ${type}. This path also works for many members who are unable to find the starter dose of ${type} at pharmacies near them, as ${siteName} will ship semaglutide directly to your home including at the starter dose. Semaglutide is the active ingredient in Wegovy and Ozempic.`}
              </Typography>
              {type !== 'skip' && (
                <Typography variant="body1">
                  {confirmPreferredTreatmentText}
                  <Link
                    onClick={() => handleOnSkip()}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: '700',
                    }}
                  >
                    {clickHereText}
                  </Link>{' '}
                  {skipText}
                </Typography>
              )}
            </Stack>
          ) : isGlp1Ineligible ? (
            <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
              {metforminNotIncludedText}
            </Typography>
          ) : patient?.insurance_skip &&
            variant8288?.variation_name !== 'Variation-1' ? (
            <>
              <>
                <Typography variant="body1" mb={1}>
                  By confirming your preferred treatment, your {siteName}{' '}
                  provider will be able to prescribe and order GLP-1 medication
                  that is medically appropriate for you.
                </Typography>
                <Typography variant="body1" mb={1}>
                  {siteName}’s weight loss program, with its streamlined process
                  for getting insurance coverage, has the highest likelihood of
                  getting Wegovy approved to be covered by insurance among GLP-1
                  medication options.
                </Typography>
              </>
              {/* ) : (
                <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
                  {willOnlyPayText}
                </Typography>
              )} */}
            </>
          ) : (
            <>
              {variant8288?.variation_name !== 'Variation-1' && (
                <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
                  {language === 'esp'
                    ? isGlp1Ineligible
                      ? `Al confirmar su tratamiento preferido, su proveedor de ${siteName} podrá recetar y ordenar el medicamento que sea médicamente apropiado para usted.`
                      : `Al confirmar su tratamiento preferido, su proveedor de ${siteName} podrá recetar y ordenar el medicamento GLP-1 que sea médicamente apropiado para usted.`
                    : isGlp1Ineligible
                    ? `By confirming your preferred treatment, your ${siteName} provider will be able to prescribe and order medication that is medically appropriate for you.`
                    : isVariant7743
                    ? ''
                    : `By confirming your preferred treatment, your ${siteName} provider will be able to prescribe and order GLP-1 medication that is medically appropriate for you.`}
                </Typography>
              )}
              <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
                {isGlp1Ineligible
                  ? ''
                  : language === 'esp'
                  ? ['Compound Semaglutide', 'Compound Tirzepatide'].includes(
                      glp1MedicationDose?.drug || ''
                    )
                  : ['Compound Semaglutide', 'Compound Tirzepatide'].includes(
                      glp1MedicationDose?.drug || ''
                    )
                  ? null
                  : hasDiabetes
                  ? 'Typically for those with insurance and with type 2 diabetes, Mounjaro is the most affordable and effective option among GLP-1 medications, with co-pays typically costing $25/month and 20% of body weight loss on average.'
                  : ''}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
                {language === 'esp'
                  ? isGlp1Ineligible
                    ? ''
                    : ['Compound Semaglutide', 'Compound Tirzepatide'].includes(
                        glp1MedicationDose?.drug || ''
                      )
                    ? null
                    : hasDiabetes
                    ? `El programa de pérdida de peso de ${siteName}, con su proceso simplificado para obtener cobertura de seguro, tiene una alta probabilidad de lograr que Mounjaro sea aprobado para ser cubierto por su seguro.`
                    : `El programa de pérdida de peso de ${siteName}, con su proceso simplificado para obtener cobertura de seguro de salud, tiene la mayor probabilidad de que Wegovy sea aprobado para que lo cubra el seguro entre las opciones de medicamentos GLP-1.`
                  : isGlp1Ineligible
                  ? ''
                  : ['Compound Semaglutide', 'Compound Tirzepatide'].includes(
                      glp1MedicationDose?.drug || ''
                    )
                  ? null
                  : variant8288?.variation_name === 'Variation-1'
                  ? 'We find that Wegovy has the highest approval rate for most insurance plans.'
                  : hasDiabetes
                  ? `${siteName}’s weight loss program, with its streamlined process for getting insurance coverage, has a high likelihood of getting Mounjaro approved to be covered by your insurance.`
                  : isVariant7743
                  ? ''
                  : `${siteName}’s weight loss program, with its streamlined process for getting insurance coverage, has the highest likelihood of getting Wegovy approved to be covered by insurance among GLP-1 medication options.`}
              </Typography>
            </>
          )}

          <Box sx={{ marginBottom: '3rem' }} width="100%">
            {(isVariant7743
              ? medicationOptions.filter(
                  (med: any) =>
                    med?.brand === 'Semaglutide' || med?.brand === 'Tirzepatide'
                )
              : medicationOptions.filter(
                  (med: any) => med?.brand !== 'Oral Semaglutide'
                )
            ).map(
              (med: any, i: number) =>
                (seeMore || type === 'skip' || isVariant7743
                  ? true
                  : getFold(i)) && (
                  <Box
                    key={`med-${i}`}
                    sx={{
                      padding: '2rem 2.5rem 1rem 2.5rem',
                      borderRadius: '1rem',
                      background: '#ffffff',
                      boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '1rem',
                    }}
                  >
                    {glp1MedicationDose?.drug && i === 0 ? (
                      <Box
                        sx={{
                          backgroundColor: '#00531B',
                          color: '#ffffff',
                          width: 'fit-content',
                          padding: '0 15px',
                          borderRadius: '15px',
                          marginBottom: '1rem',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}
                      >
                        <Typography fontWeight={600}>
                          {`Recommended for you ${
                            [
                              'Saxenda (Liraglutide)',
                              'Victoza (Liraglutide)',
                            ]?.includes(glp1MedicationDose?.drug || '') &&
                            id === 'compound'
                              ? ''
                              : glp1MedicationDose?.drug ===
                                'Trulicity (Dulaglutide)'
                              ? ''
                              : '(your current Rx)'
                          }`}
                        </Typography>
                      </Box>
                    ) : [0, 1].includes(i) &&
                      !patient?.insurance_skip &&
                      type !== 'skip' &&
                      !glp1MedicationDose?.drug ? (
                      <>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor:
                                isGlp1Ineligible &&
                                (med.drug === 'Tirzepatide' ||
                                  med.drug === 'Semaglutide' ||
                                  med.drug === 'Liraglutide' ||
                                  med.brand === 'Zepbound')
                                  ? '#F7F9A5'
                                  : ['Zealthy', 'FitRx'].includes(
                                      siteName ?? ''
                                    )
                                  ? '#00531B'
                                  : theme.palette.primary.light,
                              color:
                                isGlp1Ineligible &&
                                (med.drug === 'Tirzepatide' ||
                                  med.drug === 'Semaglutide' ||
                                  med.drug === 'Liraglutide' ||
                                  med.brand === 'Zepbound')
                                  ? '#111111'
                                  : '#ffffff',
                              width: 'fit-content',
                              padding: '5px 15px',
                              borderRadius: '15px',
                              marginBottom: '1rem',
                              fontWeight: '700',
                              fontSize: '12px',
                            }}
                          >
                            {isGlp1Ineligible &&
                            (med.drug === 'Tirzepatide' ||
                              med.drug === 'Semaglutide' ||
                              med.drug === 'Liraglutide' ||
                              med.brand === 'Zepbound')
                              ? glp1nonEligibleText
                              : mostPopular}
                          </Box>
                        </Box>
                      </>
                    ) : i === 0 && type !== 'skip' ? (
                      <Box
                        sx={{
                          backgroundColor:
                            isGlp1Ineligible &&
                            (med.drug === 'Tirzepatide' ||
                              med.drug === 'Semaglutide' ||
                              med.drug === 'Liraglutide' ||
                              med.brand === 'Zepbound')
                              ? '#F7F9A5'
                              : ['Zealthy', 'FitRx'].includes(siteName ?? '')
                              ? '#00531B'
                              : theme.palette.primary.light,
                          color:
                            isGlp1Ineligible &&
                            (med.drug === 'Tirzepatide' ||
                              med.drug === 'Semaglutide' ||
                              med.drug === 'Liraglutide' ||
                              med.brand === 'Zepbound')
                              ? '#111111'
                              : '#ffffff',
                          width: 'fit-content',
                          padding: '5px 15px',
                          borderRadius: '15px',
                          marginBottom: '1rem',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}
                      >
                        {isGlp1Ineligible &&
                        (med.drug === 'Tirzepatide' ||
                          med.drug === 'Semaglutide' ||
                          med.drug === 'Liraglutide' ||
                          med.brand === 'Zepbound')
                          ? glp1nonEligibleText
                          : mostPopular}
                      </Box>
                    ) : null}
                    {![0, 1].includes(i) &&
                    isGlp1Ineligible &&
                    (med.drug === 'Tirzepatide' ||
                      med.drug === 'Semaglutide' ||
                      med.drug === 'Liraglutide' ||
                      med.brand === 'Zepbound') ? (
                      <Box
                        sx={{
                          backgroundColor: '#F7F9A5',
                          color: '#111111',
                          width: 'fit-content',
                          padding: '5px 15px',
                          borderRadius: '15px',
                          marginBottom: '1rem',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}
                      >
                        {glp1nonEligibleText}
                      </Box>
                    ) : null}
                    <Typography
                      sx={{
                        fontSize: '1.3rem !important',
                        fontWeight: '700',
                        lineHeight: '1.75rem',
                        letterSpacing: '0.00206',
                      }}
                    >
                      {med.brand}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: '500',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {med.drug}
                    </Typography>
                    <Stack gap={2} mb={3}>
                      <Typography
                        style={{
                          whiteSpace: 'pre-wrap',
                        }}
                        variant="body1"
                      >
                        {med.body1}
                      </Typography>
                      <Typography variant="body1">{med.body2}</Typography>
                      {['Semaglutide', 'Tirzepatide'].includes(med?.brand) &&
                      isVariant7743 ? (
                        <Typography variant="body1">
                          {
                            variant7743Text?.[
                              med?.brand as keyof typeof variant7743Text
                            ]
                          }
                        </Typography>
                      ) : (
                        med.body3 && (
                          <Typography variant="body1">
                            {['Variation-1', 'Variation-2'].includes(
                              variation7861?.variation_name!
                            ) || variant === 'twelve-month'
                              ? med.body3
                                  .replace('216', '200')
                                  .replace('151', '70')
                              : med.body3}
                          </Typography>
                        )
                      )}
                    </Stack>
                    <Button
                      onClick={() => {
                        selectMedication(med);
                      }}
                    >
                      {reviewTreatment}
                    </Button>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        gap: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      {med?.disclaimers?.map((text: string, idx: number) => (
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
                  </Box>
                )
            )}
            {medicationOptions?.length > 2 &&
            !isVariant7743 &&
            type !== 'skip' &&
            !['Wegovy', 'Ozempic', 'Zepbound', 'Mounjaro'].includes(
              type || ''
            ) ? (
              <Button
                color="grey"
                fullWidth
                onClick={() => setSeeMore(more => !more)}
              >
                {seeMore ? viewLessText : viewMoreText}
                {seeMore ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </Button>
            ) : null}
          </Box>
          {variant8288?.variation_name === 'Variation-1' &&
            id !== 'compound' && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Image
                  alt="skip-brand-name-7085"
                  src={SkipBrandName}
                  quality={100}
                  priority
                  style={{
                    width: isMobile ? '90%' : '100%',
                    height: isMobile ? '90%' : '100%',
                    marginBottom: '2rem',
                  }}
                />
              </Box>
            )}
          {!isVariant7743 &&
            (variant8288?.variation_name === 'Variation-1' &&
            id !== 'compound' ? (
              <Button
                type="button"
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={() => {
                  Router.push(
                    {
                      pathname:
                        '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
                      query: {
                        id: 'compound',
                        type: 'skip',
                      },
                    },
                    undefined,
                    { shallow: true }
                  );
                  window.scrollTo({ top: 0, left: 0 });
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                fullWidth
                sx={{ marginBottom: '1rem' }}
                onClick={handleOnSkip}
              >
                {continueWithoutSelectingText}
              </Button>
            ))}
        </>
      )}
      <TreatmentILVModal open={showIlvModal} setOpen={setShowIlvModal} />
    </Container>
  );
};

export default WeightLossTreatment;
