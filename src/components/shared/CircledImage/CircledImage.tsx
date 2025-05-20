import { Box, Typography } from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import Circle from '../Circle';

interface CircledImageProps {
  src: string | StaticImageData;
  showBio?: boolean;
  openBio?: () => void;
}

const CircledImage = ({ src, showBio, openBio }: CircledImageProps) => {
  return (
    <Box
      position="relative"
      justifyContent="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Circle size="200px">
        <Image
          src={src}
          alt="image of a care provider"
          width={200}
          height={0}
          style={{ height: 'auto' }}
        />
      </Circle>
      {showBio && (
        <Box
          bgcolor="primary.main"
          color="background.paper"
          width="105px"
          textAlign="center"
          position="absolute"
          bottom="-15px"
          padding="0.5rem"
          borderRadius="20px"
          sx={{ cursor: 'pointer' }}
          onClick={openBio}
        >
          <Typography>Read Bio</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CircledImage;
