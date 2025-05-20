import { QuestionWithName } from '@/types/questionnaire';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import Head from 'next/head';
import { useCallback, useState, useEffect } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useLiveVisitAvailability,
  usePatient,
  useAllPatientPrescriptionRequest,
} from '@/components/hooks/data';
import { useILV } from '@/context/ILVContextProvider';
import { Database } from '@/lib/database.types';
import useCountDown from '@/utils/hooks/useCountdown';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

type Appointment = Database['public']['Tables']['appointment']['Row'];

interface FreeConsultSelectionProps {
  onClick: (nextPage?: string) => void;
  question: QuestionWithName;
}

const FreeConsultSelection = ({
  onClick,
  question,
}: FreeConsultSelectionProps) => {
  const supabase = useSupabaseClient<Database>();
  const { data: availability, status } = useLiveVisitAvailability();
  const { request, requestILV, cancelRequest } = useILV();
  const { data: patient } = usePatient();
  const { data: prescriptionRequests } = useAllPatientPrescriptionRequest();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const countDown = useCountDown(null, availability?.estimatedWaitTime || null);
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: question.questionnaire,
    answerOptions: question.answerOptions,
  });

  const dummyPrescriptionRequest = prescriptionRequests?.find(
    r => r.note === 'Approve or Deny, DO NOT PRESCRIBE'
  );

  const handleCompleteIlv = () => {
    submitSingleSelectAnswer(question?.answerOptions?.[0]!);
    return onClick();
  };

  const handleInitialConsult = () => {
    submitSingleSelectAnswer(question?.answerOptions?.[1]!);
    return onClick();
  };

  const createRequest = useCallback(async () => {
    setLoading(true);
    requestILV();
    setRequested(true);

    await supabase.from('prescription_request').insert({
      patient_id: patient?.id,
      status: 'REQUESTED',
      note: 'Approve or Deny, DO NOT PRESCRIBE',
      specific_medication:
        'Approve or Deny 3 Month Jumpstart For New Patient on the ILV Call',
      charge: false,
    });
  }, [requestILV]);

  const onNext = useCallback(() => {
    Router.push(Pathnames.PATIENT_PORTAL);
  }, []);

  // const cancelRequestAndNext = async (request: Appointment) => {
  //   cancelRequest(request).then(() => {
  //     onNext();
  //   });
  // };

  useEffect(() => {
    const triggerRequest = async () => {
      if (
        availability?.available &&
        status === 'success' &&
        !requested &&
        patient?.id
      ) {
        await createRequest();
        if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
          window?.freshpaint?.track('wl-free-consult-ilv-waiting-room');
        }
      }
    };

    triggerRequest();
  }, [availability?.available, requested, status, patient?.id]);

  useEffect(() => {
    if (
      request &&
      request.status === 'Completed' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
      dummyPrescriptionRequest?.status === 'APPROVED'
    ) {
      return window.freshpaint.track(
        'wl-free-consult-time-to-build-your-order-ilv'
      );
    }
  }, [request, dummyPrescriptionRequest]);

  return (
    <>
      <Head>
        <title>Live Visit | Zealthy</title>
      </Head>

      {availability?.available && request?.status !== 'Completed' ? (
        <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
            }}
          >
            You&apos;re now in the waiting room to see a Zealthy provider!
          </Typography>
          <Typography marginY={3}>
            While waiting for Zealthy to match you with a provider for your
            visit, you can verify your ID and answer some required clinical
            questions.
          </Typography>
          <Box
            border="1px solid lightgrey"
            borderRadius={5}
            boxShadow={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="25px"
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Gelasio, serif',
                fontWeight: 'bold',
              }}
            >
              Expected Wait Time:
            </Typography>
            {availability?.estimatedWaitTime && requested ? (
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Gelasio, serif',
                  fontWeight: 'bold',
                }}
              >{` ${countDown} Minutes`}</Typography>
            ) : null}
            <Box
              component="img"
              src="/images/free-consult/people.png"
              alt="people"
              sx={{ height: 50, my: 2 }}
            />
            <Typography textAlign="center">
              Zealthy appreciates your patience, and we can&apos;t wait to meet
              with you.
            </Typography>
          </Box>
          {request && request.status === 'Confirmed' && request.clinician_id ? (
            <Button
              target="_blank"
              href={`/visit/room/${request?.daily_room ?? ''}?appointment=${
                request?.id
              }`}
              fullWidth
              sx={{ marginTop: 5 }}
            >
              Talk with Provider now
            </Button>
          ) : null}
        </Container>
      ) : null}

      {(availability?.estimatedWaitTime &&
        availability.estimatedWaitTime <= 15) ||
      request?.status === 'Completed' ? null : (
        <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
            }}
          >
            Welcome to Zealthy
          </Typography>
          <Typography marginY={3}>
            Congratulations! Let’s get you connected with a Zealthy Care Team
            medical provider.
          </Typography>
          <Box
            border="1px solid lightgrey"
            borderRadius={5}
            boxShadow={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="25px"
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Gelasio, serif',
                fontWeight: 'bold',
              }}
            >
              Schedule your consult
            </Typography>
            <Box
              component="img"
              src="/images/free-consult/people.png"
              alt="people"
              sx={{ height: 50, my: 2 }}
            />
            <Typography textAlign="center">
              Schedule your video visit with your care team medical provider.
            </Typography>
          </Box>
          <Button
            fullWidth
            onClick={handleInitialConsult}
            sx={{ marginTop: 5 }}
          >
            Continue
          </Button>
        </Container>
      )}
      {request && request.status === 'Completed' ? (
        <Container maxWidth={false} disableGutters sx={{ width: '100%' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
            }}
          >
            Congrats!
          </Typography>
          <Typography marginY={3}>
            You have officially completed you&apos;re in-person live visit.
          </Typography>
          <Box
            border="1px solid lightgrey"
            borderRadius={5}
            boxShadow={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="25px"
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Gelasio, serif',
                fontWeight: 'bold',
              }}
            >
              Ready to continue?
            </Typography>
            <Box
              component="img"
              src="/images/free-consult/people.png"
              alt="people"
              sx={{ height: 50, my: 2 }}
            />
            <Typography textAlign="center">
              Press the button below to continue to the next steps!
            </Typography>
          </Box>
          <Button fullWidth onClick={handleCompleteIlv} sx={{ marginTop: 5 }}>
            Continue
          </Button>
        </Container>
      ) : null}
    </>
  );
};

export default FreeConsultSelection;
