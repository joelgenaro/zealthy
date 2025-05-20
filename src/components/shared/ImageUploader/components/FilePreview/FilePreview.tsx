import ConfirmationText from './ConfirmationText';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PDFIcon from '@/components/shared/icons/PdfIcon';

export const ImagePreview = styled.img`
  display: flex;
  max-width: 100%;
  object-fit: contain;
  width: 100%;
  margin: auto;
`;

interface FilePreviewProps {
  showConfirmationText: boolean;
  file: string;
  title: string;
  fileType: string;
  onRemove: () => void;
}

const FilePreview = ({
  showConfirmationText,
  file,
  title,
  onRemove,
  fileType,
}: FilePreviewProps) => {
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
          {fileType !== 'application/pdf' ? (
            <ImagePreview
              src={file}
              alt={title || ''}
              width="fit-content"
              height="inherit"
            />
          ) : (
            <PDFIcon />
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
