import { Stack, Typography, Button, Link, Box } from '@mui/material';
import { useCallback, useState } from 'react';
import { UploadedDocType } from '../../screens/PatientPortal/components/DocumentsUpload/types';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { useLanguage } from '@/components/hooks/data';
import { format } from 'date-fns';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useBetterDocumentLoading } from '@/components/hooks/useBetterDocumentLoading';

interface UploadedCardProps {
  card: UploadedDocType;
  onUpdate: (card: UploadedDocType) => void;
  onError: (error: string) => void;
  refetch?: () => void;
}

const UploadedCard = ({
  onUpdate,
  card,
  onError,
  refetch,
}: UploadedCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { pathToFile, label, created_at } = card;
  const { removeFile, downloadFile } = useUploadDocument();
  const language = useLanguage();

  const { isDocumentLoading, openDocument, loadDocument } =
    useBetterDocumentLoading({
      onReturnFromDocument: () => {
        // No specific action needed when returning from document
      },
    });

  const documentLoading = isDocumentLoading(pathToFile);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const freshUrl = await downloadFile(pathToFile);

        if (freshUrl) {
          await loadDocument(pathToFile, async () => {
            try {
              const response = await fetch(freshUrl);
              return await response.blob();
            } catch (error) {
              console.error('Error loading document:', error);
              onError('Error loading document. Please try again.');
              return null;
            }
          });

          openDocument(pathToFile, freshUrl);
        } else {
          console.error('Could not get document URL');
          onError('Could not download document. Please try again.');
        }
      } catch (error) {
        console.error('Error downloading document:', error);
        onError('Error downloading document. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [pathToFile, openDocument, downloadFile, loadDocument, onError]
  );

  const removePhoto = useCallback(async () => {
    try {
      const { error } = await removeFile(pathToFile);

      if (error) {
        onError(error.message);
        return;
      }

      onUpdate(card);
      refetch?.();
    } catch (err) {
      console.error('Error removing document:', err);
      onError('Failed to delete document. Please try again.');
    }
  }, [card, onError, onUpdate, pathToFile, removeFile, refetch]);

  let remove = 'Remove';

  if (language === 'esp') {
    remove = 'Quitar';
  }

  return (
    <Box
      width="100%"
      border="1px solid #D8D8D8"
      bgcolor="white"
      borderRadius="10px"
      padding="24px"
    >
      <Stack
        direction="row"
        gap="16px"
        justifyContent="space-between"
        alignItems="center"
      >
        <Link
          href="#"
          download={label}
          underline="none"
          color="inherit"
          sx={{
            cursor: isLoading || documentLoading ? 'wait' : 'pointer',
            opacity: isLoading || documentLoading ? 0.7 : 1,
            flexGrow: 1,
            display: 'block',
          }}
          onClick={handleDownload}
          data-testid={`document-item-${pathToFile}`}
        >
          <Stack gap="10px" direction="row" alignItems="center">
            <DescriptionOutlinedIcon color="primary" fontSize="large" />
            <Stack gap="4px">
              <Typography variant="body1">
                {format(new Date(created_at), 'MMMM d, yyyy')}
              </Typography>
              <Typography variant="h4">{label}</Typography>
              {(isLoading || documentLoading) && (
                <Typography variant="caption" color="text.secondary">
                  Preparing download...
                </Typography>
              )}
            </Stack>
          </Stack>
        </Link>
        <Button
          onClick={removePhoto}
          variant="rounded"
          size="small"
          color="grey"
          disabled={isLoading || documentLoading}
        >
          {remove}
        </Button>
      </Stack>
    </Box>
  );
};

export default UploadedCard;
