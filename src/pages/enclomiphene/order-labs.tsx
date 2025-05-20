import LabKitOrder from '@/components/screens/EnclomipheneLabKitOrder/LabKitOrder';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import { ReactElement } from 'react';

const EnclomipheneLabKitOrderPage = () => {
  return <LabKitOrder />;
};

export const getServerSideProps = getAuthProps;

EnclomipheneLabKitOrderPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default EnclomipheneLabKitOrderPage;
