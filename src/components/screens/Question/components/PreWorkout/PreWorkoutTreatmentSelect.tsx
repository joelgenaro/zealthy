import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { Pathnames } from '@/types/pathnames';
import {
  QuestionWithName,
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import PreWorkoutTreatment from './PreWorkoutTreatment';

const items: Medication[] = [
  {
    name: '2.5 mg tadalafil • 2.5 mg vardenafil',
    type: MedicationType.PRE_WORKOUT,
    dosage: '5 mg',
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },

    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 362 : 321,
    price: 99.99,
  },
  {
    name: '5 mg tadalafil • 5 mg vardenafil',
    type: MedicationType.PRE_WORKOUT,
    dosage: '10 mg',
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },

    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 363 : 322,
    price: 150,
  },
  {
    name: '10 mg tadalafil • 10 mg vardenafil',
    type: MedicationType.PRE_WORKOUT,
    dosage: '20 mg',
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 365 : 323,
    price: 210,
  },

  // MIGHT REINSERT LATER
  // {
  //   name: 'Tadalafil 10 mg + Vardenafil 10 mg',
  //   type: MedicationType.PRE_WORKOUT,
  //   dosage: '20 mg',
  //   quantity: 30,
  //   recurring: {
  //     interval: 'month',
  //     interval_count: 1,
  //   },
  //   medication_quantity_id:
  //     process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 365 : 323,
  //   price: 0,
  // },
];

type OptionType = {
  answer: QuestionnaireQuestionAnswerOptions;
  label: string;
  value: Medication;
  pricePerUnit: number;
  unit: string;
  alternative?: {
    medication: Medication;
    pricePerUnit: number;
    unit: string;
    image: string;
  };
  subLabel: string;
  image: string;
};

const options: {
  pricePerUnit: number;
  unit: string;
  label: string;
  value: Medication;
  subLabel: string;
}[] = [
  {
    label: 'Starter pack',
    pricePerUnit: 99.99,
    unit: 'month',
    subLabel: '2.5 mg tadalafil • 2.5 mg vardenafil',
    value: items[0],
  },
  {
    label: 'Get stronger pumps',
    pricePerUnit: 150,
    unit: 'month',
    subLabel: '5 mg tadalafil • 5 mg vardenafil',
    value: items[1],
  },
  {
    label: 'Maximize muscle production',
    pricePerUnit: 210,
    unit: 'month',
    subLabel: '10 mg tadalafil • 10 mg vardenafil',
    value: items[2],
  },

  // {
  //   // MIGHT REINSERT LATER
  //   pricePerUnit: 0,
  //   label: 'Daily use',
  //   unit: 'month',
  //   subLabel: '10 mg tadalafil • 10 mg vardenafil',
  //   value: items[2],
  // },
];

interface PreWorkoutTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

const PreWorkoutTreatmentSelect = ({
  question,
  questionnaire,
  onNext,
}: PreWorkoutTreatmentSelectProps) => {
  const { addMedication } = useVisitActions();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  const currentOptions = useMemo(() => {
    return question.answerOptions!.map(
      (aO, i) =>
        ({
          answer: aO,
          ...options[i],
        } as OptionType)
    );
  }, [question]);

  const [selectedMedication, setSelectedMedication] = useState<any>(null);

  const handleSelect = useCallback(
    (option: any) => {
      setSelectedMedication(option?.value);
      const answer = `${option?.value?.type} - ${option?.value?.quantity} count - $${option?.pricePerUnit}`;
      addMedication(option?.value);
      submitFreeTextAnswer({ text: answer });
    },
    [addMedication, submitFreeTextAnswer]
  );

  const handleContinue = async () => {
    if (!selectedMedication) {
      return;
    }

    addMedication({
      ...selectedMedication,
      display_name: selectedMedication.type!,
    });
    await submitAnswer();
    Router.push(Pathnames.CHECKOUT);
  };

  return (
    <Stack gap={2}>
      {currentOptions?.length &&
        currentOptions?.map((option, idx) => (
          <PreWorkoutTreatment
            option={option}
            key={idx}
            selectedMedication={selectedMedication}
            onSelect={handleSelect}
          />
        ))}
      <Button
        size="large"
        onClick={handleContinue}
        disabled={!selectedMedication}
        sx={{ marginTop: '20px' }}
      >
        Continue
      </Button>
    </Stack>
  );
};

export default PreWorkoutTreatmentSelect;
