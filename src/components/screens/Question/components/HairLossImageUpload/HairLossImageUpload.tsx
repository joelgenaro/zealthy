import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSelector } from '@/components/hooks/useSelector';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import ErrorMessage from '@/components/shared/ErrorMessage';
import ImageUploader, { FileType } from '@/components/shared/ImageUploader';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { Database } from '@/lib/database.types';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import { imageToBlob } from '@/utils/imageToBlob';
import { Stack, Button } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useState } from 'react';

interface HairLossImageUploaderProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  nextPath: (nextPage?: string) => void;
}

const HairLossImageUploader = ({
  question,
  questionnaire,
  nextPath,
}: HairLossImageUploaderProps) => {
  const [image, setImage] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const language = useLanguage();
  const { specificCare, potentialInsurance } = useIntakeState();
  const fromTrendingEnclomiphene = useSelector(
    store => store.intake?.variant === 'trending-card-enclomiphene'
  );
  const fromProgramsEnclomiphene = useSelector(
    store => store.intake?.variant === 'program-card-enclomiphene'
  );

  const onConfirm = useCallback(async () => {
    if (!image) {
      setError('Please choose the image');
      return;
    }

    setLoading(true);

    const front = await imageToBlob(image.fileToUpload);
    return await uploadFile(
      front,
      `patient-${patient?.id}/${question?.questionnaire}/${question?.label}`
    )
      .then(async () => {
        if (specificCare === 'Enclomiphene') {
          window?.freshpaint?.track('enclomiphene-labs-uploaded');
          await supabase.from('task_queue').insert({
            task_type: 'ENCLOMIPHENE_REVIEW_LABS',
            patient_id: patient?.id,
            queue_type: 'Provider (QA)',
            note: 'Enclomiphene - review labs & prescribe enclomiphene if clinically appropriate',
          });
          await supabase.from('task_queue').insert({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id,
            queue_type: 'Provider (QA)',
          });
        }
        setImage(null);
        setLoading(false);
        fromTrendingEnclomiphene || fromProgramsEnclomiphene
          ? Router.push(`/what-next`)
          : questionnaire?.care === 'hair loss f' &&
            question?.name === 'PHOTOS_TWO'
          ? Router.push('/checkout')
          : nextPath();
      })
      .catch(err => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [image, nextPath, uploadFile]);

  const handleSkip = useCallback(() => {
    nextPath();
  }, [nextPath]);

  const handleImage = useCallback((image: FileType | null) => {
    setImage(image);
    setError('');
  }, []);

  let uploadImageTitle = 'Take a photo of';
  let uploadImageSubtitle = 'Upload a photo of';
  let buttonText = 'Submit';
  let skipButtonText = 'Skip';
  let loadingTitle = 'Uploading image...';
  let loadingDescription = 'This will take a few seconds.';

  if (language === 'esp') {
    uploadImageTitle = 'Toma una foto de';
    uploadImageSubtitle = 'Sube una foto de';
    buttonText = 'Subir fotos';
    skipButtonText = 'Omitir';
    loadingTitle = 'Subiendo imagen...';
    loadingDescription = 'Esto tardará unos segundos.';
  }

  return (
    <Stack direction="column" gap="48px">
      <ImageUploader
        title={null}
        subtitle={null}
        name={question.label!}
        showConfirmationText={false}
        setFilePath={handleImage}
        uploadedPhoto={image}
        subImageTextOne={`${uploadImageTitle} ${
          (question?.label === 'Lab work' || question?.label === 'Full body') &&
          language === 'esp'
            ? 'su'
            : ''
        } ${question.label!.toLowerCase()}`}
        subImageTextTwo={
          question?.label === 'Lab work' || question?.label === 'Full body'
            ? `${uploadImageSubtitle} ${question.label!.toLowerCase()}`
            : `${uploadImageSubtitle} ${question.label!.toLowerCase()}`
        }
      />
      <Stack direction="column" gap="16px">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {loading && (
          <LoadingModal title={loadingTitle} description={loadingDescription} />
        )}
        <Button fullWidth onClick={onConfirm}>
          {buttonText}
        </Button>
        {question.allowToSkip ? (
          <Button
            fullWidth
            color="grey"
            onClick={handleSkip}
            sx={{
              ...(question.styles || {}).button,
            }}
          >
            {skipButtonText}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default HairLossImageUploader;
