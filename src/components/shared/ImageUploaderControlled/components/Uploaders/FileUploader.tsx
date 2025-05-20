import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import DottedBox from './DottedBox';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Loading from '@/components/shared/Loading/Loading';
import Circle from '@/components/shared/Circle';
import AddIcon from '@mui/icons-material/Add';

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
  const [_, setIsDraggingOver] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });

  return (
    <Stack gap="16px" direction="column">
      <Stack>
        {title ? <Typography variant="h2">{title}</Typography> : null}
        {subtitle ? <Typography>{subtitle}</Typography> : null}
      </Stack>
      <div {...getRootProps()} style={{ width: 'inherit' }}>
        <input {...getInputProps()} />
        <DottedBox>
          <Stack direction="column" alignItems="center">
            <Circle size="72px">
              {isLoading ? <Loading /> : <AddIcon fontSize="large" />}
            </Circle>
            {subImageText ? (
              <Typography
                variant="body2"
                component="p"
                sx={{ marginTop: '16px', textAlign: 'center' }}
              >
                {subImageText}
              </Typography>
            ) : null}
          </Stack>
        </DottedBox>
      </div>
    </Stack>
  );
};

export default FileUploader;
