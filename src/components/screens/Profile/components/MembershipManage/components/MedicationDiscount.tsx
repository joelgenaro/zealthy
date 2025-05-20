import { useIntakeState, useIntakeActions } from '@/components/hooks/useIntake';
import { PatientSubscriptionProps } from '@/lib/auth';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import MedCards from './MedCards';
import { useVWOVariationName } from '@/components/hooks/data';

interface DiscountProps {
  recurringMedication: PatientSubscriptionProps | undefined;
}

const MedicationDiscount = ({ recurringMedication }: DiscountProps) => {
  const { id } = Router.query;
  const { addVariant } = useIntakeActions();
  const { variant } = useIntakeState();

  const medInformation = [
    {
      name: 'Semaglutide',
      description: '(Same active ingredient as Ozempic & Wegovy)',
      img: 'https://api.getzealthy.com/storage/v1/object/public/questions/semaglutide-bottle.svg',
      percentage: 5,
      expected: 'expected weight loss every 3 months*',
    },
    {
      name: 'Tirzepatide',
      description: '(Same active ingredient as Mounjaro and Zepbound)',
      img: 'https://api.getzealthy.com/storage/v1/object/public/questions/tirzepatide-bottle.svg',
      percentage: 7,
      expected: 'expected weight loss every 3 months**',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '1rem',
          }}
        >
          Get an additional 10% off your next semaglutide or tirzepatide order.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
          That’s on top of the 20% discount we’re currently running for the 3
          month supply, for a total of a roughly 30% discount for a 3 month
          supply or a 10% discount for a monthly supply.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
          This discount is only available if you order today.
        </Typography>
        <MedCards medInformation={medInformation} />{' '}
        <Button
          fullWidth
          size="small"
          onClick={() => {
            Router.push('/patient-portal/weight-loss-treatment/compound');
            addVariant('cancellation-discount');
          }}
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          {'Get my discount on GLP-1'}
        </Button>
        <Button
          fullWidth
          color="grey"
          size="small"
          onClick={() => {
            Router.push(
              {
                query: {
                  id,
                  page: recurringMedication?.order_id
                    ? 'cancel-recurring-medication'
                    : 'final-offer',
                },
              },
              undefined,
              { shallow: true }
            );
            window.scrollTo({ top: 0, left: 0 });
          }}
        >
          {'Continue unsubscribe'}
        </Button>
        <Stack mt="1rem">
          <Typography
            fontSize="0.75rem !important"
            fontStyle="italic"
            mt="1rem"
          >
            *This is based on data from a 2022 study published in the American
            Medical Association titled “Weight Loss Outcomes Associated With
            Semaglutide Treatment for Patients with Overweight or Obesity.”
          </Typography>
          <Typography
            fontSize="0.75rem !important"
            fontStyle="italic"
            mt="1rem"
          >
            **This is based on data from a 2022 study published in the New
            England Journal of Medicine titled &quot;Tirzepatide Once Weekly for
            the Treatment of Obesity.&quot;
          </Typography>
        </Stack>
      </>
    </Box>
  );
};

export default MedicationDiscount;
