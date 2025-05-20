import { usePatient, usePromoValues } from '@/components/hooks/data';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { addMinutes } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import Countdown from 'react-countdown';

const ClockP = styled('p')`
  font-size: 30px;
  font-weight: bold;
`;

const StyledCountdown = styled(Countdown)`
  font-size: 20px;
  font-weight: 600;
  line-height: 24.2px;
  color: ${({ theme }) => theme.palette.primary.main};
`;

const BannerWL = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: patient } = usePatient();

  // Generate storage keys once per component instance
  const storageKey = useMemo(() => {
    // use patient ID for session-specific storage
    return `countdown-date-${patient?.id}`;
  }, [patient?.id]);

  // Initialize all hooks before any conditional returns
  const [currentDate, setCurrentDate] = useState(() => {
    const storedDate = window.localStorage.getItem(storageKey);
    if (!storedDate) {
      const newDate = new Date();
      window.localStorage.setItem(storageKey, newDate.toISOString());
      return newDate;
    }
    return new Date(storedDate);
  });

  const { data: promoData } = usePromoValues(`Weight Loss Banner`);

  const bannerHeight = useMemo(() => (isMobile ? '46px' : '82px'), [isMobile]);
  const targetDate = useMemo(() => {
    return addMinutes(currentDate, 15);
  }, [currentDate]);

  const finalText = useMemo(() => {
    return promoData?.text || 'ONE TIME OFFER: Next 15 Minutes';
  }, [promoData?.text]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, currentDate.toISOString());
  }, [currentDate, storageKey]);

  return (
    <>
      <Box
        bgcolor="#B8F5CC"
        display="flex"
        gap="16px"
        justifyContent="center"
        alignItems="center"
        position="fixed"
        top={isMobile ? '48px' : '108px'}
        padding={isMobile ? `` : `0 25px`}
        left={0}
        right={0}
        width="100%"
        zIndex={9998}
        height={bannerHeight}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap="16px"
          width="100%"
          display="flex"
          justifyContent="center"
          position="relative"
        >
          <Typography
            textAlign="left"
            fontWeight={600}
            color={theme.palette.primary.main}
            sx={{
              fontSize: isMobile ? `16px!important` : `24px!important`,
              lineHeight: isMobile ? `14.52px!important` : `29.05px!important`,
              letterSpacing: `-0.06%!important`,
            }}
          >
            {finalText}
          </Typography>

          <StyledCountdown
            sx={
              !isMobile
                ? {
                    position: 'absolute',
                    right: 0,
                    fontSize: '44px',
                    lineHeight: '53.25px',
                  }
                : {}
            }
            date={targetDate}
            daysInHours
            overtime
            onComplete={() => {
              // Always reset the timer when it completes
              const newDate = new Date();
              setCurrentDate(newDate);
            }}
          />
        </Stack>
      </Box>
      <Box height={bannerHeight} />
    </>
  );
};

export default BannerWL;
