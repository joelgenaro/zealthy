import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';
import { Stack, Typography } from '@mui/material';
import PrimaryCareVisitSelectionForm from './components/VisitSelectionForm/PrimaryCareVisitSelectionForm';
import Router from 'next/router';
import { usePatient } from '@/components/hooks/data';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useRequestedQuestionnaires } from '@/components/hooks/useRequestedQuestionnaires';

const reasons = [
  'Getting healthy',
  'Staying healthy',
  'Getting sleep',
  'Losing weight',
  'Sports performance',
  'Exercising more',
  'Building muscle',
  'Eating better',
  'Quitting smoking',
  'Reducing stress',
  "I'm not sure",
];

const PrimaryCareVisitSelection = () => {
  const { data: patient } = usePatient();
  const requestedQuestionnaires = useRequestedQuestionnaires();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const onVisitSelection = useCallback(
    async (selections: string[]) => {
      // TODO: send mental health selections to EMR/backend
      await createVisitAndNavigateAway([SpecificCareOption.PRIMARY_CARE], {
        navigateAway: false,
        requestedQuestionnaires,
      });
      Router.push(Pathnames.PRIMARY_CARE_VISIT);
    },
    [createVisitAndNavigateAway, requestedQuestionnaires]
  );

  return (
    <CenteredContainer maxWidth="sm">
      <Stack gap="26px">
        <Typography variant="h2">What are your main health goals?</Typography>
        <Typography fontSize={15}>Select all that apply</Typography>
      </Stack>
      {reasons ? (
        <PrimaryCareVisitSelectionForm
          onVisitSelection={onVisitSelection}
          selections={reasons}
        />
      ) : (
        <Loading />
      )}
    </CenteredContainer>
  );
};

export default PrimaryCareVisitSelection;
