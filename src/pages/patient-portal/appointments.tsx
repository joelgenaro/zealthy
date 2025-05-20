import { useEffect, useState } from 'react';
import { Stack, Typography, Box, Grid, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Image from 'next/image';
import CustomText from '@/components/shared/Text';
import { ApptProps } from '@/components/screens/PatientPortal/PatientPortal';
import { ReactElement } from 'react';
import { format } from 'date-fns-tz';
import { addMinutes } from 'date-fns';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import Loading from '@/components/shared/Loading/Loading';
import Footer from '@/components/shared/layout/Footer';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import { usePatient } from '@/components/hooks/data';
import getConfig from '../../../config';

const baseUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : `https://frontend-next-git-development-zealthy.vercel.app`;

function parseAndValidateDate(
  dateString: string | undefined | null
): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

const AppointmentsPage = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { data: patient } = usePatient();
  const [upcomingAppointments, setUpcomingAppointments] = useState<ApptProps[]>(
    []
  );
  const [pastAppointments, setPastAppointments] = useState<ApptProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const timezone =
    patient?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const getAppointmentType = (care: string | null) => {
    switch (care) {
      case 'Primary care':
        return `${siteName} Primary Care`;
      case 'Weight loss':
        return `${siteName} Weight Loss Program`;
      case 'Anxiety or depression':
        return `${siteName} Personalized Psychiatry`;
      default:
        return `${siteName} Program`;
    }
  };

  const handleReschedule = (clinicianId: number, appointmentId: number) => {
    router.push(
      `/schedule-appointment?id=${clinicianId}&appt-id=${appointmentId}`
    );
  };

  const handleCancel = (appointmentId: number) => {
    router.push(`/patient-portal/appointment/${appointmentId}`);
  };

  async function fetchAppointments() {
    try {
      setLoading(true);
      const upcoming = await supabase
        .from('appointment')
        .select(
          `id, starts_at, visit_type, status, duration, appointment_type, care, daily_room, clinician (id, profiles(*))`
        )
        .match({ patient_id: patient?.id, status: 'Confirmed' })
        .order('starts_at', { ascending: true });

      const past = await supabase
        .from('appointment')
        .select(
          `id, starts_at, visit_type, status, duration, appointment_type, care, clinician (id, profiles(*))`
        )
        .in('status', ['Completed', 'Cancelled'])
        .match({ patient_id: patient?.id })
        .order('starts_at', { ascending: false });

      const upcomingAppointmentsData = (upcoming.data || []) as ApptProps[];
      const pastAppointmentsData = (past.data || []) as ApptProps[];

      const now = new Date();

      const filteredUpcomingAppointments: ApptProps[] = [];
      const updatedPastAppointments: ApptProps[] = [...pastAppointmentsData];

      upcomingAppointmentsData.forEach(appt => {
        const startTimeRaw = parseAndValidateDate(appt.starts_at);
        const duration = appt.duration || 30;
        const endTimeRaw = startTimeRaw
          ? addMinutes(startTimeRaw, duration)
          : null;

        if (endTimeRaw && endTimeRaw < now) {
          if (appt.status === 'Confirmed') {
            const updatedAppt: ApptProps = {
              ...appt,
              status: 'Cancelled',
            };
            updatedPastAppointments.push(updatedAppt);
          } else {
            updatedPastAppointments.push(appt);
          }
        } else {
          filteredUpcomingAppointments.push(appt);
        }
      });

      setUpcomingAppointments(filteredUpcomingAppointments);
      setPastAppointments(updatedPastAppointments);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patient?.id) {
      fetchAppointments();
    }
  }, [patient?.id]);

  if (loading) return <Loading />;

  return (
    <Stack gap={4} padding={4}>
      {upcomingAppointments?.length > 0 && (
        <>
          <Typography
            variant="h2"
            width="80%"
            marginLeft="auto"
            marginRight="auto"
          >
            {upcomingAppointments.length === 1
              ? 'Upcoming Appointment'
              : 'Upcoming Appointments'}
          </Typography>
          <Stack gap={3}>
            {upcomingAppointments.map((appt: ApptProps) => {
              const startTimeRaw = parseAndValidateDate(appt.starts_at);
              const duration = appt.duration || 30;
              const endTimeRaw = startTimeRaw
                ? addMinutes(startTimeRaw, duration)
                : null;

              const startTime = startTimeRaw ? new Date(startTimeRaw) : null;
              const endTime = endTimeRaw ? new Date(endTimeRaw) : null;

              const startTimeFormatted = startTime
                ? format(startTime, 'h:mm a')
                : null;
              const endTimeFormatted = endTime
                ? format(endTime, 'h:mm a z')
                : null;

              const clinicianProfile = appt.clinician?.profiles;
              const careProviderName = clinicianProfile
                ? `${clinicianProfile.first_name} ${clinicianProfile.last_name}`
                : 'Unknown Provider';

              const visitLink = appt.daily_room
                ? `${baseUrl}/visit/room/${appt.daily_room}?appointment=${appt.id}`
                : '';

              return (
                <Box
                  key={appt.id ?? ''}
                  sx={{
                    backgroundColor: '#F4F9F4',
                    borderRadius: 2,
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    width: '80%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <Grid
                    sx={{
                      mb: 2,
                      '@media (min-width: 600px)': {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingLeft: 3,
                        paddingRight: 3,
                      },
                      '@media (max-width: 599px)': {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        justifyContent: 'space-between',
                        flexGrow: 1,
                      },
                    }}
                  >
                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.5 20C9.7 20 8.16667 19.3667 6.9 18.1C5.63333 16.8333 5 15.3 5 13.5V12.925C3.56667 12.6917 2.375 12.0208 1.425 10.9125C0.475 9.80417 0 8.5 0 7V1H3V0H5V4H3V3H2V7C2 8.1 2.39167 9.04167 3.175 9.825C3.95833 10.6083 4.9 11 6 11C7.1 11 8.04167 10.6083 8.825 9.825C9.60833 9.04167 10 8.1 10 7V3H9V4H7V0H9V1H12V7C12 8.5 11.525 9.80417 10.575 10.9125C9.625 12.0208 8.43333 12.6917 7 12.925V13.5C7 14.75 7.4375 15.8125 8.3125 16.6875C9.1875 17.5625 10.25 18 11.5 18C12.75 18 13.8125 17.5625 14.6875 16.6875C15.5625 15.8125 16 14.75 16 13.5V11.825C15.4167 11.625 14.9375 11.2667 14.5625 10.75C14.1875 10.2333 14 9.65 14 9C14 8.16667 14.2917 7.45833 14.875 6.875C15.4583 6.29167 16.1667 6 17 6C17.8333 6 18.5417 6.29167 19.125 6.875C19.7083 7.45833 20 8.16667 20 9C20 9.65 19.8125 10.2333 19.4375 10.75C19.0625 11.2667 18.5833 11.625 18 11.825V13.5C18 15.3 17.3667 16.8333 16.1 18.1C14.8333 19.3667 13.3 20 11.5 20ZM17 10C17.2833 10 17.5208 9.90417 17.7125 9.7125C17.9042 9.52083 18 9.28333 18 9C18 8.71667 17.9042 8.47917 17.7125 8.2875C17.5208 8.09583 17.2833 8 17 8C16.7167 8 16.4792 8.09583 16.2875 8.2875C16.0958 8.47917 16 8.71667 16 9C16 9.28333 16.0958 9.52083 16.2875 9.7125C16.4792 9.90417 16.7167 10 17 10Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} PROVIDER
                      </CustomText>
                      <CustomText
                        sx={{
                          color: '#0B541D',
                          fontSize: '1.1rem !important',
                          fontWeight: 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          textDecoration: 'underline',
                          marginLeft: 3,
                        }}
                      >
                        <Image
                          src={
                            clinicianProfile?.avatar_url ||
                            '/favicon_cream_black_256x256.png'
                          }
                          alt="avatar"
                          width={30}
                          height={30}
                          style={{
                            borderRadius: '50%',
                            border: '2px solid #0B541D',
                            marginTop: 1,
                          }}
                        />
                        {clinicianProfile
                          ? `${clinicianProfile.first_name} ${clinicianProfile.last_name}`
                          : 'Unknown Provider'}
                      </CustomText>
                    </Grid>

                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 10.45 19.975 10.8917 19.925 11.325C19.875 11.7583 19.7917 12.1833 19.675 12.6C19.4417 12.3333 19.1708 12.1083 18.8625 11.925C18.5542 11.7417 18.2167 11.6167 17.85 11.55C17.9 11.3 17.9375 11.0458 17.9625 10.7875C17.9875 10.5292 18 10.2667 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18C10.85 18 11.6625 17.875 12.4375 17.625C13.2125 17.375 13.925 17.025 14.575 16.575C14.775 16.8583 15.0208 17.1083 15.3125 17.325C15.6042 17.5417 15.9167 17.7083 16.25 17.825C15.4 18.5083 14.4458 19.0417 13.3875 19.425C12.3292 19.8083 11.2 20 10 20ZM17.25 16C16.9 16 16.6042 15.8792 16.3625 15.6375C16.1208 15.3958 16 15.1 16 14.75C16 14.4 16.1208 14.1042 16.3625 13.8625C16.6042 13.6208 16.9 13.5 17.25 13.5C17.6 13.5 17.8958 13.6208 18.1375 13.8625C18.3792 14.1042 18.5 14.4 18.5 14.75C18.5 15.1 18.3792 15.3958 18.1375 15.6375C17.8958 15.8792 17.6 16 17.25 16ZM13.3 14.7L9 10.4V5H11V9.6L14.7 13.3L13.3 14.7Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} TIME
                      </CustomText>
                      {startTime && startTimeFormatted ? (
                        <>
                          <CustomText
                            sx={{
                              color: '#4F4F4F',
                              marginTop: {
                                xs: 0,
                                sm: 1,
                              },
                              marginLeft: 3,
                            }}
                          >
                            {format(startTime, 'MM/dd/yyyy')}
                          </CustomText>
                          {endTime && endTimeFormatted && (
                            <CustomText
                              sx={{
                                color: '#4F4F4F',
                                marginLeft: 3,
                              }}
                            >
                              {`${startTimeFormatted} - ${endTimeFormatted}`}
                            </CustomText>
                          )}
                        </>
                      ) : (
                        <CustomText
                          sx={{
                            color: '#4F4F4F',
                            marginTop: {
                              xs: 0,
                              sm: 1,
                            },
                            marginLeft: 3,
                          }}
                        >
                          Time not available
                        </CustomText>
                      )}
                    </Grid>

                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="18"
                          height="20"
                          viewBox="0 0 18 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.95 16.35L4.4 12.8L5.85 11.35L7.95 13.45L12.15 9.25L13.6 10.7L7.95 16.35ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} APPOINTMENT TYPE
                      </CustomText>
                      <CustomText
                        sx={{
                          color: '#4F4F4F',
                          marginTop: { xs: 0, sm: 1 },
                          marginLeft: 3,
                        }}
                      >
                        {getAppointmentType(appt.care)}
                      </CustomText>
                    </Grid>
                  </Grid>

                  {visitLink ? (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={8}>
                        <CustomText
                          sx={{
                            color: '#000',
                            fontWeight: 600,
                            marginLeft: {
                              xs: 0,
                              sm: 3,
                            },
                          }}
                        >
                          Link to Appointment:{' '}
                          <a
                            href={visitLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#2E7D32',
                            }}
                          >
                            Here
                          </a>
                        </CustomText>
                      </Grid>
                    </Grid>
                  ) : (
                    <CustomText sx={{ color: '#000' }}>
                      The appointment link will be available soon.
                    </CustomText>
                  )}

                  {startTime && endTime ? (
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        width: 'auto',
                        '@media (max-width: 600px)': {
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      }}
                    >
                      <Grid
                        item
                        sx={{
                          width: {
                            xs: '100%',
                            sm: '280px',
                          },
                          display: 'flex',
                          justifyContent: 'center',
                          padding: 0,
                          maxWidth: 'unset',
                          margin: 0,
                          '@media (max-width: 600px)': {
                            width: '100%',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 'small',
                            marginTop: '0.9em',
                            display: 'inline-flex',
                            textWrap: 'nowrap',
                            marginLeft: '5em',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 0,
                            lineHeight: '1em',
                            padding: 0,
                            '@media (max-width: 600px)': {
                              width: '100%',
                              marginLeft: 0,
                            },
                          }}
                        >
                          <AddToCalendarButton
                            name={`${siteName} visit with ${careProviderName}`}
                            startDate={format(startTime, 'yyyy-MM-dd')}
                            startTime={format(startTime, 'HH:mm')}
                            endDate={format(endTime, 'yyyy-MM-dd')}
                            endTime={format(endTime, 'HH:mm')}
                            timeZone={timezone}
                            location={visitLink}
                            options={['Apple', 'Google', 'Microsoft365']}
                            buttonStyle="default"
                            hideBackground
                            hideCheckmark
                            label="Add to Calendar"
                            lightMode="bodyScheme"
                          />
                        </Box>
                      </Grid>

                      <Grid
                        item
                        sx={{
                          width: {
                            xs: '100%',
                            sm: '300px',
                          },
                        }}
                      >
                        <Button
                          startIcon={<EventRepeatOutlinedIcon />}
                          sx={{
                            width: '100%',
                            height: '45px',
                            padding: '8px 24px',
                            gap: '10px',
                            opacity: 1,
                            marginTop: {
                              xs: '0.5rem',
                              sm: '1rem',
                            },
                            '@media (max-width: 600px)': {
                              width: '100%',
                            },
                          }}
                          onClick={() =>
                            handleReschedule(appt.clinician?.id!, appt.id!)
                          }
                          disabled={!appt.clinician?.id}
                        >
                          Reschedule Appointment
                        </Button>
                      </Grid>

                      <Grid
                        item
                        sx={{
                          width: {
                            xs: '100%',
                            sm: '280px',
                          },
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<EventRepeatOutlinedIcon />}
                          sx={{
                            width: '100%',
                            height: '45px',
                            padding: '8px 24px',
                            gap: '10px',
                            opacity: 1,
                            marginTop: {
                              xs: '0.5rem',
                              sm: '1rem',
                            },
                            '@media (max-width: 600px)': {
                              width: '100%',
                            },
                          }}
                          onClick={() => handleCancel(appt.id!)}
                        >
                          Cancel Appointment
                        </Button>
                      </Grid>
                    </Grid>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        </>
      )}

      {pastAppointments?.length > 0 && (
        <>
          <Typography
            variant="h2"
            width="80%"
            marginLeft="auto"
            marginRight="auto"
          >
            {pastAppointments.length === 1
              ? 'Past Appointment'
              : 'Past Appointments'}
          </Typography>
          <Stack gap={3}>
            {pastAppointments.map((appt: ApptProps) => {
              const startTimeRaw = parseAndValidateDate(appt.starts_at);
              const duration = appt.duration || 30;
              const endTimeRaw = startTimeRaw
                ? addMinutes(startTimeRaw, duration)
                : null;

              const startTime = startTimeRaw ? new Date(startTimeRaw) : null;
              const endTime = endTimeRaw ? new Date(endTimeRaw) : null;

              const startTimeFormatted = startTime
                ? format(startTime, 'h:mm a')
                : null;
              const endTimeFormatted = endTime
                ? format(endTime, 'h:mm a z')
                : null;

              const clinicianProfile = appt.clinician?.profiles;

              return (
                <Box
                  key={appt.id ?? ''}
                  sx={{
                    backgroundColor: '#F4F9F4',
                    borderRadius: 2,
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    width: '80%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <Grid
                    sx={{
                      mb: 2,
                      '@media (min-width: 600px)': {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingLeft: 3,
                        paddingRight: 3,
                      },
                      '@media (max-width: 599px)': {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        justifyContent: 'space-between',
                        flexGrow: 1,
                      },
                    }}
                  >
                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.5 20C9.7 20 8.16667 19.3667 6.9 18.1C5.63333 16.8333 5 15.3 5 13.5V12.925C3.56667 12.6917 2.375 12.0208 1.425 10.9125C0.475 9.80417 0 8.5 0 7V1H3V0H5V4H3V3H2V7C2 8.1 2.39167 9.04167 3.175 9.825C3.95833 10.6083 4.9 11 6 11C7.1 11 8.04167 10.6083 8.825 9.825C9.60833 9.04167 10 8.1 10 7V3H9V4H7V0H9V1H12V7C12 8.5 11.525 9.80417 10.575 10.9125C9.625 12.0208 8.43333 12.6917 7 12.925V13.5C7 14.75 7.4375 15.8125 8.3125 16.6875C9.1875 17.5625 10.25 18 11.5 18C12.75 18 13.8125 17.5625 14.6875 16.6875C15.5625 15.8125 16 14.75 16 13.5V11.825C15.4167 11.625 14.9375 11.2667 14.5625 10.75C14.1875 10.2333 14 9.65 14 9C14 8.16667 14.2917 7.45833 14.875 6.875C15.4583 6.29167 16.1667 6 17 6C17.8333 6 18.5417 6.29167 19.125 6.875C19.7083 7.45833 20 8.16667 20 9C20 9.65 19.8125 10.2333 19.4375 10.75C19.0625 11.2667 18.5833 11.625 18 11.825V13.5C18 15.3 17.3667 16.8333 16.1 18.1C14.8333 19.3667 13.3 20 11.5 20ZM17 10C17.2833 10 17.5208 9.90417 17.7125 9.7125C17.9042 9.52083 18 9.28333 18 9C18 8.71667 17.9042 8.47917 17.7125 8.2875C17.5208 8.09583 17.2833 8 17 8C16.7167 8 16.4792 8.09583 16.2875 8.2875C16.0958 8.47917 16 8.71667 16 9C16 9.28333 16.0958 9.52083 16.2875 9.7125C16.4792 9.90417 16.7167 10 17 10Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} PROVIDER
                      </CustomText>
                      <CustomText
                        sx={{
                          color: '#0B541D',
                          fontSize: '1.1rem !important',
                          fontWeight: 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          textDecoration: 'underline',
                          marginLeft: 3,
                        }}
                      >
                        <Image
                          src={
                            clinicianProfile?.avatar_url ||
                            '/favicon_cream_black_256x256.png'
                          }
                          alt="avatar"
                          width={30}
                          height={30}
                          style={{
                            borderRadius: '50%',
                            border: '2px solid #0B541D',
                            marginTop: 1,
                          }}
                        />
                        {clinicianProfile
                          ? `${clinicianProfile.first_name} ${clinicianProfile.last_name}`
                          : 'Unknown Provider'}
                      </CustomText>
                    </Grid>

                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 10.45 19.975 10.8917 19.925 11.325C19.875 11.7583 19.7917 12.1833 19.675 12.6C19.4417 12.3333 19.1708 12.1083 18.8625 11.925C18.5542 11.7417 18.2167 11.6167 17.85 11.55C17.9 11.3 17.9375 11.0458 17.9625 10.7875C17.9875 10.5292 18 10.2667 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18C10.85 18 11.6625 17.875 12.4375 17.625C13.2125 17.375 13.925 17.025 14.575 16.575C14.775 16.8583 15.0208 17.1083 15.3125 17.325C15.6042 17.5417 15.9167 17.7083 16.25 17.825C15.4 18.5083 14.4458 19.0417 13.3875 19.425C12.3292 19.8083 11.2 20 10 20ZM17.25 16C16.9 16 16.6042 15.8792 16.3625 15.6375C16.1208 15.3958 16 15.1 16 14.75C16 14.4 16.1208 14.1042 16.3625 13.8625C16.6042 13.6208 16.9 13.5 17.25 13.5C17.6 13.5 17.8958 13.6208 18.1375 13.8625C18.3792 14.1042 18.5 14.4 18.5 14.75C18.5 15.1 18.3792 15.3958 18.1375 15.6375C17.8958 15.8792 17.6 16 17.25 16ZM13.3 14.7L9 10.4V5H11V9.6L14.7 13.3L13.3 14.7Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} TIME
                      </CustomText>
                      {startTime && startTimeFormatted ? (
                        <>
                          <CustomText
                            sx={{
                              color: '#4F4F4F',
                              marginTop: {
                                xs: 0,
                                sm: 1,
                              },
                              marginLeft: 3,
                            }}
                          >
                            {format(startTime, 'MM/dd/yyyy')}
                          </CustomText>
                          {endTime && endTimeFormatted && (
                            <CustomText
                              sx={{
                                color: '#4F4F4F',
                                marginLeft: 3,
                              }}
                            >
                              {`${startTimeFormatted} - ${endTimeFormatted}`}
                            </CustomText>
                          )}
                        </>
                      ) : (
                        <CustomText
                          sx={{
                            color: '#4F4F4F',
                            marginTop: {
                              xs: 0,
                              sm: 1,
                            },
                            marginLeft: 3,
                          }}
                        >
                          Time not available
                        </CustomText>
                      )}
                    </Grid>

                    <Grid item xs={4}>
                      <CustomText fontWeight={700} sx={{ color: '#0B541D' }}>
                        <svg
                          width="18"
                          height="20"
                          viewBox="0 0 18 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.95 16.35L4.4 12.8L5.85 11.35L7.95 13.45L12.15 9.25L13.6 10.7L7.95 16.35ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6Z"
                            fill="#0B541D"
                          />
                        </svg>
                        {'  '} APPOINTMENT TYPE
                      </CustomText>
                      <CustomText
                        sx={{
                          color: '#4F4F4F',
                          marginTop: { xs: 0, sm: 1 },
                          marginLeft: 3,
                          marginBottom: { xs: 0 },
                        }}
                      >
                        {getAppointmentType(appt.care)}
                      </CustomText>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      '@media (max-width: 600px)': {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      disabled
                      sx={{
                        width: '140px',
                        fontSize: '16px',
                        height: '45px',
                        gap: '10px',
                        marginTop: {
                          xs: '0.5rem',
                          sm: '1rem',
                        },
                        cursor: 'default',
                        pointerEvents: 'none',
                        '&.Mui-disabled': {
                          opacity: 1,
                          backgroundColor: '#0B541D',
                          color: 'white',
                        },
                        '@media (max-width: 600px)': {
                          width: '100%!important',
                          display: 'flex',
                          justifyContent: 'center',
                          marginTop: '1rem',
                          marginLeft: '0.5rem',
                        },
                      }}
                    >
                      {appt.status === 'Cancelled' ? 'CANCELLED' : 'COMPLETED'}
                    </Button>
                  </Grid>
                </Box>
              );
            })}
          </Stack>
        </>
      )}

      {upcomingAppointments?.length === 0 && pastAppointments?.length === 0 && (
        <Typography>No appointments available at the moment.</Typography>
      )}

      <Footer />
    </Stack>
  );
};

AppointmentsPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default AppointmentsPage;
