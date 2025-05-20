import VisitSummary from '@/components/shared/VisitSummary';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';

interface AppointmentCardProps {
  appointment: AppointmentState;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  if (!appointment.id || !appointment.duration) return null;

  return <VisitSummary appointment={appointment} />;
};

export default AppointmentCard;
