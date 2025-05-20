import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { MedicationAddOn } from '@/components/shared/AddOnPayment';
import Footer from '@/components/shared/layout/Footer';
import { useRouter } from 'next/router';
import { useFlowState } from '@/components/hooks/useFlow';
import Spinner from '@/components/shared/Loading/Spinner';
import { Pathnames } from '@/types/pathnames';
import { useAnswerState } from '@/components/hooks/useAnswer';

const MedicationAddOnPage = () => {
  const router = useRouter();
  const { currentFlow } = useFlowState();
  const [loading, setLoading] = useState<boolean>(false);
  const answers = useAnswerState();
  useEffect(() => {
    setLoading(true);
    if (!router) return;
    if (
      currentFlow === 'enclomiphene-prescription-renewal' ||
      currentFlow === 'menopause-refill' ||
      currentFlow === 'sleep-prescription-renewal' ||
      currentFlow === 'bc-prescription-renewal' ||
      currentFlow === 'mhl-prescription-renewal' ||
      currentFlow === 'fhl-prescription-renewal' ||
      currentFlow === 'preworkout-renewal' ||
      currentFlow === 'edhl-prescription-renewal' ||
      (currentFlow === 'ed-prescription-renewal' &&
        answers['ED_RENEWAL_Q9'].answer[0].valueCoding.code !==
          'ED_RENEWAL_Q9_A2')
    ) {
      router.replace(Pathnames.CHECKOUT_CREATE_SUBSCRIPTIONS);
    } else if (
      currentFlow === 'ed-prescription-renewal' &&
      answers['ED_RENEWAL_Q9'].answer[0].valueCoding.code === 'ED_RENEWAL_Q9_A2'
    ) {
      router.replace('/checkout');
    } else {
      setLoading(false);
    }
  }, [currentFlow, router, answers]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <Head>
        <title>Checkout | Zealthy</title>
      </Head>
      <MedicationAddOn />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

MedicationAddOnPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default MedicationAddOnPage;
