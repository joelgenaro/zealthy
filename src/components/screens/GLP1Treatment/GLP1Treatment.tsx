import {
  Container,
  Typography,
  Button,
  Box,
  Checkbox,
  Stack,
  Link,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientDefaultPayment,
} from '@/components/hooks/data';
import ErrorMessage from '@/components/shared/ErrorMessage';
import PatientPaymentMethod from '@/components/shared/PatientPaymentMethod';
import PaymentEditModal from '@/components/shared/PaymentEditModal';
import { addMonths } from 'date-fns';
import { usePayment } from '@/components/hooks/usePayment';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pathnames } from '@/types/pathnames';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  paApprovedSixMonths,
  paApprovedTwoMonths,
} from '@/utils/freshpaint/events';
import { useVWO } from '@/context/VWOContext';
import { uuid } from 'uuidv4';

const GLP1Treatment = () => {
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient<Database>();
  const review = searchParams?.get('review');
  const authId = searchParams?.get('authId');
  const { createInvoicePayment } = usePayment();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: patientInfo } = usePatient();
  const [checked, setChecked] = useState<string>('');
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data: patientSubscriptions, refetch } =
    useAllVisiblePatientSubscription();
  const vwoClientInstance = useVWO();

  const uniqueKey = useMemo(() => uuid(), [failed]);

  function compareFn(a: any, b: any) {
    if (new Date(a.created_at) < new Date(b.created_at)) {
      return -1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
      return 1;
    }
    return 0;
  }
  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const handleChange = (value: string) => {
    setChecked(value);
  };
  const toggleOpen = () => setOpen(o => !o);

  async function handleConfirmQuantity() {
    if (!checked.length) {
      return setDisplayError(true);
    }
    setDisplayError(false);
    Router.push(
      {
        pathname: `/patient-portal/pa-approved/glp1`,
        query: {
          review: true,
          ...Router.query,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }
  const months = checked === 'bulk' ? 6 : 2;
  const discount = checked === 'bulk' ? '$100' : '$108';
  const price = checked === 'bulk' ? 600 : 216;

  const confirmPurchase = async () => {
    setLoading(true);
    const metadata = {
      zealthy_care: 'Weight loss',
      zealthy_product_name: 'Weight Loss',
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `glp1-bulk`,
      zealthy_patient_id: patientInfo?.id,
    };

    //create invoice payment
    if (price > 0) {
      const { data, error } = await createInvoicePayment(
        patientInfo?.id!,
        price * 100,
        metadata,
        price === 216
          ? '2 Months Weight Loss Membership'
          : '6 Months Weight Loss Membership',
        false,
        uniqueKey
      );

      //handle payment intent
      if (error) {
        setFailed(true);
        setLoading(false);
        return;
      }

      const trialEnd = addMonths(
        new Date(weightLossSubscription?.current_period_end || ''),
        months
      );

      const applyCredit = await axios.post(
        '/api/service/payment/apply-credit-balance',
        {
          referenceId: weightLossSubscription?.reference_id,
          trialEnd,
        }
      );

      if (applyCredit.status === 200) {
        toast.success(`Successfully pre-paid ${months} months of membership`);
        await supabase
          .from('prior_auth')
          .update({
            sub_status: 'READY_TO_PRESCRIBE',
          })
          .eq('id', authId!);

        months === 6
          ? await paApprovedSixMonths(
              patientInfo?.profiles?.id,
              patientInfo?.profiles?.email
            )
          : await Promise.all([
              paApprovedTwoMonths(
                patientInfo?.profiles?.id,
                patientInfo?.profiles?.email
              ),
            ]);
      }
    }
    refetch();
    setLoading(false);
    Router.push(Pathnames.PATIENT_PORTAL);
    return;
  };

  return (
    <Container maxWidth="sm" sx={{ overflow: 'scroll' }}>
      {review && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {checked === 'bulk'
              ? 'Your discount for the next 6 months of your membership has been applied. Remember that in order to have your insurance cover your GLP-1 medication, you must remain under our care (which requires being a Zealthy weight loss member).'
              : 'Your discount for the next 2 months of your membership has been applied. Remember that in order to have your insurance cover your GLP-1 medication, you must pre-pay at least 2 months of membership.'}
          </Typography>
          <Box
            sx={{
              marginBottom: '16px',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid #D8D8D8',
              background: '#FFF',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: '16px !important',
                fontWeight: '600',
                lineHeight: '24px !important',
                color: '#989898',
              }}
            >
              {`Pre-pay next ${months} months of membership`}
            </Typography>
            <Typography variant="body1">
              <Typography
                component="span"
                variant="body1"
                sx={{
                  textDecoration: 'line-through',
                  marginRight: '0.2rem',
                  width: '20px',
                }}
              >
                {'$135/month'}
              </Typography>
              {`${discount}/month`}
            </Typography>
            <Typography variant="body1">
              {`Next ${months} months upfront with discount applied`}
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {`$${price} Due Today`}
            </Typography>
            {paymentMethod ? (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '16px !important',
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    color: '#989898',
                    marginTop: '1.5rem',
                  }}
                >
                  {'Payment'}
                </Typography>
                <Stack gap="16px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={toggleOpen}
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Stack>
              </>
            ) : null}
          </Box>
          <LoadingButton
            fullWidth
            onClick={confirmPurchase}
            loading={loading}
            disabled={loading}
          >
            {`Confirm $${price}.00`}
          </LoadingButton>
          <Typography
            variant="subtitle2"
            fontSize="0.75rem !important"
            sx={{
              fontStyle: 'italic',
              marginTop: '3rem',
              textAlign: 'center',
            }}
          >
            {price === 216
              ? 'Lock in 20% off your next 2 months and make sure that you can get an additional 2 months of medication with insurance coverage.'
              : 'Lock in 26% off your next 6 months and make sure that you can get an additional 6 months of medication with insurance coverage.'}
          </Typography>
        </Box>
      )}
      {!review && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {
              'Congratulations! Your insurance approved covering your medication.'
            }
          </Typography>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {`In order to continue to get your medication, you will need to pre-pay the next 2 or 6 months 
              of membership for up to $205 off and ensure that you can achieve lasting weight loss.`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {`To keep your prior authorization active to have your insurance continue 
              to cover your GLP-1 medication, you must pre-pay for at least 2 months. 
              For a limited time, we are offering this for 20% off!`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`We require you to sign up for multiple months of membership because it 
              enables us to provider care along your weight loss journey, so that we can help you achieve 
              lasting weight loss. Our care team does not find it effective or safe to begin these medications 
              without continuing your care with the same provider at Zealthy across multiple months to ensure clinical 
              safety and quality.`}
          </Typography>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('single')}
          >
            <Box
              sx={{
                borderRadius: '0.75rem',
                background: '#F7F9A5',
                display: 'flex',
                width: '17rem',
                height: '3.25rem',
                padding: '1rem 1.25rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                alignSelf: 'center',
                fontWeight: 600,
              }}
            >{`For a limited time save $54`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'single'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {'Buy next 2 months & get 20% off for a limited time'}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`Your prior authorization to have your medication covered will continue to be effective if you remain a Zealthy member. 
                    To get 20% off your membership for the next 2 months, pay upfront. This is only available for a limited time.`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '3rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('bulk')}
          >
            <Box
              sx={{
                borderRadius: '0.75rem',
                background: '#F7F9A5',
                display: 'flex',
                width: '17rem',
                height: '3.25rem',
                padding: '1rem 1.25rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                alignSelf: 'center',
                fontWeight: 600,
              }}
            >{`For a limited time save $205`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'bulk'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {'Buy next 6 months & get 26% off for a limited time'}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`Your prior authorization to have your medication covered will continue to be effective if you remain a Zealthy member. To get 26% off your membership for the next 5 months, pay upfront. This is only available for a limited time.`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Button
            fullWidth
            sx={{ marginBottom: '1rem' }}
            onClick={handleConfirmQuantity}
          >
            Continue
          </Button>
          {displayError && (
            <ErrorMessage>
              Please select one of the options above to continue.
            </ErrorMessage>
          )}
        </Box>
      )}
      <PaymentEditModal
        onClose={toggleOpen}
        open={open}
        title="Update your card to get your care or prescription"
      />
    </Container>
  );
};

export default GLP1Treatment;
