import { useLiveVisitAvailability } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';

import Spinner from '@/components/shared/Loading/Spinner';
import { Database } from '@/lib/database.types';
import { QuestionWithName } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState, useEffect } from 'react';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ILVModal from '@/components/shared/ILVModal';
import { useILV } from '@/context/ILVContextProvider';

type Appointment = Database['public']['Tables']['appointment']['Row'];

interface LiveVisitWithProviderProps {
  question: QuestionWithName;
  nextPath: (nextPage?: string) => void;
}

const LiveVisitWithProvider = ({
  question,
  nextPath,
}: LiveVisitWithProviderProps) => {
  const { data: availability, isLoading } = useLiveVisitAvailability();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { request, requestILV, cancelRequest } = useILV();

  const onNext = useCallback(() => {
    nextPath();
  }, [nextPath]);

  const cancelAndGoToNextPage = useCallback(
    async (request: Appointment) => {
      cancelRequest(request).then(() => {
        onNext();
      });
    },
    [cancelRequest, onNext]
  );

  const handleILVRequest = useCallback(() => {
    setLoading(true);
    requestILV().then(() => {
      setLoading(false);
      setOpen(true);
    });
  }, [requestILV]);

  useEffect(() => {
    if (request && request.clinician_id && request.status === 'Completed') {
      onNext();
    }
  }, [request]);

  return (
    <Container maxWidth="md">
      <Stack gap={isMobile ? 4 : 6}>
        <Typography variant="h2" textAlign="center">
          {question.header}
        </Typography>
        {isLoading && <Spinner />}
        {!isLoading && availability?.available ? (
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
              Click below to talk with a provider now.
            </Typography>
            <LoadingButton
              loading={loading}
              disabled={loading}
              onClick={handleILVRequest}
              sx={{ maxWidth: '400px' }}
            >
              Complete video visit
            </LoadingButton>
            {availability?.estimatedWaitTime ? (
              <Typography>{`Current Estimated Wait Time: ${availability.estimatedWaitTime} Min`}</Typography>
            ) : null}
          </Stack>
        ) : null}

        <Stack
          borderRadius="12px"
          border="1px solid #535353"
          padding="24px 48px"
          gap="32px"
          alignItems="center"
        >
          <Typography variant="h3" textAlign="center">
            Submit for provider to review without video visit
          </Typography>
          <Typography textAlign="center">
            Your provider will review your responses and make a clinical
            decision based on these. You may not need to complete a video visit
            in this case, but you will likely only hear back in 1-2 days (versus
            today).
          </Typography>
          <Button sx={{ maxWidth: '400px' }} onClick={onNext}>
            Submit request without video visit
          </Button>
        </Stack>
      </Stack>
      {request && open ? (
        <ILVModal
          open={open}
          setOpen={setOpen}
          request={request}
          onLeave={cancelAndGoToNextPage}
          onNext={onNext}
        />
      ) : null}
    </Container>
  );
};

export default LiveVisitWithProvider;
