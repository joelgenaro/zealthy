import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { Container } from '@mui/material';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePatient } from '@/components/hooks/data';
import getConfig from '../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const ProgramUnsupported = () => {
  const { removeSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient();

  const removeEncloOnlineVisit = async () =>
    await supabase
      .from('online_visit')
      .update({ status: 'Canceled' })
      .eq('patient_id', patient?.id)
      .eq('specific_care', 'Enclomiphene');

  removeSpecificCare();
  resetQuestionnaires();
  removeEncloOnlineVisit();

  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Program Unsupported</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage
          title="This program is not yet available in your state."
          body=""
          captionText="You're not eligible"
        />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ProgramUnsupported.getLayout = (page: ReactElement) => (
  <OnboardingLayout
    back={
      ['Zealthy', 'FitRx'].includes(siteName ?? '')
        ? Pathnames.REGION_SCREEN
        : Pathnames.REGION_SCREEN_ZP
    }
  >
    {page}
  </OnboardingLayout>
);

export default ProgramUnsupported;
