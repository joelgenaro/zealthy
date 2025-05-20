import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { ReactElement } from 'react';
import { getUnauthProps } from '@/lib/auth';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Container from '@mui/material/Container';

const RegionUnsupported = () => {
  return (
    <>
      <Head>
        <title>Zealthy | ED | Region Unsupported</title>
      </Head>
      <RegionUnsupportedMessage />
    </>
  );
};

export const RegionUnsupportedMessage = () => {
  return (
    <Container maxWidth="sm">
      <VisitMessage
        title="Unfortunately, Zealthy isn’t available in your state yet."
        body="We can’t provide you with medical care at this time. Zealthy will email you once we become available in your state."
        captionText="You’re not eligible"
      />
    </Container>
  );
};

export const getServerSideProps = getUnauthProps;

RegionUnsupported.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default RegionUnsupported;
