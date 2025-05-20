import {
  DailyVideo,
  useDaily,
  useDevices,
  useParticipantProperty,
  useVideoTrack,
} from '@daily-co/daily-react';
import { CameraswitchTwoTone } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { CameraOff } from '../Tray/icons/CamOff';
import Username from '../Username/Username';

interface Props {
  id: string;
  isLocal?: boolean;
  isAlone?: boolean;
}

export default function Tile({ id, isLocal, isAlone }: Props) {
  const callObject = useDaily();
  const localVideo = useVideoTrack(id);
  const username = useParticipantProperty(id, 'user_name');
  const { cameras, currentCam, setCamera } = useDevices();

  const videoOff = localVideo.state === 'off';

  const switchCamera = () => {
    const currentCamLabel = currentCam?.device.label;
    const isBackCam = currentCamLabel?.toLowerCase().includes('back');
    const isFrontCam = currentCamLabel?.toLowerCase().includes('front');
    const frontCam = cameras.find(cam =>
      cam.device.label.toLowerCase().includes('front')
    );
    const backCam = cameras.find(cam =>
      cam.device.label.toLowerCase().includes('back camera')
    );
    if (cameras.length < 2) return;
    if (isBackCam && frontCam) {
      setCamera(frontCam.device.deviceId);
    } else if (isFrontCam && backCam) {
      setCamera(backCam.device.deviceId);
    } else {
      callObject?.cycleCamera();
    }
  };

  return (
    <Box
      overflow="hidden"
      display="flex"
      justifyContent="center"
      justifyItems="center"
      alignItems="baseline"
      alignContent="stretch"
      position="relative"
      width="100%"
      height="100%"
      minHeight="0"
      borderBottom={isLocal && !isAlone ? '1px solid black' : 'none'}
    >
      {videoOff ? (
        <Box
          display="flex"
          flexDirection="column"
          gap="1rem"
          alignItems="center"
          alignSelf="center"
          justifyContent="center"
          width="auto"
          height="100%"
          padding="1rem"
          bgcolor="text.disabled"
          color="white"
          sx={{ aspectRatio: '16 / 9' }}
        >
          <Typography variant={isLocal ? 'body1' : 'h3'}>
            {isLocal ? `${username} (You)` : username}
          </Typography>
          <CameraOff color="#fff" />
        </Box>
      ) : (
        <Box
          minHeight="0"
          height="100%"
          width="auto"
          display="flex"
          justifyContent="center"
          position="relative"
          overflow="hidden"
          sx={{ aspectRatio: '16 / 9' }}
        >
          <DailyVideo
            automirror
            sessionId={id}
            type="video"
            fit="cover"
            style={{ width: '100%', height: '100%' }}
            playableStyle={{
              width: '100%',
              height: '100%',
              minHeight: '0',
            }}
          />
          <Username id={id} isLocal={isLocal} />
          {!!(cameras?.length > 1) && isLocal && (
            <IconButton
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
              }}
              onClick={() => switchCamera()}
            >
              <CameraswitchTwoTone />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}
