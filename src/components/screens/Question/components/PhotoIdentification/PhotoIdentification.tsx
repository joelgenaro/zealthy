import { useCallback, useEffect, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Button } from '@mui/material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploaderControlled';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAnswerAsync, useAnswerState } from '@/components/hooks/useAnswer';
import { Questionnaire, QuestionnaireName } from '@/types/questionnaire';
import { useRouter } from 'next/router';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

interface PhotoIdentificationProps {
  nextPage: (nextPage?: string) => void;
  questionnaire: Questionnaire;
}
function isBlob(file: any): file is Blob {
  return file instanceof Blob;
}
function isFile(file: any): file is File {
  return file instanceof File;
}
const convertToBlob = async (file: FileType['fileToUpload']): Promise<Blob> => {
  if (isBlob(file)) {
    return file;
  } else if (typeof file === 'string') {
    const response = await fetch(file);
    return await response.blob();
  } else if (isFile(file)) {
    return file;
  }
  throw new Error('Unsupported file type');
};

const PhotoIdentification = ({
  nextPage,
  questionnaire,
}: PhotoIdentificationProps) => {
  const isMobile = useIsMobile();
  const supabase = useSupabaseClient();
  const [file, setFile] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const { data: patient } = usePatient();
  const { data: variant5484 } = useVWOVariationName('5484');
  const { data: variant5871 } = useVWOVariationName('5871_new');
  const { data: variant8205 } = useVWOVariationName('8205');
  const { specificCare } = useIntakeState();
  const language = useLanguage();
  const router = useRouter();
  const answers = useAnswerState();
  const { submitAnswer } = useAnswerAsync({
    ...questionnaire,
    name: QuestionnaireName.WEIGHT_LOSS_POST_V2,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notVerifiedEventFired, setNotVerifiedEventFired] =
    useState<boolean>(false);
  const [verifiedEventFired, setVerifiedEventFired] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      variant8205?.variation_name !== 'Variation-3' ||
      specificCare !== SpecificCareOption.ENCLOMIPHENE ||
      notVerifiedEventFired ||
      verifiedEventFired ||
      patient?.has_verified_identity ||
      patient?.vouched_verified
    ) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (
        window?.freshpaint &&
        !patient?.has_verified_identity &&
        !patient?.vouched_verified &&
        !notVerifiedEventFired &&
        !verifiedEventFired
      ) {
        window.freshpaint.track('nonwl-purchased-but-not-verified');
        console.log(
          'PhotoIdentification - Tracked: nonwl-purchased-but-not-verified'
        );
        setNotVerifiedEventFired(true);
      }
    }, 10000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    patient?.has_verified_identity,
    patient?.vouched_verified,
    variant8205?.variation_name,
    specificCare,
    notVerifiedEventFired,
    verifiedEventFired,
  ]);

  const trackVerificationComplete = useCallback(() => {
    if (
      variant8205?.variation_name === 'Variation-3' &&
      specificCare === SpecificCareOption.ENCLOMIPHENE &&
      !verifiedEventFired &&
      typeof window !== 'undefined'
    ) {
      if (window?.freshpaint) {
        window.freshpaint.track('nonwl-completed-ID-verification');
        console.log(
          'PhotoIdentification - Tracked: nonwl-completed-ID-verification'
        );
        setVerifiedEventFired(true);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [variant8205?.variation_name, specificCare, verifiedEventFired]);

  const deleteFile = () => {
    setFile(null);
    handleImage(null);
  };

  let errorMsg = 'Please choose the image';
  if (language === 'esp') {
    errorMsg = 'Por favor seleccione una imagen';
  }

  const onConfirm = useCallback(async () => {
    if (!file) {
      setError(errorMsg);
      return;
    }
    setLoading(true);

    if (
      ['Variation-1', 'Variation-2']?.includes(variant5484?.variation_name!) ||
      variant5871?.variation_name === 'Variation-1'
    ) {
      try {
        await supabase
          .from('patient')
          .update({
            has_verified_identity: true,
          })
          .eq('id', patient?.id);
      } catch (err) {
        console.error('Error updating patient identity:', err);
      }
    }

    const folder = `patient-${patient?.id}/identification`;
    const blob = await convertToBlob(file.fileToUpload);

    uploadFile(blob, `${folder}/front-of-card`)
      .then(async () => {
        try {
          await supabase
            .from('patient')
            .update({
              has_verified_identity: true,
            })
            .eq('id', patient?.id);

          const { data: updatedPatient, error } = await supabase
            .from('patient')
            .select('has_verified_identity')
            .eq('id', patient?.id!)
            .single();

          if (error) {
            console.error('Error fetching updated patient:', error);
          } else if (updatedPatient?.has_verified_identity) {
            window?.freshpaint?.track('weight-loss-completed-ID-verification');

            if (specificCare === SpecificCareOption.ENCLOMIPHENE) {
              trackVerificationComplete();
            }
          }
        } catch (err) {
          console.error('Error updating/fetching final patient record:', err);
        }

        setLoading(false);
        nextPage();
      })
      .catch(err => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [
    file,
    errorMsg,
    nextPage,
    patient?.id,
    supabase,
    uploadFile,
    variant5484?.variation_name,
    variant5871?.variation_name,
    specificCare,
    trackVerificationComplete,
  ]);

  const handleImage = useCallback((image: FileType | null) => {
    setFile(image);
    setError('');
  }, []);

  useEffect(() => {
    console.log(answers['WEIGHT-LOSS-TREATMENT-A-Q1'], 'VARUN1');
    if (answers['WEIGHT-LOSS-TREATMENT-A-Q1'] && submitAnswer !== null) {
      console.log(answers['WEIGHT-LOSS-TREATMENT-A-Q1'], 'VARUN2');
      const submit = async () => {
        console.log('SUBMITTING ANSWERS');
        await submitAnswer();
      };
      submit();
    }
  }, [answers, submitAnswer]);

  return (
    <Container maxWidth="xs">
      <Stack gap={isMobile ? '1.5rem' : '1rem'}>
        <Typography variant="h2">
          {file ? 'Review and confirm your ID' : 'Identification'}
        </Typography>
        <Typography>
          For your security and to comply with telemedicine regulation, you must
          verify your identity with a photo ID. Any ID with your name and photo
          will be sufficient.
        </Typography>
        <Typography>
          Examples: Driver's License, Passport, School ID, Consular ID
        </Typography>
      </Stack>
      <Stack mt={6} gap={1}>
        <Typography variant="h3">Upload your ID</Typography>
        <ImageUploader
          title={null}
          subtitle={null}
          name={'id-card'}
          showConfirmationText={false}
          setFilePath={handleImage}
          file={file}
          setFile={setFile}
          subImageTextOne={`Take a photo of your ID`}
          subImageTextTwo={`Upload a photo of your ID`}
          subImageTextMobile={`Add photo ID`}
          nextPage={nextPage}
        />
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {file && (
          <Stack mt={3} alignItems="center" gap={5}>
            <LoadingButton loading={loading} fullWidth onClick={onConfirm}>
              Use this ID
            </LoadingButton>
            <Link
              style={{ cursor: 'pointer', fontWeight: '600' }}
              onClick={() => deleteFile()}
            >
              Discard changes
            </Link>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default PhotoIdentification;
