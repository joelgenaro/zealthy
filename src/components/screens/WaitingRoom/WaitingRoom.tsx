import { useAppointmentSelect } from '@/components/hooks/useAppointment';
import { useProfileState } from '@/components/hooks/useProfile';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import CustomText from '@/components/shared/Text/CustomText';
import Title from '@/components/shared/Title';
import VisitSummary from '@/components/shared/VisitSummary';
import Link from '@mui/material/Link';
import VisitTips from './components/VisitTips';

const WaitingRoom = () => {
  const { first_name } = useProfileState();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  if (!appointment) {
    throw new Error('Appointment is not provided');
  }
  const message = `Hi ${first_name}, Dr. ${appointment.provider!.first_name} ${
    appointment.provider!.last_name
  } will be with you shortly.`;

  return (
    <CenteredContainer maxWidth="sm">
      <Title text="Welcome!" />
      <VisitSummary appointment={appointment} />
      <CustomText>{message}</CustomText>
      <CustomText>{appointment.provider!.specialties}</CustomText>
      <VisitTips />
      <CustomText textAlign="center" fontSize="14px">
        For any issues or concerns,{'\n'}you may contact our{' '}
        <Link href={`mailto:support@getzealthy.com`}>Support Team</Link>.
      </CustomText>
    </CenteredContainer>
  );
};

export default WaitingRoom;
