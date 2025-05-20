import React, { ChangeEventHandler, useCallback } from 'react';
import Textarea from '@/components/shared/Textarea';
import { Stack, Typography } from '@mui/material';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { FreeTextAnswer } from '@/context/AppContext/reducers/types/answer';

interface Props {
  label?: string;
  subLabel?: string;
  placeholder?: string;
  questionName: string;
  onChange: (answer: QuestionnaireQuestionAnswerOptions) => void;
}

const Detail = ({
  label,
  subLabel,
  placeholder,
  questionName,
  onChange,
}: Props) => {
  const answer = useAnswerSelect(answers => answers[questionName])
    ?.answer[0] as FreeTextAnswer;
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    e => {
      onChange({ text: e.target.value });
    },
    [onChange]
  );

  return (
    <Stack gap={3}>
      {(label || subLabel) && (
        <Stack gap={1}>
          {label && <Typography variant="h3">{label}</Typography>}
          {subLabel && <Typography>{subLabel}</Typography>}
        </Stack>
      )}
      <Textarea
        minRows={5}
        placeholder={placeholder}
        value={answer?.valueString || ''}
        sx={{ backgroundColor: '#eeeeee' }}
        onChange={handleChange}
      />
    </Stack>
  );
};

export default Detail;
