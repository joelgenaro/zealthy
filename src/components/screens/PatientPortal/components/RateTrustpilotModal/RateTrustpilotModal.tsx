import { useFutureNotifications, usePatient } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Database } from '@/lib/database.types';
import { Button, Modal, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';
import { addHours } from 'date-fns';
import { useCallback, useState } from 'react';
import { ModalQueueType } from '../PriorityModals';
import { isMobile as isMobileDevice } from 'react-device-detect';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  addToQueue: (modalName: ModalQueueType) => void;
};

const RateTrustpilotModal = ({ isOpen, onClose, addToQueue }: Props) => {
  const { data: notifications } = useFutureNotifications('RATE_TP');
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState<boolean>(false);
  const { data: patient } = usePatient();
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;

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

      if (notifications?.skip_count === 2) {
        openGoogleOrBBBModal();
      }
    } catch (e: any) {
      throw new Error('Error skipping trustpilot review', e);
    } finally {
      onClose();
    }
  };

  const handleInvitationLink = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/trustpilot/invitation-link',
        {
          patientName,
          email: patient?.profiles?.email,
          referenceId: patient?.profile_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      await supabase
        .from('notifications')
        .update({
          is_read: true,
        })
        .eq('type', notifications?.type!)
        .eq('recipient_id', notifications?.recipient_id!);

      if (isMobileDevice) {
        return setTimeout(() => {
          window.open(response?.data?.url, '_top');
        });
      }
      return window.open(response?.data?.url, '_blank');
    } catch (error) {
      console.error('Error creating invitation link:', error);
    } finally {
      onClose();
      setLoading(false);
    }
  }, [patient, patientName, notifications]);

  const openGoogleOrBBBModal = async () => {
    if (['CA', 'FL', 'TX', 'GA', 'OH'].includes(patient?.region || '')) {
      await supabase.from('notifications').insert({
        display_at: addHours(new Date(), 24).toISOString(),
        recipient_id: patient?.profile_id!,
        sender_id: patient?.profile_id!,
        type: 'RATE_BBB',
      });
    } else {
      await supabase.from('notifications').insert({
        display_at: addHours(new Date(), 24).toISOString(),
        recipient_id: patient?.profile_id!,
        sender_id: patient?.profile_id!,
        type: 'RATE_GOOGLE',
      });
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
          Please help with a public review on Trustpilot!
        </Typography>
        <Typography>
          {
            'Would you please share your experience with Zealthy online? Your review or rating will help people learn more about us. That means we can spend less on advertising and keep service costs low.'
          }
        </Typography>
        <LoadingButton
          loading={loading}
          fullWidth
          onClick={handleInvitationLink}
        >
          Review us on Trustpilot
        </LoadingButton>
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

export default RateTrustpilotModal;
