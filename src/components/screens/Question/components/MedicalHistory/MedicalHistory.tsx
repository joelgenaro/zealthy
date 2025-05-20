import { useAnswerAction } from '@/components/hooks/useAnswer';
import DetailsBox from '@/components/shared/DetailsBox';
import { FreeTextAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionWithName } from '@/types/questionnaire';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';

interface MedicalHistoryProps {
  question: QuestionWithName;
  answer: FreeTextAnswer[];
}

const MedicalHistory = ({ question, answer }: MedicalHistoryProps) => {
  const [checked, setChecked] = useState(
    answer?.[0].valueString === question.checkboxText
  );
  const [details, setDetails] = useState('');
  const { submitFreeTextAnswer } = useAnswerAction(question);

  const handleCheckbox: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setChecked(e.target.checked);
      submitFreeTextAnswer({
        text: question.checkboxText!,
      });
    },
    [question.checkboxText, submitFreeTextAnswer]
  );

  const handleDetails = useCallback(
    (value: string) => {
      setDetails(value);
      submitFreeTextAnswer({
        text: value,
      });
    },
    [submitFreeTextAnswer]
  );

  useEffect(() => {
    setChecked(!!answer?.[0].valueString.includes(question.checkboxText!));
    setDetails(() => {
      if (answer?.[0].valueString.includes(question.checkboxText!)) return '';
      return answer?.[0].valueString || '';
    });
  }, [question.name]);

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Typography variant="h3">{question.label}</Typography>
      <FormControlLabel
        sx={{
          margin: 0,
          border: '1px solid #D8D8D8',
          borderRadius: '12px',
          padding: '20px 24px',
        }}
        control={
          <Checkbox
            checked={checked}
            onChange={handleCheckbox}
            sx={{ padding: 0, marginRight: '12px' }}
          />
        }
        label={question.checkboxText}
      />
      <DetailsBox
        value={details}
        checked={checked}
        setAnswer={handleDetails}
        name={`Add ${question.label?.toLowerCase()}`}
        placeholder={''}
      />
    </Box>
  );
};

export default MedicalHistory;
