import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import WeightLossTreatmentBundled from '@/components/screens/WeightLossTreatmentBundled';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { useWeightLossSubscription } from '@/components/hooks/data';
import {
  SEMAGLUTIDE_BUNDLE_PRICE,
  ORAL_SEMAGLUTIDE_BUNDLE_PRICE,
  TIRZEPATIDE_BUNDLE_PRICE,
} from '../[id]';
import { Pathnames } from '@/types/pathnames';

const WeightLossTreatmentBundledPage = () => {
  const { data: weightLossSubscription }: any = useWeightLossSubscription();
  const router = useRouter();

  useEffect(() => {
    const unbundledUrl = Pathnames.WL_NONBUNDLED_TREATMENT;
    const bundledUrl = Pathnames.WL_BUNDLED_TREATMENT;
    const med = router.query.med;

    // If not bundled
    if (
      weightLossSubscription &&
      weightLossSubscription?.price &&
      ![
        SEMAGLUTIDE_BUNDLE_PRICE,
        ORAL_SEMAGLUTIDE_BUNDLE_PRICE,
        TIRZEPATIDE_BUNDLE_PRICE,
      ].includes(weightLossSubscription.price)
    ) {
      // Go to unbundled URL
      Router.push({ pathname: unbundledUrl });
    }

    // If on bundled link that corresponds to med NOT bundled with
    // Go to correct bundled link
    else if (weightLossSubscription && weightLossSubscription?.price) {
      if (
        weightLossSubscription.price === SEMAGLUTIDE_BUNDLE_PRICE &&
        med !== 'Semaglutide'
      ) {
        Router.push({ pathname: bundledUrl + 'Semaglutide' });
      } else if (
        weightLossSubscription.price === ORAL_SEMAGLUTIDE_BUNDLE_PRICE &&
        med !== 'Oral Semaglutide'
      ) {
        Router.push({ pathname: bundledUrl + 'Oral Semaglutide' });
      } else if (
        weightLossSubscription.price === TIRZEPATIDE_BUNDLE_PRICE &&
        med !== 'Tirzepatide'
      ) {
        Router.push({ pathname: bundledUrl + 'Tirzepatide' });
      }
    }

    // If not on weight loss subscription
    else if (weightLossSubscription === null) {
      // Go to unbundled URL
      Router.push({ pathname: unbundledUrl });
    }
  }, [weightLossSubscription, router.query]);

  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Bundled Treatments</title>
        </Head>
        <WeightLossTreatmentBundled />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossTreatmentBundledPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossTreatmentBundledPage;
