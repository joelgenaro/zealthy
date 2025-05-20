import Head from 'next/head';
import { getPatientPortalProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useCallback } from 'react';
import Footer from '@/components/shared/layout/Footer';
import HeightWeightBase from '@/components/shared/HeightWeightBase';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useQueryClient } from 'react-query';

interface HeightWeightScreenProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const HeightWeightScreen = ({ patient }: HeightWeightScreenProps) => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(async () => {
    await supabase
      .from('patient_action_item')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('type', 'MISSING_HEIGHT_WEIGHT')
      .eq('patient_id', patient.id);

    queryClient.invalidateQueries('actionItems');

    Router.push(Pathnames.PATIENT_PORTAL);
  }, [patient.id, queryClient, supabase]);

  return (
    <>
      <Head>
        <title>Zealthy | Height Weight</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <HeightWeightBase maxWeight={Infinity} onSuccess={onSuccess} />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getPatientPortalProps;

HeightWeightScreen.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default HeightWeightScreen;
