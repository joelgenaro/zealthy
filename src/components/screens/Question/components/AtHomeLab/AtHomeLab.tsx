import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitAsync } from '@/components/hooks/useVisit';
import {
  QuestionWithName,
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { useVWOVariationName } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';

interface AtHomeLabProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onNext: (nextPage?: string) => void;
}

type OptionType = {
  answer: QuestionnaireQuestionAnswerOptions;
  choice: string;
  price?: number;
  name: string;
  description: string;
};

const options: {
  choice: string;
  price?: number;
  name: string;
  description: string;
}[] = [
  {
    choice: 'Yes',
    name: 'At-home lab kit',
    description:
      'Zealthy works with certified lab tests that ships straight to your door. The test is painless and ships within 1-3 business days',
    price: 72.5,
  },
  {
    choice: 'No',
    name: 'Use my own lab kit',
    description:
      'You can upload your lab tests to your documents section within your Zealthy portal',
  },
];

const AtHomeLab = ({ question, questionnaire, onNext }: AtHomeLabProps) => {
  const { addConsultation, removeConsultationV2 } = useConsultationActions();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { updateOnlineVisit } = useVisitAsync();
  const { data: variationName8205 } = useVWOVariationName('8205');
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const fromTrendingEnclomiphene = useSelector(
    store => store.intake?.variant === 'trending-card-enclomiphene'
  );
  const fromProgramsEnclomiphene = useSelector(
    store => store.intake?.variant === 'program-card-enclomiphene'
  );

  const currentOptions = useMemo(() => {
    return question.answerOptions!.map(
      (aO, i) =>
        ({
          answer: aO,
          ...options[i],
        } as OptionType)
    );
  }, [question]);

  const [selectedOption, setSelectedOption] = useState<any>(null);

  const handleSelect = useCallback(
    (option: any) => {
      setSelectedOption(option);
      const answer = `At-home lab kit - ${option.choice}`;
      submitFreeTextAnswer({ text: answer });
    },
    [submitFreeTextAnswer]
  );

  const handleContinue = () => {
    if (!selectedOption) {
      return;
    }
    submitAnswer();
    if (selectedOption?.choice === 'Yes') {
      addConsultation({
        ...selectedOption,
        display_name: selectedOption?.header,
      });
      updateOnlineVisit(
        {
          variant: 'lab kit purchased',
        },
        false
      );
      fromTrendingEnclomiphene || fromProgramsEnclomiphene
        ? Router.push(`/what-next`)
        : // : variationName8205?.variation_name === 'Variation-3'
          // ? Router.push(Pathnames.CHECKOUT)
          onNext();
    } else if (selectedOption?.choice === 'No') {
      removeConsultationV2();
      onNext('MY_LAB_KIT');
    } else if (
      selectedOption?.choice === 'No' &&
      variationName8205?.variation_name === 'Variation-3'
    ) {
      removeConsultationV2();
      Router.push(Pathnames.CHECKOUT);
    }
  };

  return (
    <Stack gap={2}>
      <Stack gap={3} mt={1}>
        {currentOptions.map((option, idx) => (
          <Box
            key={idx}
            onClick={() => handleSelect(option)}
            sx={{
              width: '100%',
              backgroundColor: 'white',
              padding: '15px',
              display: 'grid',
              gap: '1rem',
              border: '1px solid black',
              borderRadius: '8px',
              gridTemplateColumns: '40px 1fr',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <Box>
              <Checkbox
                size="small"
                checked={selectedOption?.choice === option?.choice}
              />
            </Box>
            <Stack>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h3">{option?.name}</Typography>
                {option?.price && (
                  <Typography variant="h3">{`$${option?.price.toFixed(
                    2
                  )}`}</Typography>
                )}
              </Box>
              <Typography sx={{ textAlign: 'start' }}>
                {option?.description}
              </Typography>
            </Stack>
          </Box>
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

export default AtHomeLab;
