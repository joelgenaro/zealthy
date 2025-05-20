import { usePatient } from '@/components/hooks/data';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import ErrorMessage from '@/components/shared/ErrorMessage';
import ImageUploader, { FileType } from '@/components/shared/ImageUploader';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { Pathnames } from '@/types/pathnames';
import { imageToBlob } from '@/utils/imageToBlob';
import { Button, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

const List = ({ listItems }: { listItems: string[] }) => {
  return (
    <Stack>
      {listItems.map((text, idx) => (
        <Stack key={text} direction="row" gap="8px">
          <Typography>{idx + 1}</Typography>
          <Typography>{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

const Instructions = [
  'Wear lightweight clothing. Please take off your shoes.',
  'Stand on the scale.',
  'Take a photo of the scale. Ensure the weight is clearly visible in the photo.',
];

const WeightVerification = () => {
  const [image, setImage] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const { data: patient } = usePatient();

  const onConfirm = useCallback(async () => {
    if (!patient) return;
    if (!image) {
      setError('Please provide an image to submit');
      return;
    }

    setError('');
    setLoading(true);

    const front = await imageToBlob(image.fileToUpload);
    const { error } = await uploadFile(
      front,
      `patient-${patient.id}/weight-verification/image1`
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    Router.replace(Pathnames.PATIENT_PORTAL);
    toast.success('Thank you for submitting your scale photo');
  }, [image, patient, uploadFile]);

  const handleImage = useCallback((image: FileType | null) => {
    setImage(image);
    setError('');
  }, []);

  return (
    <Stack gap="48px">
      <Stack gap="16px">
        <Typography variant="h2">Confirm weight</Typography>
        <Typography>
          {`We need to verify your weight so we can ensure we're providing members
          with the most appropriate care. All you need is a scale, your phone,
          and yourself!`}
        </Typography>
        <Typography>Instructions:</Typography>
        <List listItems={Instructions} />
        <Typography>
          Once it’s uploaded, your provider will review the photo to verify your
          weight. If your scale photo is of someone who is not yourself, your
          provider will not be able to provide treatment.
        </Typography>
      </Stack>
      <ImageUploader
        title={null}
        subtitle={null}
        name={'weight-verification'}
        showConfirmationText={false}
        setFilePath={handleImage}
        uploadedPhoto={image}
        subImageTextOne={null}
        subImageTextTwo={null}
        isFullBodyVerification={false}
      />
      <Stack>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {loading && (
          <LoadingModal
            title="Uploading image..."
            description="This will take a few seconds."
          />
        )}
        <Button fullWidth onClick={onConfirm}>
          Upload photo
        </Button>
      </Stack>
    </Stack>
  );
};

export default WeightVerification;
