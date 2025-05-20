import { usePatientAppointment } from '@/components/hooks/data';
import Spinner from '@/components/shared/Loading/Spinner';
import Redirect from '@/components/shared/Redirect';
import { Pathnames } from '@/types/pathnames';
import Typography from '@mui/material/Typography';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import { useMemo } from 'react';
import { utcToZonedTime } from 'date-fns-tz';

interface AppointmentVerifyProps {
  children: JSX.Element;
  appointmentId: number;
  roomId: string;
}

const AppointmentVerify = ({
  children,
  appointmentId,
  roomId,
}: AppointmentVerifyProps) => {
  const { data: appointment, isLoading } = usePatientAppointment(appointmentId);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = utcToZonedTime(appointment?.starts_at ?? '', timeZone);
  const formattedTime = new Date(zonedDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const allowJoin = () => {
    if (appointment?.status === 'Cancelled') {
      return false;
    }

    if (appointment?.daily_room !== roomId) {
      return false;
    }

    if (appointment && appointment.provider_joined_at) {
      return (
        differenceInMinutes(
          new Date(),
          new Date(appointment.provider_joined_at)
        ) <= 25
      );
    } else if (appointment && !appointment.provider_joined_at) {
      return true;
    }

    return false;
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!appointment) {
    return <Typography variant="h3">Hmmm, something went wrong</Typography>;
  }

  if (!allowJoin()) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          style={{ marginTop: '15rem' }}
        >{`Your visit is on ${
          appointment.starts_at?.split('T')[0]
        } at ${formattedTime}. Please join the link 5 minutes before your meeting.`}</Typography>
      </div>
    );
  }

  return children;
};

export default AppointmentVerify;
