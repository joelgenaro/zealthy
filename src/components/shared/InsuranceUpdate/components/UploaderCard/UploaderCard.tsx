import { Fragment } from 'react';
import { Grid, Typography } from '@mui/material';
import Link from 'next/link';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploader/ImageUploader';

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
  return (
    <Fragment>
      <Grid container direction="column" gap="16px">
        <Typography variant="h2">
          Provide Zealthy with your insurance information.
        </Typography>
        <Typography>
          This will only take a minute of your time. Take photos of the{' '}
          {currentCardStep} of your insurance card or, if easier,{' '}
          <Link
            style={{
              color: '#008A2E',
              textDecoration: 'none',
              fontWeight: 600,
            }}
            href="/patient-portal/insurance-verify"
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
          uploadedPhoto={frontOfCard}
        />
      )}
      {currentCardStep === 'back' && (
        <ImageUploader
          title="Back of card"
          subtitle=""
          setFilePath={onChangeBackOfCard}
          uploadedPhoto={backOfCard}
        />
      )}
    </Fragment>
  );
};

export default UploaderCard;
