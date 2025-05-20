import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { styled } from '@mui/system';
import DOMPurify from 'dompurify';
import Image from 'next/image';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import performanceProtocol from 'public/images/performance-protocol.png';

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
  .cost-label {
    display: flex;
    justify-content: end;
  }
  .payment {
    color: #1b1b1b;
    font-size: 18px;
    font-weight: 700;
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
  label: string;
  value: Medication;
  subLabel: string;
  answer: QuestionnaireQuestionAnswerOptions;
  image?: string;
  pricePerUnit: number;
};

interface OptionProps {
  option: Option;
  selectedMedication: any;
  onSelect: (option: Option) => void;
}

const PreWorkoutTreatment = ({
  option,
  selectedMedication,
  onSelect,
}: OptionProps) => {
  const { label, subLabel, image, pricePerUnit } = useMemo(
    () => ({
      ...option,
      label: DOMPurify.sanitize(option.label),
      subLabel: option.subLabel && DOMPurify.sanitize(option.subLabel),
    }),
    [option]
  );

  const isSelected = selectedMedication?.price === option?.pricePerUnit;
  const isFirstOption = label?.includes('Starter pack');

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 1.5,
        p: '20px',
        paddingTop: isFirstOption ? '20px' : '10px',
        boxShadow: '0 8px 16px 4px rgba(81, 76, 40, 0.08)',
        borderRadius: 4,
        cursor: 'pointer',
        backgroundColor: isSelected ? '#B8F5CC!important' : '#FFFFFF',
        '&:hover': {
          backgroundColor: isSelected ? '#B8F5CC!important' : '#f5f5f5',
        },
      }}
    >
      {' '}
      <Box sx={{ alignSelf: 'center' }}>
        {' '}
        {isFirstOption ? (
          <Box
            sx={{
              borderRadius: '0.75rem',
              background: '#F7F9A5',
              display: 'flex',
              marginTop: '-40px',
              padding: '0.25rem 4rem 0.25rem 4rem',
              justifyContent: 'center',
              alignItems: 'flex-start',
              alignSelf: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >{`For a limited time save $110!`}</Box>
        ) : null}
      </Box>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
        }}
        onClick={() => onSelect(option)}
      >
        {performanceProtocol ? (
          <Image
            src={performanceProtocol}
            alt="pre-workout-med"
            width={75}
            height={60}
          />
        ) : null}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Title>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Typography fontWeight={800}>{label}</Typography>
              <Typography fontWeight={800}>
                {'$' + Math.round((pricePerUnit * 100) / 30) / 100 + '/dose'}
              </Typography>
            </Box>
          </Title>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            {subLabel ? (
              <Description sx={{ fontSize: '0.9rem' }}>{subLabel}</Description>
            ) : null}
            <Description fontStyle="italic" sx={{ fontSize: '0.9rem' }}>
              {'$' + pricePerUnit + ' total'}
            </Description>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreWorkoutTreatment;
