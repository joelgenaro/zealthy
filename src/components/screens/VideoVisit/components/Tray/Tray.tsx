import {
  useAudioTrack,
  useDaily,
  useDailyEvent,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react';
import {
  Badge,
  Box,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useState } from 'react';
import { CameraOff } from './icons/CamOff';
import { CameraOn } from './icons/CamOn';
import { ChatIcon } from './icons/Chat';
import { MicrophoneOff } from './icons/MicOff';
import { MicrophoneOn } from './icons/MicOn';
import Chat from '../Chat/Chat';

interface Props {
  leaveCall: () => void;
}

export default function Tray({ leaveCall }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const callObject = useDaily();
  const localParticipant = useLocalParticipant();

  const [newChatMessage, setNewChatMessage] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const localVideo = useVideoTrack(localParticipant!.session_id);
  const localAudio = useAudioTrack(localParticipant!.session_id);
  const mutedVideo = localVideo.isOff;
  const mutedAudio = localAudio.isOff;

  const toggleVideo = useCallback(() => {
    callObject!.setLocalVideo(mutedVideo);
  }, [callObject, mutedVideo]);

  const toggleAudio = useCallback(() => {
    callObject!.setLocalAudio(mutedAudio);
  }, [callObject, mutedAudio]);

  const toggleChat = () => {
    setShowChat(!showChat);
    if (newChatMessage) {
      setNewChatMessage(!newChatMessage);
    }
  };

  /* When a remote participant sends a message in the chat, we want to display a differently colored
   * chat icon in the Tray as a notification. By listening for the `"app-message"` event we'll know
   * when someone has sent a message. */
  useDailyEvent(
    'app-message',
    useCallback(() => {
      /* Only light up the chat icon if the chat isn't already open. */
      if (!showChat) {
        setNewChatMessage(true);
      }
    }, [showChat])
  );

  return (
    <Box
      position="relative"
      width="100%"
      height="70px"
      borderTop="1px solid black"
      minWidth="0"
    >
      <Stack
        height="100%"
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        padding="0 1rem"
      >
        <Stack height="100%" direction="row" spacing={2} alignItems="center">
          <IconButton size="small" color="primary" onClick={toggleAudio}>
            {mutedAudio ? <MicrophoneOff /> : <MicrophoneOn />}
          </IconButton>
          <IconButton size="small" color="primary" onClick={toggleVideo}>
            {mutedVideo ? <CameraOff /> : <CameraOn />}
          </IconButton>
        </Stack>

        <Button
          onClick={toggleChat}
          size="small"
          variant="contained"
          color="grey"
          startIcon={
            <Badge
              color="error"
              variant="dot"
              badgeContent={newChatMessage ? 1 : 0}
            >
              <ChatIcon />
            </Badge>
          }
        >
          {isMobile ? 'Chat' : 'Open Chat'}
        </Button>
      </Stack>
      <Chat showChat={showChat} toggleChat={toggleChat} />
    </Box>
  );
}
