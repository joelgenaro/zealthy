import { useAppointmentSelect } from '@/components/hooks/useAppointment';
import VisitSummary from '@/components/shared/VisitSummary';

const VisitConfirmation = () => {
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );
  return <VisitSummary isConfirmed appointment={appointment!} />;
};

export default VisitConfirmation;
