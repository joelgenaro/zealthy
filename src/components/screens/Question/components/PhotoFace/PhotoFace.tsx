import ErrorMessage from '@/components/shared/ErrorMessage';
import ImageUploader, { FileType } from '@/components/shared/ImageUploader';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { QuestionWithName } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useCallback, useState } from 'react';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { imageToBlob } from '@/utils/imageToBlob';
import { useLanguage, usePatient } from '@/components/hooks/data';

interface PhotoFaceProps {
  question: QuestionWithName;
  nextPath: (nextPage?: string) => void;
}

const listItems = [
  'Your photo isn’t dark or blurry.',
  'You’re alone in the photo.',
  'Your photo hasn’t been edited/has no filter.',
  'Your photo is recent (taken in past 60 days).',
  'You’re not covering your face.',
];

const Criteria = () => {
  return (
    <Stack sx={{ minWidth: '240px' }}>
      <Typography>Please make sure:</Typography>
      <List
        sx={{
          listStyleType: 'disc',
          marginLeft: '25px',
          padding: '0',
        }}
      >
        {listItems.map(t => (
          <ListItem key={t} sx={{ display: 'list-item', padding: '0' }}>
            <Typography>{t}</Typography>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

const PhotoFace = ({ question, nextPath }: PhotoFaceProps) => {
  const [image, setImage] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const { data: patient } = usePatient();
  const language = useLanguage();

  let errorMsg = 'Please choose the image';
  if (language === 'esp') {
    errorMsg = 'Por favor seleccione una imagen';
  }

  const onConfirm = useCallback(async () => {
    if (!image) {
      setError(errorMsg);
      return;
    }
    setLoading(true);

    const folder = `patient-${patient?.id}/identification`;
    const blob = await imageToBlob(image.fileToUpload);
    return uploadFile(blob, `${folder}/front-of-card`)
      .then(() => {
        setLoading(false);
        nextPath();
      })
      .catch(err => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [image, nextPath, patient?.id, uploadFile]);

  const handleImage = useCallback((image: FileType | null) => {
    setImage(image);
    setError('');
  }, []);

  return (
    <Stack direction="column" gap="24px">
      {!image ? <Criteria /> : null}

      <ImageUploader
        title={'Upload photo'}
        subtitle={null}
        name={'face'}
        showConfirmationText={false}
        setFilePath={handleImage}
        uploadedPhoto={image}
        subImageTextOne={`Take a photo of your face`}
        subImageTextTwo={`Upload a photo of your face`}
      />

      <Stack direction="column" gap="16px">
        {image ? <Criteria /> : null}
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {loading && (
          <LoadingModal
            title="Uploading image..."
            description="This will take a few seconds."
          />
        )}
        <Button fullWidth onClick={onConfirm}>
          {question.buttonText}
        </Button>
      </Stack>
    </Stack>
  );
};

export default PhotoFace;
