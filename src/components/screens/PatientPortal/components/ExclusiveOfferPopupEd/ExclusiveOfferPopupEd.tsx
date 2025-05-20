import { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
  IconButton,
} from '@mui/material';
import Ramelteon from '../../../../../../public/images/sleep/ramelteon.png';
import { usePatient, useSpecificCares } from '@/components/hooks/data';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { StaticImageData } from 'next/image';

interface CardRowProps {
  patient: any;
  imageUrl: string | StaticImageData;
  title: string;
  description: string;
  specificCare: SpecificCareOption;
  setShowExclusiveOfferEd: Dispatch<SetStateAction<boolean>>;
}

const CardRow: React.FC<CardRowProps> = ({
  patient,
  imageUrl,
  title,
  description,
  specificCare,
  setShowExclusiveOfferEd,
}) => {
  const { addSpecificCare } = useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const handleRedirect = async () => {
    sessionStorage.removeItem('showExclusiveOfferEd');
    addSpecificCare(specificCare);

    createVisitAndNavigateAway([specificCare], {
      careType: PotentialInsuranceOption.DEFAULT,
    });

    setShowExclusiveOfferEd(false);
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
        src={typeof imageUrl === 'string' ? imageUrl : imageUrl.src}
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

interface ExclusiveOfferPopupEdProps {
  isOpen: boolean;
  setShowExclusiveOfferEd: Dispatch<SetStateAction<boolean>>;
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

const ExclusiveOfferPopupEd = ({
  isOpen,
  setShowExclusiveOfferEd,
}: ExclusiveOfferPopupEdProps) => {
  const { data: patient } = usePatient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMale = patient?.profiles.gender === 'male';
  const { data: specificCares } = useSpecificCares();

  const handleClose = () => {
    sessionStorage.removeItem('showExclusiveOfferEd');
    setShowExclusiveOfferEd(false);
  };

  const weightLossCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/weight-loss-bg.svg',
    title: 'Weight Loss',
    description: 'Lose Weight',
    specificCare: SpecificCareOption.WEIGHT_LOSS,
  };

  const enclomipheneCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/enclo-lift.svg',
    title: 'Enclomiphene',
    description: 'Get back to you',
    specificCare: SpecificCareOption.ENCLOMIPHENE,
  };

  const mentalHealthCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/mental-health-smile.svg',
    title: 'Mental Health',
    description: 'Be Happy',
    specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
  };

  const insomniaCard = {
    imageUrl: Ramelteon,
    title: 'Insomnia',
    description: 'Sleep Well',
    specificCare: SpecificCareOption.SLEEP,
  };

  const hairLossCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/men-hair-loss.svg',
    title: 'Hair Loss',
    description: 'Grow Hair Again',
    specificCare: SpecificCareOption.HAIR_LOSS,
  };

  const preworkoutCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/pre-workout-lift.svg',
    title: 'Pre-workout',
    description: 'Start strong',
    specificCare: SpecificCareOption.PRE_WORKOUT,
  };

  const sexPlusHairCard = {
    imageUrl:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/ed-program.svg',
    title: 'Sex + Hair',
    description: 'Sex + Hair',
    specificCare: SpecificCareOption.SEX_PLUS_HAIR,
  };

  const cardArray = [
    weightLossCard,
    enclomipheneCard,
    mentalHealthCard,
    insomniaCard,
    hairLossCard,
    preworkoutCard,
    sexPlusHairCard,
  ];
  const filteredCards = cardArray.filter(
    card => !specificCares?.includes(card.specificCare)
  );

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
              You&apos;ve unlocked 25% off
            </Typography>
            <Typography>
              Have some health goals? Save 25% on the first order of any new
              subscription.
            </Typography>
            <CardRow
              patient={patient}
              imageUrl={filteredCards?.[0]?.imageUrl}
              title={filteredCards?.[0]?.title}
              description={filteredCards?.[0]?.description}
              specificCare={filteredCards?.[0]?.specificCare}
              setShowExclusiveOfferEd={setShowExclusiveOfferEd}
            />
            <CardRow
              patient={patient}
              imageUrl={filteredCards?.[1]?.imageUrl}
              title={filteredCards?.[1]?.title}
              description={filteredCards?.[1]?.description}
              specificCare={filteredCards?.[1]?.specificCare}
              setShowExclusiveOfferEd={setShowExclusiveOfferEd}
            />
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ExclusiveOfferPopupEd;
