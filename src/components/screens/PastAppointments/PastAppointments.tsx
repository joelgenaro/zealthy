import { useEffect, useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Image from 'next/image';
import { ApptProps } from '../PatientPortal/PatientPortal';
import CustomText from '@/components/shared/Text';
import { clinicianTitle } from '@/utils/clinicianTitle';
import { usePatient } from '@/components/hooks/data';
import { utcToZonedTime, format } from 'date-fns-tz';
import { addMinutes } from 'date-fns';

const PastAppointments = () => {
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const [pastAppointments, setPastAppointments] = useState<ApptProps[]>([]);
  const [primaryCareProvider, setPrimaryCareProvider] =
    useState<ApptProps | null>(null);
  const router = useRouter();
  const timezone =
    patient?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleRebook = () => {
    router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT);
  };

  async function fetchPastAppointment() {
    const appts = await supabase
      .from('appointment')
      .select(
        `id, starts_at, visit_type, status, duration, appointment_type, clinician (id, type, zoom_link, daily_room, canvas_practitioner_id, profiles(*))`
      )
      .match({
        patient_id: patient?.id,
        status: 'Completed',
      })
      .order('created_at', { ascending: false });

    setPastAppointments(appts.data as ApptProps[]);

    const primaryCare = appts?.data?.filter(
      a => a.appointment_type === 'Provider'
    )[0];

    setPrimaryCareProvider(primaryCare as ApptProps);
  }
  useEffect(() => {
    if (patient?.id) {
      fetchPastAppointment();
    }
  }, [patient?.id]);

  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h2">Past appointments.</Typography>
      <Stack gap={2}>
        {pastAppointments?.length > 0 ? (
          pastAppointments.map((appt: ApptProps) => {
            const startTime = utcToZonedTime(
              new Date(appt.starts_at || ''),
              timezone
            );
            const startTimeFormatted = format(startTime, 'h:mm');
            const endTime = utcToZonedTime(
              addMinutes(new Date(appt.starts_at || ''), appt?.duration || 30),
              timezone
            );

            const endTimeFormatted = format(endTime, 'h:mm a zzz');

            return (
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 2,
                  border: '1px solid #D8D8D8',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 500,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                key={appt.id}
              >
                <Box sx={{ display: 'flex' }}>
                  <Image
                    src={
                      appt?.clinician?.profiles?.avatar_url ||
                      '/favicon_cream_black_256x256.png'
                    }
                    alt="avatar"
                    width={48}
                    height={48}
                    style={{ borderRadius: '50%' }}
                  />
                  <Stack sx={{ marginLeft: 3 }}>
                    <CustomText letterSpacing="0.3px" fontWeight={500}>
                      {format(startTime, 'EEEE, MMMM do, yyyy')}
                    </CustomText>
                    <CustomText>{`${startTimeFormatted} - ${endTimeFormatted}`}</CustomText>
                    <CustomText fontSize="14px">
                      {clinicianTitle(appt.clinician)}
                    </CustomText>
                    <CustomText
                      onClick={handleRebook}
                      sx={{
                        color: '#00872B',
                        fontSize: '12px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Rebook now
                    </CustomText>
                  </Stack>
                </Box>
              </Box>
            );
          })
        ) : (
          <>
            <Typography variant="body1">
              {
                'You do not have any past appointments within the Zealthy system at this time.'
              }
            </Typography>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default PastAppointments;
