import { useVisitSelect } from '@/components/hooks/useVisit';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { Box, Button, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { useMemo } from 'react';

const TransitionQuestionnaire = () => {
  const {
    query: { name },
  } = useRouter();

  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const currentIndex = questionnaires.findIndex(q => q.name === name);
  const currentCare = questionnaires[currentIndex]?.care;
  const nextQuestionnaire = questionnaires[currentIndex + 1];

  const [completed, total] = useMemo(() => {
    const uniq = [...new Set(questionnaires.map(q => q?.care))];
    return [uniq.indexOf(currentCare) + 1, uniq.length];
  }, [currentCare, questionnaires]);

  return (
    <PatientPortalNav>
      <Head>
        <title>Zealthy | Transition</title>
      </Head>
      <Stack
        spacing={6}
        sx={{
          maxWidth: 600,
          px: 2,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h2">
            Thank you for completing the {currentCare} questionnaire.
          </Typography>

          <Box>
            This is {completed} of {total} sets of clinical intake questions
            you’ll need to answer.
          </Box>

          <Box>
            {`To provide the most holistic care, your Zealthy provider requires
            you to answer a handful of questions about ${nextQuestionnaire?.care}
            next. Ready to get started?`}
          </Box>
        </Stack>

        <div>
          <Button
            sx={{ width: 268, margin: '0 auto' }}
            onClick={() =>
              Router.push(
                `${Pathnames.QUESTIONNAIRES}/${nextQuestionnaire.name}`
              )
            }
          >
            Get started now
          </Button>
        </div>
      </Stack>
    </PatientPortalNav>
  );
};

export const getServerSideProps = getAuthProps;

export default TransitionQuestionnaire;
