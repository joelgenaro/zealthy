import { usePatient } from '@/components/hooks/data';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { QuestionnaireName } from '@/types/questionnaire';
import { Box, Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Router from 'next/router';
import { useCallback, useState } from 'react';
import getConfig from '../../../../../config';
import { useTheme } from '@mui/system';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import { useRenewSubscription } from '@/components/hooks/mutations';
import { PatientSubscriptionProps } from '@/lib/auth';

const medicationName = (reason: string) => {
  switch (reason) {
    case 'Acne':
      return 'Acne';
    case 'Fine Lines & Wrinkles':
      return 'Anti-Aging';
    case 'Hyperpigmentation Dark Spots':
      return 'Melasma';
    case 'Rosacea':
      return 'Rosacea';

    default:
      return 'Acne';
  }
};

interface CardProps {
  program: {
    intro?: string;
    header?: string;
    subheader?: string;
    buttonColor?: string;
    bgImage?: string;
    image?: string;
    specificCare: SpecificCareOption;
    potentialInsurance?: PotentialInsuranceOption;
    isIntro: boolean;
    isBottle?: boolean;
    path?: string;
    isWeightLoss?: boolean;
    isMH?: boolean;
  };
  newWindow: boolean;
  hasActiveWeightLoss?: boolean;
  cancelledWeightLossSubscription?: PatientSubscriptionProps;
}

const CarouselCard = ({
  program,
  newWindow,
  hasActiveWeightLoss,
  cancelledWeightLossSubscription,
}: CardProps) => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const { addConsultation, removeConsultationV2 } = useConsultationActions();
  const renewPrescription = useRenewSubscription();

  const [showRestartWeightLoss, setShowRestartWeightLoss] = useState(false);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (!patient) return;

    removeConsultationV2();

    if (program.specificCare === 'Skincare') {
      addVariant('trending-card-skincare');
      addSpecificCare(program.specificCare);

      return Router.push(Pathnames.CARE_SELECTION);
    }

    if (
      [
        'Rosacea',
        'Hyperpigmentation Dark Spots',
        'Acne',
        'Fine Lines & Wrinkles',
      ]?.includes(program.specificCare)
    ) {
      const medication = medicationName(program.specificCare);

      addVariant('trending-card-skincare');
      addSpecificCare(program.specificCare);
      addConsultation({
        name: `${medication} Medical Consultation`,
        price: 50,
        discounted_price: 20,
        type: medication as ConsultationType,
      });

      await createVisitAndNavigateAway([program.specificCare], {
        navigateAway: false,
        careType: program.potentialInsurance,
        skipQuestionnaires: [QuestionnaireName.VOUCHED_VERIFICATION],
      });

      Router.push(Pathnames.WHAT_NEXT);
      return;
    }

    if (program.specificCare === 'Enclomiphene') {
      addVariant('trending-card-enclomiphene');
      addSpecificCare(program.specificCare);
    }

    if (program.specificCare === 'Hair loss') {
      addVariant('trending-card-hair-loss');
      addSpecificCare(program.specificCare);
    }

    if (program.specificCare === 'Hair Loss') {
      addVariant('trending-card-hair-loss-f');
      addSpecificCare(program.specificCare);
    }

    setLoading(true);

    addPotentialInsurance(program.potentialInsurance!);
    addSpecificCare(program.specificCare);

    createVisitAndNavigateAway([program.specificCare], {
      careType: program.potentialInsurance,
    });

    return;
  }, [
    addPotentialInsurance,
    addSpecificCare,
    addVariant,
    createVisitAndNavigateAway,
    patient,
    program.potentialInsurance,
    program.specificCare,
  ]);

  const handleNavigate = useCallback(() => {
    if (!!cancelledWeightLossSubscription) {
      return setShowRestartWeightLoss(true);
    }

    if (newWindow) {
      return window.open(program.path || Pathnames.PATIENT_PORTAL, '_blank');
    }

    return Router.push(program.path || Pathnames.PATIENT_PORTAL);
  }, [cancelledWeightLossSubscription, newWindow, program.path]);

  const handleReactivation = useCallback(async () => {
    await renewPrescription.mutateAsync(cancelledWeightLossSubscription);
  }, [renewPrescription, cancelledWeightLossSubscription]);

  return (
    <>
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        onConfirm={handleReactivation}
        onClose={() => setShowRestartWeightLoss(false)}
        title="Reactivate your weight loss subscription?"
        description={[
          'Once you confirm below, your Zealthy Weight Loss subscription will become active.',
          'This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
        ]}
        open={showRestartWeightLoss}
        buttonText="Yes, reactivate"
      />
      <Stack
        onClick={
          hasActiveWeightLoss && program.isWeightLoss
            ? handleNavigate
            : handleClick
        }
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          sx={{
            backgroundImage: program.bgImage
              ? `linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%), url(${program.bgImage})`
              : '',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            borderRadius: '14px',

            boxShadow: '0px 0px 4px 1px rgba(0, 0, 0, 0.10)',
            cursor: 'pointer',
            height: '295px',
            width: '274px',
            padding: '16px 12px',
          }}
        >
          {program.intro ? (
            <Typography
              fontWeight={600}
              variant={isMobile ? 'body1' : 'h3'}
              sx={{
                color: ['Zealthy', 'FitRx'].includes(siteName ?? '')
                  ? '#008A2E'
                  : theme.palette.primary.light,
                fontSize: '1.4rem!important',
                lineHeight: '30px!important',
              }}
            >
              {program.intro}
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" flexDirection="column" width="250px">
                <Typography fontWeight={600}>{program.header}</Typography>
                <Typography fontWeight={600}>{program.subheader}</Typography>
              </Box>
              <Typography
                sx={{
                  backgroundColor: '#FDFFA2',
                  width: '44px',
                  height: 'fit-content',
                  padding: '5.5px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  position: 'relative',
                  bottom: '20%',
                }}
              >
                Rx
              </Typography>
            </Box>
          )}
          {program.image ? (
            <Image
              src={program.image}
              alt={program.header || 'program-image'}
              style={{
                width: program.isBottle ? '200px' : '150px',
                height: program.isWeightLoss
                  ? '72%'
                  : program.isBottle
                  ? '67%'
                  : program.isMH
                  ? '63%'
                  : '70%',
                alignSelf: 'center',
                padding: program.isBottle ? '0' : '10px',
              }}
              width={0}
              height={0}
              quality={100}
            />
          ) : null}
          <Button
            fullWidth
            size="large"
            sx={{
              backgroundColor: program.buttonColor ? program.buttonColor : '',
              color: program.buttonColor
                ? ['Zealthy', 'FitRx'].includes(siteName ?? '')
                  ? '#00531B'
                  : theme.palette.primary.light
                : '',
              height: '40px',
              maxHeight: '70px',
            }}
          >
            Get Started
          </Button>
        </Box>
      </Stack>
    </>
  );
};

export default CarouselCard;
