import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import React from 'react';
import WhatNextImage1 from 'public/images/female-hair-loss/WhatNextImage1';
import WhatNextImage2 from 'public/images/female-hair-loss/WhatNextImage2';
import WhatNextImage3 from 'public/images/female-hair-loss/WhatNextImage3';
import { useIsMobile } from '@/components/hooks/useIsMobile';

const whatNextSteps = [
  {
    image: <WhatNextImage1 />,
    header: '1. Your hair history',
    description: 'Answer a few questions about your hair  health',
  },
  {
    image: <WhatNextImage2 />,
    header: '2. Provider review',
    description:
      'A licensed provider reviews your answers to determine the best treatment plan for you',
  },
  {
    image: <WhatNextImage3 />,
    header: '3. Delivered to your door',
    description:
      'If prescribed, your treatment is shipped straight to your door',
  },
];

const FemaleHairLossWhatNext = () => {
  const isMobile = useIsMobile();

  return (
    <Stack display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h2" sx={{ color: '#00531B', display: 'flex' }}>
        {"What's Next"}
      </Typography>
      <Typography fontFamily="Gelasio" variant="h3">
        {'Strengthen and regrow hair with a few steps'}
      </Typography>
      <br></br>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        sx={{ gap: '2rem' }}
      >
        {whatNextSteps.map((step, idx) => (
          <Box
            key={'step' + idx}
            sx={{
              boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
              padding: '24px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {step.image}
            </Box>
            <br></br>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Typography fontWeight={700}>{step.header}</Typography>
              <Typography
                variant="h4"
                sx={{ textAlign: 'start', color: '#6B6B6B' }}
              >
                {step.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default FemaleHairLossWhatNext;
