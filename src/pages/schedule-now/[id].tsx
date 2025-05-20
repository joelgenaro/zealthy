import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import Loading from '@/components/shared/Loading/Loading';
import OneTimeScheduleVisit from '@/components/screens/OneTimeScheduleVisit';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { usePatient } from '@/components/hooks/data';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { ErrorOutline } from '@mui/icons-material';
import { Pathnames } from '@/types/pathnames';
import { useResetValues } from '@/components/hooks/useResetValues';

const ScheduleNowPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: patient } = usePatient();
  const resetValues = useResetValues();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clinician, setClinician] = useState<number>();
  const [duration, setDuration] = useState<number>();

  async function fetchSingleUseAppointment() {
    resetValues();
    const { data, error } = await supabase
      .from('single_use_appointment')
      .select('*')
      .eq('id', id!)
      .eq('used', false)
      .single();

    if (error || !data) {
      setError(true);
    } else {
      if (data?.patient !== patient?.id) {
        setError(true);
      } else {
        setClinician(data.clinician);
        if (data.duration) {
          setDuration(data.duration);
        }
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
    } else if (patient) {
      fetchSingleUseAppointment();
    }
  }, [id, patient]);

  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <Box alignItems="center">
        {loading ? (
          <Loading />
        ) : error ? (
          <Container>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <ErrorOutline fontSize="large" />
              <Typography>Oops! This scheduling link is invalid.</Typography>
              <Typography>
                Please{' '}
                <Link href={Pathnames.MESSAGES}>contact your care team</Link>{' '}
                for a new link.
              </Typography>
            </Stack>
          </Container>
        ) : (
          clinician &&
          duration && (
            <OneTimeScheduleVisit
              clinician_id={clinician}
              duration={duration}
            />
          )
        )}
      </Box>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleNowPage.getLayout = (page: ReactElement) => (
  <DefaultNavLayout>{page}</DefaultNavLayout>
);

export default ScheduleNowPage;
