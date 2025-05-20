import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import { Button, List, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import BirthControlMedication from './component/BirthControlMedication';
import BirthControlTreatment from './component/BirthControlTreatment';

const items: Medication[] = [
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 45,
    dosage: 'Standard Dose',
    quantity: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 284,
  },
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 90,
    dosage: 'Standard Dose',
    quantity: 180,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 285,
  },
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 156,
    dosage: 'Standard Dose',
    quantity: 360,
    recurring: {
      interval: '',
      interval_count: 0,
    },
    medication_quantity_id: 286,
  },
];

const quantityOptions = [
  {
    quantity: '3 packs',
    price: '$45 every 3 months',
    description: 'Get three packs of birth control pills every three months.',
    monthlyPrice: 15,
    medication_quantity_id: 284,
  },
  {
    quantity: '6 packs',
    price: '$90 every 6 months',
    description: 'Get six packs of birth control pills every six months.',
    monthlyPrice: 15,
    medication_quantity_id: 285,
  },
  {
    quantity: '12 packs',
    price: '$156 for 12 months',
    description: 'Get twelve packs of birth control pills.',
    monthlyPrice: 13,
    discountMonthlyPrice: 15,
    savings: 24,
    medication_quantity_id: 286,
  },
];

interface BirthControlTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

const BirthControlTreatmentSelect = ({
  question,
  questionnaire,
  onNext,
}: BirthControlTreatmentSelectProps) => {
  const { addMedication } = useVisitActions();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  const [selectedMedication, setSelectedMedication] = useState<string | null>(
    null
  );

  const [selectedQuantity, setSelectedQuantity] = useState<Medication | null>(
    null
  );

  function handleSelect(quantity: Medication) {
    setSelectedQuantity(quantity);
    const answer = `${selectedMedication} - ${quantity.quantity} count - $${quantity.price}`;
    submitFreeTextAnswer({ text: answer });
  }

  const handleContinue = () => {
    if (!selectedQuantity) {
      return;
    }

    addMedication({
      ...selectedQuantity,
      display_name: selectedMedication!,
    });
    submitAnswer();
    onNext();
  };

  if (!selectedMedication) {
    return (
      <BirthControlMedication handleSelectMedication={setSelectedMedication} />
    );
  }

  return (
    <Stack gap={2}>
      <Typography variant="h2">
        We’re ready to provide you with birth control.{' '}
      </Typography>
      <Typography variant="h5">
        How often would you like to receive your birth control? Pricing refers
        to generic pills. Pay as little as $13/month without insurance.
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {quantityOptions.map((quantity, idx) => (
          <BirthControlTreatment
            details={quantity}
            key={items[idx].medication_quantity_id}
            birthControl={items[idx]}
            onSelect={handleSelect}
            isSelected={
              selectedQuantity?.medication_quantity_id ===
              items[idx].medication_quantity_id
            }
          />
        ))}
      </List>
      <Button
        size="small"
        onClick={handleContinue}
        disabled={!selectedQuantity}
      >
        Continue with birth control
      </Button>
      <Stack>
        <Typography textAlign="center">
          Price refers to generic pills.
        </Typography>
        <Typography textAlign="center" color="#A8A8A8">
          If your Zealthy provider determines that branded pills are better,
          price may vary.
        </Typography>
      </Stack>
    </Stack>
  );
};

export default BirthControlTreatmentSelect;
