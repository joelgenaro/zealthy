import DosageAdjustment from '@/components/shared/icons/DosageAdjusment';
import ProviderReview from '@/components/shared/icons/ProviderReview';
import TreatmentPlan from '@/components/shared/icons/TreatmentPlan';
import { Paper, Typography, Stack } from '@mui/material';

const WorkingTogether = () => {
  return (
    <Paper sx={{ borderRadius: '16px' }}>
      <Stack padding="36px 24px" gap="36px">
        <Stack alignItems="center" gap="16px">
          <ProviderReview />
          <Typography variant="h3">1. Provider review</Typography>
          <Typography textAlign="center">
            Your provider will review your responses and make a recommendation
            based on your intake questions and your medical history.
          </Typography>
        </Stack>
        <Stack alignItems="center" gap="16px">
          <TreatmentPlan />
          <Typography variant="h3">2. Treatment plan</Typography>
          <Typography textAlign="center">
            If clinically appropriate, you’ll receive a personalized medication
            treatment plan.
          </Typography>
        </Stack>
        <Stack alignItems="center" gap="16px">
          <DosageAdjustment />
          <Typography variant="h3">3. Dosage adjustments</Typography>
          <Typography textAlign="center">
            Your provider will work with you to adjust and find the right
            long-term dosage or try another medication, if necessary.
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default WorkingTogether;
