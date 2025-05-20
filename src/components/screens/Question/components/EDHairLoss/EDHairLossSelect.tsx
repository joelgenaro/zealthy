import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {
  QuestionWithName,
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import Image from 'next/image';
import Box from '@mui/material/Box';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useCallback, useMemo, useState } from 'react';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import AddPhoto from 'public/images/female-hair-loss/AddPhoto';

const edHairLossSelectOptions = [
  {
    image: (
      <Image
        src="/images/ed-hl/ed-hl-thinning-at-hairline.svg"
        alt="Thinning at the hairline"
        width={100}
        height={150}
      />
    ),
    header: 'Thinning at the hairline',
  },
  {
    image: (
      <Image
        src="/images/ed-hl/ed-hl-thinning-at-top.svg"
        alt="Thinning at the top of the head"
        width={100}
        height={150}
      />
    ),
    header: 'Thinning at the top of the head',
  },
  {
    image: (
      <Image
        src="/images/ed-hl/ed-hl-bald-patches.svg"
        alt="Bald patches"
        width={100}
        height={150}
      />
    ),
    header: 'Bald patches',
    description: 'Smooth and hairless, not on top of the head',
  },
  {
    image: (
      <Image
        src="/images/ed-hl/ed-hl-redness-irritation.svg"
        alt="Redness and irritation"
        width={100}
        height={150}
      />
    ),
    header: 'Redness and irritation',
    description: 'Found at the sites of hair loss',
  },
  {
    image: <AddPhoto />,
    header: 'I’m not sure',
    description: 'Submit a photo',
  },
];

interface EDHairLossSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  nextPage: (nextPage?: string) => void;
}

type OptionType = {
  answer: QuestionnaireQuestionAnswerOptions;
  header: string;
  description?: string;
  image: any;
};

const EDHairLossSelect = ({
  question,
  questionnaire,
  nextPage,
}: EDHairLossSelectProps) => {
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitMultiSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<any>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentOptions = useMemo(() => {
    return question.answerOptions!.map(
      (aO, i) =>
        ({
          answer: aO,
          ...edHairLossSelectOptions[i],
        } as OptionType)
    );
  }, [question]);

  const handleSelect = useCallback(
    (option: OptionType) => {
      const isCurrentlySelected = selected.some(
        (item: OptionType) => item.header === option.header
      );

      if (option.header === 'I’m not sure') {
        if (
          selected.some((item: OptionType) => item.header === 'I’m not sure')
        ) {
          setSelected([]);
        } else {
          setSelected([option]);
        }
      } else {
        if (isCurrentlySelected) {
          setSelected(
            selected.filter((item: OptionType) => item.header !== option.header)
          );
        } else {
          const filteredSelected = selected.filter(
            (item: OptionType) => item.header !== 'I’m not sure'
          );
          setSelected([...filteredSelected, option]);
        }
      }

      if (option?.answer) {
        submitMultiSelectAnswer(option?.answer);
      }
    },
    [submitMultiSelectAnswer, selected]
  );

  const handleContinue = () => {
    if (selected.length === 0) {
      return;
    }

    selected.forEach((option: any) => {
      submitAnswer(option.answer);
    });

    nextPage('PHOTO_HAIRLINE_FRONT');
  };

  const isSelected = (option: string) => {
    return selected.some((item: any) => item.header === option);
  };

  return (
    <>
      <Stack display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography
          sx={{
            fontFamily: 'Inter',
            fontWeight: '550',
            fontSize: '24px!important',
            lineHeight: '38px',
            color: '#666666',
            marginBottom: '2rem',
          }}
        >
          Select all that apply
        </Typography>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          sx={{ gap: '2rem' }}
        >
          {currentOptions.map((option, idx) => (
            <Box
              key={'option' + idx}
              width={200}
              onClick={() => handleSelect(option)}
              sx={{
                boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
                padding: '24px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '1rem',
                backgroundColor: isSelected(option.header)
                  ? '#B8F5CC!important'
                  : '#FFFFFF',
                '&:hover': {
                  backgroundColor: isSelected(option.header)
                    ? '#B8F5CC!important'
                    : '#f5f5f5',
                },
              }}
            >
              {option.image}
              <Typography fontWeight="bold">{option.header}</Typography>
              {option.description && (
                <Typography variant="h4">{option.description}</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Stack>
      <LoadingButton
        loading={loading}
        size="large"
        disabled={selected.length === 0}
        onClick={handleContinue}
      >
        Continue
      </LoadingButton>
    </>
  );
};

export default EDHairLossSelect;
