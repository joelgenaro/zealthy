import Head from 'next/head';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getVideoVisitProps } from '@/lib/auth';
import VisitRoom, {
  VideoVisitStatus,
} from '@/components/screens/VideoVisit/components/VisitRoom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Call from '@/components/screens/VideoVisit/components/Call';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HairCheck from '@/components/screens/VideoVisit/components/HairCheck';
import Tray from '@/components/screens/VideoVisit/components/Tray';
import Router, { useRouter } from 'next/router';
import Loading from '@/components/shared/Loading/Loading';
import { useDaily, useParticipantCounts } from '@daily-co/daily-react';
import { Pathnames } from '@/types/pathnames';
import Link from 'next/link';
import { useLiveVisitAvailability } from '@/components/hooks/data';
import useCountDown from '@/utils/hooks/useCountdown';
import { StandardModal } from '@/components/shared/modals';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';

export interface UnsavedChangesDialogProps {
  shouldConfirmLeave: boolean;
}

export const UnsavedChangesDialog = ({
  shouldConfirmLeave,
}: UnsavedChangesDialogProps): React.ReactElement<UnsavedChangesDialogProps> => {
  const [shouldShowLeaveConfirmDialog, setShouldShowLeaveConfirmDialog] =
    useState(false);
  const [nextRouterPath, setNextRouterPath] = useState<string | null>(null);

  const Router = useRouter();

  const onRouteChangeStart = useCallback(
    (nextPath: string) => {
      if (!shouldConfirmLeave) {
        return;
      }

      setShouldShowLeaveConfirmDialog(true);
      setNextRouterPath(nextPath);

      throw 'cancelRouteChange';
    },
    [shouldConfirmLeave]
  );

  const onRejectRouteChange = (b: boolean) => {
    setNextRouterPath(null);
    setShouldShowLeaveConfirmDialog(false);
  };

  const onConfirmRouteChange = () => {
    setShouldShowLeaveConfirmDialog(false);
    // simply remove the listener here so that it doesn't get triggered when we push the new route.
    // This assumes that the component will be removed anyway as the route changes
    removeListener();
    nextRouterPath ? Router.push(nextRouterPath) : null;
  };

  const removeListener = useCallback(() => {
    Router.events.off('routeChangeStart', onRouteChangeStart);
  }, [Router.events, onRouteChangeStart]);

  useEffect(() => {
    Router.events.on('routeChangeStart', onRouteChangeStart);

    return removeListener;
  }, [Router.events, onRouteChangeStart, removeListener]);

  return (
    <StandardModal
      setModalOpen={onRejectRouteChange}
      modalOpen={shouldShowLeaveConfirmDialog}
    >
      <Button onClick={onConfirmRouteChange}>Confirm</Button>
    </StandardModal>
  );
};

interface NoProvidersModal {
  open: boolean;
  setOpen: (b: boolean) => void;
  onMoveOn: () => void;
}

const NoProvidersModal = ({ open, setOpen, onMoveOn }: NoProvidersModal) => {
  const { id } = Router.query;
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();

  const onGoHome = useCallback(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    supabase
      .from('appointment')
      .update({
        status: 'Cancelled',
      })
      .eq('daily_room', id)
      .throwOnError()
      .then(() => {
        Router.push(Pathnames.PATIENT_PORTAL);
      });
  }, [id, supabase]);

  return (
    <StandardModal setModalOpen={setOpen} modalOpen={open}>
      <Stack gap="16px" alignItems="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
        >
          <g clip-path="url(#clip0_7129_12442)">
            <path
              d="M78.9693 63.4991L46.1546 9.07844C44.8618 6.93454 42.5035 5.60266 39.9999 5.60266C37.4963 5.60266 35.138 6.93454 33.8451 9.0786L1.03054 63.4991C-0.305556 65.715 -0.345087 68.4913 0.927256 70.7444C2.19991 72.9975 4.59773 74.3972 7.18523 74.3972H72.8146C75.4021 74.3972 77.8001 72.9975 79.0727 70.7442C80.3451 68.4909 80.3055 65.7147 78.9693 63.4991ZM74.5374 68.1831C74.1871 68.8033 73.5269 69.1888 72.8146 69.1888H7.18523C6.47288 69.1888 5.81273 68.8034 5.46257 68.1833C5.11226 67.563 5.12319 66.7986 5.49085 66.1888L38.3057 11.7681C38.6616 11.178 39.3108 10.8113 40.0001 10.8113C40.6891 10.8113 41.3383 11.178 41.6943 11.7681L74.5088 66.1888C74.8768 66.7988 74.8877 67.563 74.5374 68.1831Z"
              fill="#E38869"
            />
            <path
              d="M40.0236 27.032C38.0423 27.032 36.4961 28.0951 36.4961 29.9798C36.4961 35.7301 37.1725 43.9932 37.1725 49.7437C37.1727 51.2417 38.4775 51.8698 40.0237 51.8698C41.1834 51.8698 42.8264 51.2417 42.8264 49.7437C42.8264 43.9934 43.5028 35.7303 43.5028 29.9798C43.5028 28.0953 41.9083 27.032 40.0236 27.032Z"
              fill="#E38869"
            />
            <path
              d="M40.0725 55.2041C37.9464 55.2041 36.3516 56.8954 36.3516 58.925C36.3516 60.9063 37.9462 62.646 40.0725 62.646C42.0537 62.646 43.7452 60.9063 43.7452 58.925C43.7452 56.8954 42.0536 55.2041 40.0725 55.2041Z"
              fill="#E38869"
            />
          </g>
          <defs>
            <clipPath id="clip0_7129_12442">
              <rect width="80" height="80" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <Typography textAlign="center">
          We are experiencing a high volume of synchronous visits. We recommend
          scheduling a visit or joining the waiting room later.
        </Typography>
        <Stack>
          <Button onClick={onMoveOn}>Schedule visit</Button>
          <LoadingButton
            loading={loading}
            disabled={loading}
            variant="text"
            onClick={onGoHome}
          >
            Go to home page
          </LoadingButton>
        </Stack>
      </Stack>
    </StandardModal>
  );
};

const Messages = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { data: available } = useLiveVisitAvailability();
  const { appointment } = Router.query;
  const count = useCountDown(
    () => setOpen(true),
    available?.estimatedWaitTime || 15
  );

  const onSchedule = useCallback(() => {
    Router.push(
      `${Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT}?appointment=${appointment}`
    );
  }, [appointment]);

  return (
    <>
      <Stack alignItems="center" gap="12px">
        <Typography variant="h3" textAlign="center">
          {`Please wait for your provider. Your provider will be with you soon. Your
        estimated wait time is ${Number(
          count.split(':')[0]
        )} minutes. We recommend that you stay in the waiting room, since if you exit out of this window or leave the waiting room you will lose your spot in line.`}
        </Typography>
        <Typography
          textAlign="center"
          whiteSpace={isMobile ? 'break-spaces' : 'inherit'}
        >
          Wait time too long? Don’t worry you can{'\n'}
          <Link
            href={`${Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT}?appointment=${appointment}`}
            style={{ color: 'green' }}
          >
            schedule a visit for later.
          </Link>
        </Typography>
      </Stack>
      <NoProvidersModal open={open} setOpen={setOpen} onMoveOn={onSchedule} />
    </>
  );
};

interface Props {
  status: VideoVisitStatus;
  setStatus: (status: VideoVisitStatus) => void;
  roomUrl: string | null;
  roomId: string;
}

const VideoVisitILV = ({ status, setStatus, roomUrl }: Props) => {
  const callObject = useDaily();
  const { present } = useParticipantCounts();

  const joinCall = useCallback(() => {
    setStatus(VideoVisitStatus.JOINING);
    if (callObject && roomUrl) {
      callObject.join({ url: roomUrl }).then(() => {
        setStatus(VideoVisitStatus.JOINED);
      });
    }
  }, [setStatus, callObject, roomUrl]);

  const leaveCall = useCallback(() => {
    Router.push(Pathnames.PATIENT_PORTAL_LIVE_VISIT);
    setStatus(VideoVisitStatus.LEAVING);
    callObject?.destroy();
  }, [callObject, setStatus]);

  const showCall = ['JOINED', 'ERROR'].includes(status);
  const showHairCheck = ['HAIR_CHECK', 'JOINING'].includes(status);
  const showWaitingMessage = status === VideoVisitStatus.JOINING;

  return (
    <>
      <Stack gap="16px" alignItems="center">
        {present === 1 ? <Messages /> : null}
        <Box display="flex" maxWidth="100%" minHeight="0">
          {showCall ? (
            <Call />
          ) : showHairCheck ? (
            <HairCheck joinCall={joinCall} />
          ) : null}
        </Box>
        {showCall && <Tray leaveCall={leaveCall} />}
        {showWaitingMessage && (
          <Box
            top="50%"
            left="50%"
            zIndex="11"
            bgcolor="white"
            borderRadius="5px"
            position="absolute"
            padding="15px"
            style={{
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px',
            }}
          >
            <Stack spacing={2} width="200px" height="00pxs">
              <Loading />
            </Stack>
          </Box>
        )}
      </Stack>
    </>
  );
};

const VisitRoomScreen = () => {
  return (
    <>
      <Head>
        <title>Visit Room | Zealthy</title>
      </Head>

      <VisitRoom>
        {(status, setStatus, roomUrl, id) => (
          <VideoVisitILV
            status={status}
            setStatus={setStatus}
            roomId={id}
            roomUrl={roomUrl}
          />
        )}
      </VisitRoom>
    </>
  );
};

export const getServerSideProps = getVideoVisitProps;

VisitRoomScreen.getLayout = (page: ReactElement) => {
  return <PatientPortalNav showActionModal={false}>{page}</PatientPortalNav>;
};

export default VisitRoomScreen;
