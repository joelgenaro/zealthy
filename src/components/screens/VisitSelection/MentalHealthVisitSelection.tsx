import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { useCallback, useState } from 'react';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';
import { Stack, Typography } from '@mui/material';
import MentalHealthVisitsSelectionForm from './components/VisitSelectionForm/MentalHealthVisitSelectionForm';
import Router from 'next/router';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatient } from '@/components/hooks/data';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useRequestedQuestionnaires } from '@/components/hooks/useRequestedQuestionnaires';

const reasons = [
  'Anxiety',
  'Depression',
  'Insomnia',
  'Panic',
  'OCD',
  'PTSD',
  'Social anxiety',
  'Phobias',
  'Postpartum depression',
  'Burnout',
  'Binge eating and/or eating disorders',
  "I'm not sure",
];

const MentalHealthVisitSelection = () => {
  const { data: patient } = usePatient();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const requestedQuestionnaires = useRequestedQuestionnaires();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onVisitSelection = useCallback(
    async (selections: string[]) => {
      try {
        setIsSubmitting(true);

        // localStorage.setItem(
        //   'mentalHealthSelections',
        //   JSON.stringify(selections)
        // );

        await createVisitAndNavigateAway(
          [SpecificCareOption.ANXIETY_OR_DEPRESSION],
          {
            navigateAway: false,
            requestedQuestionnaires,
          }
        );

        Router.push(Pathnames.MENTAL_HEALTH_VISIT);
      } catch (error) {
        console.error('Error in mental health selection:', error);
        setIsSubmitting(false);
      }
    },
    [createVisitAndNavigateAway, requestedQuestionnaires]
  );

  if (isSubmitting) {
    return (
      <CenteredContainer maxWidth="sm">
        <Loading />
        <Typography textAlign="center" marginTop={2}>
          Preparing your mental health visit...
        </Typography>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer maxWidth="sm">
      <Stack gap="26px">
        <Typography variant="h2">What can we help you with today?</Typography>
        <Typography fontSize={15}>Select all that apply:</Typography>
      </Stack>
      {reasons ? (
        <MentalHealthVisitsSelectionForm
          onVisitSelection={onVisitSelection}
          selections={reasons}
        />
      ) : (
        <Loading />
      )}
    </CenteredContainer>
  );
};

export default MentalHealthVisitSelection;
