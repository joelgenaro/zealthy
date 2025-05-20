import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import FitnessNutritionPlan from '@/components/screens/FitnessNutritionPlan';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';

const FitnessNutritionPlanPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Accountability Partner</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <FitnessNutritionPlan />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

FitnessNutritionPlanPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default FitnessNutritionPlanPage;
