import Head from 'next/head';
import { ReactElement, useCallback, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import { Button, Container, Stack, Typography } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useLiveVisitAvailability } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useILV } from '@/context/ILVContextProvider';
import ILVModal from '@/components/shared/ILVModal';
import { Database } from '@/lib/database.types';

type Appointment = Database['public']['Tables']['appointment']['Row'];

const LiveVisitPage = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: availability } = useLiveVisitAvailability();
  const { request, requestILV, cancelRequest } = useILV();

  const onSchedule = useCallback(() => {
    Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT);
  }, []);

  const createRequest = useCallback(async () => {
    setLoading(true);
    requestILV().then(() => {
      setLoading(false);
      setOpen(true);
    });
  }, [requestILV]);

  const onNext = useCallback(() => {
    Router.push(Pathnames.PATIENT_PORTAL);
  }, []);

  const cancelRequestAndNext = async (request: Appointment) => {
    cancelRequest(request).then(() => {
      onNext();
    });
  };

  return (
    <>
      <Head>
        <title>Live Visit | Zealthy</title>
      </Head>
      <Container maxWidth="md">
        <Stack gap={isMobile ? 4 : 6}>
          <Typography variant="h2" textAlign="center">
            Let’s get you connected with a Zealthy Care Team medical provider
          </Typography>
          {availability?.available ? (
            <Stack
              borderRadius="12px"
              border="1px solid #535353"
              padding="24px 48px"
              gap="32px"
              alignItems="center"
              position="relative"
            >
              <Typography
                position="absolute"
                bgcolor="#00531B"
                borderRadius="12px"
                padding={'2px 16px'}
                color="white"
                fontWeight={600}
                top="-12px"
                left="12px"
              >
                Most popular
              </Typography>
              <Typography variant="h3">
                Meet with a provider via video now
              </Typography>
              <Typography textAlign="center">
                Click below to talk with a provider now. This is a video visit
                with a medical provider, so if you have questions about billing,
                shipping statuses, or other inquiries unrelated to your medical
                care, call us at (877) 870-0323 instead.
              </Typography>
              <LoadingButton
                loading={loading}
                onClick={createRequest}
                sx={{ maxWidth: '400px' }}
                disabled={loading}
              >
                Complete video visit
              </LoadingButton>
              {availability?.estimatedWaitTime ? (
                <Typography>{`Current Estimated Wait Time: ${availability.estimatedWaitTime} Min`}</Typography>
              ) : null}
            </Stack>
          ) : null}
          {availability?.estimatedWaitTime &&
          availability.estimatedWaitTime <= 15 ? null : (
            <Stack
              borderRadius="12px"
              border="1px solid #535353"
              padding="24px 48px"
              gap="32px"
              alignItems="center"
            >
              <Typography variant="h3">Schedule your Consult</Typography>
              <Typography textAlign="center">
                Schedule your video visit with your care team medical provider.
              </Typography>
              <Button sx={{ maxWidth: '400px' }} onClick={onSchedule}>
                Schedule Consult
              </Button>
            </Stack>
          )}
        </Stack>
      </Container>
      <Footer />
      {request ? (
        <ILVModal
          open={open}
          setOpen={setOpen}
          request={request}
          onLeave={cancelRequestAndNext}
          onNext={onNext}
        />
      ) : null}
    </>
  );
};

export const getServerSideProps = getAuthProps;

LiveVisitPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default LiveVisitPage;
