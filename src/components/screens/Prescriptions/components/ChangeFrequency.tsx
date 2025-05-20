import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import {
  MedicationType,
  OtherOption,
} from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo, useState } from 'react';

import { useIsMobile } from '@/components/hooks/useIsMobile';
import { MedicationName } from '@/constants/ed-mapping/types';
import { ED_MAPPING } from '@/constants/ed-mapping';
import RadioOptionList from '../../Question/components/RadioOptionList';
import { Button, Container, Stack, Typography } from '@mui/material';

type QuantityValue = {
  quantity: number | undefined;
  medication_quantity_id: number | null;
  otherOptions: OtherOption[];
};

type Option = {
  label: string;
  options: {
    label: string;
    value: QuantityValue;
  }[];
};

const optionsByDosage = (
  medicationName: MedicationName,
  dosage: string,
  fontSize: string
): Option[] => {
  const quantities = ED_MAPPING[medicationName][dosage].quantities;
  const popular = quantities.filter(q => q.popular);
  const others = quantities.filter(q => !q.popular);

  return [
    {
      label: 'Most popular',
      options: popular.map(q => ({
        label: `<span style="font-size: ${fontSize}">${q.display_name}</span>`,
        value: {
          quantity: q.value,
          medication_quantity_id: q.medication_quantity_id,
          otherOptions: q.otherOptions,
        },
      })),
    },
    {
      label: 'Additional options',
      options: others.map(q => ({
        label: `<span style="font-size: ${fontSize}">${q.display_name}</span>`,
        value: {
          quantity: q.value,
          medication_quantity_id: q.medication_quantity_id,
          otherOptions: q.otherOptions,
        },
      })),
    },
  ];
};

interface EDFrequencyProps {
  setPage: (page: string) => void;
}

const EDFrequency = ({ setPage }: EDFrequencyProps) => {
  const isMobile = useIsMobile();
  const { updateMedication } = useVisitActions();
  const supabase = useSupabaseClient<Database>();
  const medication = useVisitSelect(visit =>
    visit.medications.find(m => m.type === MedicationType.ED)
  );
  const [currentValue, setCurrentValue] = useState<QuantityValue>({
    quantity: medication?.quantity,
    medication_quantity_id: medication?.medication_quantity_id || null,
    otherOptions: medication?.otherOptions || [],
  });

  if (!medication || !medication.dosage) {
    throw new Error('No medication or dosage was selected');
  }

  const selectInterval = () => setPage('change-interval');

  const options = useMemo(() => {
    return optionsByDosage(
      medication.name as MedicationName,
      medication.dosage as string,
      isMobile ? '14px' : '16px'
    );
  }, [isMobile, medication.dosage, medication.name]);

  const handleQuantity = useCallback(
    (value: QuantityValue) => {
      setCurrentValue(value);
      if (!value.medication_quantity_id) {
        return;
      }
      supabase
        .from('medication_quantity')
        .select('price')
        .eq('id', value.medication_quantity_id)
        .single()
        .then(({ data }) => {
          if (data) {
            updateMedication({
              type: MedicationType.ED,
              update: {
                ...value,
                price: data.price,
                discounted_price: data.price - 20,
              },
            });
          }
        });
    },
    [supabase, updateMedication]
  );

  const isSelected = useCallback(
    (value: QuantityValue) =>
      currentValue.medication_quantity_id === value.medication_quantity_id,
    [currentValue.medication_quantity_id]
  );

  return (
    <Container maxWidth="sm">
      <Stack gap="24px">
        <Typography variant="h2">{`How frequently do you plan to use ${medication.name} per month?`}</Typography>
        <Typography>{`In a typical month, how many times do you expect to use ${medication.name}?`}</Typography>
        <RadioOptionList
          isSelected={isSelected}
          groups={options}
          onSelect={handleQuantity}
        />
        <Button onClick={selectInterval}>Continue</Button>
      </Stack>
    </Container>
  );
};

export default EDFrequency;
