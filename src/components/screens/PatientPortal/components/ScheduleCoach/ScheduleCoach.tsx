import { Container, Grid, Stack, Typography } from '@mui/material';
import CareTeam from './components/CareTeam';
import { CarePersonType, CoachType } from '@/types/carePersonType';
import CheckmarkList from '@/components/shared/CheckmarkList';
import { useSelector } from '@/components/hooks/useSelector';

interface ScheduleCoachProps {
  coachType: CoachType;
}

const ScheduleCoach = ({ coachType }: ScheduleCoachProps) => {
  const coaching = useSelector(store => store.coaching[0]);

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">
          {coaching?.id ? (
            <>
              <Typography variant="h2">
                {!(coachType === CarePersonType.MENTAL_HEALTH)
                  ? 'You have successfully signed up for coaching! Select your coach & schedule your first 1:1 video session.'
                  : 'Select your coach & schedule your first 1:1 video session.'}
              </Typography>
              <Stack gap="1rem">
                <CheckmarkList
                  listItems={[
                    `Your coach will work with you throughout your ${coachType
                      .toLowerCase()
                      .replace(/(coach)|[()]/gi, '')} journey`,
                    'They will ensure you are getting holistic care, including medication and behavioral change',
                    'You can message your coach at any time in the Zealthy portal',
                  ]}
                />
              </Stack>
            </>
          ) : (
            <>{'Schedule your coaching session'}</>
          )}
        </Typography>
        <CareTeam coachType={coachType} />
      </Grid>
    </Container>
  );
};

export default ScheduleCoach;
