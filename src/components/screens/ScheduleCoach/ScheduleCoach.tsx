import { Container, Grid, Stack, Typography } from '@mui/material';
import CareTeam from './components/CareTeam';
import CheckmarkList from '@/components/shared/CheckmarkList';
import { CarePersonType, CoachType } from '@/types/carePersonType';
import Router from 'next/router';

interface ScheduleCoachProps {
  coachType: CoachType;
  onSelect: (nextPage: string | undefined) => void;
  title?: string;
  body?: string;
  listItems?: string[];
}

const ScheduleCoach = ({
  coachType,
  onSelect,
  title,
  body,
  listItems,
}: ScheduleCoachProps) => {
  const program =
    coachType === CarePersonType.MENTAL_HEALTH
      ? 'mental health'
      : 'weight loss';

  const isPostCheckoutMentalHealthCoachSchedule =
    Router.asPath ===
    '/post-checkout/questionnaires-v2/mental-health-add-schedule-coach/MENTAL_ADD_SCH_C_Q5';

  const handleRedirect = () => {
    Router.push(
      '/post-checkout/questionnaires-v2/mental-health-add-schedule-coach/MENTAL_ADD_SCH_C_Q3'
    );
  };

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="30px">
        <Stack gap="1rem">
          <Stack gap="0.6rem">
            <Typography variant="h2">
              {title || 'Select your coach & schedule your 1:1 video session.'}
            </Typography>
            {body && <Typography>{body}</Typography>}
          </Stack>
          <CheckmarkList
            listItems={
              listItems || [
                `Your coach will work with you throughout your ${program} journey`,
                'They will ensure you are getting holistic care, including medication and behavioral change',
                'You can message your coach at any time in the Zealthy portal',
              ]
            }
          />
          <Typography variant="h4" style={{ fontStyle: 'italic' }}>
            {`Zealthy carefully selected the following coach or coaches for you.
            After your first session, you can select a different coach if your
            initial coach wasn't the right fit.`}
          </Typography>
        </Stack>
        <Typography variant="h2">Book an appointment</Typography>
        <CareTeam coachType={coachType} onSelect={onSelect} />
        {isPostCheckoutMentalHealthCoachSchedule && (
          <Typography
            variant="h4"
            style={{ fontStyle: 'italic' }}
            fontWeight="500"
          >
            No availability slots?{' '}
            <span
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={handleRedirect}
            >
              Click here to go back
            </span>
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default ScheduleCoach;
