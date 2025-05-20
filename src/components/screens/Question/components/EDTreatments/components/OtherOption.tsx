import React, { useCallback, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import * as DOMPurify from 'dompurify';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { useVisitActions } from '@/components/hooks/useVisit';

const Title = styled(Box)`
  display: flex;
  align-items: start;
  gap: 24px;
  width: 100%;
  font-weight: 500;

  .title {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
    .recommended {
      padding: 4px 12px;
      background-color: #ffe792;
      border-radius: 38px;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
    }

    h3 {
      font-size: 22px;
      font-weight: 400;
      line-height: 28px;
      margin: 0;
    }

    .price {
      color: ${({ theme }) => theme.palette.primary.main};
    }
  }
`;

const Description = styled(Box)`
  .graph {
    background: #f6f7f7;
    padding: 16px 24px;
    margin: 24px 0;

    strong {
      font-weight: 600;
    }

    .properties {
      display: flex;
      gap: 12px;
      font-size: 12px;
      line-height: 16px;
      margin-top: 8px;
      margin-bottom: 32px;
    }
  }

  p {
    margin: 0;
  }
`;

type Option = {
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

interface OptionProps {
  option: Option;
  onSelect: (answer: QuestionnaireQuestionAnswerOptions) => void;
}

const OtherOption = ({ option, onSelect }: OptionProps) => {
  const { addMedication } = useVisitActions();
  const { value, label, subLabel } = useMemo(
    () => ({
      ...option,
      label: DOMPurify.sanitize(option.label),
      subLabel: option.subLabel && DOMPurify.sanitize(option.subLabel),
    }),
    [option]
  );

  const handleSelect = useCallback(() => {
    onSelect(option.answer);
    addMedication(value);
  }, [onSelect, option]);

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 2,
        p: '32px 40px',
        boxShadow: '0 8px 16px 4px rgba(81, 76, 40, 0.08)',
        borderRadius: 4,
      }}
    >
      <Title dangerouslySetInnerHTML={{ __html: label }} />
      {subLabel && (
        <Description dangerouslySetInnerHTML={{ __html: subLabel }} />
      )}
      <LoadingButton size="medium" fullWidth onClick={handleSelect}>
        Select treatment
      </LoadingButton>
    </Paper>
  );
};

export default OtherOption;
