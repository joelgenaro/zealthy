import ErrorMessage from '@/components/shared/ErrorMessage';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import Spinner from '@/components/shared/Loading/Spinner';
import {
  Button,
  Typography,
  useTheme,
  Box,
  Link,
  Stack,
  IconButton,
} from '@mui/material';
import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { UploadedDocType } from '../types';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useBetterDocumentLoading } from '@/components/hooks/useBetterDocumentLoading';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const OtherDocumentItem = ({
  doc,
  onRemove,
}: {
  doc: UploadedDocType;
  onRemove: (doc: UploadedDocType) => void;
}) => {
  const { isDocumentLoading, openDocument, loadDocument } =
    useBetterDocumentLoading({
      onReturnFromDocument: () => {},
    });

  const [isLoading, setIsLoading] = useState(false);
  const { downloadFile } = useUploadDocument();

  const documentLoading = isDocumentLoading(doc.pathToFile);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const freshUrl = await downloadFile(doc.pathToFile);

        if (freshUrl) {
          await loadDocument(doc.pathToFile, async () => {
            try {
              const response = await fetch(freshUrl);
              return await response.blob();
            } catch (error) {
              console.error('Error loading document:', error);
              return null;
            }
          });

          openDocument(doc.pathToFile, freshUrl);
        } else {
          console.error('Could not get document URL');
        }
      } catch (error) {
        console.error('Error downloading document:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [doc.pathToFile, openDocument, downloadFile, loadDocument]
  );

  const handleDelete = () => {
    onRemove(doc);
  };

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
          download={doc.label}
          underline="none"
          color="inherit"
          sx={{
            cursor: isLoading || documentLoading ? 'wait' : 'pointer',
            opacity: isLoading || documentLoading ? 0.7 : 1,
            flexGrow: 1,
          }}
          onClick={handleDownload}
          data-testid={`document-item-${doc.pathToFile}`}
        >
          <Stack gap="10px" direction="row" alignItems="center">
            <DescriptionOutlinedIcon color="primary" fontSize="large" />
            <Stack gap="4px">
              <Typography variant="body1">
                {format(new Date(doc.created_at), 'MMMM d, yyyy')}
              </Typography>
              <Typography variant="h4">{doc.label}</Typography>
              {(isLoading || documentLoading) && (
                <Typography variant="caption" color="text.secondary">
                  Preparing download...
                </Typography>
              )}
            </Stack>
          </Stack>
        </Link>
        <Button
          onClick={handleDelete}
          variant="rounded"
          size="small"
          color="grey"
          disabled={isLoading || documentLoading}
        >
          Remove
        </Button>
      </Stack>
    </Box>
  );
};

const OtherDocuments = ({ patientId }: { patientId: number | undefined }) => {
  const [docs, setDocs] = useState<UploadedDocType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const { uploadFile, fetchFiles, downloadFile, removeFile } =
    useUploadDocument();
  const supabase = useSupabaseClient<Database>();
  const { loadDocument } = useBetterDocumentLoading({
    onReturnFromDocument: () => {},
  });

  const folder = `patient-${patientId}/other`;

  const handleRemoveDocument = useCallback(
    async (docToRemove: UploadedDocType) => {
      try {
        setError('');
        await removeFile(docToRemove.pathToFile);
        setDocs(docs =>
          docs.filter(doc => doc.pathToFile !== docToRemove.pathToFile)
        );
      } catch (error) {
        console.error('Error removing document:', error);
        setError('Failed to delete document. Please try again.');
      }
    },
    [removeFile]
  );

  const uploadPhoto: ChangeEventHandler<HTMLInputElement> = useCallback(
    async e => {
      const file = e.target.files?.[0];
      if (!file) return;

      const originalName = file.name;
      const fileExtension = originalName.includes('.')
        ? originalName.split('.').pop() || ''
        : '';

      const documentNumber = docs.length + 1;
      const fileName = `Other_Document_${documentNumber}${
        fileExtension ? '.' + fileExtension : ''
      }`;

      setLoading(true);
      setError('');

      try {
        const { data, error } = await uploadFile(file, `${folder}/${fileName}`);

        if (error) {
          console.error('Upload error:', error);
          setError(error.message);
          return;
        }

        if (!data) {
          setError('Upload successful but no data returned');
          return;
        }

        const path = data.data?.path || '';

        if (path) {
          const displayName = fileName;

          const newDoc = {
            pathToFile: path,
            label: displayName,
            created_at: new Date().toISOString(),
          };

          setDocs(uploads => [newDoc, ...uploads]);

          const url = await downloadFile(path);
          if (url) {
            await loadDocument(path, async () => {
              try {
                const response = await fetch(url);
                return await response.blob();
              } catch (error) {
                console.error('Error pre-loading document:', error);
                return null;
              }
            });
          }

          try {
            await supabase.storage
              .from('patients')
              .remove([`patient-${patientId}/requested/new`]);
          } catch (removeError) {
            console.error('Error removing requested file:', removeError);
          }
        } else {
          console.error('Upload successful but no path returned');
          setError('Failed to upload file. Please try again.');
        }
      } catch (err) {
        console.error('Unexpected upload error:', err);
        setError(
          'An unexpected error occurred during upload. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      docs.length,
      folder,
      uploadFile,
      patientId,
      supabase.storage,
      downloadFile,
      loadDocument,
    ]
  );

  useEffect(() => {
    fetchFiles(folder).then(images => {
      const sortedDocs = images
        .map(image => ({
          pathToFile: `${folder}/${image.name}`,
          label: image.name,
          created_at: image.created_at || new Date().toISOString(),
        }))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setDocs(sortedDocs);
    });
  }, [fetchFiles, folder]);

  return (
    <Stack direction="column" gap="16px">
      <Typography variant="h3">Other documents</Typography>

      <Stack gap={2}>
        {docs.map(doc => (
          <OtherDocumentItem
            key={doc.pathToFile}
            doc={doc}
            onRemove={handleRemoveDocument}
          />
        ))}
      </Stack>

      <WhiteBox padding="24px">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography color={theme.palette.primary.main} fontWeight="600">
            Additional document
          </Typography>
          <Button component="label" variant="rounded" size="small">
            {loading ? <Spinner size="1.3em" color="inherit" /> : 'Upload'}
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/heic,application/pdf"
              onChange={uploadPhoto}
            />
          </Button>
        </Stack>
      </WhiteBox>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </Stack>
  );
};

export default OtherDocuments;
