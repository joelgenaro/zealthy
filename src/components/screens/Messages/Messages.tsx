import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Router from 'next/router';
import { MessagesHeader } from './components/MessagesHeader';
import { MessagesContent } from './components/MessagesContent';
import { usePatient, usePatientMessagesList } from '@/components/hooks/data';
import useIsFullyCancelled from '@/components/hooks/useIsFullyCancelled';

type Profile = Database['public']['Tables']['profiles']['Row'];
import { MessageItemI } from '@/types/messageItem';

const Messages = () => {
  const { complete, provider } = Router.query as {
    complete: string;
    provider: string;
  };
  const { data: patientInfo } = usePatient();
  const { data: patientMessagesList } = usePatientMessagesList();
  const isFullyCancelled = useIsFullyCancelled();

  const [selectedMessages, setSelectedMessages] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [actionItemCount, setActionItemCount] = useState<number>(0);

  const handleOnClick = (selected: MessageItemI) => {
    setSelectedMessages(selected);
  };

  const showActionItemBanner = actionItemCount > 0 && !isFullyCancelled;

  useEffect(() => {
    if (complete && complete == 'weight-loss') {
      window.freshpaint?.track('weight-loss-messages');
    }
  }, [complete]);

  useEffect(() => {
    if (patientMessagesList?.length && patientMessagesList?.length > 0) {
      if (complete) {
        setSelectedMessages(
          patientMessagesList?.find(
            (g: any) =>
              g?.messages_group_id?.name.toLowerCase() ===
              complete.split('-').join(' ').toLowerCase()
          ) || null
        );
      }
    }
  }, [complete, patientMessagesList, provider]);

  return (
    <Box
      sx={{
        paddingBottom: `${isMobile ? '0px' : '24px'}`,
        scroll: 'none',
        marginTop: `${isMobile ? '-3%' : '0px'}`,
      }}
    >
      <Container
        sx={{
          padding: '0 !important',
          borderBottom: `solid ${isMobile ? '0x' : '1px'} #AFAFAF`,
          borderRadius: '4px',
        }}
      >
        <MessagesHeader
          selectedMessage={selectedMessages}
          setSelectedMessages={setSelectedMessages}
        />
        <MessagesContent
          allMessages={patientMessagesList}
          selectedMessage={selectedMessages}
          patient={patientInfo!}
          handleOnClick={handleOnClick}
        />
      </Container>
    </Box>
  );
};

export default Messages;
