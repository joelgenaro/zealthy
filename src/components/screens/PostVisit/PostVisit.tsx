import { useState } from 'react';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import StarRating from '@/components/shared/StarRating';
import { Provider } from '@/types';
import { Box, Divider, Grid, Typography } from '@mui/material';
import AppointmentDetailCard from './components/AppointmentDetailCard';
import ProviderRecommendationCard from './components/ProviderRecommendationCard';

interface Props {
  header: string;
  provider: Provider;
  issuesDiscussed: string[];
  providerRecommendation: string;
}

const PostVisit = ({
  header = 'Appointment Summary',
  provider,
  issuesDiscussed,
  providerRecommendation,
}: Props) => {
  const [rating, setRating] = useState(0);
  return (
    <CenteredContainer>
      <Typography fontWeight="700" variant="h5" component="h1">
        {header}
      </Typography>
      <Grid container direction="column" gap="16px">
        <Typography fontWeight="700" variant="subtitle1" component="h2">
          {`You’ve now established care with ${provider.honorific} ${provider.lastName}`}
        </Typography>
        <Typography variant="body2" component="p">
          {`You can book appointments with ${provider.honorific} ${provider.lastName} and ask questions anytime from the Zealthy home page.`}
        </Typography>
      </Grid>
      <AppointmentDetailCard provider={provider} />
      <Grid container direction="column" gap="16px">
        <Typography fontWeight="700" variant="subtitle1" component="h2">
          Issues discussed
        </Typography>
        <Grid container direction="column">
          {issuesDiscussed.map((issue, index) => (
            <Typography key={index} variant="body2" component="p">
              {`${index + 1}. ${issue}`}
            </Typography>
          ))}
        </Grid>
      </Grid>
      <Grid container direction="column" gap="16px">
        <Typography fontWeight="700" variant="subtitle1" component="h2">
          {`${provider.honorific} ${provider.lastName}’s Recommendations`}
        </Typography>
        <ProviderRecommendationCard>
          {providerRecommendation}
        </ProviderRecommendationCard>
      </Grid>
      <Grid container direction="column" gap="16px">
        <Box borderRadius="12px" padding="12px" bgcolor="#6699FF">
          <Typography
            variant="caption"
            component="p"
            color="white"
            fontWeight="500"
            textAlign="center"
          >
            Get help with something else
          </Typography>
        </Box>
        <Box borderRadius="12px" padding="12px" bgcolor="#EEEEEE">
          <Typography
            variant="caption"
            component="p"
            fontWeight="500"
            textAlign="center"
          >
            Finish
          </Typography>
        </Box>
      </Grid>
      <Divider />
      <Box maxWidth="200px" alignSelf="center">
        <StarRating
          value={rating}
          onChange={setRating}
          description={`How would you rate your recent visit with ${provider.honorific} ${provider.lastName}?`}
        />
      </Box>
    </CenteredContainer>
  );
};

export default PostVisit;
