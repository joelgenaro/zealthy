import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import animationData from 'public/lottie/healthCareCheckup.json';
import { useEffect, useState } from 'react';

const Lottie = dynamic(() => import('react-lottie'), {
  ssr: false,
});

const defaultText =
  'Just a moment - we’re matching you with Zealthy providers!';

const HealthCheckupLoading = ({ text = defaultText }: { text?: string }) => {
  const [dynamicText, setDynamicText] = useState(text);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDynamicText(
        'It’s taking a little longer than usual to load - please hang tight while we find available appointment times'
      );
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
    >
      <Lottie
        height={150}
        width={150}
        options={{
          loop: true,
          autoplay: true,
          animationData,
        }}
      />
      <Typography>{dynamicText}</Typography>
    </Box>
  );
};

export default HealthCheckupLoading;
