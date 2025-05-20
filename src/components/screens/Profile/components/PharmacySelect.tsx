import { Grid, Stack, Typography } from '@mui/material';
import { Database } from '@/lib/database.types';
import PharmacySearchForm from '@/components/shared/PharmacySelectForm/PharmacySelectForm';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = Database['public']['Tables']['patient']['Row'];
type PatientProps = Patient & { profiles: Profile };
type PharmProp = { patient: PatientProps; onCancel: () => void };

const PharmacySelection = ({ patient, onCancel }: PharmProp) => {
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
      {patient ? (
        <PharmacySearchForm patientId={patient.id} onSuccess={onCancel} />
      ) : null}
    </Grid>
  );
};

export default PharmacySelection;
