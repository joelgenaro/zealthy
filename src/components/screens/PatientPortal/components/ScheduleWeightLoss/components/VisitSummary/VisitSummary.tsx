import Image from 'next/image';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import { Typography } from '@mui/material';
import Circle from '@/components/shared/Circle';
import CalendarSVG from '@/components/shared/icons/CalendarSVG';
import { usePatient } from '@/components/hooks/data';
import { utcToZonedTime, format } from 'date-fns-tz';
import { addMinutes } from 'date-fns';

interface VisitSummaryProps {
  appointment: AppointmentState;
}

const VisitSummary = ({ appointment }: VisitSummaryProps) => {
  const { provider } = appointment;
  const { data: patient } = usePatient();
  const careProviderName = `${provider?.first_name} ${provider?.last_name}`;

  const timezone =
    patient?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const startTime = utcToZonedTime(
    new Date(appointment.starts_at || 0),
    timezone
  );
  const startTimeFormatted = format(startTime, 'h:mm');
  const endTime = utcToZonedTime(new Date(appointment.ends_at || 0), timezone);
  const endTimeFormatted = format(endTime, 'h:mm a zzz');

  return (
    <Box
      width="100%"
      minWidth="265px"
      display="flex"
      bgcolor="white"
      alignItems="center"
      borderRadius="24px"
      flexDirection="column"
      boxShadow="0px 12px 24px 4px rgba(0, 0, 0, 0.04);"
    >
      <Grid container direction="column" gap="48px" padding="2rem">
        <Box display="flex" flexDirection="column" gap="16px">
          <Box display="flex" gap="16px" alignItems="center">
            <Image
              src={provider?.avatar_url! || ProfilePlaceholder}
              width="72"
              height="72"
              alt="care-person"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <Box>
              <Typography
                variant="h6"
                lineHeight="1.75rem"
                fontWeight="600"
              >{`${careProviderName}`}</Typography>
              <Typography color="#777777">
                {provider?.specialties
                  ? provider?.specialties
                  : appointment.appointment_type === 'Provider'
                  ? 'Zealthy Provider'
                  : 'Zealthy Coach'}
              </Typography>
            </Box>
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="72px 1fr"
            gap="16px"
            alignItems="center"
          >
            <Circle size="72px">
              <CalendarSVG />
            </Circle>
            <Box>
              <Typography fontWeight="600">
                {`${startTimeFormatted} - ${endTimeFormatted} ET`}
              </Typography>
              <Typography color="#777777">
                {format(startTime, 'EEEE, MMMM do, yyyy')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default VisitSummary;
