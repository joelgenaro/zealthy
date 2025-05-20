import { useMemo, useState, useCallback } from 'react';
import { Button, Container, Grid } from '@mui/material';
import {
  useInsuranceActions,
  useInsuranceAsync,
} from '@/components/hooks/useInsurance';
import { FileType } from '@/components/shared/ImageUploader/ImageUploader';
import { useRouter } from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { DocumentStatus, ExtractedFieldDto } from 'butler-sdk';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import UploaderCard from './components/UploaderCard/UploaderCard';
import { resizeImage } from '@/utils/resizeImage';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { imageToBlob } from '@/utils/imageToBlob';

const mapResponseToDetails = (response: ExtractedFieldDto[]) => {
  const memberName =
    response.find(field => field.fieldName === 'Member Name')?.value || '';
  const member_id =
    response.find(field => field.fieldName === 'ID Number')?.value || '';

  return {
    policyholder_first_name: memberName.split(' ')[0],
    policyholder_last_name: memberName.split(' ')[1],
    member_id,
  };
};

const InsuranceCapture = () => {
  const { extractDataFromCard } = useInsuranceAsync();
  const [frontOfCard, setFrontOfCard] = useState<FileType | null>(null);
  const [backOfCard, setBackOfCard] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const { addHasInsurance, addInsurancePolicy } = useInsuranceActions();
  const { potentialInsurance } = useIntakeState();
  const { uploadFile } = useUploadDocument();
  const Router = useRouter();
  const { data: patient } = usePatient();
  const redirectUser = useRedirectUser(patient?.id);

  const currentCardStep = useMemo(() => {
    if (Router.query.type === 'back') return 'back';
    else return 'front';
  }, [Router.query.type]);

  const handleFrontOfCard = useCallback((file: FileType | null) => {
    setError('');
    setFrontOfCard(file);
  }, []);

  const handleBackOfCard = useCallback((file: FileType | null) => {
    setError('');
    setBackOfCard(file);
  }, []);

  const skipInsurance = useCallback(async () => {
    addHasInsurance(false);
    setSkipLoading(true);
    if (potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2) {
      return Router.push(Pathnames.WHAT_NEXT);
    }
    await redirectUser();
    setSkipLoading(false);
  }, [addHasInsurance, redirectUser, potentialInsurance]);

  const handleSubmit = useCallback(async () => {
    if (!frontOfCard) {
      setError('Please upload front of the card');
      return;
    } else if (currentCardStep === 'front') {
      Router.push({
        pathname: Pathnames.INSURANCE_CAPTURE,
        query: { type: 'back' },
      });
      return;
    }

    if (!backOfCard) {
      setError('Please upload back of the card');
      return;
    }

    try {
      setLoading(true);
      if (potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2) {
        const folder = `patient-${patient?.id}/insurance-card`;
        const front = await imageToBlob(frontOfCard.fileToUpload);
        await uploadFile(front, `${folder}/front-of-card`);
        const back = await imageToBlob(backOfCard.fileToUpload);
        await uploadFile(back, `${folder}/back-of-card`);
        return Router.push(Pathnames.INSURANCE_OON_ELIGIBLE);
      }

      // extract data
      const { data } = await resizeImage(frontOfCard.fileToUpload, 1024).then(
        data => {
          return extractDataFromCard({
            ...frontOfCard,
            fileToUpload: data,
          });
        }
      );

      // update insurance reducer and navigate to next page
      if (data && data.documentStatus === DocumentStatus.Completed) {
        addInsurancePolicy(mapResponseToDetails(data.formFields!));
        Router.push(Pathnames.INSURANCE_VERIFY);
      } else {
        Router.push(Pathnames.INSURANCE_UNSUPPORTED);
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [
    Router,
    addInsurancePolicy,
    backOfCard,
    currentCardStep,
    extractDataFromCard,
    frontOfCard,
    patient,
    potentialInsurance,
    uploadFile,
  ]);

  return (
    <Container maxWidth="sm">
      <Grid
        container
        margin="0 auto"
        maxWidth="29rem"
        direction="column"
        gap="48px"
      >
        <UploaderCard
          currentCardStep={currentCardStep}
          frontOfCard={frontOfCard}
          onChangeFrontOfCard={handleFrontOfCard}
          backOfCard={backOfCard}
          onChangeBackOfCard={handleBackOfCard}
        />
        <Grid container direction="column" gap="16px">
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {loading && (
            <LoadingModal
              title="Loading insurance information..."
              description="This will take a few seconds."
            />
          )}
          <Button onClick={handleSubmit}>
            {(frontOfCard && Router.query.type === 'front') ||
            (backOfCard && Router.query.type === 'back')
              ? 'Confirm photo'
              : 'Continue'}
          </Button>
          <LoadingButton
            loading={skipLoading}
            disabled={skipLoading}
            color="grey"
            onClick={skipInsurance}
          >
            Pay without insurance
          </LoadingButton>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InsuranceCapture;
