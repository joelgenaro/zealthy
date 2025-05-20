import { Grid, Stack, Typography } from '@mui/material';
import PharmacySearchForm from '@/components/shared/PharmacySelectForm';

type PharmProp = { patientId: number; onCancel: () => void };

export const PharmacySelection = ({ patientId, onCancel }: PharmProp) => {
  return (
    <Grid container direction="column" gap="48px">
      <Stack direction="column" gap="16px">
        <Typography variant="h2">Update your pharmacy.</Typography>

        <Typography>
          We&apos;re asking you to share the most convenient place for you to
          pick up or receive medication. We want to make your healthcare easier
          for you!
        </Typography>
      </Stack>
      <PharmacySearchForm patientId={patientId} onSuccess={onCancel} />
    </Grid>
  );
};
