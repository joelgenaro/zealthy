import Head from 'next/head';
import Router from 'next/router';
import Persona, { Client } from 'persona';
import {
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactElement, useCallback, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import CheckmarkList from '@/components/shared/CheckmarkList';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePostCheckoutNavigation } from '@/context/NavigationContext/NavigationContext';
import Loading from '@/components/shared/Loading/Loading';
import { useUpdatePatient } from '@/components/hooks/mutations';
import { useFutureNotifications } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { usePatient } from '@/components/hooks/data';
const IdentityVerification = () => {
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [loading, setLoading] = useState(false);
  const updatePatient = useUpdatePatient();
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { next } = usePostCheckoutNavigation();
  const { data: notifications } = useFutureNotifications('MOBILE_DOWNLOAD');
  const user = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  type PersonaResult = {
    inquiryId: string;
    status: string;
  };

  const onComplete = useCallback(
    async ({ inquiryId, status }: PersonaResult) => {
      try {
        setLoading(true);
        await updatePatient.mutateAsync({
          has_verified_identity: true,
          persona_inquiry_id: inquiryId,
        });

        const { data: updatedPatient, error } = await supabase
          .from('patient')
          .select('has_verified_identity')
          .eq('id', patient?.id!)
          .single();

        if (error) {
          console.error('Error fetching updated patient:', error);
        } else if (updatedPatient?.has_verified_identity) {
          window?.freshpaint?.track('weight-loss-completed-ID-verification');
        }

        Router.push(next);

        if (!notifications) {
          await supabase.from('notifications').insert({
            display_at: new Date().toISOString(),
            recipient_id: user?.id!,
            sender_id: user?.id!,
            type: 'MOBILE_DOWNLOAD',
          });
        }
      } catch (err) {
        console.error('on_complete_id_ver_err', err);
      } finally {
        setLoading(false);
      }
    },
    [next, updatePatient, user, notifications, supabase]
  );

  const openPersona = () => {
    setLoadingPersona(true);
    const client: Client = new Persona.Client({
      templateId: 'itmpl_kvAd3iMoqzRmRr8tsUeAqqcX',
      referenceId: user!.id,
      environmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
      onReady: () => {
        setLoadingPersona(false);
        client.open();
      },
      onComplete,
      onCancel: ({ inquiryId, sessionToken }) => console.info('onCancel'),
      onError: error => console.error(error),
    });
  };

  return (
    <>
      <Head>
        <title>Verify Identity | Onboarding | Zealthy</title>
      </Head>
      {loading ? (
        <Loading />
      ) : (
        <Container maxWidth="xs">
          <Stack gap={isMobile ? '1.5rem' : '1rem'}>
            <Typography variant="h2">
              {`It’s time to verify your identity.`}
            </Typography>
            <Typography>
              To access treatment, we need a{' '}
              <b>{`photo of your driver’s license or passport`}</b>.
              Telemedicine law requires us to verify your identity with a photo
              ID.
            </Typography>
            <Stack gap={isMobile ? '1.5rem' : '3rem'}>
              <CheckmarkList
                header="Ensure that..."
                listItems={[
                  'Your photo ID isn’t blurry or dark',
                  "Your ID isn't cut off",
                  'Your ID is government issued and not expired',
                ]}
              />
              <LoadingButton loading={loadingPersona} onClick={openPersona}>
                Begin verification
              </LoadingButton>
            </Stack>
          </Stack>
        </Container>
      )}
    </>
  );
};

IdentityVerification.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default IdentityVerification;
