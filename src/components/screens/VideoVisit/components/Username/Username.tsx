import { useAudioTrack, useParticipantProperty } from '@daily-co/daily-react';
import { Box } from '@mui/material';
import { MicrophoneOff } from '../Tray/icons/MicOff';
import { MicrophoneOn } from '../Tray/icons/MicOn';

interface Props {
  id: string;
  isLocal?: boolean;
}

export default function Username({ id, isLocal }: Props) {
  const username = useParticipantProperty(id, 'user_name');
  const localAudio = useAudioTrack(id);
  const mutedAudio = localAudio.isOff;

  return (
    <Box
      height="28px"
      position="absolute"
      display="flex"
      gap="5px"
      alignItems="center"
      padding="5px"
      bgcolor="rgb(0 0 0 / 50%)"
      color="#fff"
      bottom="0"
      left="0"
      sx={{ textWrap: 'nowrap' }}
    >
      {mutedAudio ? <MicrophoneOff /> : <MicrophoneOn />}
      {isLocal ? '(you)' : username || id}
    </Box>
  );
}
