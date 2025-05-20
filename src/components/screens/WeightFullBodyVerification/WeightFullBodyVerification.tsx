import { usePatient } from '@/components/hooks/data';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import ErrorMessage from '@/components/shared/ErrorMessage';
import ImageUploader, { FileType } from '@/components/shared/ImageUploader';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { Pathnames } from '@/types/pathnames';
import { imageToBlob } from '@/utils/imageToBlob';
import { Button, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const WeightFullBodyVerification = () => {
  const [image, setImage] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const { data: patient } = usePatient();
  const { updateActionItem } = useMutatePatientActionItems();

  const handleImage = useCallback((image: FileType | null) => {
    setImage(image);
    setError('');
  }, []);

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
      `patient-${patient.id}/full-body-photo/image1`
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    updateActionItem({
      patient_id: patient.id!,
      completed_at: new Date().toISOString(),
      completed: true,
      type: 'FULL_BODY_PHOTO',
    });

    Router.replace(Pathnames.PATIENT_PORTAL);
    toast.success('Thank you for submitting your photo');
  }, [image, patient, uploadFile]);

  return (
    <Stack gap="48px">
      <Stack gap="16px">
        <Typography variant="h2">Upload photo of your body</Typography>
        <Typography>
          {`Please take or upload a photo that shows your entire body (with clothes on) for your provider to review. All you need is a scale, your phone, and yourself!`}
        </Typography>
        <Typography>
          {`Once it’s uploaded, your provider will review the photo, which will serve as a physical exam so that they can write your prescription if medically appropriate.`}
        </Typography>
      </Stack>
      <ImageUploader
        title={null}
        subtitle={null}
        name={'weight-full-body-verification'}
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

export default WeightFullBodyVerification;
