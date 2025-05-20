import { useEffect, useState } from 'react';
import { usePatientState } from '@/components/hooks/usePatient';
import { QuestionWithName } from '@/types/questionnaire';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import GreenArrowUp from '@/components/shared/icons/GreenArrowUp';
import GreenArrowCurve from '@/components/shared/icons/GreenArrowCurve';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import Router from 'next/router';
import { useSubscription } from '@/components/hooks/data';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';

interface PricingProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

interface OptionProps {
  type: CoachingType;
  price: number;
  discounted_price: number;
  name: string | undefined;
  planId: string | undefined;
  id: number | undefined;
  recurring: {
    interval: string;
    interval_count: number;
  };
}

const PricingOptions = ({ question, nextPage }: PricingProps) => {
  const isMobile = useIsMobile();
  const { addCoaching } = useCoachingActions();
  const { weight } = usePatientState();
  const { potentialInsurance } = useIntakeState();
  const [poundsLost, setPoundsLost] = useState<number>();
  const [selectedOption, setSelectedOption] = useState<OptionProps>();
  const { data: nonBundledSubscription } = useSubscription(
    'Zealthy Weight Loss Flexible'
  );
  const { data: bundledSubscription } = useSubscription(
    'Zealthy Weight Loss Semaglutide Flexible'
  );

  useEffect(() => {
    if (weight) {
      const newWeight = Math.floor(weight * 0.8);
      const poundsLost = weight - newWeight;
      setPoundsLost(poundsLost);
    }
  }, [weight]);

  const nonBundledOptions: OptionProps[] = [
    {
      type: CoachingType.WEIGHT_LOSS,
      name: nonBundledSubscription?.name,
      price: 135,
      discounted_price: 19,
      id: nonBundledSubscription?.id,
      planId: nonBundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
    {
      type: CoachingType.WEIGHT_LOSS,
      price: 135,
      discounted_price: 29,
      name: nonBundledSubscription?.name,
      id: nonBundledSubscription?.id,
      planId: nonBundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
    {
      type: CoachingType.WEIGHT_LOSS,
      price: 135,
      discounted_price: 39,
      name: nonBundledSubscription?.name,
      id: nonBundledSubscription?.id,
      planId: nonBundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
  ];

  const semaglutideBundledOptions: OptionProps[] = [
    {
      type: CoachingType.WEIGHT_LOSS,
      name: bundledSubscription?.name,
      price: 297,
      discounted_price: 149,
      id: bundledSubscription?.id,
      planId: bundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
    {
      type: CoachingType.WEIGHT_LOSS,
      price: 297,
      discounted_price: 169,
      name: bundledSubscription?.name,
      id: bundledSubscription?.id,
      planId: bundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
    {
      type: CoachingType.WEIGHT_LOSS,
      price: 297,
      discounted_price: 189,
      name: bundledSubscription?.name,
      id: bundledSubscription?.id,
      planId: bundledSubscription?.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    },
  ];

  const isSemaglutideBundled =
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED;

  const options = isSemaglutideBundled
    ? semaglutideBundledOptions
    : nonBundledOptions;

  const header = isSemaglutideBundled ? (
    <>
      We predict you can lose at least{' '}
      <span style={{ color: '#00872B' }}>{poundsLost}</span> pounds on
      Compounded Semaglutide!
    </>
  ) : (
    <>
      With Zealthy, we predict you can lose at least{' '}
      <span style={{ color: '#00872B' }}>{poundsLost}</span> pounds in 12
      months!
    </>
  );

  const subheader = isSemaglutideBundled
    ? 'Money shouldn’t stop you from getting access to life-changing treatment.'
    : 'At Zealthy we don’t want money to stop you from having access to life-changing treatment';

  const descriptionText = isSemaglutideBundled
    ? 'It costs us approximately $189* to offer you access to treatment for a month.'
    : 'It costs us approximately $29* to offer you access to treatment for 4 weeks.';

  const optionsText = isSemaglutideBundled
    ? 'Choose a price for your first month:'
    : 'Choose a price for your first 4 weeks:';

  const handleSelected = (option: any) => {
    setSelectedOption(option);
    addCoaching(option);
  };
  return (
    <Stack
      gap={4}
      width={isMobile ? '100%' : '130%'}
      display="flex"
      flexDirection="column"
      //   alignItems="center"
      sx={{
        position: isMobile ? '' : 'relative',
        right: isMobile ? 0 : 60,
      }}
    >
      <Typography
        variant={isMobile ? 'h2' : 'h2'}
        fontSize={isMobile ? '1.5rem!important' : ''}
      >
        {header}
      </Typography>
      <Typography
        fontSize="1.2rem!important"
        sx={{ lineHeight: '28px!important' }}
      >
        {subheader}
      </Typography>
      <Typography
        fontWeight={700}
        fontSize="1.2rem!important"
        sx={{ lineHeight: '28px!important' }}
      >
        {descriptionText}
      </Typography>
      <Typography
        fontWeight={700}
        fontSize="1.4rem!important"
        sx={{ lineHeight: '28px!important' }}
      >
        {optionsText}
      </Typography>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems="center"
        sx={{ gap: '0.5rem' }}
      >
        {options.map((option, idx) => {
          const isSelected =
            selectedOption &&
            selectedOption.discounted_price === option.discounted_price;
          return (
            <Box
              key={idx}
              sx={{
                backgroundColor: isSelected
                  ? '#D3F2DD'
                  : 'rgba(119, 119, 119, 0.11)',
                padding: '24px',
                borderRadius: '12px',
                width: isMobile ? '100%' : '189px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleSelected(option)}
            >
              <Typography
                fontSize={isMobile ? '2rem!important' : '1.5rem!important'}
                fontWeight={700}
                sx={{
                  color: isSelected ? '#00531B' : '#000000',
                }}
              >
                ${option.discounted_price}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box
        display="flex"
        justifyContent={isMobile ? '' : 'space-between'}
        sx={{ gap: '1rem' }}
      >
        {isMobile ? <GreenArrowCurve /> : null}
        <Typography
          sx={{
            width: isMobile ? '350px' : '400px',
            lineHeight: '24px!important',
          }}
          fontSize={isMobile ? '1.2rem!important' : '1rem!important'}
        >
          This option helps us support those who need to select the lowest trial
          prices!
        </Typography>
        {isMobile ? null : (
          <Box sx={{ position: 'relative', right: '16%' }}>
            <GreenArrowUp />
          </Box>
        )}
      </Box>

      <Button
        size="large"
        onClick={() =>
          isSemaglutideBundled ? nextPage() : Router.push('/checkout')
        }
        disabled={!selectedOption}
      >
        Continue
      </Button>
      <Typography sx={{ position: 'relative', bottom: '18px' }}>
        *Approx. Cost as of May 2024
      </Typography>
    </Stack>
  );
};

export default PricingOptions;
