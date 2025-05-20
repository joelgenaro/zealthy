import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Box, Container, Link, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { UpdatePayment } from '../UpdatePatientInfo';
import CheckMarkCircleGreen from '../icons/CheckMarkCircleGreen';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { format } from 'date-fns-tz';

type Patient = {
  id: number | null | undefined;
};

type Payment = Database['public']['Tables']['payment_profile']['Row'];

interface AppointmentProps {
  id: number;
  starts_at: string;
  ends_at: string;
  appointment_type?: string | null | undefined;
  duration: number;
  provider: {
    canvas_practitioner_id: string;
    type: string[];
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface ConfirmationProps {
  appointment: AppointmentProps | null;
  patient: Patient | null;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ProviderAddOn({
  appointment,
  patient,
  onBack,
  onSubmit,
  loading,
}: ConfirmationProps) {
  const supabase = useSupabaseClient<Database>();
  const [page, setPage] = useState<string>('confirm');
  const [patientPayment, setPatientPayment] = useState<Payment | null>(null);
  const [durationPrice, setDurationPrice] = useState<number | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<
    string | null | undefined
  >(null);
  const title = useMemo(() => {
    const isDoctor = !!appointment?.provider?.type?.find(type =>
      type.includes('MD or DO')
    );

    return `${isDoctor ? 'Dr.' : ''} ${appointment?.provider?.first_name} ${
      appointment?.provider?.last_name
    }`;
  }, [appointment]);

  async function fetchPatientPayment() {
    if (!patient?.id) {
      return;
    }
    const payment = await supabase
      .from('payment_profile')
      .select()
      .eq('patient_id', patient?.id)
      .single();

    setStripeCustomerId(payment.data?.customer_id);
    setPatientPayment(payment.data as Payment);
  }

  async function fetchDurationPrice() {
    if (!appointment?.duration) {
      return;
    }
    const duration = await supabase
      .from('encounter_duration')
      .select('price')
      .eq('duration', appointment?.duration)
      .single();

    setDurationPrice(duration.data?.price as number);
  }

  useEffect(() => {
    if (patient?.id) {
      fetchPatientPayment();
    }
  }, [patient?.id]);
  useEffect(() => {
    if (appointment?.duration) {
      fetchDurationPrice();
    }
  }, [appointment?.duration]);

  return (
    <Container maxWidth="xs">
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
              fontSize: '32px !important',
              lineHeight: '38px !important',
            }}
          >
            {'You have added a remote visit to your cart.'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
              marginBottom: '16px',
            }}
          >
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Remote visit'}
              </Typography>
              <Typography variant="subtitle1">{title}</Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {format(
                  new Date(appointment?.starts_at || ''),
                  `MMMM do 'at' h:mm a`
                )}
                -{format(new Date(appointment?.ends_at || ''), 'h:mm a z')}
              </Typography>
              <Link
                onClick={onBack}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Modify'}
              </Link>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Payment'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`**** **** **** ${patientPayment?.last4}`}
              </Typography>
              <Link
                onClick={() => setPage('update-payment')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Edit'}
              </Link>
            </Box>

            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Visit fee'}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`$${durationPrice}.00`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                lineHeight: '22px !important',
                fontWeight: '400',
                fontStyle: 'italic',
                marginBottom: '48px',
              }}
            >
              {
                'You will not be charged until after your visit but you are authorizing us to charge your card once the visit is completed.'
              }
            </Typography>
            <LoadingButton
              sx={{ width: '100%', marginBottom: '36px' }}
              loading={loading}
              disabled={loading}
              onClick={onSubmit}
            >
              {`Confirm visit fee - $${durationPrice}.00`}
            </LoadingButton>
            <Link
              sx={{
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '0.005em',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              Continue without visit
            </Link>
          </Box>{' '}
        </>
      )}
      {page === 'update-payment' && (
        <>
          <UpdatePayment
            stripeCustomerId={stripeCustomerId}
            patientId={patient?.id}
            goHome={() => {
              fetchPatientPayment();
              setPage('confirm');
            }}
          />
        </>
      )}
      {page === 'success' && (
        <>
          <Box
            sx={{
              textAlign: 'center',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
            }}
          >
            <Box sx={{ marginBottom: '14px' }}>
              <CheckMarkCircleGreen />
            </Box>
            <Typography
              component="h2"
              variant="h2"
              sx={{ marginBottom: '32px' }}
            >
              {'Your medication request has been submitted!'}
            </Typography>
            <Link
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              Go back home
            </Link>
          </Box>
        </>
      )}
    </Container>
  );
}
