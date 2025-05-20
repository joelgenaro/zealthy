import { useIsMobile } from '@/components/hooks/useIsMobile';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import React, { useCallback, useState } from 'react';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Image from 'next/image';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useVWOVariationName } from '@/components/hooks/data';

interface EDUsageProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

type OptionType = {
  header: string;
  description: string;
  price: string;
  img?: string;
  next?: string;
};

let options: OptionType[] = [];

const optionsQ1 = [
  {
    header: 'Daily',
    description:
      'Get hard and stay hard whenever you’re in the mood- no planning required',
    price: '2',
  },
  {
    header: 'Before Sex',
    description: 'When you know what’s coming ahead of time',
    price: '1.80',
  },
];

const optionsQ2 = [
  {
    header: 'Quick Dissolve Tablet',
    description: 'Rx ingredients compounded to your needs',
    price: '1.30',
    img: 'https://api.getzealthy.com/storage/v1/object/public/questions/green-hardies.svg',
    next: 'TREATMENT_OPTIONS_V2-Q3',
  },
  {
    header: 'Standard Pill',
    description: 'Rx ingredients in a pill option',
    price: '1.07',
    img: 'https://api.getzealthy.com/storage/v1/object/public/questions/ed-yellow-pill.svg',
    next: 'TREATMENT_OPTIONS-Q1',
  },
];

const EDUsage = ({ question, questionnaire, onNext }: EDUsageProps) => {
  const isMobile = useIsMobile();
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { addConditions } = useIntakeActions();
  options =
    question?.name === 'TREATMENT_OPTIONS_V2-Q1' ? optionsQ1 : optionsQ2;

  const handleSelect = useCallback(
    (option: any) => {
      setSelectedOption(option);
      if (question?.name === 'TREATMENT_OPTIONS_V2-Q1') {
        addConditions(option?.header);
      }
      const answer =
        question?.name === 'TREATMENT_OPTIONS_V2-Q1'
          ? `Usage - ${option?.header}`
          : `Medication Type Preference - ${option?.header}`;
      submitFreeTextAnswer({ text: answer });
    },
    [submitFreeTextAnswer, question]
  );

  const handleContinue = useCallback(() => {
    if (!selectedOption) {
      return;
    }

    submitAnswer();
    question?.name === 'TREATMENT_OPTIONS_V2-Q1'
      ? onNext()
      : onNext(selectedOption?.next);
  }, [onNext, selectedOption, submitAnswer, question]);

  const isSelected = (option: string) => {
    return selectedOption?.header === option;
  };
  return (
    <Stack>
      {question?.name === 'TREATMENT_OPTIONS_V2-Q1' ? (
        <Box
          sx={{
            background: 'rgba(138, 205, 160, 0.45)',
            borderRadius: '8px 8px 0px 0px',
            display: 'flex',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 'fit-content',
            padding: 'var(--borderRadius, 4px) 12px',
          }}
        >
          <Typography sx={{ color: '#00531B' }}>
            Best for spontaneous sex
          </Typography>
        </Box>
      ) : null}
      <Stack gap={3}>
        {options.map((option, idx) => (
          <Stack
            key={idx}
            onClick={() => handleSelect(option)}
            sx={{
              border: '1px solid #D8D8D8',
              borderRadius: '13px',
              padding: '24px',
              cursor: 'pointer',
              backgroundColor: isSelected(option?.header)
                ? '#B8F5CC!important'
                : '#FFFFFF',
              '&:hover': {
                backgroundColor: isSelected(option?.header)
                  ? '#B8F5CC!important'
                  : '#f5f5f5',
              },
            }}
            gap={1}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                }}
              >
                {option?.img ? (
                  <Image
                    width={67}
                    height={68}
                    alt={option?.header}
                    src={option?.img}
                    quality={100}
                  />
                ) : null}
                <Box sx={{ display: 'none' }}>
                  <Checkbox
                    size="small"
                    checked={selectedOption?.header === option?.header}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginLeft: '10px',
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: '500',
                      }}
                    >
                      {option.header === 'Quick Dissolve Tablet'
                        ? 'Hardies (Quick Dissolve Tablet)'
                        : option.header}
                    </Typography>
                    <Typography
                      sx={{
                        width:
                          question?.name === 'TREATMENT_OPTIONS_V2-Q2'
                            ? isMobile
                              ? '180px'
                              : '230px'
                            : '230px',
                      }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      background: '#F6EFE3',
                      borderRadius: '2px',
                      padding: 'var(--borderRadius, 4px) 8px',
                      height: 'fit-content',

                      display: 'flex',
                      justifyContent: 'end',
                      marginLeft:
                        question?.name === 'TREATMENT_OPTIONS_V2-Q1'
                          ? isMobile
                            ? '0'
                            : '60px'
                          : '0',
                    }}
                  >
                    <Typography variant="h4">{`From $${option.price}/use`}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Stack>
        ))}
        <Button
          size="large"
          onClick={handleContinue}
          disabled={!selectedOption}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};

export default EDUsage;
