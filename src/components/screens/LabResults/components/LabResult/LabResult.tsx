import { useState, useEffect } from 'react';
import { Stack, Box, Typography, Link } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { UploadedDocType } from '@/components/screens/PatientPortal/components/DocumentsUpload/types';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { format } from 'date-fns';

const LabResult = ({ lab }: { lab: UploadedDocType }) => {
  const { downloadFile } = useUploadDocument();
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!downloadUrl) {
      downloadFile(lab.pathToFile).then(src =>
        setDownloadUrl(src || undefined)
      );
    }

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [lab.pathToFile, downloadUrl, downloadFile]);

  return (
    <Link
      href={downloadUrl || '#'}
      download={lab.label}
      target="_blank"
      rel="noreferrer"
      underline="none"
      color="inherit"
      sx={{ cursor: 'pointer' }}
      onClick={e => {
        if (!downloadUrl) {
          e.preventDefault();
        }
      }}
    >
      <Box
        width="100%"
        height="95px"
        border="1px solid #D8D8D8"
        bgcolor="white"
        borderRadius="10px"
        padding="24px"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack gap="10px" direction="row" alignItems="center">
          <DescriptionOutlinedIcon color="primary" fontSize="large" />
          <Stack gap="4px">
            <Typography variant="body1">
              {format(new Date(lab.created_at), 'MMMM d, yyyy')}
            </Typography>
            <Typography variant="h4">{lab.label}</Typography>
          </Stack>
        </Stack>
        <Box sx={{ opacity: 0.5 }}>→</Box>
      </Box>
    </Link>
  );
};

export default LabResult;
