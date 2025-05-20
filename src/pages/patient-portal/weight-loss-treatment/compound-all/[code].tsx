import { Container, Link, Stack, Typography } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect, useState } from 'react';
import Footer from '@/components/shared/layout/Footer';
import Loading from '@/components/shared/Loading/Loading';
import { ErrorOutline } from '@mui/icons-material';
import { Pathnames } from '@/types/pathnames';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useRouter } from 'next/router';
import { usePatient } from '@/components/hooks/data';
import { differenceInDays } from 'date-fns';
import CompoundWeightLossRefillTreatment from '@/components/screens/Question/components/CompoundWeightLossRefillTreatment';

const WeightLossTreatmentPage = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { code } = router.query;
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSingleUseCode() {
    const { data, error } = await supabase
      .from('single_use_appointment')
      .select('*')
      .eq('id', code!)
      .eq('used', false)
      .single();

    if (error || !data) {
      setError(true);
    } else {
      if (data?.patient !== patient?.id) {
        setError(true);
      }
      // if created_at is more than 10 days ago then setError to true
      const createdAt = new Date(data.created_at);
      const diff = differenceInDays(new Date(), createdAt);
      if (diff > 10) {
        setError(true);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError(true);
    } else if (patient) {
      fetchSingleUseCode();
    }
  }, [code, patient]);

  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Treatments</title>
        </Head>
        {loading ? (
          <Loading />
        ) : error ? (
          <Container>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <ErrorOutline fontSize="large" />
              <Typography>Oops! This link is invalid or expired.</Typography>
              <Typography>
                If you still need help, please{' '}
                <Link href={Pathnames.MESSAGES}>contact your care team</Link>{' '}
                for a new link.
              </Typography>
            </Stack>
          </Container>
        ) : (
          <CompoundWeightLossRefillTreatment
            nextPage={() => router.push(Pathnames.PATIENT_PORTAL)}
          />
        )}
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossTreatmentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossTreatmentPage;
