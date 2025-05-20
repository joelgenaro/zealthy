import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useAnswerAction, useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import ChoiceItem from '@/components/screens/Question/components/Choice/components/ChoiceItem';
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';

const question: QuestionWithName = {
  name: 'HAIR_L_Q3',
  questionnaire: 'hair-loss',
  header:
    'Would you prefer to take pills or use topical treatments (gels/foams/solutions)?',
  description:
    'We’ll recommend an effective treatment, but will take your preference into consideration.',
  type: 'choice',
  canvas_linkId: '5dff01ef-3fcb-450f-ab47-90a605396ff3',
  answerOptions: [
    {
      text: 'Pills (oral)',
      code: 'HAIR_L_Q3_A1',
    },
    {
      text: 'Topical (applied to head)',
      code: 'HAIR_L_Q3_A2',
    },
    {
      text: 'I’m ok with either option',
      code: 'HAIR_L_Q3_A3',
    },
  ],
};

const HairLossQuestion3 = () => {
  const { removeMedication, addMedication } = useVisitActions();
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'hair-loss',
    canvas_linkId: question.canvas_linkId,
  });

  const addMedicationBulk = useCallback(
    (answer: string) => {
      removeMedication(MedicationType.HAIR_LOSS);
      removeMedication(MedicationType.HAIR_LOSS_ADD_ON);

      if (answer === 'Pills (oral)') {
        addMedication({
          name: 'Oral Minoxidil',
          type: MedicationType.HAIR_LOSS,
          quantity: 90,
          dosage: '2.5 mg',
          price: 90,
          discounted_price: 45,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 113,
        });

        addMedication({
          name: 'Oral Finasteride',
          type: MedicationType.HAIR_LOSS_ADD_ON,
          quantity: 90,
          dosage: '1 mg',
          price: 52,
          discounted_price: 26,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 52,
        });
      } else {
        addMedication({
          name: 'Oral Finasteride',
          type: MedicationType.HAIR_LOSS,
          quantity: 90,
          dosage: '1 mg',
          price: 52,
          discounted_price: 26,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 52,
        });

        addMedication({
          name: 'Minoxidil Foam',
          type: MedicationType.HAIR_LOSS_ADD_ON,
          quantity: 3,
          dosage: '60 ml',
          price: 50,
          discounted_price: 25,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 114,
        });
      }
    },
    [removeMedication, addMedication]
  );

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
      addMedicationBulk(answer.text);
      Router.push(Pathnames.HAIR_LOSS_QUESTION_4);
    },
    [addMedicationBulk, submitSingleSelectAnswer]
  );

  return (
    <>
      <Head>
        <title>Treat Hair Loss with Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6}>
          <QuestionHeader question={question} />
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
                <ChoiceItem
                  key={a.code}
                  item={a}
                  handleItem={handleSubmit}
                  answer={answer}
                />
              ))}
            </List>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

HairLossQuestion3.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossQuestion3;
