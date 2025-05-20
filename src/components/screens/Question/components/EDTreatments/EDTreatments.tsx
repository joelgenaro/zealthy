import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import {
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import {
  useAnswerAction,
  useAnswerActions,
} from '@/components/hooks/useAnswer';
import { otherOptions } from '@/constants/ed-mapping';
import EDModal from './components/EDModal';
import OtherOption from './components/OtherOption';
import Option from './components/Option';
import { useSelector } from '@/components/hooks/useSelector';

const values: Medication[] = [
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'Sildenafil (Generic Viagra), As needed',
    name: 'Sildenafil (Generic Viagra)',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'Tadalafil (Generic Cialis), As needed',
    name: 'Tadalafil (Generic Cialis)',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    quantity: 90,
    price: 180,
    discounted_price: 160,
    dosage: '5 mg',
    medication_quantity_id: 36,
    display_name: 'Tadalafil (Generic Cialis), Daily',
    name: 'Tadalafil (Generic Cialis), Daily',
    type: MedicationType.ED,
    otherOptions: otherOptions['Tadalafil (Generic Cialis), Daily'],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    medication_quantity_id: null,
    dosage: '50 mg',
    type: MedicationType.ED,
    display_name: 'Viagra, As needed',
    name: 'Viagra',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    quantity: 90,
    price: 2964,
    discounted_price: 2944,
    dosage: '5 mg',
    medication_quantity_id:
      otherOptions['Cialis, Daily'][1].medication_quantity_id,
    display_name: 'Cialis, Daily',
    name: 'Cialis, Daily',
    type: MedicationType.ED,
    otherOptions: otherOptions['Cialis, Daily'],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
];

const options: {
  image: string;
  pricePerUnit: number;
  unit: string;
  label: string;
  value: Medication;
  subLabel: string;
  alternative?: {
    medication: Medication;
    pricePerUnit: number;
    unit: string;
    image: string;
  };
}[] = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/viagra-(as-needed).png',
    label: `<div class='title'>
        <div class='recommended'>Recommended for you</div>
        <h3><strong>Generic Viagra®</strong> (as needed)</h3>
        <div>Sildenafil</div>
        <div class='price'>From $1.67/pill.</div>
      </div>
      <img src='https://api.getzealthy.com/storage/v1/object/public/questions/viagra-(as-needed).png' />`,
    value: values[0],
    pricePerUnit: 1.67,
    unit: 'pill',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Ready: <strong>30m</strong></span><span>Peak: <strong>1h</strong></span><span>In System: <strong>12h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/viagra-(as-needed)-chart.svg' width='100%'/></div><p>Used for treating ED only when you need it.</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/cialis.png',
    label:
      "<div class='title'><h3><strong>Generic Cialis®</strong> (as needed)</h3><div>Tadalafil</div><div class='price'>From $1.80/pill.</div></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis.png' />",
    value: values[1],
    pricePerUnit: 1.8,
    unit: 'pill',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Ready: <strong>30m</strong></span><span>Peak: <strong>2h</strong></span><span>In System: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis-(as-needed)-chart.svg' width='100%'/></div><p>Long lasting allowing more spontaneity in intimacy.</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/cialis.png',
    label:
      "<div class='title'><h3><strong>Generic Cialis®</strong> (daily)</h3><div>Tadalafil</div><div class='price'>From $54/month.</div></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis.png' />",
    value: values[2],
    pricePerUnit: 54,
    unit: 'month',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Ready: <strong>---</strong></span><span><strong>Always</strong></span><span>In System: <strong>24/7</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis-(daily)-chart.svg' width='100%'/></div><p>Long lasting allowing more spontaneity in intimacy.</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/brand-viagra.png',
    label:
      "<div class='title'><h3><strong>Viagra®</strong> (as needed)</h3><div class='price'>From $138/pill.</div></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/brand-viagra.png' width='72' />",
    value: values[3],
    pricePerUnit: 138,
    unit: 'pill',
    alternative: {
      medication: values[0],
      pricePerUnit: 1.67,
      unit: 'pill',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/questions/viagra-(as-needed).png',
    },
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Ready: <strong>30m</strong></span><span>Peak: <strong>1h</strong></span><span>In System: <strong>12h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis-(as-needed)-chart.svg' width='100%'/></div><p>Original Viagra®, the pioneering ED prescription trusted by millions over decades - famed as the Little Blue Pill™.</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/brand-cialis.png',
    label:
      "<div class='title'><h3><strong>Cialis®</strong> (daily)</h3><div>Tadalafil</div><div class='price'>From $957/month.</div></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/brand-cialis.png'width='72' />",
    value: values[4],
    alternative: {
      medication: values[2],
      pricePerUnit: 54,
      unit: 'month',
      image:
        'https://api.getzealthy.com/storage/v1/object/public/questions/cialis.png',
    },
    pricePerUnit: 957,
    unit: 'month',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Ready: <strong>---</strong></span><span><strong>Always</strong></span><span>In System: <strong>24/7</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/cialis-(daily)-chart.svg' width='100%'/></div><p>The original Cialis®, it’s a longer lasting option for treating erectile dysfunction allowing more spontaneity in intimacy.</p>",
  },
];

interface OptionsProps {
  question: QuestionWithName;
  onNext: (nextPage?: string) => void;
}

type OptionType = {
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

const EDTreatments = ({ question, onNext }: OptionsProps) => {
  const [all, setAll] = useState(false);
  const { removeAnswers } = useAnswerActions();
  const { submitSingleSelectAnswer } = useAnswerAction(question);
  const [context, setContext] = useState<OptionType | null>(null);
  const [open, setOpen] = useState(false);
  const usage = useSelector(store => store.intake.conditions);

  const currentOptions = useMemo(() => {
    const allOptions = question.answerOptions!.map(
      (aO, i) =>
        ({
          answer: aO,
          ...options[i],
        } as OptionType)
    );
    return allOptions;
  }, [question]);

  const others = useMemo(() => currentOptions.slice(1), [currentOptions]);

  const handleOpen = useCallback((option: OptionType) => {
    setContext(option);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer({
        text: answer.text,
        code: answer.code,
        next: answer.next,
        system: answer.system,
      });

      onNext(answer.next);
    },
    [onNext, submitSingleSelectAnswer]
  );

  useEffect(() => {
    removeAnswers(['TREATMENT_OPTIONS-Q2', 'TREATMENT_OPTIONS-Q3']);
  }, [removeAnswers]);

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h3">Recommended</Typography>
        {currentOptions.slice(0, 1).map((o, i) => (
          <Option key={i} option={o} onSelect={handleSubmit} />
        ))}
      </Stack>

      {all && others.length && (
        <Stack spacing={2}>
          <Typography fontSize="20px" fontWeight="600" lineHeight="26px">
            Other options
          </Typography>
          {others.map((o, i) => (
            <OtherOption key={i} option={o} onSelect={handleSubmit} />
          ))}
        </Stack>
      )}

      <Button
        color="grey"
        sx={{ width: 368, margin: '0 auto' }}
        onClick={() => setAll(!all)}
      >
        {all ? 'Close' : 'View all'}
        {all ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Button>
      {context ? (
        <EDModal
          open={open}
          onClose={handleClose}
          onConfirm={handleSubmit}
          option={context}
        />
      ) : null}
    </>
  );
};

export default EDTreatments;
