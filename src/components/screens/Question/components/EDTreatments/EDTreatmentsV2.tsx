import { Medication } from '@/context/AppContext/reducers/types/visit';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Key, useCallback, useMemo, useState } from 'react';
import {
  QuestionWithName,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import Option from './components/Option';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  options as medicationOptions,
  options5440,
  optionsCA,
} from './asset/treatment-options';
import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatientState } from '@/components/hooks/usePatient';
import { usePortalQuestionnaireQuestion } from '@/components/hooks/usePortalQuestionnaireQuestion';

interface OptionsProps {
  question: QuestionWithName;
  onNext: (nextPage?: string) => void;
}

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

const EDTreatmentsV2 = ({ question, onNext }: OptionsProps) => {
  const { submitSingleSelectAnswer } = useAnswerAction(question);
  const usage = useSelector(store => store.intake.conditions);
  const { addMedication } = useVisitActions();
  const { variant } = useIntakeState();
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState<boolean>(false);
  const [context, setContext] = useState<OptionType | null>(null);
  const { data: variation5146 } = useVWOVariationName('5146');
  const patientState = usePatientState();
  const { question: questionData } = usePortalQuestionnaireQuestion();
  console.log(questionData);

  const options =
    variant === '5440'
      ? options5440
      : patientState.region === 'CA'
      ? optionsCA
      : medicationOptions;

  const medOptions = useMemo(() => {
    return questionData.answerOptions!.map(
      (aO: any, i: number) =>
        ({
          answer: aO,
          ...options[i],
        } as OptionType)
    );
  }, [question]);

  const filteredCurrentOptions = useCallback(() => {
    if (variation5146?.variation_name === 'Variation-1') {
      return medOptions.filter(
        (o: { value: { name: string } }) =>
          !o.value.name.toLowerCase().includes('oxytocin')
      );
    }
    return medOptions;
  }, [medOptions, variation5146?.variation_name]);

  const currentOptions = filteredCurrentOptions();

  const others = useMemo(() => currentOptions.slice(1), [currentOptions]);

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer({
        text: answer.text,
        code: answer.code,
        next: answer.next,
        system: answer.system,
      });

      onNext();
    },
    [onNext, submitSingleSelectAnswer]
  );

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h3">Recommended</Typography>
        {currentOptions.slice(0, 1).map((o: Option, i: number) => (
          <Option key={i} option={o} onSelect={handleSubmit} />
        ))}
        {all &&
          others.map((o: Option, i: number) => (
            <Option key={i} option={o} onSelect={handleSubmit} />
          ))}
      </Stack>
      <Button
        color="grey"
        sx={{ width: 368, margin: '0 auto' }}
        onClick={() => setAll(!all)}
      >
        {all ? 'Close' : 'View all'}
        {all ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Button>
    </>
  );
};

export default EDTreatmentsV2;
