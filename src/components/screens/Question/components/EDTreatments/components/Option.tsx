import React, { useCallback, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import * as DOMPurify from 'dompurify';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { useSelector } from '@/components/hooks/useSelector';

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

    .banner-1 {
      padding: 4px 12px;
      background-color: #d2f7fb;
      border-radius: 38px;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
      color: #007c8a;
    }

    .banner-2 {
      padding: 4px 12px;
      background-color: #e8fff8;
      border-radius: 38px;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
      color: #008b61;
    }

    .banner-3 {
      padding: 4px 12px;
      background-color: #d7eeff;
      border-radius: 38px;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
      color: #1b5886;
    }

    .banner-4 {
      padding: 4px 12px;
      background-color: #ffe5ee;
      border-radius: 38px;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      margin-bottom: 6px;
      color: #76223e;
    }

    .description {
      color: #007c8a;
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0.12px;
    }

    .description-2 {
      color: #008b61;
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0.12px;
    }

    .description-3 {
      color: #1b5886;
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0.12px;
    }

    .description-4 {
      color: #76223e;
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0.12px;
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
  label: string;
  value: Medication;
  subLabel: string;
  answer: QuestionnaireQuestionAnswerOptions;
};

interface OptionProps {
  option: Option;
  onSelect: (answer: QuestionnaireQuestionAnswerOptions) => void;
}

const Option = ({ option, onSelect }: OptionProps) => {
  const { addMedication } = useVisitActions();
  const usage = useSelector(store => store.intake.conditions);
  const { medications } = useVisitState();
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
    if (option.answer.text.toLowerCase().includes('hardies')) {
      if (usage !== 'Daily') {
        addMedication(value);
      } else {
        let medicationQuantityId: number | null = 0;
        switch (value?.name) {
          case 'Sildenafil + Tadalafil Zealthy Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 466 : 428;
            break;
          case 'Sildenafil + Oxytocin Zealthy Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 467 : 429;
            break;
          case 'Tadalafil + Oxytocin Zealthy Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 468 : 430;
            break;
          case 'Tadalafil + Vardenafil Zealthy Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 472 : 434;
            break;
          case 'Sildenafil Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 485 : 449;
            break;
          case 'Tadalafil Hardies':
            medicationQuantityId =
              process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 498 : 462;
            break;
        }
        if (value.name) {
          addMedication({
            medication_quantity_id: medicationQuantityId,
            type: MedicationType.ED,
            display_name: 'ED Medication',
            name: value.name,
            dosage: 'Standard',
            otherOptions: [],
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            price: 390,
            discounted_price: 370,
            quantity: 30,
            note: `Preferred ED medication: ${value.name}. 
          Preferred ED medication frequency: every 1 month(s). 
          Preferred ED medication quantity: 30.
          Preferred ED medication dosage: Standard.
          Preferred ED medication usage: Daily.
          `,
          });
        }
        return;
      }
    }
    addMedication(value);
  }, [addMedication, onSelect, option.answer, value, usage, medications]);

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

export default Option;
