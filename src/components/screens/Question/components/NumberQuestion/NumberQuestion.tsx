import { useAnswerAction } from '@/components/hooks/useAnswer';
import { usePatientActions } from '@/components/hooks/usePatient';
import { FreeTextAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionWithName } from '@/types/questionnaire';
import TextField from '@mui/material/TextField';
import { ChangeEventHandler, useCallback, useMemo } from 'react';

interface NumberQuestionProps {
  question: QuestionWithName;
  answer: FreeTextAnswer[];
}

const NumberQuestion = ({ question, answer }: NumberQuestionProps) => {
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { addHeartRate } = usePatientActions();

  const currentAnswer = useMemo(
    () =>
      answer?.[0].valueString === 'Skipped' ? '' : answer?.[0].valueString,
    [answer]
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      submitFreeTextAnswer({ text: e.target.value });
      if (question.header === 'What’s your resting heart rate?') {
        const rate = Number(e.target.value);
        addHeartRate(rate);
      }
    },
    [addHeartRate, question.header, submitFreeTextAnswer]
  );

  return (
    <TextField
      onChange={handleChange}
      value={currentAnswer || ''}
      placeholder={question.input_placeholder}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
    />
  );
};

export default NumberQuestion;
