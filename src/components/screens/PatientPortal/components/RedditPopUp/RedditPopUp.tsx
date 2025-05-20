import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ChevronRight } from '@mui/icons-material';
import React from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';

const RedditPopUp = () => {
  const isMobile = useIsMobile();

  return (
    <Box
      onClick={() =>
        window.open('https://www.reddit.com/r/getZealthy/', '_blank')
      }
      sx={{
        background:
          'linear-gradient(102deg, #00531B -11.61%, rgba(0, 83, 21, 0.20) 106.16%)',
        padding: isMobile ? '20px' : '25px',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#FFFFFF',
          fontSize: isMobile ? '20px' : '24px!important',
        }}
      >
        Join Zealthy’s Reddit Community
      </Typography>
      <IconButton
        sx={{
          color: 'white',
          padding: '0',
        }}
        edge="start"
      >
        <ChevronRight fontSize={'large'} />
      </IconButton>
    </Box>
  );
};

export default RedditPopUp;
