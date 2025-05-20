import ErrorMessage from '@/components/shared/ErrorMessage';
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useSearchParams } from 'next/navigation';
import { CompoundDetailProps } from './CompoundWeightLossRefillTreatment';
import { useState, useEffect } from 'react';
import getConfig from '../../../../../../config';
import ChoiceItem from '@/components/shared/ChoiceItem';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';

interface WeightLossOptionsProps {
  videoUrl?: string;
  displayError: boolean;
  compoundDetails: CompoundDetailProps;
  handleChange: (value: string) => void;
  handleConfirmQuantity: () => Promise<void>;
}

const WeightLossOptions6315Var = ({
  videoUrl,
  displayError,
  compoundDetails,
  handleChange,
  handleConfirmQuantity,
}: WeightLossOptionsProps) => {
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med') as string;
  const checked = searchParams?.get('checked') ?? 'six-month';
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const { addMedication, removeMedication } = useVisitActions();
  const [lastInsertedMedication, setLastInsertedMedication] =
    useState<MedicationType | null>(null);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (!compoundDetails || !medicationSelected) return;

    if (lastInsertedMedication) {
      removeMedication(lastInsertedMedication);
    }

    let newMedication;
    if (checked === 'six-month') {
      newMedication = compoundDetails?.[medicationSelected].medSixMonthData!;
    } else if (checked === 'twelve-month') {
      newMedication = compoundDetails?.[medicationSelected].medTwelveMonthData!;
    } else {
      newMedication =
        checked === 'bulk'
          ? compoundDetails?.[medicationSelected].medBulkData!
          : compoundDetails?.[medicationSelected].medData!;
    }

    if (newMedication) {
      addMedication(newMedication);
      setLastInsertedMedication(newMedication.type);
    }
  }, [
    checked,
    medicationSelected,
    compoundDetails,
    addMedication,
    removeMedication,
  ]);

  return (
    <Box>
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        {`Please select your preferred frequency of ${medicationSelected}.`}
      </Typography>
      <Stack spacing={2} mb={3}>
        <Typography variant="subtitle1">
          You won’t be charged unless your provider approves your Rx request &
          we’re ready to ship it to you.
        </Typography>

        {showVideo && (
          <Typography variant="subtitle1">
            {`Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director? Watch this video.`}
          </Typography>
        )}
        {showVideo && (
          <Box sx={{ marginY: '1rem' }}>
            <video
              width="100%"
              controls
              style={{ borderRadius: '10px' }}
              poster={
                'https://api.getzealthy.com/storage/v1/object/public/images/programs/thumbnail.png'
              }
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}
      </Stack>

      {/** ************************************************************************************ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/** 12 Month Option */}
        {compoundDetails?.[medicationSelected].medTwelveMonthData !==
          undefined && (
          <ChoiceItem
            item={{ text: '12 month supply' }}
            selected={checked === 'twelve-month'}
            handleItem={() => handleChange('twelve-month')}
          />
        )}

        {/** 6 Month Option */}
        {compoundDetails?.[medicationSelected].medSixMonthData !==
          undefined && (
          <ChoiceItem
            item={{ text: '6 month supply' }}
            selected={checked === 'six-month'}
            handleItem={() => handleChange('six-month')}
          />
        )}

        {/** 3 Month Option */}
        {compoundDetails?.[medicationSelected].medBulkData !== undefined && (
          <ChoiceItem
            item={{ text: '3 month supply' }}
            selected={checked === 'bulk'}
            handleItem={() => handleChange('bulk')}
          />
        )}

        {/** 1 Month Option */}
        {compoundDetails?.[medicationSelected].medData !== undefined && (
          <ChoiceItem
            item={{ text: '1 month supply' }}
            selected={checked === 'single'}
            handleItem={() => handleChange('single')}
          />
        )}
      </Box>
      {displayError && (
        <ErrorMessage>
          Please select one of the options above to continue.
        </ErrorMessage>
      )}
    </Box>
  );
};

export default WeightLossOptions6315Var;
