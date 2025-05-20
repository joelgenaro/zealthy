import Image from 'next/image';
import Box from '@mui/material/Box';
import CalendarSVG from '../icons/CalendarSVG';
import CheckMark from '../icons/CheckMark';
import Grid from '@mui/material/Grid';
import Circle from '../Circle';
import CustomText from '../Text/CustomText';
import BaseCard from '../BaseCard';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import { usePatient } from '@/components/hooks/data';
import { format } from 'date-fns-tz';

type Provider = {
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  specialties: string | null | undefined;
  avatar_url: string | null | undefined;
};
interface VisitSummaryProps {
  isConfirmed?: boolean;
  appointment: {
    appointment_type: string | null | undefined;
    starts_at: string | null | undefined;
    ends_at: string | null | undefined;
    provider: Provider | null | undefined;
    daily_room?: string | null | undefined;
    id?: number;
  };
}

const VisitSummary = ({
  isConfirmed = false,
  appointment,
}: VisitSummaryProps) => {
  const { data: patient } = usePatient();
  const { provider, daily_room, id } = appointment;
  const timezone =
    patient?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const startTime = new Date(appointment.starts_at || 0);
  const startTimeFormatted = format(startTime, 'h:mm');
  const endTime = new Date(appointment.ends_at || 0);
  const endTimeFormatted = format(endTime, 'h:mm a zz');

  const careProviderName = `${provider?.first_name} ${provider?.last_name}`;

  const specialties = provider?.specialties
    ? provider?.specialties
    : appointment?.appointment_type === 'Provider'
    ? 'Zealthy Provider'
    : appointment.appointment_type === 'Coach (Mental Health)'
    ? 'Zealthy Mental Health Coach'
    : 'Zealthy Weight Loss Coach';

  const visit_meeting_link = `${
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'https://app.getzealthy.com'
      : 'https://frontend-next-git-development-zealthy.vercel.app'
  }/visit/room/${daily_room}?appointment=${id}`;

  return (
    <BaseCard>
      <Grid container direction="column" gap="48px" padding="2rem">
        <Box display="flex" flexDirection="column" gap="16px">
          <Box display="flex" gap="16px" alignItems="center" textAlign="start">
            <Image
              src={provider?.avatar_url! || ProfilePlaceholder}
              width="72"
              height="72"
              alt="care-person"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <Box>
              <CustomText
                variant="h6"
                lineHeight="1.75rem"
                fontWeight="600"
              >{`${careProviderName}`}</CustomText>
              <CustomText color="#777777">{specialties}</CustomText>
            </Box>
            {isConfirmed ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="75px 1fr 20px"
            gap="16px"
            alignItems="center"
            textAlign="start"
          >
            <Circle size="72px">
              <CalendarSVG />
            </Circle>
            <Box>
              <CustomText fontWeight="600">
                {`${startTimeFormatted} - ${endTimeFormatted}`}
              </CustomText>
              <CustomText color="#777777">
                {format(startTime, 'EEEE, MMMM do, yyyy')}
              </CustomText>
            </Box>
            {isConfirmed ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
          </Box>
        </Box>

        {isConfirmed ? (
          <Grid
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
            }}
          >
            <AddToCalendarButton
              name={`Zealthy visit with ${careProviderName}`}
              startDate={format(startTime, 'yyyy-MM-dd').toString()}
              startTime={format(startTime, 'HH:mm').toString()}
              endDate={format(endTime, 'yyyy-MM-dd').toString()}
              endTime={format(endTime, 'HH:mm').toString()}
              timeZone={timezone}
              location={!daily_room ? '' : visit_meeting_link}
              options="'Apple','Google','Microsoft365'"
              buttonStyle="default"
              hideIconButton
              hideBackground
              hideCheckmark
              label="Add to Calendar"
              lightMode="bodyScheme"
            />
          </Grid>
        ) : null}
      </Grid>
    </BaseCard>
  );
};

export default VisitSummary;
