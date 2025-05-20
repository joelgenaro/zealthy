import { useState, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Fade,
  IconButton,
} from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions } from '@/components/hooks/useIntake';

interface CardRowProps {
  patient: any;
  imageUrl: string;
  title: string;
  description: string;
  specificCare: SpecificCareOption;
  setShowExclusiveOffer: Dispatch<SetStateAction<boolean>>;
}

const CardRow: React.FC<CardRowProps> = ({
  patient,
  imageUrl,
  title,
  description,
  specificCare,
  setShowExclusiveOffer,
}) => {
  const { addSpecificCare } = useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const handleRedirect = async () => {
    sessionStorage.removeItem('showExclusiveOffer');
    sessionStorage.setItem('shownExclusiveOffer', 'true');
    addSpecificCare(specificCare);

    createVisitAndNavigateAway([specificCare], {
      careType: PotentialInsuranceOption.DEFAULT,
    });

    setShowExclusiveOffer(false);
    return;
  };

  return (
    <Box
      onClick={() => handleRedirect()}
      display="flex"
      alignItems="center"
      sx={{
        backgroundColor: '#FFF8F1',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        ':hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt={title}
        sx={{
          width: '30%',
          objectFit: 'cover',
          marginRight: 2,
        }}
      />

      <Box flex="1">
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#00872B',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Gelasio, serif',
            fontWeight: 500,
            color: '#000',
            marginTop: '4px',
          }}
          variant="h3"
        >
          {description}
        </Typography>
      </Box>

      <IconButton
        sx={{
          color: '#000',
        }}
        aria-label="arrow"
      >
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  );
};

interface ExclusiveOfferPopupProps {
  isOpen: boolean;
  setShowExclusiveOffer: Dispatch<SetStateAction<boolean>>;
}

const desktopSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.default',
  width: '28%',
  height: 'auto',
  p: 4,
  outline: 'none',
  borderRadius: 2,
};

const mobileSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.default',
  width: '90%',
  height: 'auto',
  p: 3,
  outline: 'none',
  borderRadius: 2,
};

const ExclusiveOfferPopup = ({
  isOpen,
  setShowExclusiveOffer,
}: ExclusiveOfferPopupProps) => {
  const { data: patient } = usePatient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMale = patient?.profiles.gender === 'male';

  const handleClose = () => {
    sessionStorage.removeItem('showExclusiveOffer');
    setShowExclusiveOffer(false);
    sessionStorage.setItem('shownExclusiveOffer', 'true');
  };

  const firstCard = {
    imageUrl: isMale
      ? 'https://api.getzealthy.com/storage/v1/object/public/images/programs/ed-pic.svg'
      : 'https://api.getzealthy.com/storage/v1/object/public/images/programs/mental-health-smile.svg',
    title: isMale ? 'Erectile Dysfunction' : 'Mental Health',
    description: 'Get back to you',
    specificCare: isMale
      ? SpecificCareOption.ERECTILE_DYSFUNCTION
      : SpecificCareOption.ANXIETY_OR_DEPRESSION,
  };

  const secondCard = {
    imageUrl: isMale
      ? 'https://api.getzealthy.com/storage/v1/object/public/images/programs/pre-workout-lift.svg'
      : 'https://api.getzealthy.com/storage/v1/object/public/images/programs/birth-control-smile.svg',
    title: isMale ? 'Pre-workout' : 'Birth Control',
    description: isMale ? 'Start strong' : `Find what's best for you`,
    specificCare: isMale
      ? SpecificCareOption.PRE_WORKOUT
      : SpecificCareOption.BIRTH_CONTROL,
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      aria-labelledby="exclusive-offer-title"
      aria-describedby="exclusive-offer-description"
    >
      <Fade in={isOpen}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={isMobile ? mobileSx : desktopSx}
        >
          <Stack alignItems="center" spacing={3} sx={{ width: '100%' }}>
            <Box
              sx={{
                backgroundColor: '#00872B',
                alignSelf: 'flex-start',
                padding: 1,
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{ color: 'white', fontWeight: 'bold' }}
                variant="h5"
                textAlign="center"
                id="exclusive-offer-title"
              >
                Exclusive Offer
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: 'Gelasio, serif',
                fontWeight: 600,
              }}
              variant="h2"
              alignSelf={'flex-start'}
            >
              You've unlocked additional
              <br />
              discounts!
            </Typography>
            <Typography>
              Have some health goals? Save on the first order of any new
              subscription.
            </Typography>
            <CardRow
              patient={patient}
              imageUrl={firstCard.imageUrl}
              title={firstCard.title}
              description={firstCard.description}
              specificCare={firstCard.specificCare}
              setShowExclusiveOffer={setShowExclusiveOffer}
            />
            <CardRow
              patient={patient}
              imageUrl={secondCard.imageUrl}
              title={secondCard.title}
              description={secondCard.description}
              specificCare={secondCard.specificCare}
              setShowExclusiveOffer={setShowExclusiveOffer}
            />
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ExclusiveOfferPopup;
