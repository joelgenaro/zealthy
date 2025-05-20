import { useEffect, useMemo, useState } from 'react';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientOrders,
  useAllPatientPrescriptionRequest,
  useCompoundMatrix,
  CompoundMatrixProps,
  Prescription,
  PatientProps,
} from '@/components/hooks/data';
import { differenceInDays } from 'date-fns';
import UsStates from '@/constants/us-states';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import { getPlan } from '@/utils/orders/getPlan';
import { useAnswerState } from './useAnswer';
import { AnswerState } from '@/context/AppContext/reducers/types/answer';

function compareFn(a: any, b: any) {
  if (new Date(a.created_at) < new Date(b.created_at)) {
    return -1;
  } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return 1;
  }
  return 0;
}

const dosageToMonth: {
  semaglutide: { [key: string]: number };
  tirzepatide: { [key: string]: number };
} = {
  semaglutide: {
    '0.25 mg per week (1 mg per month)': 2,
    '0.5 mg per week (2 mg per month)': 3,
    '1 mg per week (4 mg per month)': 3,
    '1.7 mg per week (6.8 mg per month)': 4,
    '2.4 mg per week (9.6 mg per month)': 4,
  },
  tirzepatide: {
    '2.5 mg per week (10 mg per month)': 2,
    '5 mg per week (20 mg per month)': 3,
    '7.5 mg per week (30 mg per month)': 4,
    '10 mg per week (40 mg per month)': 4,
    '12.5 mg per week (50 mg per month)': 4,
  },
};

export const useNextDosage = (
  patient: PatientProps,
  plan: string,
  matrixData: CompoundMatrixProps[],
  med?: string,
  patientPrescriptions?: (Prescription & {
    matrix_id: CompoundMatrixProps;
  })[],
  keepDosage: boolean = true,
  answers?: AnswerState
) => {
  if (!med || !patientPrescriptions || !matrixData) {
    return;
  }
  // Get state full name
  const patientState = UsStates.find(
    s => s.abbreviation === patient?.region
  )?.name;

  // Sort compound matrix based on month (dosage)
  const sortedMatrixData = matrixData
    ?.filter(
      matrixEntry =>
        matrixEntry.subscription_plan === plan &&
        matrixEntry.active &&
        matrixEntry.states?.includes(patientState as string)
    )
    .sort((a, b) => {
      return a?.current_month! > b?.current_month! ? 1 : -1;
    });

  // Get all compound prescriptions from the last 6 months
  let dosage;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(new Date().getMonth() - 6);
  const compoundPatientPrescriptions = patientPrescriptions?.filter(
    pr => pr.matrix_id && new Date(pr.created_at!) > sixMonthsAgo
  );
  // First request
  if (compoundPatientPrescriptions?.length === 0) {
    if (answers) {
      const timesOfMostRecentDoses = Object.values(answers!).filter(answer =>
        answer.name.includes('WL_GLP_1_Q2')
      );
      const mostRecentDoses = Object.values(answers!).filter(answer =>
        answer.name.includes('WL_GLP_1_Q1')
      );
      if (mostRecentDoses.length > 0 && timesOfMostRecentDoses.length > 0) {
        // Find approximate months of GLP1 prescriptions
        const months = mostRecentDoses.map((dose, idx) => {
          if (!timesOfMostRecentDoses[idx]) {
            return 0;
          }
          const timeOfDose =
            timesOfMostRecentDoses[idx].answer[0].valueCoding.display;

          // Do not consider any dosages that were NOT within the last month
          if (!(timeOfDose === 'Within the past month')) {
            return 0;
          }
          const recentDosage =
            mostRecentDoses[idx].answer[0].valueCoding.display;
          const med = timesOfMostRecentDoses[idx].text
            .toLowerCase()
            .includes('tirzepatide')
            ? 'tirzepatide'
            : timesOfMostRecentDoses[idx].text
                .toLowerCase()
                .includes('semaglutide')
            ? 'semaglutide'
            : '';

          if (med === '') {
            return 0;
          }

          return dosageToMonth[med as keyof typeof dosageToMonth][recentDosage];
        });

        // For any GLP1s taken in the last month, consider those when finding next dosage
        const nextMonth = Math.max(...months);
        const nextDosage = sortedMatrixData.find(med => {
          return med.current_month === nextMonth;
        });
        dosage = nextDosage;
      } else {
        dosage = sortedMatrixData[0];
      }
    } else {
      dosage = sortedMatrixData[0];
    }
  }
  // Refill
  else {
    const months = compoundPatientPrescriptions.map(presc => {
      if (presc.matrix_id.subscription_plan?.includes('multi_month')) {
        return presc.matrix_id.current_month! + 2;
      } else if (presc.matrix_id.subscription_plan?.includes('six_month')) {
        return presc.matrix_id.current_month! + 5;
      } else if (presc.matrix_id.subscription_plan?.includes('twelve_month')) {
        return presc.matrix_id.current_month! + 11;
      } else {
        return presc.matrix_id.current_month;
      }
    });
    const highestMonth = Math.min(Math.max(...(months as number[])), 6);
    const nextDosage = sortedMatrixData.find(med => {
      return med.current_month === highestMonth + (keepDosage ? 0 : 1);
    });
    dosage = nextDosage;
  }
  // Just in case no entries were returned
  if (!dosage) {
    dosage = sortedMatrixData[0];
  }
  return {
    med: dosage,
    plan,
    price: dosage?.price,
    compound: true,
    shipments: dosage?.shipment_breakdown?.join() || '',
    currentMonth: dosage?.current_month,
  };
};

export const useTitrationSelection = (
  dosage?: string | null,
  skipTitration = false
) => {
  const { data: patient } = usePatient();
  const { data: patientSubscriptions, isFetched: subFetched } =
    useAllVisiblePatientSubscription();
  const { data: patientPrescriptionRequests, isFetched: reqFetched } =
    useAllPatientPrescriptionRequest();
  const { data: patientOrders, isFetched: orderFetched } = usePatientOrders();
  const { data: matrixData } = useCompoundMatrix();
  const answers = useAnswerState();
  const isSameDosage =
    answers?.WEIGHT_L_C_REFILL_Q3?.answer[0]?.valueCoding?.code ===
    'KEEP_DOSAGE';

  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med')?.replace('Oral ', '');
  const [selectedMed, setSelectedMed] = useState<CompoundMatrixProps | null>(
    null
  );
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [shipments, setShipments] = useState<string>('');
  const [compound, setCompound] = useState(true);

  const weightLossSubscription = useMemo(() => {
    const weightLossSubs = patientSubscriptions
      ?.filter(s => s.subscription.name.includes('Weight Loss'))
      .sort(compareFn);

    return (
      weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0]
    );
  }, [patientSubscriptions]);

  async function fetchCorrectMed() {
    const sub = weightLossSubscription;
    const medRequested = medicationSelected
      ? medicationSelected.slice(0, 1).toUpperCase() +
        medicationSelected.slice(1)
      : patientOrders?.[0]?.prescription?.medication
          ?.toLowerCase()
          ?.includes('semaglutide')
      ? 'Semaglutide'
      : patientOrders?.[0]?.prescription?.medication
          ?.toLowerCase()
          ?.includes('tirzepatide')
      ? 'Tirzepatide'
      : (
          patientPrescriptionRequests?.[0]?.specific_medication ||
          patientPrescriptionRequests?.[0]?.note
        )?.includes('Semaglutide')
      ? 'Semaglutide'
      : (
          patientPrescriptionRequests?.[0]?.specific_medication ||
          patientPrescriptionRequests?.[0]?.note
        )?.includes('Tirzepatide')
      ? 'Tirzepatide'
      : (
          patientPrescriptionRequests?.[1]?.specific_medication ||
          patientPrescriptionRequests?.[1]?.note
        )?.includes('Semaglutide')
      ? 'Semaglutide'
      : (
          patientPrescriptionRequests?.[1]?.specific_medication ||
          patientPrescriptionRequests?.[1]?.note
        )?.includes('Tirzepatide')
      ? 'Tirzepatide'
      : null;

    if (!medRequested) setCompound(false);

    // Check if part of bundle plan
    const semBundle = sub?.price === 297;
    const tirzBundle = sub?.price === 449;

    // Check sub times
    let currMonth = 0;
    const subStart = new Date(sub?.created_at || '');
    const subPeriodStart = new Date(sub?.current_period_start || '');
    const subPeriodEnd = new Date(sub?.current_period_end || '');
    const daysSinceStart = differenceInDays(new Date(), subStart);

    // This will tell us if monthly or quarterly med
    const currentPeriodLength =
      differenceInDays(subPeriodEnd, subPeriodStart) / 30;

    // if sub start and period start are the same we are in the first month
    const totalOrderDurationInDays = patientOrders
      ?.filter(
        o =>
          ['semaglutide', 'tirzepatide', 'liraglutide']?.includes(
            o.prescription?.medication?.toLowerCase().split(' ')[0] || ''
          ) &&
          !['cancel', 'cancelled', 'canceled', 'payment_failed'].includes(
            o?.order_status?.toLowerCase()!
          )
      )
      ?.reduce(
        (total, item) => total + (item?.prescription?.duration_in_days ?? 0),
        0
      );
    currMonth = Math.round((totalOrderDurationInDays ?? 30) / 30 + 1);

    let plan = getPlan(
      medRequested,
      currentPeriodLength,
      semBundle,
      tirzBundle
    );

    if (['tirzepatide_multi_month', 'semaglutide_multi_month'].includes(plan)) {
      currMonth = Math.ceil((totalOrderDurationInDays ?? 30) / 90 + 1);
    }
    const correctPlan = matrixData
      ?.filter(m => m.active)
      ?.filter((p: CompoundMatrixProps) => p.subscription_plan === plan);

    const recentSig = dosage?.split(' ')?.[0];

    const recentOrder = patientOrders?.find(
      o =>
        ['semaglutide', 'tirzepatide', 'liraglutide']?.includes(
          o.total_dose?.toLowerCase().split(' ')[0] ||
            o.prescription?.medication?.toLowerCase().split(' ')[0] ||
            ''
        ) &&
        !['cancel', 'cancelled', 'canceled', 'payment_failed'].includes(
          o?.order_status?.toLowerCase()!
        )
    );

    const recentOrderDose =
      recentOrder?.total_dose?.toLowerCase().split(' ')[1] ||
      recentOrder?.prescription?.medication?.split(' ')[1];

    const currentOptions = correctPlan?.filter((p: any) =>
      p.states.includes(
        UsStates.find(s => s.abbreviation === patient?.region)?.name
      )
    );

    // Initialize variables
    let closestMonth = null;
    let minDifference = Infinity;

    // Find the object with dose closest to targetDose
    if (recentSig) {
      currentOptions?.find(item => {
        if (!item.current_month) return;
        const difference = Math.abs(
          parseFloat(item?.dose || '0') - parseFloat(recentSig || '0')
        );

        if (difference < minDifference) {
          minDifference = difference;
          closestMonth = item?.current_month;
        }
        // For the purpose of the .find() method, we don't need to return anything specific
        return false;
      });
    }

    const currentEscalatedDose: string = closestMonth || '';

    const currentEscalatedMonth =
      correctPlan?.find(
        (p: any) =>
          p?.vial_size === `${recentOrderDose} mg` &&
          p.states.includes(
            UsStates.find(s => s.abbreviation === patient?.region)?.name
          )
      )?.current_month ||
      correctPlan?.find(
        (p: any) =>
          p?.dose?.split(' ')[0] === recentSig &&
          p.states.includes(
            UsStates.find(s => s.abbreviation === patient?.region)?.name
          )
      )?.current_month;

    currMonth =
      currentEscalatedDose && currentEscalatedDose?.toString()?.includes('9')
        ? 9
        : currentEscalatedDose?.toString()?.includes(currMonth.toString())
        ? currMonth
        : currentEscalatedDose?.toString()?.length ?? 0 > 0
        ? parseInt(currentEscalatedDose || '', 10) + 1
        : currentEscalatedMonth &&
          currentEscalatedMonth?.toString()?.includes('9')
        ? 9
        : currentEscalatedMonth?.toString()?.includes(currMonth.toString())
        ? currMonth
        : // : currentEscalatedMonth
        // ? currentEscalatedMonth + 1
        !totalOrderDurationInDays
        ? currMonth
        : currMonth;

    if (currMonth > 9) {
      currMonth = 9;
    }

    if (
      Router.asPath.includes('post-checkout') &&
      !currentEscalatedMonth &&
      !currentEscalatedDose
    ) {
      currMonth = 1;
    }

    if (skipTitration && currMonth < 8) {
      currMonth = currMonth - 1;
    }

    if (isSameDosage) {
      currMonth--;
    }

    const correctRow =
      correctPlan?.find(
        (p: any) =>
          p?.current_month?.toString()?.includes(currMonth.toString()) &&
          p.states.includes(
            UsStates.find(s => s.abbreviation === patient?.region)?.name
          )
      ) || null;

    const name = `${medRequested} ${correctRow?.vial_size} vial`;

    setSelectedMed(correctRow as any);
    setShipments(correctRow?.shipment_breakdown?.join() || '');
    setCurrentMonth(currMonth);
    setCurrentPlan(plan);
    setPrice(correctRow?.price || 0);
  }

  useEffect(() => {
    if (matrixData && orderFetched && subFetched && reqFetched) {
      fetchCorrectMed();
    }
  }, [
    matrixData,
    medicationSelected,
    orderFetched,
    subFetched,
    reqFetched,
    dosage,
    skipTitration,
  ]);

  return {
    currentMonth,
    currentPlan,
    selectedMed: selectedMed,
    price,
    compound,
    shipments,
  };
};
