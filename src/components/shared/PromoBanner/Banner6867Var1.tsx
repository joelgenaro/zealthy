import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import { supabaseClient } from '@/lib/supabaseClient';
import { Button, Typography } from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { StandardModal } from '../modals';
import Image from 'next/image';

export const Banner6867Var1 = ({ text }: { text: string }) => {
  const [expirationTime, setExpirationTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  const { data: patient } = usePatient();
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalShown, setModalShown] = useState<boolean>(false);

  const getFlashSaleTimeRemaining = async () => {
    const data = await supabaseClient
      .from('patient')
      .select('flash_sale_expires_at')
      .eq('id', patient?.id!)
      .single()
      .then(data => data.data);
    if (
      !data?.flash_sale_expires_at ||
      new Date(data?.flash_sale_expires_at) < new Date()
    ) {
      const expirationTime = new Date();
      expirationTime.setDate(expirationTime.getDate() + 2);
      await supabaseClient
        .from('patient')
        .update({ flash_sale_expires_at: expirationTime.toISOString() })
        .eq('id', patient?.id!)
        .select();
      setExpirationTime(expirationTime);
    } else {
      console.log(new Date(data?.flash_sale_expires_at));
      setExpirationTime(new Date(data?.flash_sale_expires_at));
    }
  };

  useEffect(() => {
    if (patient) {
      getFlashSaleTimeRemaining();
    }
  }, [patient]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTime]);

  useEffect(() => {
    const questionnaireName = router.query['name'];
    const questionName = router.query['question_name'];
    console.log(questionnaireName, questionName);
    if (
      questionnaireName === 'weight-loss-treatment' &&
      questionName === 'WEIGHT-LOSS-TREATMENT-A-Q1' &&
      !modalShown
    ) {
      setShowModal(true);
      setModalShown(true);
    }
  }, [router.query, modalShown]);

  const timeRemaining =
    (expirationTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
  return (
    <>
      <Box
        bgcolor={theme.palette.secondary.main}
        padding={`${isMobile ? '12px' : '24px'} 12px`}
        display="flex"
        gap="16px"
        justifyContent={isMobile ? 'flex-start' : 'center'}
        alignItems="center"
        //top={isMobile ? '48px' : '108px'}
        width={'100%'}
        position={'relative'}
        zIndex={-1}
      >
        {!isMobile && (
          <Typography
            textAlign={isMobile ? 'left' : 'center'}
            fontSize={`${isMobile ? '14px' : 'inherit'}`}
            width={'50%'}
          >
            <div
              style={{
                fontSize: '20px',
                lineHeight: '22px',
                color: '#00531B',
                fontWeight: 'bold',
              }}
            >
              {`⏰ ${text} ⏰`.toUpperCase()}
            </div>
          </Typography>
        )}
        {isMobile ? (
          <Box display={'flex'} sx={{ width: 'calc(100% - 112px)' }}>
            <div
              style={{
                fontSize: '20px',
                marginRight: '10px',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              ⏰
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#00531B',
                fontWeight: 'bold',
              }}
            >
              {text.toUpperCase()}
            </div>
          </Box>
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            paddingRight: '10px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: isMobile ? '24px' : '32px',
              color: '#00531B',
            }}
          >
            {Math.floor(timeRemaining)}:
            {Math.floor((timeRemaining - Math.floor(timeRemaining)) * 60) < 10
              ? '0'
              : ''}
            {Math.floor((timeRemaining - Math.floor(timeRemaining)) * 60)}:
            {Math.floor(((timeRemaining * 3600) % 3600) % 60) < 10 ? '0' : ''}
            {Math.floor(((timeRemaining * 3600) % 3600) % 60)}
          </div>
        </Box>
      </Box>
      {showModal && (
        <StandardModal
          maxHeight="800px"
          maxWidth="400px"
          modalOpen={showModal}
          setModalOpen={setShowModal}
        >
          <Image
            src={'/images/flash-sale.png'}
            alt={''}
            style={{ width: '100%' }}
          />
          <Typography variant="h2">
            <div
              style={{
                fontSize: '30px',
                lineHeight: '30px',
              }}
            >
              FLASH SALE: Additional 10% off compounded GLP-1 injections ends
              soon
            </div>
          </Typography>
          <Box
            width={'100%'}
            height={'100px'}
            borderRadius={'16px'}
            sx={{
              backgroundColor: '#E1EFE6',
              border: '1px solid #B8F5CC',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                width: '80%',
                display: 'flex',
                justifyContent: 'center',
                height: '60px',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '2px solid #00C642',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: isMobile ? '24px' : '32px',
                }}
              >
                ⏰ {Math.floor(timeRemaining)}:
                {Math.floor((timeRemaining - Math.floor(timeRemaining)) * 60) <
                10
                  ? '0'
                  : ''}
                {Math.floor((timeRemaining - Math.floor(timeRemaining)) * 60)}:
                {Math.floor(((timeRemaining * 3600) % 3600) % 60) < 10
                  ? '0'
                  : ''}
                {Math.floor(((timeRemaining * 3600) % 3600) % 60)} ⏰
              </div>
            </Box>
          </Box>
          <Button
            sx={{ width: '100%' }}
            onClick={() => setShowModal(!showModal)}
          >
            Continue
          </Button>
        </StandardModal>
      )}
    </>
  );
};
