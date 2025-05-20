import { useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import { Button, Container, List, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import SkincareVisitSelectionForm from './components/VisitSelectionForm/SkincareVisitSelectionForm';
import Option from '../Question/components/ImageChoice/Option';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import {
  useVisitActions,
  useVisitAsync,
  useVisitState,
} from '@/components/hooks/useVisit';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { useAnswerAction, useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useABZVariationName, usePatient } from '@/components/hooks/data';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { useIntakeState } from '@/components/hooks/useIntake';

const question = {
  name: 'SKIN_T_SELECT',
  questionnaire: 'skin-type',
  header: 'Where do you experience breakouts?',
  description: 'Select all that apply:',
  type: 'multiple-choice',
  answerOptions: [
    {
      text: 'Face',
      code: 'SKIN_T_SELECT_A1',
      image: '/images/skincare/face-icon.png',
    },
    {
      text: 'Chest',
      code: 'SKIN_T_SELECT_A2',
      image: '/images/skincare/chest-icon.png',
    },
    {
      text: 'Back',
      code: 'SKIN_T_SELECT_A3',
      image: '/images/skincare/back-icon.png',
    },
    {
      text: 'Butt',
      code: 'SKIN_T_SELECT_A4',
      image: '/images/skincare/butt-icon.png',
    },
  ],
};

interface SkinOptionProps {
  item: QuestionnaireQuestionAnswerOptions;
  handleAnswer: (a: QuestionnaireQuestionAnswerOptions) => void;
}

const SkinOption = ({ item, handleAnswer }: SkinOptionProps) => {
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const isSelected = useMemo(
    () => !!answer?.find(ans => ans?.valueCoding?.code === item?.code),
    [answer, item?.code]
  );

  return (
    <Option
      option={item}
      compact={true}
      isSelected={isSelected}
      onSelect={handleAnswer}
    />
  );
};

interface SkinCareQuestion {
  onContinue: () => Promise<void>;
  error: string;
}

const SkinCareQuestion = ({ onContinue, error }: SkinCareQuestion) => {
  const isMobile = useIsMobile();

  const { submitMultiSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: question.questionnaire,
  });

  const handleAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitMultiSelectAnswer(answer);
    },
    [submitMultiSelectAnswer]
  );

  return (
    <Stack gap="16px">
      <Typography variant="h2">{question.header}</Typography>
      <Typography fontSize={15}>{question.description}</Typography>
      <Stack direction="column" gap="45px">
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '0',
          }}
        >
          {question.answerOptions!.map(a => (
            <SkinOption key={a.text} item={a} handleAnswer={handleAnswer} />
          ))}
        </List>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <Button onClick={onContinue}>Continue</Button>
      </Stack>
    </Stack>
  );
};

const SkincareVisitSelection = () => {
  const [error, setError] = useState('');
  const supabase = useSupabaseClient<Database>();
  const [reasons, setReasons] = useState<ReasonForVisit[]>();
  const [conditionSelected, setConditionSelected] = useState<boolean>(false);
  const { addAsync } = useVisitActions();
  const { addConsultation, removeConsultationV2 } = useConsultationActions();
  const { selectedCare } = useVisitState();
  const { createOnlineVisit } = useVisitAsync();
  const { resetQuestionnaires } = useVisitActions();
  const consultation = useSelector(store => store.consultation);
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();
  const { data: testVariation99 } = useABZVariationName('99');
  const reason = selectedCare?.careSelections?.[0]?.reason;

  const fromProgram = useSelector(
    store => store.intake?.variant === 'program-card'
  );

  let medicationName = '';
  switch (reason) {
    case 'Acne':
      medicationName = 'Acne';
      break;
    case 'Fine Lines & Wrinkles':
      medicationName = 'Anti-Aging';
      break;
    case 'Hyperpigmentation Dark Spots':
      medicationName = 'Melasma';
      break;
    case 'Rosacea':
      medicationName = 'Rosacea';
      break;
  }

  const handleSetReasons = useCallback(async () => {
    await supabase
      .from('reason_for_visit')
      .select('id, reason, synchronous')
      .order('order', { ascending: true })
      .eq('group', 'SKINCARE')
      .then(({ data }) => {
        if (data) {
          setReasons(data);
        }
      });
  }, [supabase]);

  useEffect(() => {
    if (!reasons) {
      handleSetReasons();
    }

    window?.freshpaint?.track('started-skincare-flow');
  }, [reasons, handleSetReasons]);

  async function onContinue() {
    if (consultation) {
      removeConsultationV2();
      resetQuestionnaires();
    }

    addAsync(false);

    addConsultation({
      name: `${medicationName} Medical Consultation`,
      price: 50,
      discounted_price: 20,
      type: medicationName as ConsultationType,
    });

    if (
      fromProgram ||
      ([
        PatientStatus.ACTIVE,
        PatientStatus.PAYMENT_SUBMITTED,
        PatientStatus.PROFILE_CREATED,
      ].includes(patient?.status as PatientStatus) &&
        specificCare)
    ) {
      Router.push('/what-next');
    } else {
      Router.push(Pathnames.SKINCARE_REGION);
    }
  }

  const var99 = testVariation99?.variation_name;

  return (
    <Container maxWidth="sm">
      {!conditionSelected ? (
        <Stack gap="26px" mb={5}>
          <Typography variant="h2">
            {var99
              ? 'Help me acquire prescription medication for:'
              : 'Help me get prescription medication for:'}
          </Typography>
          <Typography fontSize={15}>
            Please choose your skin conditions:
          </Typography>
          {reasons ? (
            <SkincareVisitSelectionForm
              selections={reasons}
              onContinue={() => setConditionSelected(true)}
            />
          ) : (
            <Loading />
          )}
        </Stack>
      ) : (
        <SkinCareQuestion onContinue={onContinue} error={error} />
      )}
    </Container>
  );
};

export default SkincareVisitSelection;
