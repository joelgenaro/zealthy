import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Webcam from 'react-webcam';
import { useCallback, useRef } from 'react';
import { FileType } from '@/components/shared/ImageUploader';
import { resizeImage } from '@/utils/resizeImage';

interface UploaderProps {
  setOpenWebcam: (m: boolean) => void;
  file: FileType | null;
  setFile: (m: any) => void;
  setFilePath: (file: FileType | null) => void;
}

const videoConstraints = {
  facingMode: 'user',
};

const buttonStyles = {
  height: '52px',
  padding: { sm: '0 32px', xs: '0 8px' },
  textTransform: 'none',
  borderRadius: '12px',
  border: '1px solid #000000',
  color: '#1B1B1B',
  fontSize: { sm: '1rem', xs: '0.75rem' },
};

const FemaleHairLossImageUploader = ({
  setOpenWebcam,
  file,
  setFile,
  setFilePath,
}: UploaderProps) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    return webcamRef.current?.getScreenshot();
  }, [webcamRef]);

  const disableWebcam = () => {
    setOpenWebcam(false);
  };

  const captureWebcamPhoto = () => {
    const screenshot = capture();
    resizeImage(screenshot!, 1024).then(resizedImage => {
      setFile({
        fileToUpload: resizedImage,
        type: 'image/jpeg',
        name: 'hair-loss',
        title: 'Hair loss selfie',
      });
      disableWebcam();
    });
  };

  return (
    <>
      <Box
        overflow="hidden"
        borderRadius="24px"
        maxWidth="464px"
        width="100%"
        height="260px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        margin="auto"
        border="1px dashed #1B1B1B"
        sx={{ cursor: 'pointer' }}
      >
        <Webcam
          style={{
            width: 'fit-content',
            height: 'inherit',
          }}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      </Box>
      <Box display="flex" gap="16px" justifyContent="center" width="100%">
        <Box display="flex" gap="16px" justifyContent="center" width="100%">
          <Button
            fullWidth
            variant="outlined"
            onClick={captureWebcamPhoto}
            sx={buttonStyles}
          >
            Take a Photo
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={disableWebcam}
            sx={buttonStyles}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default FemaleHairLossImageUploader;
