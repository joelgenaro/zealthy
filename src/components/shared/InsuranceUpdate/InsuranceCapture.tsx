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
import { imageToBlob } from '@/utils/imageToBlob';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { Database } from '@/lib/database.types';

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

interface InsuranceCaptureProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const mapTypeToFolder: { [key: string]: string } = {
  Primary: 'insurance-card',
  Secondary: 'secondary-insurance-card',
};

const InsuranceCapture = ({ patient }: InsuranceCaptureProps) => {
  const { uploadFile } = useUploadDocument();
  // const { extractDataFromCard } = useInsuranceAsync();
  const [frontOfCard, setFrontOfCard] = useState<FileType | null>(null);
  const [backOfCard, setBackOfCard] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHasInsurance, addInsurancePolicy } = useInsuranceActions();

  const Router = useRouter();
  const policyType = Router.query.policy_type as string;

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

  const skipInsurance = () => {
    addHasInsurance(false);
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  const folder = useMemo(() => {
    const insuranceFolder = mapTypeToFolder[policyType] || 'insurance-card';
    return `patient-${patient?.id}/${insuranceFolder}`;
  }, [policyType, patient]);

  const handleSubmit = async () => {
    if (!patient) return;
    if (!frontOfCard) {
      setError('Please upload front of the card');
      return;
    } else if (currentCardStep === 'front') {
      Router.push({
        pathname: Pathnames.PATIENT_PORTAL_UPDATE_INSURANCE,
        query: { type: 'back', policy_type: policyType },
      });
      return;
    }

    if (!backOfCard) {
      setError('Please upload back of the card');
      return;
    }

    try {
      setLoading(true);

      await Promise.allSettled([
        imageToBlob(frontOfCard.fileToUpload).then(front =>
          uploadFile(front, `${folder}/front`)
        ),
        imageToBlob(backOfCard.fileToUpload).then(back =>
          uploadFile(back, `${folder}/back`)
        ),
      ]);

      Router.push(
        `${Pathnames.PATIENT_PORTAL_INSURANCE_VERIFY}?policy_type=${policyType}`
      );

      // extract data
      // const { data } = await extractDataFromCard(frontOfCard);

      // update insurance reducer and navigate to next page
      // if (data && data.documentStatus === DocumentStatus.Completed) {
      //   addInsurancePolicy(mapResponseToDetails(data.formFields!));
      //   Router.push(
      //     `${Pathnames.PATIENT_PORTAL_INSURANCE_VERIFY}?policy_type=${policyType}`
      //   );
      // } else {
      //   Router.push(Pathnames.PATIENT_PORTAL_INSURANCE_UNSUPPORTED);
      // }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

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
          <Button onClick={handleSubmit}>Continue</Button>
          <Button color="grey" onClick={skipInsurance}>
            Go home
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InsuranceCapture;
