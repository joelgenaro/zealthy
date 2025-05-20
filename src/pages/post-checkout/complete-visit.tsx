import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactElement, Suspense } from 'react';
import { Database } from '@/lib/database.types';
import { getPostCheckoutAuth } from '@/lib/auth';
import Container from '@mui/material/Container';
import Loading from '@/components/shared/Loading/Loading';

// Dynamically import the CompleteVisit component
const CompleteVisit = dynamic(
  () => import('@/components/shared/CompleteVisit'),
  {
    loading: () => <Loading />,
    ssr: false, // Disable SSR for this component since it relies on client-side data
  }
);

// Dynamically import the layout
const OnboardingLayout = dynamic(() => import('@/layouts/OnboardingLayout'), {
  loading: () => <Loading />,
  ssr: true,
});

interface CompleteVisitProps {
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

const CompleteVisitPage = ({ patient, profile }: CompleteVisitProps) => {
  return (
    <>
      <Head>
        <title>Zealthy</title>
        {/* Add preconnect for any third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Add meta description for SEO */}
        <meta name="description" content="Complete your visit on Zealthy" />
      </Head>
      <Container maxWidth="sm">
        <Suspense fallback={<Loading />}>
          <CompleteVisit patient={patient} profile={profile} />
        </Suspense>
      </Container>
    </>
  );
};

export const getServerSideProps = getPostCheckoutAuth;

CompleteVisitPage.getLayout = (page: ReactElement) => {
  return (
    <Suspense fallback={<Loading />}>
      <OnboardingLayout>{page}</OnboardingLayout>
    </Suspense>
  );
};

export default CompleteVisitPage;
