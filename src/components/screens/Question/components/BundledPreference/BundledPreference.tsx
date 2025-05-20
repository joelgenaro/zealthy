import { useIsMobile } from '@/components/hooks/useIsMobile';
import { QuestionWithName } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import semaglutide from '/public/images/trending/trending1.png';
import tirzepatide from '/public/images/trending/trending2.png';
import Image from 'next/image';
import Router from 'next/router';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { useUpdateOnlineVisit } from '@/components/hooks/mutations';

interface ComponentProps {
  nextPage: (nextPage?: string) => void;
  question: QuestionWithName;
}

const bundledOptions = [
  {
    index: 1,
    header: 'Semaglutide Bundle',
    image: semaglutide,
    subHeader: '(Same active ingredient as Ozempic & Wegovy)',
    percentage: '6.9%',
    fact: 'expected weight loss every 3 months*',
    description: [
      'Receive monthly or quarterly shipments of Semaglutide delivered straight to your door',
      'This plan includes doctor + medication. There are no hidden or extra costs.',
    ],
    pricing: {
      saving: '$80 off',
      price: '$297',
      text: 'Every month after',
      discountedPrice: '$217',
      discountText: 'First month',
    },
    buttonText: 'I’d like to receive Semaglutide',
    study:
      '*This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”',
    potentialInsurance: PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
  },
  {
    index: 2,
    header: 'Tirzepatide Bundle ',
    image: tirzepatide,
    subHeader: '(Same active ingredient as Mounjaro & Zepbound)',
    percentage: '8%',
    fact: 'expected weight loss every 3 months†',
    description: [
      'Receive monthly or quarterly shipments of Tirzepatide delivered straight to your door',
      'This plan includes doctor + medication. There are no hidden or extra costs.',
    ],
    pricing: {
      saving: '$100 off',
      price: '$449',
      text: 'Every month after',
      discountedPrice: '$349',
      discountText: 'First month',
    },
    buttonText: 'I’d like to receive Tirzepatide',
    study:
      '*This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”',
    potentialInsurance: PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
  },
];

const BundledPreference = ({ question, nextPage }: ComponentProps) => {
  const isMobile = useIsMobile();
  const { addPotentialInsurance } = useIntakeActions();
  const { updateVisit } = useVisitActions();
  const { id: visitId } = useVisitState();
  const updateVisitPotentialInsurance = useUpdateOnlineVisit();

  const handleContinue = (potentialInsurance: PotentialInsuranceOption) => {
    addPotentialInsurance(potentialInsurance);
    updateVisitPotentialInsurance.mutateAsync({
      visitId: visitId!,
      update: {
        potential_insurance: potentialInsurance,
      },
    });
    updateVisit({
      questionnaires: [
        {
          name: 'weight-loss-bundled',
          care: 'weight loss bundled',
          entry: 'WEIGHT_L_Q3',
          intro: false,
        },
      ],
    });
    window?.freshpaint?.track('bundled-preference', {
      choice: potentialInsurance,
    });
    Router.push('/questionnaires-v2/weight-loss-bundled/WEIGHT_L_Q3');
  };

  return (
    <Stack
      gap={4}
      width={isMobile ? '100%' : '185%'}
      display="flex"
      flexDirection="column"
      //   alignItems="center"
      sx={{
        position: isMobile ? '' : 'relative',
        right: isMobile ? 0 : 220,
      }}
    >
      <Typography variant="h2">{question?.header}</Typography>

      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        sx={{
          gap: '3rem',
        }}
      >
        {bundledOptions.map(option => (
          <Box key={option.index} display="flex" flexDirection="column">
            <Box
              key={option.index}
              sx={{
                border: '1px solid #000000',
                borderRadius: '12px',
                padding: '64px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: isMobile ? '100%' : '450px',
                maxWidth: '500px',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontSize="1.7rem!important"
                    fontFamily="Gelasio"
                    fontWeight={700}
                    sx={{ lineHeight: '25px!important' }}
                  >
                    {option.header}
                  </Typography>
                  <Typography
                    fontStyle="italic"
                    variant="h4"
                    fontSize="1rem!important"
                    sx={{ paddingTop: '10px' }}
                  >
                    {option.subHeader}
                  </Typography>
                </Box>
                <Image
                  alt={option.header}
                  src={option.image}
                  width={100}
                  height={80}
                  style={{
                    position: 'relative',
                    left: 40,
                    bottom: 10,
                  }}
                />
              </Box>
              <Box display="flex" alignItems="center" sx={{ gap: '0.6rem' }}>
                <Typography
                  fontSize="2.5rem!important"
                  sx={{ color: '#00872B' }}
                >
                  {option.percentage}
                </Typography>
                <Typography>{option.fact}</Typography>
              </Box>
              <Stack gap={3}>
                <Typography
                  fontSize="1.2rem!important"
                  sx={{ lineHeight: '20px!important' }}
                >
                  {option.description[0]}
                </Typography>
                <Typography
                  fontSize="1.2rem!important"
                  sx={{ lineHeight: '20px!important' }}
                >
                  {option.description[1]}
                </Typography>
              </Stack>
              {isMobile ? (
                <Stack gap={2}>
                  <Typography
                    fontWeight={700}
                    sx={{
                      color: '#00531B',
                      backgroundColor: '#CEFFDE',
                      borderRadius: '12px',
                      width: 'fit-content',
                      padding: 'var(--borderRadius, 4px) 12px',
                    }}
                  >
                    {option.pricing.saving}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'relative', left: 10 }}
                  >
                    <Typography
                      fontSize="1.5rem!important"
                      fontWeight={700}
                      sx={{
                        color: '#00872B',
                        position: 'relative',
                        right: 10,
                      }}
                    >
                      {option.pricing.discountedPrice}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      sx={{
                        display: 'flex',
                        position: 'relative',
                        right: 35,
                      }}
                    >
                      {option.pricing.discountText.toLowerCase()}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{
                      gap: '2rem',
                      position: 'relative',
                      left: 10,
                    }}
                  >
                    <Typography sx={{ color: '#8F8989' }}>
                      {option.pricing.price}
                    </Typography>
                    <Typography sx={{ color: '#8F8989' }}>
                      {option.pricing.text.toLowerCase()}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack>
                  <Box display="flex" justifyContent="space-around">
                    <Typography
                      fontWeight={700}
                      sx={{
                        color: '#00531B',
                        backgroundColor: '#CEFFDE',
                        borderRadius: '12px',
                        width: 'fit-content',
                        padding: 'var(--borderRadius, 4px) 12px',
                      }}
                    >
                      {option.pricing.saving}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      sx={{
                        position: 'relative',
                        right: 10,
                      }}
                    >
                      {option.pricing.discountText}
                    </Typography>
                    <Typography
                      fontSize="1.5rem!important"
                      fontWeight={700}
                      sx={{
                        color: '#00872B',
                        position: 'relative',
                        left: 20,
                      }}
                    >
                      {option.pricing.discountedPrice}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    sx={{
                      gap: '2rem',
                      position: 'relative',
                      right: 10,
                    }}
                  >
                    <Typography sx={{ color: '#8F8989' }}>
                      {option.pricing.text}
                    </Typography>
                    <Typography sx={{ color: '#8F8989' }}>
                      {option.pricing.price}
                    </Typography>
                  </Box>
                </Stack>
              )}

              <Button
                fullWidth
                onClick={() => handleContinue(option.potentialInsurance)}
              >
                {option.buttonText}
              </Button>
            </Box>
            {isMobile ? null : (
              <Typography
                variant="h4"
                fontStyle="italic"
                sx={{ color: '#000000', marginTop: '15px' }}
              >
                {option.study}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      {isMobile ? (
        <Box>
          <Typography variant="h4" fontStyle="italic" sx={{ color: '#000000' }}>
            * This is based on data from a 2022 study published in the New
            England Journal of Medicine titled “Tirzepatide Once Weekly for the
            Treatment of Obesity.”
          </Typography>
          <Typography
            variant="h4"
            fontStyle="italic"
            paddingTop="10px"
            sx={{ color: '#000000' }}
          >
            † This is based on data from a 2022 study published in the American
            Medical Association titled “Weight Loss Outcomes Associated With
            Semaglutide Treatment for Patients with Overweight or Obesity.”
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
};

export default BundledPreference;
