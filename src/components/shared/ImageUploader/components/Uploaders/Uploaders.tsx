import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Box, Divider } from '@mui/material';
import FileUploader from './FileUploader';
import WebcamUploader from './WebcamUploader';

interface UploadersProps {
  title: string | null;
  subtitle: string | null;
  activateWebcam: () => void;
  onDrop: (acceptedFiles: File[]) => void;
  subImageTextOne: string | null;
  subImageTextTwo: string | null;
  isLoading: boolean;
  isFullBodyVerification?: boolean;
}

const Uploaders = ({
  title,
  subtitle,
  activateWebcam,
  onDrop,
  subImageTextOne,
  subImageTextTwo,
  isLoading,
  isFullBodyVerification,
}: UploadersProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <FileUploader
          onDrop={onDrop}
          subImageText={subImageTextOne}
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

          {isFullBodyVerification ? null : (
            <>
              <Divider sx={{ margin: '48px 0' }}>or</Divider>

              <FileUploader
                onDrop={onDrop}
                subImageText={subImageTextTwo}
                title={null}
                subtitle={null}
                isLoading={isLoading}
              />
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default Uploaders;
