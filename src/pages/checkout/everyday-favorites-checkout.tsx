import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import EverydayFavoritesCheckout from '@/components/screens/Checkout/EverydayFavoritesCheckout';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';

const EverydayFavoritesCheckoutPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Checkout</title>
      </Head>
      <EverydayFavoritesCheckout />
    </>
  );
};

export const getServerSideProps = getAuthProps;

EverydayFavoritesCheckoutPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default EverydayFavoritesCheckoutPage;
