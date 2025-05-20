import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface ImageContent {
  text1: string;
  highlight1: string;
  textBetweenHighlights: string;
  highlight2: string;
  imageSrc: string;
  text2: string;
  height: number;
  width: number;
}

interface ImageScreenProps {
  content: ImageContent;
}

const ImageScreen = ({ content }: ImageScreenProps) => {
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        borderRadius: '17px',
        padding: '19px',
        marginY: '19px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {content.text1 ||
        (content.text2 && (
          <Typography
            fontSize="30px!important"
            sx={{
              lineHeight: '40px!important',
              fontWeight: 700,
              padding: '19px',
              borderRadius: '17px',
              fontFamily: 'Gelasio',
              textAlign: 'center',
            }}
          >
            {content.text1}{' '}
            <span style={highlightedTextStyle}>{content.highlight1}</span>{' '}
            {content.textBetweenHighlights}{' '}
            <span style={highlightedTextStyle}>{content.highlight2}</span>{' '}
            {content.text2}
          </Typography>
        ))}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: content.width || '700px',
          padding: '19px',
          borderRadius: '17px',
          margin: '0 auto',
        }}
      >
        <Image
          alt="3-in-1"
          src={content.imageSrc}
          layout="fixed"
          quality={100}
          priority
          width={isMobile ? 435 : content.width}
          height={isMobile ? 250 : content.height}
          sizes="(max-width: 800px) 100vw, 800px"
        />
      </Box>
    </Box>
  );
};

export default ImageScreen;
