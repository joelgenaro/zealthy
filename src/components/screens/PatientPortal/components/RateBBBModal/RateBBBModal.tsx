import { useFutureNotifications } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Database } from '@/lib/database.types';
import { Button, Modal, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { addHours } from 'date-fns';
import { useEffect } from 'react';
import { ModalQueueType } from '../PriorityModals';
import Router from 'next/router';
import { isMobile as isMobileDevice } from 'react-device-detect';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  addToQueue: (modalName: ModalQueueType) => void;
  onRedirectFromMessage?: () => void;
};
const RateBBBModal = ({
  isOpen,
  onClose,
  addToQueue,
  onRedirectFromMessage,
}: Props) => {
  const { data: notifications } = useFutureNotifications('RATE_BBB');
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    if (
      notifications &&
      !notifications.is_read &&
      new Date(notifications.display_at || '') <= new Date()
    ) {
      addToQueue('BBB');
    }
  }, [notifications]);

  const handleSkip = async () => {
    try {
      const incrementSkipCount = (notifications?.skip_count || 0) + 1;

      await supabase
        .from('notifications')
        .update({
          skip_count: incrementSkipCount,
          display_at: addHours(
            new Date(notifications?.display_at || ''),
            24
          ).toISOString(),
        })
        .eq('type', notifications?.type!)
        .eq('recipient_id', notifications?.recipient_id!);
    } catch (e: any) {
      throw new Error('Unable to skip BBB rating modal');
    } finally {
      onClose();
    }
  };

  const handleRate = async () => {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
        })
        .eq('type', notifications?.type!)
        .eq('recipient_id', notifications?.recipient_id!);

      if (Router.asPath.includes('messages') && onRedirectFromMessage) {
        onRedirectFromMessage();
      }

      if (isMobileDevice) {
        return setTimeout(() => {
          window.open(
            'https://www.bbb.org/us/ny/new-york/profile/telemedicine/zealthy-inc-0121-87176031/leave-a-review',
            '_top'
          );
        });
      }
      return window.open(
        'https://www.bbb.org/us/ny/new-york/profile/telemedicine/zealthy-inc-0121-87176031/leave-a-review',
        '_blank'
      );
    } catch (e: any) {
      throw new Error('Unable to complete BBB Rating');
    } finally {
      onClose();
    }
  };

  const isMobile = useIsMobile();
  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 150,
    minHeight: 300,
    maxHeight: '100%',
    overflow: 'auto',
    p: 4,
    outline: 'none',
    gap: '1rem',
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  return (
    <Modal open={isOpen}>
      <Stack
        alignItems="center"
        justifyContent="center"
        borderRadius={2}
        textAlign="center"
        sx={isMobile ? mobileSx : desktopSx}
      >
        <Typography variant="h2">
          Please help with a public review on Better Business Bureau!
        </Typography>
        <Typography>
          {
            'Would you please share your experience with Zealthy online? Your review or rating will help people learn more about us. That means we can spend less on advertising and keep service costs low.'
          }
        </Typography>
        <Button fullWidth onClick={handleRate}>
          Review us on Better Business Bureau
        </Button>
        <Button
          onClick={handleSkip}
          fullWidth
          color="grey"
          sx={{ color: '#008A2E' }}
        >
          Go back to your Zealthy portal
        </Button>
      </Stack>
    </Modal>
  );
};

export default RateBBBModal;
