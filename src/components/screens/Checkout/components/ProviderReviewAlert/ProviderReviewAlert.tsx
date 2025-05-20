import { Box, Typography } from '@mui/material';
import { useVisitState } from '@/components/hooks/useVisit';
import CheckMarkCircleThin from '@/components/shared/icons/CheckMarkCircleThin';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useAppointmentState } from '@/components/hooks/useAppointment';
import { useIntakeSelect } from '@/components/hooks/useIntake';

const ProviderReviewAlert = () => {
  const { selectedCare } = useVisitState();
  const appointment = useAppointmentState();
  const specificCare = useIntakeSelect(intake => intake.specificCare);

  const providerReviewConditions: string[] = [
    SpecificCareOption.BIRTH_CONTROL,
    SpecificCareOption.HAIR_LOSS,
    SpecificCareOption.ERECTILE_DYSFUNCTION,
    SpecificCareOption.PRE_WORKOUT,
  ];

  const showProviderReviewMessage = selectedCare.careSelections.some(care =>
    providerReviewConditions.includes(care.reason)
  );

  if (!showProviderReviewMessage || appointment.length) return null;

  return (
    <Box
      bgcolor="#FDFFA2"
      padding="3px 7px"
      borderRadius="20px"
      width="fit-content"
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap="5px"
    >
      <CheckMarkCircleThin />
      <Typography color="#000" variant="h4">
        {specificCare === 'Preworkout'
          ? `Only pay if prescribed`
          : 'Your free provider review has been added to your cart!'}
      </Typography>
    </Box>
  );
};

export default ProviderReviewAlert;
