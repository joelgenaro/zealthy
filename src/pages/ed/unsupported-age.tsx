import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { ReactElement } from 'react';
import { getUnauthProps } from '@/lib/auth';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Container from '@mui/material/Container';

const AgeUnsupported = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Age Unsupported</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage
          title="Unfortunately, Zealthy can’t provide you with care at this time."
          body="We’re only available to patients 18 years of age or older. Please check back with us once you meet the threshold."
          captionText="You’re not eligible"
        />
      </Container>
    </>
  );
};

export const getServerSideProps = getUnauthProps;

AgeUnsupported.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AgeUnsupported;
