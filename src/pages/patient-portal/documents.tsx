import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { User } from '@supabase/supabase-js';
import DocumentsUpload from '@/components/screens/PatientPortal/components/DocumentsUpload';
import Footer from '@/components/shared/layout/Footer';

interface SessionUserProps {
  sessionUser: User;
}
const PatientProfile = ({ sessionUser }: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>My Documents | Zealthy</title>
      </Head>
      <DocumentsUpload />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

PatientProfile.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PatientProfile;
