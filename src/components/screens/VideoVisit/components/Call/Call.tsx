import React, { useState, useCallback, useMemo } from 'react';
import {
  useParticipantIds,
  useLocalParticipant,
  useDailyEvent,
  DailyAudio,
} from '@daily-co/daily-react';

import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';
import { Box, useMediaQuery, useTheme } from '@mui/material';

export default function Call() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);

  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, [])
  );

  /* This is for displaying remote participants: this includes other humans, but also screen shares. */
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  /* This is for displaying our self-view. */
  const localParticipant = useLocalParticipant();
  const isAlone = useMemo(
    () => remoteParticipantIds?.length < 1,
    [remoteParticipantIds]
  );

  const renderCallScreen = () => (
    <Box
      width="100%"
      height="100%"
      display="grid"
      gridAutoColumns="auto"
      gridTemplateRows={isAlone ? '1fr' : '2fr'}
    >
      {remoteParticipantIds?.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns={
            isMobile ? '1fr' : `repeat(${remoteParticipantIds?.length}, 1fr)`
          }
          gridAutoRows={
            isMobile ? `repeat(${remoteParticipantIds?.length}, 1fr)` : '1fr'
          }
          gap="5px"
          minHeight="0"
          flexDirection={isMobile ? 'column' : 'row'}
        >
          {remoteParticipantIds.map(id => (
            <Tile key={id} id={id} />
          ))}
        </Box>
      )}
      {localParticipant && (
        <Tile id={localParticipant.session_id} isLocal isAlone={isAlone} />
      )}
      <DailyAudio />
    </Box>
  );

  return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}
