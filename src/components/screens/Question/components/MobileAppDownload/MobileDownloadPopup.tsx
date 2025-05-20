import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton, useTheme } from '@mui/material';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import { useFutureNotifications } from '@/components/hooks/data';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useEffect } from 'react';
import { ModalQueueType } from '@/components/screens/PatientPortal/components/PriorityModals';

interface MobileDownloadPopupProps {
  open: boolean;
  onClose: () => void;
  addToQueue: (modalName: ModalQueueType) => void;
}

const MobileDownloadPopup = ({
  open,
  onClose,
  addToQueue,
}: MobileDownloadPopupProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: notifications } = useFutureNotifications('MOBILE_DOWNLOAD');
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    if (
      notifications &&
      !notifications.is_read &&
      new Date(notifications.display_at || '') <= new Date()
    ) {
      addToQueue('MobileDownload');
    }
  }, [notifications]);

  const handleClose = async () => {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
        })
        .eq('type', notifications?.type!)
        .eq('recipient_id', notifications?.recipient_id!);
    } catch (e: any) {
      throw new Error('Error sendig user to google rating');
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      open={open}
    >
      <Container
        maxWidth={isMobile ? 'xs' : 'sm'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 16,
        }}
      >
        {
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Image
                src="/icons/phone.png"
                alt="phone icon"
                width={78}
                height={78}
                style={{ marginBottom: '2vw' }}
              />
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>

            <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
              <>
                Download the{' '}
                <span style={{ color: '#008532' }}>Zealthy app</span>
              </>
            </Typography>
            <p
              style={{
                marginBottom: '2rem',
                marginTop: '0.8rem',
                fontSize: `${isMobile ? '4vw' : '24px'}`,
                lineHeight: `${isMobile ? '5vw' : '33.6px'}`,
              }}
            >
              We have officially launched the app! Download the Zealthy app by
              selecting the QR code below.
            </p>
            <div
              style={{
                backgroundColor: '#D6F0DF',
                padding: '1.5vh',
                paddingLeft: '3vh',
                paddingRight: '3vh',
                gap: '2.5vh',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2vh',
                borderRadius: '15px',
                border: 'solid green',
                borderWidth: '1.5px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#00541f',
                  cursor: 'point',
                  fontSize: `${isMobile ? '5vw' : null}`,
                  fontWeight: 'normal',
                  ':hover': {
                    cursor: 'pointer',
                  },
                }}
              >
                Download Zealthy app
              </Typography>
              {isMobile ? (
                <>
                  <Image
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      window.open(
                        'https://link.getzealthy.com/FEbcTpIshSb',
                        '_blank'
                      )
                    }
                    src="/app-store-download-btn.png"
                    alt="Download the Zealthy mobile app on iOS"
                    width={160}
                    height={50}
                  />
                  <Image
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      window.open(
                        'https://link.getzealthy.com/FEbcTpIshSb',
                        '_blank'
                      )
                    }
                    src="/google-play-download-btn.png"
                    alt="Download the Zealthy mobile app on Google Play"
                    width={160}
                    height={50}
                  />
                </>
              ) : (
                <Image
                  src="/app-store-mobile-app-download-QR.png"
                  alt="Download the Zealthy mobile app"
                  width={112}
                  height={112}
                />
              )}
            </div>
          </>
        }
      </Container>
    </Modal>
  );
};

export default MobileDownloadPopup;
