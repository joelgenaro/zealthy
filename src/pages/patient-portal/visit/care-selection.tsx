import Head from 'next/head';
import { ReactElement } from 'react';
import VisitSelection from '@/components/screens/VisitSelection';
import { getAuthProps } from '@/lib/auth';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import MentalHealthVisitSelection from '@/components/screens/VisitSelection/MentalHealthVisitSelection';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import { usePatient } from '@/components/hooks/data';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const CareSelection = () => {
  const { specificCare } = useIntakeState();
  const patient = usePatient();

  if (
    specificCare &&
    specificCare === SpecificCareOption.ENCLOMIPHENE &&
    patient?.data?.region === 'CA'
  ) {
    Router.push(
      `${Pathnames.UNSUPPORTED_PROGRAM}?care=${SpecificCareOption.ENCLOMIPHENE}`
    );
  }

  return (
    <>
      <Head>
        <title>How can we help you today? | Zealthy</title>
      </Head>
      {specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ? (
        <MentalHealthVisitSelection />
      ) : (
        <VisitSelection />
      )}
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

CareSelection.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default CareSelection;
