import ConfirmationText from './ConfirmationText';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useMemo } from 'react';

export const ImagePreview = styled.img`
  display: flex;
  max-width: 100%;
  object-fit: contain;
  width: 100%;
  margin: auto;
`;

interface FilePreviewProps {
  showConfirmationText: boolean;
  file: string | File | Blob;
  title: string;
  onRemove: () => void;
}

const PDFPreview = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const FilePreview = ({
  showConfirmationText,
  file,
  title,
  onRemove,
}: FilePreviewProps) => {
  const fileUrl = useMemo(() => {
    if (file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return file;
  }, [file]);

  const isPDF = useMemo(() => {
    if (file instanceof Blob) {
      return file.type === 'application/pdf';
    }
    return file.endsWith('.pdf');
  }, [file]);

  return (
    <>
      {showConfirmationText ? <ConfirmationText /> : null}
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
        position="relative"
      >
        <Box display="flex">
          {isPDF ? (
            <PDFPreview src={fileUrl} />
          ) : (
            <ImagePreview
              src={fileUrl}
              alt={title || ''}
              width="fit-content"
              height="inherit"
            />
          )}
          <IconButton
            onClick={onRemove}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '4px',
              color: 'inherit',
            }}
          >
            <CancelOutlinedIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default FilePreview;
