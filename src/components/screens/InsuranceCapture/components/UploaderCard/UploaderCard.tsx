import { Fragment } from 'react';
import { Grid, Typography } from '@mui/material';
import Link from 'next/link';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploader/ImageUploader';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

interface UploaderCardProps {
  frontOfCard: FileType | null;
  backOfCard: FileType | null;
  onChangeFrontOfCard: (file: FileType | null) => void;
  onChangeBackOfCard: (file: FileType | null) => void;
  currentCardStep: 'front' | 'back';
}

const UploaderCard = ({
  frontOfCard,
  backOfCard,
  onChangeFrontOfCard,
  onChangeBackOfCard,
  currentCardStep,
}: UploaderCardProps) => {
  const { potentialInsurance } = useIntakeState();
  return (
    <Fragment>
      <Grid container direction="column" gap="16px">
        <Typography variant="h2">
          {potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2
            ? 'See doctor with or without insurance.'
            : 'Now provide Zealthy with your insurance information.'}
        </Typography>
        {potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2 && (
          <Typography>
            With insurance, you may pay as little as as $0.
          </Typography>
        )}
        <Typography>
          {potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2
            ? `Provide a photo of the ${currentCardStep} of your insurance card`
            : `This will only take a minute of your time. Take photos of the
          ${currentCardStep} of your insurance card`}{' '}
          or, if easier,{' '}
          <Link
            style={{
              color: '#008A2E',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            href="/onboarding/insurance-form"
          >
            enter your details manually.
          </Link>
        </Typography>
      </Grid>
      {currentCardStep === 'front' && (
        <ImageUploader
          title="Front of card"
          subtitle=""
          setFilePath={onChangeFrontOfCard}
          showConfirmationText={false}
          uploadedPhoto={frontOfCard}
        />
      )}
      {currentCardStep === 'back' && (
        <ImageUploader
          title="Back of card"
          subtitle=""
          setFilePath={onChangeBackOfCard}
          showConfirmationText={false}
          uploadedPhoto={backOfCard}
        />
      )}
    </Fragment>
  );
};

export default UploaderCard;
