import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  useLocalParticipant,
  useDevices,
  useDaily,
  useDailyEvent,
  DailyVideo,
} from '@daily-co/daily-react';
import UserMediaError from '../UserMediaError/UserMediaError';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import DOMPurify from 'dompurify';

interface Props {
  joinCall: () => void;
}

export default function HairCheck({ joinCall }: Props) {
  const theme = useTheme();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();

  const localParticipant = useLocalParticipant();
  const {
    microphones,
    currentMic,
    speakers,
    currentSpeaker,
    cameras,
    currentCam,
    setMicrophone,
    setCamera,
    setSpeaker,
  } = useDevices();
  const callObject = useDaily();

  const [getUserMediaError, setGetUserMediaError] = useState(false);

  async function fetchUserName(user_id: string) {
    if (user) {
      await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user_id)
        .single()
        .then(({ data }) => {
          if (data?.first_name && data?.last_name) {
            callObject!.setUserName(`${data.first_name} ${data.last_name}`);
          }
        });
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchUserName(user!.id);
    }
  }, [user]);

  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, [])
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    callObject!.setUserName(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );
  };

  const updateMicrophone = (e: ChangeEvent<HTMLInputElement>) => {
    setMicrophone(e.target.value);
  };

  const updateSpeakers = (e: ChangeEvent<HTMLInputElement>) => {
    setSpeaker(e.target.value);
  };

  const updateCamera = (e: ChangeEvent<HTMLInputElement>) => {
    setCamera(e.target.value);
  };

  return (
    <Box padding="1rem" width="100%" alignSelf="center">
      <Box
        maxWidth="25rem"
        width="100%"
        height="auto"
        maxHeight="100%"
        overflow="auto"
        margin="auto"
        borderRadius="4px"
        bgcolor={theme.palette.background.paper}
        border="1px solid"
        borderColor={theme.palette.text.disabled}
      >
        <Stack direction="column">
          <Stack
            direction="row"
            padding="20px"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3">Ready for your visit?</Typography>
            {localParticipant && !getUserMediaError && (
              <Button size="small" onClick={joinCall}>
                Join now
              </Button>
            )}
          </Stack>
          <Box width="100%" height="100%" overflow="hidden">
            {localParticipant && !getUserMediaError && (
              <DailyVideo
                automirror
                type="video"
                sessionId={localParticipant.session_id}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '200px',
                }}
              />
            )}
            {getUserMediaError && <UserMediaError />}
          </Box>
          {localParticipant && !getUserMediaError && (
            <Stack padding="20px" gap="1rem" width="100%">
              <TextField
                type="text"
                label="Your name"
                onChange={onChange}
                value={localParticipant?.user_name || ''}
              />

              <Stack direction="row" gap="25px">
                {currentMic && (
                  <TextField
                    select
                    fullWidth
                    label="Microphone"
                    name="microphone"
                    value=""
                    onChange={updateMicrophone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MicIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {microphones.map(mic => (
                      <MenuItem
                        key={`mic-${mic.device.deviceId}`}
                        value={mic.device.deviceId}
                      >
                        {mic.device.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {currentSpeaker && (
                  <TextField
                    select
                    fullWidth
                    label="Speakers"
                    name="speakers"
                    value=""
                    onChange={updateSpeakers}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VolumeUpIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {speakers.map(speaker => (
                      <MenuItem
                        key={`speaker-${speaker.device.deviceId}`}
                        value={speaker.device.deviceId}
                      >
                        {speaker.device.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {currentCam && (
                  <TextField
                    select
                    fullWidth
                    label="Camera"
                    name="camera"
                    value=""
                    onChange={updateCamera}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VideocamIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {cameras.map(camera => (
                      <MenuItem
                        key={`cam-${camera.device.deviceId}`}
                        value={camera.device.deviceId}
                      >
                        {camera.device.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
