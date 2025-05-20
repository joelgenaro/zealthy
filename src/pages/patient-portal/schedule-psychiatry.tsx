import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import SchedulePsychiatry from '@/components/screens/PatientPortal/components/SchedulePsychiatry';
import Gap from '@/components/shared/layout/Gap';

const SchedulePsychiatryPage = () => {
  return (
    <Container maxWidth="lg">
      <SchedulePsychiatry />
      <Gap />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

SchedulePsychiatryPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default SchedulePsychiatryPage;
