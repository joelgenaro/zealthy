import Head from 'next/head';
import Router from 'next/router';
import AppointmentVerify from '@/components/screens/VideoVisit/components/AppointmentVerify';
import VisitRoom from '@/components/screens/VideoVisit/components/VisitRoom';
import { ReactElement } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getVideoVisitProps } from '@/lib/auth';
import VideoVisit from '@/components/screens/VideoVisit';

const VisitRoomScreen = () => {
  const { appointment, id } = Router.query;

  return (
    <>
      <Head>
        <title>Visit Room | Zealthy</title>
      </Head>

      <AppointmentVerify
        appointmentId={Number(appointment)}
        roomId={id as string}
      >
        <VisitRoom>
          {(status, setStatus, roomUrl, id) => (
            <VideoVisit
              status={status}
              setStatus={setStatus}
              roomId={id}
              roomUrl={roomUrl}
              appointment={appointment}
            />
          )}
        </VisitRoom>
      </AppointmentVerify>
    </>
  );
};

export const getServerSideProps = getVideoVisitProps;

VisitRoomScreen.getLayout = (page: ReactElement) => {
  return <PatientPortalNav showActionModal={false}>{page}</PatientPortalNav>;
};

export default VisitRoomScreen;
