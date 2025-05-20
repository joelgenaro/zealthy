import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import DottedBox from './DottedBox';
import UploadIcon from '@/components/shared/icons/UploadIcon';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Loading from '@/components/shared/Loading/Loading';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { CameraAltOutlined } from '@mui/icons-material';

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  subImageText: string | null;
  title: string | null;
  subtitle: string | null;
  isLoading: boolean;
}

const FileUploader = ({
  onDrop,
  subImageText,
  title,
  subtitle,
  isLoading,
}: FileUploaderProps) => {
  const isMobile = useIsMobile();
  const [_, setIsDraggingOver] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });

  const hasText = useMemo(() => {
    return !!(title || subtitle);
  }, []);

  return (
    <Stack gap="16px" direction="column">
      {hasText ? (
        <Stack>
          {title ? <Typography variant="h2">{title}</Typography> : null}
          {subtitle ? <Typography>{subtitle}</Typography> : null}
        </Stack>
      ) : null}
      <div {...getRootProps()} style={{ width: 'inherit' }}>
        <input {...getInputProps()} />
        <DottedBox>
          {isLoading ? (
            <Loading />
          ) : isMobile ? (
            <CameraAltOutlined fontSize="large" />
          ) : (
            <UploadIcon fontSize="large" />
          )}
        </DottedBox>
      </div>
      {subImageText ? (
        <Typography variant="body2" component="p" sx={{ textAlign: 'center' }}>
          {subImageText}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default FileUploader;
