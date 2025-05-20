import { Container, Box, Typography, Divider, Link } from '@mui/material';
import { useSelector } from '@/components/hooks/useSelector';
import PaymentForm from '../PaymentForm/PaymentForm';
import { useMemo } from 'react';

const FreeConsultCheckout = () => {
  const medication = useSelector(store => store.visit.medications[0]);
  const totalAmount = useMemo(() => {
    if (medication && medication?.price) {
      return medication.price;
    } else {
      return 0;
    }
  }, [medication]);

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'Gelasio, serif',
          fontWeight: 'bold',
          marginBottom: 3,
        }}
      >
        Lasting weight loss, within reach!
      </Typography>
      <Box my={5} border="1px solid lightgrey" borderRadius={3} boxShadow={3}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            margin: 2,
          }}
        >
          {`Order Summary: ${medication?.name}`}
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <Box paddingX={3}>
          <Box display="flex" flexDirection="row">
            <Box
              component="img"
              src={`/images/free-consult/${
                medication.display_name === 'Semaglutide'
                  ? 'semaglutide-bottle.png'
                  : 'tirzepatide-bottle.png'
              }`}
              alt="Medication"
              sx={{
                height: 150,
                textAlign: 'left',
                marginLeft: -1,
              }}
            />
            <Box
              display="flex"
              flexDirection="column"
              alignSelf="center"
              marginLeft={5}
              gap={1}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                }}
              >
                {medication.display_name}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                }}
              >{`${medication?.recurring.interval_count} Month`}</Typography>
            </Box>
            <Typography
              alignSelf="center"
              marginLeft="auto"
              variant="subtitle1"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
              }}
            >{`$${medication?.price}`}</Typography>
          </Box>
          <Typography textAlign="right" marginY={1}>
            Membership charged separately on next page
          </Typography>
        </Box>
      </Box>
      <PaymentForm amount={totalAmount} />
      <Typography marginTop={5} textAlign="center">
        By clicking the checkout button, you acknowledge that prescription
        products are not returnable and your order cannot be canceled or
        refunded. After completing checkout for your medication, you will be
        asked to checkout again and will be charged separately for your
        membership subscription. By clicking the checkout buttons to order
        medications, supplements, or other goods (see “Recurring Fees” to the
        right on this Order Form), you agree that you are responsible for paying
        for your Zealthy membership for that number of months. Please see our{' '}
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
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Consent to Telehealth
        </Link>{' '}
        and{' '}
        <Link
          href="https://www.getzealthy.com/returns-and-refunds"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Cancellation Policy
        </Link>{' '}
        for more details.
      </Typography>
      <Typography marginTop={3} textAlign="center">
        By submitting your payment information, you confirm that you have
        reviewed and agreed to Zealthy’s{' '}
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
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Consent to Telehealth
        </Link>
        .
      </Typography>
    </Container>
  );
};

export default FreeConsultCheckout;
