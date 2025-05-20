import Head from 'next/head';
import { ReactElement } from 'react';
import InsuranceForm from '@/components/shared/InsuranceUpdate/InsuranceForm';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import { Database } from '@/lib/database.types';

interface VerifyInsuranceInputProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const VerifyInsuranceInput = ({ patient }: VerifyInsuranceInputProps) => {
  return (
    <>
      <Head>
        <title>Verify Insurance | Patient Portal | Zealthy</title>
      </Head>
      <InsuranceForm
        patient={patient}
        title="Double-check your captured insurance info."
        description="This will only take a minute of your time."
      />
    </>
  );
};

export const getServerSideProps = getAuthProps;

VerifyInsuranceInput.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default VerifyInsuranceInput;
