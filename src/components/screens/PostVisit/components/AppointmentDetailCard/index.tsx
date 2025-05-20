import { Provider } from '@/types';
import { Box, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';

interface Props {
  provider: Provider;
}

const AppointmentDetailCard = ({ provider }: Props) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      borderRadius="24px"
      padding="32px"
      gap="16px"
      bgcolor="white"
      border="1px solid #D8D8D8"
      boxShadow="0px 12px 24px 4px rgba(0, 0, 0, 0.04)"
    >
      <Grid container direction="column">
        <Typography fontWeight="600" variant="subtitle1" component="h2">
          {`${provider.honorific} ${provider.firstName} ${provider.lastName}`}
        </Typography>
        <Typography fontWeight="400" variant="caption" component="h3">
          {`${provider.specialties}`}
        </Typography>
      </Grid>
      <Grid container direction="column"></Grid>
    </Box>
  );
};

export default AppointmentDetailCard;
