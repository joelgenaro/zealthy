import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import ScheduleWeightLoss from '@/components/screens/PatientPortal/components/ScheduleWeightLoss';

const ScheduleWeightLossPage = () => {
  return (
    <Container maxWidth="lg">
      <ScheduleWeightLoss />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

ScheduleWeightLossPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ScheduleWeightLossPage;
