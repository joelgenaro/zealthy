import React, { useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';

const Title = styled(Box)`
  display: flex;
  align-items: start;
  gap: 24px;
  width: 100%;
  font-weight: 500;
  justify-content: center;

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

interface OptionProps {
  option: QuestionnaireQuestionAnswerOptions;
  isSelected: boolean;
  onSelect: (answer: QuestionnaireQuestionAnswerOptions) => void;
  compact?: boolean;
}

const Option = ({
  option,
  isSelected,
  onSelect,
  compact = false,
}: OptionProps) => {
  const handleSelect = useCallback(() => {
    onSelect(option);
  }, [onSelect, option.text]);

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'normal',
        gap: 2,
        p: '32px 40px',
        boxShadow: compact ? 'none' : '0 8px 16px 4px rgba(81, 76, 40, 0.08)',
        borderRadius: 4,
        width: '100%',
        height: compact ? '100px' : '267px',
        cursor: 'pointer',
        border: compact
          ? isSelected
            ? '1px solid #00531B'
            : '1px solid #D8D8D8'
          : isSelected
          ? '2px solid #00531B'
          : 'none',
        background: isSelected ? '#B8F5CC' : '',
      }}
      onClick={handleSelect}
    >
      {compact ? (
        <Typography
          style={{
            fontSize: '22px',
            textAlign: 'center',
            lineHeight: '2rem',
          }}
        >
          {option.text}
        </Typography>
      ) : (
        <Title>{option.text}</Title>
      )}
      <Image
        width={compact ? 50 : 153}
        height={compact ? 50 : 165}
        alt={option.text}
        src={option.image!}
      />
    </Paper>
  );
};

export default Option;
