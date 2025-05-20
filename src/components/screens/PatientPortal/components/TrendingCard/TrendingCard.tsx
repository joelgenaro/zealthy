import { usePatient } from '@/components/hooks/data';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Image from 'next/image';
import Router from 'next/router';
import React, { useCallback, useState } from 'react';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { QuestionnaireName } from '@/types/questionnaire';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';

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

const TrendingCard = ({
  src,
  action,
  newWindow = false,
  specificCare,
  hasActiveWeightLoss,
  isWeightLoss,
  isBottle,
  potentialInsurance,
}: {
  src: any;
  specificCare: SpecificCareOption;
  potentialInsurance?: PotentialInsuranceOption;
  action?: () => void;
  newWindow: boolean;
  hasActiveWeightLoss: boolean;
  isWeightLoss: boolean;
  isBottle: boolean;
}) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const { data: patient } = usePatient();
  const { addConsultation } = useConsultationActions();
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  const handleClick = useCallback(async () => {
    if (!patient) return;

    if (
      [
        'Rosacea',
        'Hyperpigmentation Dark Spots',
        'Acne',
        'Fine Lines & Wrinkles',
      ]?.includes(specificCare)
    ) {
      const medication = medicationName(specificCare);
      addVariant('trending-card-skincare');
      addSpecificCare(specificCare);

      addConsultation({
        name: `${medication} Medical Consultation`,
        price: 50,
        discounted_price: 20,
        type: medication as ConsultationType,
      });

      await createVisitAndNavigateAway([specificCare], {
        navigateAway: false,
        careType: potentialInsurance,
        skipQuestionnaires: [QuestionnaireName.VOUCHED_VERIFICATION],
      });

      Router.push(Pathnames.WHAT_NEXT);
      return;
    }

    if (specificCare === 'Enclomiphene') {
      addVariant('trending-card-enclomiphene');
      addSpecificCare(specificCare);
    }

    if (specificCare === 'Hair loss') {
      addVariant('trending-card-hair-loss');
      addSpecificCare(specificCare);
    }

    if (specificCare === 'Hair Loss') {
      addVariant('trending-card-hair-loss-f');
      addSpecificCare(specificCare);
    }

    setLoading(true);

    addPotentialInsurance(potentialInsurance || null);
    addSpecificCare(specificCare);
    createVisitAndNavigateAway([specificCare], {
      careType: potentialInsurance,
    });

    return;
  }, [
    addConsultation,
    addPotentialInsurance,
    addSpecificCare,
    addVariant,
    createVisitAndNavigateAway,
    patient,
    potentialInsurance,
    specificCare,
  ]);

  const handleNavigate = useCallback(() => {
    if (action) {
      return action();
    }

    if (newWindow) {
      return window.open(src.path || Pathnames.PATIENT_PORTAL, '_blank');
    }

    return Router.push(src.path || Pathnames.PATIENT_PORTAL);
  }, [action, newWindow, src.path]);

  return (
    <Stack
      onClick={
        hasActiveWeightLoss && isWeightLoss ? handleNavigate : handleClick
      }
    >
      {specificCare === SpecificCareOption.ENCLOMIPHENE &&
      patient?.region === 'CA' ? null : (
        <Box
          sx={{
            borderRadius: '12px',
            backgroundColor: '#FFF',
            boxShadow: ' 0px 0px 4px 1px rgba(0, 0, 0, 0.10)',
            cursor: 'pointer',
            height: '90%',
            width: isMobile ? '205px' : '300px',
            padding: '16px 12px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px',
            }}
          >
            <Typography
              sx={{
                backgroundColor: '#FDFFA2',
                width: '40px',
                padding: '5px',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              Rx
            </Typography>
            <Typography
              variant="h4"
              sx={{
                position: 'relative',
                top: '5px',
              }}
            >
              {src.body}
            </Typography>
          </Box>
          {src.img.src ? (
            <Image
              alt="image"
              src={src.img}
              quality={100}
              style={{
                height: isWeightLoss || isBottle ? '140px' : '120px',
                width: isWeightLoss || isBottle ? '50%' : '60%',
                margin: '10px auto',
                display: 'block',
                objectFit: 'contain',
                transform: isWeightLoss || isBottle ? 'scale(1.25)' : '',
              }}
            />
          ) : src.isHardie ? (
            <Image
              alt="image"
              src={src.img}
              quality={100}
              style={{
                height: '110px',
                maxHeight: '115px',
                width: '110px',
                margin: '10px auto',
                display: 'block',
                objectFit: 'contain',
                transform: 'scale(1.2)',
              }}
            />
          ) : (
            <Box
              sx={{
                height: isWeightLoss || isBottle ? '140px' : '120px',
                width: isWeightLoss || isBottle ? '50%' : '60%',
                margin: '10px auto',
                display: 'block',
                objectFit: 'contain',
                transform: isWeightLoss || isBottle ? 'scale(1.25)' : '',
                padding: '10px',
              }}
            >
              <src.img />
            </Box>
          )}
          <Box
            sx={{
              padding: '10px',
              marginBottom: '10px',
            }}
          >
            <Typography
              fontWeight="600"
              sx={{ width: isMobile ? '75%' : '65%' }}
            >
              {src.header}
            </Typography>
            {/* <br/> */}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default TrendingCard;
