import { usePatient } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useSelector } from '@/components/hooks/useSelector';
import BaseCard from '@/components/shared/BaseCard';
import PhoneVisitIcon from '@/components/shared/icons/PhoneVisitIcon';
import VideoVisitIcon from '@/components/shared/icons/VideoVisitIcon';
import { Database } from '@/lib/database.types';
import { Stack, Button, Typography } from '@mui/material';

type VisitType = Database['public']['Enums']['visit_type'];

interface SelectVisitTypeProps {
  nextPage: (nextPage?: string) => void;
}

const SelectVisitType = ({ nextPage }: SelectVisitTypeProps) => {
  const { data: patient } = usePatient();
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const { updateAppointment } = useAppointmentAsync();

  const onContinue = async (visitType: VisitType) => {
    await updateAppointment(
      appointment!.id,
      { visit_type: visitType! },
      patient!
    );
    nextPage();
  };

  if (!appointment) {
    return null;
  }

  return (
    <Stack direction="column" gap="3rem">
      <BaseCard>
        <Stack gap="1rem" width="100%" alignItems="center" padding="2rem">
          <VideoVisitIcon />
          {appointment?.provider && (
            <Typography>
              {`Keep your video visit with Dr. ${appointment.provider.first_name} ${appointment.provider.last_name}.`}
            </Typography>
          )}
          <Button
            size="medium"
            onClick={() => onContinue('Video')}
            sx={{ width: '100%' }}
          >
            I prefer video
          </Button>
        </Stack>
      </BaseCard>
      <BaseCard>
        <Stack gap="1rem" width="100%" alignItems="center" padding="2rem">
          <PhoneVisitIcon />
          {appointment?.provider && (
            <Typography>
              {`Speak to Dr. ${appointment.provider.first_name} ${appointment.provider.last_name} over the phone.`}
            </Typography>
          )}
          <Button
            size="medium"
            onClick={() => onContinue('Phone')}
            sx={{ width: '100%' }}
          >
            I prefer phone
          </Button>
        </Stack>
      </BaseCard>
    </Stack>
  );
};

export default SelectVisitType;
