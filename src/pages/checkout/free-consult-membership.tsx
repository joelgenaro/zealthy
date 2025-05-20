import { ReactElement } from 'react';
import CheckoutLayout from '@/layouts/CheckoutLayout';
import { getAuthProps } from '@/lib/auth';
import { Container, Box, Typography, Grid, Stack, Link } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { usePatientState } from '@/components/hooks/usePatient';
import BottlePhone from '@/components/screens/Checkout/CheckoutV2/asset/BottlePhone';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { styled } from '@mui/system';
import { AssignmentTurnedInOutlined } from '@mui/icons-material';
import CareIcon from '@/components/shared/icons/CareIcon';
import ForumIcon from '@/components/shared/icons/ForumIcon';
import MedicineIcon from '@/components/shared/icons/MedicineIcon';
import PaymentForm from '@/components/screens/Checkout/components/PaymentForm/PaymentForm';
import { useAllPatientInvoices } from '@/components/hooks/data';
import { Check } from '@mui/icons-material';
import Router from 'next/router';

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
`;

const listItems = [
  {
    text: 'Provider reviews your medical history and writes prescription for GLP-1, if appropriate',
    Icon: AssignmentTurnedInOutlined,
  },
  {
    text: 'Access to affordable compound GLP-1 medications without insurance requried',
    Icon: MedicineIcon,
  },
  {
    text: 'You will be matched to a coach to build an individualized weight loss program to supplement your medication',
    Icon: CareIcon,
  },
  {
    text: 'Unlimited messaging with coach and progress tracking',
    Icon: ForumIcon,
  },
];

const FreeConsultMembershipCheckout = () => {
  const { weight } = usePatientState();
  const { data: patientInvoices = [], status } = useAllPatientInvoices();
  const isMobile = useIsMobile();
  const [poundsLost, setPoundsLost] = useState(0);

  const hasPaid3MonthJumpStart = useMemo(() => {
    return !!patientInvoices?.find(
      i =>
        i.status === 'paid' &&
        [
          '3 Month Semaglutide Jumpstart',
          '3 Month Tirzepatide Jumpstart',
        ].includes(i.description ?? '')
    );
  }, [patientInvoices]);

  useEffect(() => {
    if (weight) {
      const newWeight = Math.floor(weight * 0.8);
      const poundsLost = weight - newWeight;
      setPoundsLost(poundsLost);
    }
  }, [weight]);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    if (!hasPaid3MonthJumpStart) {
      Router.push('/checkout');
    }
  }, [status, hasPaid3MonthJumpStart]);

  return (
    <Container maxWidth="md">
      <Grid
        container
        gap={{ sm: '25px', xs: '16px' }}
        maxWidth="590px"
        margin="0 auto"
        direction="column"
      >
        <Box border="1px solid lightgrey" borderRadius={5} padding={4}>
          <Typography variant="h3" fontWeight="bold" marginBottom={2}>
            Thank You
          </Typography>
          <Typography marginBottom={2}>
            You have paid for 3 months of medication and are about to start your
            weight loss journey!
          </Typography>
          <Typography fontWeight="bold">
            Set up your membership subscription below to begin your weight loss
            journey with Zealthy.
          </Typography>
        </Box>
        <Typography variant="h2">{`We predict you will lose ${poundsLost} pounds.`}</Typography>
        <Stack
          sx={{
            borderRadius: '12px',
            width: '100%',
            gap: '0.5rem',
          }}
        >
          <Box
            display="flex"
            sx={{
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <BottlePhone />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <Typography variant="h3" fontWeight={400}>
                {`Doctor-led & Individualized Weight Loss Membership`}
              </Typography>
              <Typography variant="h4">{`Billed every 4 weeks.`} </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: isMobile ? '12px 8px' : '24px 16px',
                backgroundColor: '#04581D',
                borderRadius: '12px',
                color: '#FFFFFF',
                gap: '0.5rem',
                width: 'fit-content',
                textAlign: 'right',
              }}
            >
              <Typography
                fontWeight={600}
                fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
              >
                {`$74.99`}
              </Typography>
              <StrikethroughText
                fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
              >
                {'$135'}
              </StrikethroughText>
            </Box>
          </Box>
          <Box
            border="1px solid lightgrey"
            borderRadius={5}
            padding={3}
            marginBottom={2}
          >
            <Stack direction="column" gap="16px">
              {listItems.map(({ text, Icon }) => (
                <Stack key={text} direction="row" gap="16px">
                  <Typography>
                    <Icon />
                  </Typography>
                  <Typography variant="h4">{text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
          <PaymentForm amount={74.99} buttonText="Get Started" />
          <Box
            display="flex"
            alignItems="center"
            alignSelf="center"
            marginY={3}
          >
            <Check fontSize="small" sx={{ color: '#555' }} />
            <Typography
              variant="body2"
              sx={{ color: '#555', marginLeft: '4px' }}
            >
              FSA & HSA eligible.
            </Typography>
          </Box>
          <Typography textAlign="center">
            By clicking “Confirm” you agree to having reviewed and agreed to
            Zealthy’s{' '}
            <Link
              href="https://www.getzealthy.com/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Use.
            </Link>{' '}
          </Typography>
          <Typography textAlign="center" marginTop={1}>
            By providing your card information, you allow Zealthy to charge
            $74.99 for your monthly membership. The membership is required for
            patients to participate in the Zealthy 3 Month Jump Start program.
            After completing the 3 Month Jump Start program, you will be able to
            get a refill by requesting a refill in your patient portal. You will
            be able to choose between 1, 3, 6, and 12 month medication plans.
            After completing the 3 Month Jump Start program you will be able to
            cancel your membership by logging into your Zealthy account and
            clicking “Profile” in the top right corner and selecting “Manage
            Membership” in the program details section. Your monthly membership
            fees are non-refundable. After the end of the 3 Month Jump Start
            program, you can cancel your membership up to 36 hours before any
            future billing period.
          </Typography>
        </Stack>
      </Grid>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

FreeConsultMembershipCheckout.getLayout = (page: ReactElement) => (
  <CheckoutLayout>{page}</CheckoutLayout>
);

export default FreeConsultMembershipCheckout;
