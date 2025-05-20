import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { usePatient } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface MobileAppDownloadProps {
  nextPage: (nextPage?: string) => void;
}

const MobileAppDownload = ({ nextPage }: MobileAppDownloadProps) => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const theme = useTheme();
  const isLargeMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showMobileDownloadPage = patient && patient.region === 'TX';

  const handleNext = async () => {
    if (patient) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', patient.profile_id)
        .eq('type', 'MOBILE_DOWNLOAD')
        .maybeSingle();

      // if there is no mobile download database entry, add a new entry
      if (!data) {
        const { error } = await supabase.from('notifications').insert({
          is_read: true,
          recipient_id: patient.profile_id,
          sender_id: patient.profile_id,
          type: 'MOBILE_DOWNLOAD',
        });
        if (error) {
          console.error('Error adding mobile download notification', error);
        }
        // if there is already a mobile download DB entry, update to reflect notification has been seen
      } else {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('recipient_id', patient?.profile_id)
          .eq('type', 'MOBILE_DOWNLOAD')
          .single();
      }
      if (error) {
        console.error('Error adding mobile download notification', error);
      }
    }
    nextPage();
  };

  return (
    <>
      {showMobileDownloadPage ? (
        <Container
          maxWidth="lg"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: `${isSmallMobile ? 'wrap' : 'nowrap'}`,
            paddingTop: '10vh',
          }}
        >
          <Image
            src="/flying-iphone.png"
            alt="flying phone"
            width={577.35}
            height={586.74}
            style={{
              position: 'relative',
              width: `${
                isSmallMobile ? '80vw' : isLargeMobile ? '60vw' : '577.35px'
              }`,
              height: `${
                isSmallMobile ? '80vw' : isLargeMobile ? '55vw' : '586.74px'
              }`,
              marginRight: '-40px',
            }}
          />
          <Container maxWidth="md">
            <Image
              src="/icons/phone.png"
              alt="phone icon"
              width={78}
              height={78}
              style={{ marginBottom: '1.5vw' }}
            />
            <Typography
              variant="h1"
              sx={{ marginBottom: '2rem', fontWeight: 'bold' }}
            >
              <>
                Welcome to <span style={{ color: '#008532' }}>Zealthy</span>
              </>
            </Typography>
            <p
              style={{
                marginBottom: '2rem',
                marginTop: '0.8rem',
                fontSize: `${isSmallMobile ? '4vw' : '24px'}`,
                lineHeight: `${isSmallMobile ? '5vw' : '33.6px'}`,
              }}
            >
              <>
                Start by downloading the Zealthy app and setting up your
                account. You’ll receive an email shortly with next steps, so
                keep an eye on your inbox.
              </>
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
            <button
              style={{
                marginBottom: '1rem',
                fontStyle: 'italic',
                fontWeight: 'bold',
                marginLeft: '2vh',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
              }}
              onClick={handleNext}
            >
              <>Download app later</>
            </button>
          </Container>
        </Container>
      ) : (
        nextPage()
      )}
    </>
  );
};

export default MobileAppDownload;
