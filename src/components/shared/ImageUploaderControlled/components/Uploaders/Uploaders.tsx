import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import FileUploader from './FileUploader';
import WebcamUploader from './WebcamUploader';

interface UploadersProps {
  title: string | null;
  subtitle: string | null;
  activateWebcam: () => void;
  onDrop: (acceptedFiles: File[]) => void;
  subImageTextOne: string | null;
  subImageTextTwo: string | null;
  subImageTextMobile: string | null;
  isLoading: boolean;
}

const Uploaders = ({
  title,
  subtitle,
  activateWebcam,
  onDrop,
  subImageTextOne,
  subImageTextTwo,
  subImageTextMobile,
  isLoading,
}: UploadersProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {isMobile ? (
        <FileUploader
          onDrop={onDrop}
          subImageText={subImageTextMobile}
          title={title}
          subtitle={subtitle}
          isLoading={isLoading}
        />
      ) : (
        <Box>
          <WebcamUploader
            title={title}
            subtitle={subtitle}
            onClick={activateWebcam}
            subImageText={subImageTextOne}
          />

          <Divider sx={{ margin: '48px 0' }}>or</Divider>

          <FileUploader
            onDrop={onDrop}
            subImageText={subImageTextTwo}
            title={null}
            subtitle={null}
            isLoading={isLoading}
          />
        </Box>
      )}
    </>
  );
};

export default Uploaders;
