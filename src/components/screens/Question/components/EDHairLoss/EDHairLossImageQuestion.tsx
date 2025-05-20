import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface EDHairLossImageQuestionContent {
  text1: string;
  highlight1: string;
  textBetweenHighlights: string;
  highlight2: string;
  imageSrc: string;
  text2: string;
}

interface EDHairLossImageQuestionProps {
  content: EDHairLossImageQuestionContent;
}

const EDHairLossImageQuestion = ({ content }: EDHairLossImageQuestionProps) => {
  const isMobile = useIsMobile();

  const highlightedTextStyle = {
    backgroundColor: '#B8F5CC',
    color: '#00531B',
    width: 'fit-content',
    padding: '4px',
    borderRadius: '10px',
    fontWeight: 700,
  };

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography
          fontSize="30px!important"
          sx={{
            lineHeight: '40px!important',
            fontWeight: 700,
            padding: '19px',
            borderRadius: '17px',
            fontFamily: 'Gelasio',
          }}
        >
          {content.text1}{' '}
          <span style={highlightedTextStyle}>{content.highlight1}</span>{' '}
          {content.textBetweenHighlights}{' '}
          <span style={highlightedTextStyle}>{content.highlight2}</span>{' '}
          {content.text2}
        </Typography>
        <Box
          sx={{
            padding: '19px',
            borderRadius: '17px',
            overflow: 'hidden',
          }}
        >
          <Image
            alt="ed-hl-image-question"
            src={content.imageSrc}
            layout="intrinsic"
            quality={100}
            priority
            height={isMobile ? 250 : 400}
            width={435}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EDHairLossImageQuestion;
