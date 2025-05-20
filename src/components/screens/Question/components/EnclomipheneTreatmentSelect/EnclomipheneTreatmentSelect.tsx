import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useVWOVariationName } from '@/components/hooks/data';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import {
  QuestionWithName,
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import { Button, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import enclomipheneBottle from '/public/images/enclom_bottle.png';
import EnclomipheneTreatment from './component/EnclomipheneTreatment';

const items: Medication[] = [
  {
    name: 'Enclomiphene Medication',
    type: MedicationType.ENCLOMIPHENE,
    dosage: 'Standard Dose',
    quantity: 365,
    recurring: {
      interval: 'month',
      interval_count: 12,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 353 : 302,
    price: 1188,
  },
  {
    name: 'Enclomiphene Medication',
    type: MedicationType.ENCLOMIPHENE,
    dosage: 'Standard Dose',
    quantity: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 298 : 299,
    price: 420,
  },
  {
    name: 'Enclomiphene Medication',
    type: MedicationType.ENCLOMIPHENE,
    dosage: 'Standard Dose',
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 297 : 298,
    price: 190,
  },
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
  isMostPopular?: boolean;
  isBestValue?: boolean;
};

const options: {
  image: string;
  pricePerUnit: number;
  unit: string;
  label: string;
  value: Medication;
  subLabel: string;
  isMostPopular?: boolean;
  isBestValue?: boolean;
}[] = [
  {
    image: enclomipheneBottle.src,
    label:
      "<div class='title'><h3><strong>Yearly Plan</strong></h3><div>Bills every 12 months</div><div class='price'>$1092 yearly savings</div></div><div class='cost'><div class='cost-label'>From</div><div class='payment'>$99/month</div></div>",
    pricePerUnit: 1188,
    unit: 'month',
    subLabel: '',
    value: items[0],
    isMostPopular: false,
    isBestValue: true,
  },
  {
    image: enclomipheneBottle.src,
    label:
      "<div class='title'><h3><strong>Quarterly Plan</strong></h3><div>Bills every 3 months</div><div class='price'>$600 yearly savings</div></div><div class='cost'><div class='cost-label'>From</div><div class='payment'>$140/month</div></div>",
    pricePerUnit: 420,
    unit: 'month',
    subLabel: '',
    value: items[1],
    isMostPopular: true,
    isBestValue: false,
  },
  {
    image: enclomipheneBottle.src,
    label:
      "<div class='title'><h3><strong>Monthly Plan</strong></h3><div>Bills every month</div></div><div class='cost'><div class='cost-label'>From</div><div class='payment'>$190/month</div></div>",
    pricePerUnit: 190,
    unit: 'month',
    subLabel: '',
    value: items[2],
    isMostPopular: false,
    isBestValue: false,
  },
];

interface EnclomipheneTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

const EnclomipheneTreatmentSelect = ({
  question,
  questionnaire,
  onNext,
}: EnclomipheneTreatmentSelectProps) => {
  const { addMedication } = useVisitActions();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  const { data: variation8205 } = useVWOVariationName('8205');
  const showBadges =
    variation8205?.variation_name === 'Variation-2' ||
    variation8205?.variation_name === 'Variation-3';

  const currentOptions = useMemo(() => {
    return question.answerOptions!.map((aO, i) => {
      const option = {
        answer: aO,
        ...options[i],
      } as OptionType;

      if (!showBadges) {
        option.isMostPopular = false;
        option.isBestValue = false;
      }

      return option;
    });
  }, [question, showBadges]);

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

  const handleContinue = () => {
    if (!selectedMedication) {
      return;
    }

    addMedication({
      ...selectedMedication,
      display_name: selectedMedication.type!,
    });
    submitAnswer();
    onNext();
  };

  return (
    <Stack gap={2}>
      {currentOptions?.length &&
        currentOptions?.map((option, idx) => (
          <EnclomipheneTreatment
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
      >
        Continue
      </Button>
    </Stack>
  );
};

export default EnclomipheneTreatmentSelect;
