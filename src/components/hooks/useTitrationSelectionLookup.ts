import { useEffect, useState } from 'react';
import {
  CompoundMatrixProps,
  useCompoundMatrix,
  usePatient,
} from '@/components/hooks/data';
import UsStates from '@/constants/us-states';

type MatrixProps = {
  plan: string;
  currMonth: string;
  dose: string;
  durationInWeeks: string;
  pharmacy: string;
  price: string;
  sig: string;
  size: string;
  states: string[];
  shipments: string;
  vials: string;
  doctorInstructions: string;
  laymanInstructions: string;
};

export const useTitrationSelectionLookup = (
  medRequested: string,
  month: number,
  plan: string,
  totalDose?: string
  //for 90 day refill recurring requests, we dont want to depend on next month. the dosage should be the same (or higher if last dosage is inactive in compound matrix and no other option)
) => {
  const { data: patient } = usePatient();
  const [selectedMed, setSelectedMed] = useState<CompoundMatrixProps | null>(
    null
  );
  const [price, setPrice] = useState<number>(0);
  const [shipments, setShipments] = useState<string>();
  const { data: matrixData } = useCompoundMatrix();

  async function fetchCorrectMed() {
    const correctPlan = matrixData
      ?.filter(m => m.active)
      ?.filter((p: CompoundMatrixProps) => p.subscription_plan === plan);

    const correctRow = totalDose
      ? correctPlan?.find((p: any) => {
          const planVialSize = p?.vial_size;
          const floatValue = parseFloat(planVialSize.match(/[\d.]+/)[0]);

          return (
            p?.states.includes(
              UsStates.find(s => s.abbreviation === patient?.region)?.name
            ) && floatValue >= parseFloat(totalDose.match(/[\d.]+/)?.[0] ?? '0')
          );
        }) || null
      : correctPlan?.find(
          (p: any) =>
            p?.current_month?.toString()?.includes(month.toString()) &&
            p?.states.includes(
              UsStates.find(s => s.abbreviation === patient?.region)?.name
            )
        ) || null;

    const name = plan?.includes('Bundled (monthly)')
      ? `${medRequested} Bundled Monthly`
      : `${medRequested} ${correctRow?.vial_size} vial`;

    setSelectedMed(correctRow);
    setShipments(correctRow?.shipment_breakdown?.join() || '');
    setPrice(correctRow?.price || 0);
  }

  useEffect(() => {
    if (matrixData && medRequested && plan && month) {
      fetchCorrectMed();
    }
  }, [matrixData, medRequested, plan, month]);

  return { med: selectedMed, price, shipments };
};
