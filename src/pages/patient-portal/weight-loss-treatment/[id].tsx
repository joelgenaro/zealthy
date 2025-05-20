import Container from '@mui/material/Container';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import WeightLossTreatment from '@/components/screens/WeightLossTreatment';
import WeightLossTreatmentVariant from '@/components/screens/WeightLossTreatment/WeightLossTreatment-variant';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import Footer from '@/components/shared/layout/Footer';
import {
  usePatient,
  usePatientSubscriptionByName,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import Router from 'next/router';

export const SEMAGLUTIDE_BUNDLE_PRICE = 297;
export const ORAL_SEMAGLUTIDE_BUNDLE_PRICE = 249;
export const TIRZEPATIDE_BUNDLE_PRICE = 449;

const WeightLossTreatmentPage = () => {
  const { data: patient } = usePatient();
  const { data: patientSubscription } = usePatientSubscriptionByName(
    'Zealthy 3-Month Weight Loss [IN]'
  );
  const { data: weightLossSubscription } = useWeightLossSubscription();

  useEffect(() => {
    const bundledUrl: string = '/patient-portal/weight-loss-treatment/bundled/';
    if (weightLossSubscription && weightLossSubscription.price) {
      // Go to correct bundled link
      if (weightLossSubscription.price === SEMAGLUTIDE_BUNDLE_PRICE) {
        Router.push({ pathname: bundledUrl + 'Semaglutide' });
      } else if (
        weightLossSubscription.price === ORAL_SEMAGLUTIDE_BUNDLE_PRICE
      ) {
        Router.push({ pathname: bundledUrl + 'Oral Semaglutide' });
      } else if (weightLossSubscription.price === TIRZEPATIDE_BUNDLE_PRICE) {
        Router.push({ pathname: bundledUrl + 'Tirzepatide' });
      }
    }
  }, [weightLossSubscription]);

  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Treatments</title>
        </Head>
        {patient?.region === 'IN' && patientSubscription?.reference_id ? (
          <WeightLossTreatmentVariant />
        ) : (
          <WeightLossTreatment />
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
