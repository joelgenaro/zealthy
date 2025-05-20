import { QuestionWithName } from '@/types/questionnaire';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import React from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import HairLossBeforeAfterPost from 'public/images/female-hair-loss/HairLossBeforeAfterPost';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface BeforeAfterProps {
  question: QuestionWithName;
}

const FemaleHairLossBeforeAfter = ({ question }: BeforeAfterProps) => {
  const isMobile = useIsMobile();

  const highlightedText = {
    backgroundColor: '#B8F5CC',
    color: '#00531B',
    width: 'fit-content',
    padding: '4px',
    borderRadius: '10px',
    fontWeight: 500,
  };

  return (
    <Stack gap={3}>
      <Typography
        fontSize="21px!important"
        sx={{ lineHeight: '35px!important' }}
      >
        We’re here to help you get there. With{' '}
        <span style={highlightedText}>personalized treatment,</span>
        <br></br>
        you can start to see results in just{' '}
        <span style={highlightedText}>3 to 6 months</span>
      </Typography>
      <Box
        sx={{
          backgroundColor: '#F6EFE3',
          padding: '19px 19px 29px 19px',
          borderRadius: '17px',
        }}
      >
        <Image
          alt="before-after"
          src="https://api.getzealthy.com/storage/v1/object/public/questions/before-after-hair-loss-2.png"
          height={isMobile ? 250 : 400}
          width={435}
          quality={100}
          style={{ width: '100%' }}
        />
        <Box display="flex" gap={2}>
          <HairLossBeforeAfterPost />
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            variant="h3"
          >
            Jenna N.
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};

export default FemaleHairLossBeforeAfter;
