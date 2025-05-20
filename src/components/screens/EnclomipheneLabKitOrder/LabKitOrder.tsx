import {
  usePatient,
  usePatientAddress,
  usePatientDefaultPayment,
} from '@/components/hooks/data';
import { usePayment } from '@/components/hooks/usePayment';
import { getCheckoutInvoiceDescription } from '@/utils/getCheckoutInvoiceDescription';
import {
  Button,
  Divider,
  Grid,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box, Container } from '@mui/system';
import axios from 'axios';
import { differenceInCalendarYears, parseISO } from 'date-fns';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Price } from '../Checkout/components/OrderSummary/components/Fee';
import PaymentMethods from '../Checkout/components/PaymentMethods';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

const LabKitOrder = () => {
  const enclomiphenePrice = 72.5;
  const theme = useTheme();
  const supabase = useSupabaseClient<Database>();

  const user = useUser();
  const { data: patient } = usePatient();
  const { data: patientAddress } = usePatientAddress();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { checkout } = usePayment();
  const [isLoading, setIsLoading] = useState(false);

  const patientAge = useMemo(() => {
    return differenceInCalendarYears(
      new Date(),
      parseISO(patient?.profiles?.birth_date || '')
    );
  }, [patient?.profiles?.birth_date]);

  const handleLabkitOrder = useCallback(async () => {
    if (!(patient && patientAddress && patientAge)) {
      toast.error('Cannot find your info, please refresh and try again');
      return { data: null, error: 'Invalid info' };
    }

    try {
      const res = await axios.post(
        '/api/tasso/place-order',
        {
          patient,
          patientAddress,
          patientAge,
          userId: user?.id,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return { data: res.data, error: null };
    } catch (err) {
      console.error('Error calling Tasso:', err);
      return { data: null, error: err };
    }
  }, [patient, patientAddress, patientAge]);

  const verifyAndOrder = async () => {
    setIsLoading(true);
    try {
      // 1) Create Stripe invoice for lab kit
      const metadata: Record<string, unknown> = {
        client_facing: 'true',
        origin_url: process.env.NEXT_PUBLIC_VERCEL_URL,
        zealthy_care: 'Enclomiphene',
        zealthy_patient_id: patient?.id!,
        zealthy_product_name: 'Enclomiphene Lab Kit',
      };
      const invoiceDescription = getCheckoutInvoiceDescription(
        'Enclomiphene',
        ''
      );

      await axios.post('/api/buy_now/purchase_lab_kit', {
        price: enclomiphenePrice,
        metadata,
        description: invoiceDescription,
        patient,
      });

      // 2) Call Tasso to place the order
      const tassoResult = await handleLabkitOrder();
      if (tassoResult.error) {
        setIsLoading(false);
        return toast.error(
          'Error placing order, please try again later.',
          tassoResult.error
        );
      }

      toast.success('Order placed successfully');
      Router.push('/patient-portal');
    } catch (err) {
      console.log('Error in verifyAndOrder:', err);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Grid
        container
        gap={{ sm: '25px', xs: '16px' }}
        maxWidth={'590px'}
        margin="0 auto"
        direction="column"
      >
        <Typography variant="h2">At home lab kit</Typography>
        <Typography
          sx={{
            border: '1px solid',
            borderColor: grey[200],
            borderRadius: '12px',
            padding: '24px',
          }}
          component={'p'}
        >
          Zealthy works with certified lab tests that ships straight to your
          door. The test is painless and ships within 1-3 business days. This
          comes with a pre-packaged label and your results will go directly to a
          Zealthy provider to review and get you started on an enclomiphene
          treatment plan. You are required to upload labs with your total
          testosterone level to get started on enclomiphene, so you’ll need to
          purchase and complete this if you don’t already have these labs to
          upload.
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          sx={{
            padding: '24px',
            border: '2px solid var(--secondary-contrast, #1B1B1B)',
            borderRadius: '12px',
          }}
        >
          <Typography fontWeight="bold">Today&apos;s total</Typography>
          <Price discountPrice={0} price={enclomiphenePrice} />
        </Box>

        <Divider textAlign="center">Pay with your card</Divider>

        <PaymentMethods
          // onError & onSuccess is not used, just declare since PaymentMethods requires them
          onError={() => {}}
          onSuccess={() => Promise.resolve()}
          defaultPaymentMethod={paymentMethod || null}
          totalAmount={enclomiphenePrice}
        />

        <hr
          style={{
            borderTop: '0.5px solid #D8D8D8',
            width: '95%',
            position: 'relative',
            bottom: '1px',
          }}
        />

        <Button
          size="medium"
          type="submit"
          fullWidth
          disabled={isLoading}
          onClick={() => verifyAndOrder()}
        >
          Confirm
        </Button>

        <Box>
          <Typography
            sx={{ margin: '2em 0' }}
            textAlign="center"
            color="#1B1B1B"
            variant="h4"
            padding="0 5px"
          >
            By proceeding, you consent to care and agree to the{' '}
            <Link
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: theme.palette.primary.light,
              }}
              href="https://www.getzealthy.com/terms-of-use/"
              target="_blank"
            >
              Terms of Use
            </Link>{' '}
            including the{' '}
            <Link
              style={{
                textDecoration: 'none',
                fontWeight: 'bold',
                color: theme.palette.primary.light,
              }}
              href="https://www.getzealthy.com/terms-of-use/"
              target="_blank"
            >
              Zealthy Subscription Agreement
            </Link>
            .
          </Typography>
          <Typography
            sx={{ margin: '2em 0' }}
            textAlign="center"
            color="#1B1B1B"
            variant="h4"
            padding="0 5px"
          >
            By providing your card information, you allow Zealthy to charge $
            {enclomiphenePrice}&nbsp; for your at home lab kit. You will be able
            to track your order on your Zealthy home page.
          </Typography>
        </Box>
      </Grid>
    </Container>
  );
};

export default LabKitOrder;
