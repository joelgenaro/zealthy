import Head from 'next/head';
import Persona, { Client } from 'persona';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import CheckmarkList from '@/components/shared/CheckmarkList';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Loading from '@/components/shared/Loading/Loading';
import {
  PrescriptionRequestProps,
  useIsBundled,
  useLanguage,
  usePatient,
} from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useIntakeState } from '@/components/hooks/useIntake';
import BasicModal from '@/components/shared/BasicModal';
import { useUpdatePatient } from '@/components/hooks/mutations';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useRouter } from 'next/router';
import { useStripe } from '@stripe/react-stripe-js';
import { supabaseClient } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { useVWO } from '@/context/VWOContext';

interface IdentityVerificationProps {
  nextPage: (nextPage?: string) => void;
}

const IdentityVerification = ({ nextPage }: IdentityVerificationProps) => {
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { data: isBundled, isFetched: isBundledFetched } = useIsBundled();

  const router = useRouter();
  const stripe = useStripe();
  const vwoClient = useVWO();

  const updatePatient = useUpdatePatient();
  const user = useUser();
  const isMobile = useIsMobile();
  const { specificCare } = useIntakeState();
  const language = useLanguage();
  const isMentalHealth =
    specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION;

  useEffect(() => {
    if (specificCare && specificCare === 'Weight loss') {
      window.freshpaint?.track('weight-loss-post-checkout-id-verify');
    }
  }, [specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-id-verify');
  }, []);

  const trackBundledMetric = async () => {
    if (patient && isBundledFetched) {
      if (isBundled) {
        const requests = await supabase
          .from('prescription_request')
          .select('*')
          .eq('status', 'PRE_INTAKES')
          .eq('patient_id', patient.id)
          .select('*')
          .then(({ data }) => (data || []) as PrescriptionRequestProps[]);

        if (requests.length) {
          let goal;
          if (requests.some(p => p.note?.includes('BUNDLED - 3 months'))) {
            goal = 'bundled3MonthUpsell';
          } else if (
            requests.some(p => p.note?.includes('BUNDLED - 6 months'))
          ) {
            goal = 'bundled6MonthUpsell';
          } else if (
            requests.some(p => p.note?.includes('BUNDLED - 12 months'))
          ) {
            goal = 'bundledYearPlanPurchased';
          }

          if (goal) {
            await vwoClient?.track('8676', goal, patient);
            await vwoClient?.track('9057_1', goal, patient);
            await vwoClient?.track('9057_2', goal, patient);
            await vwoClient?.track('9057_3', goal, patient);
          }
        }
      }
    }
  };

  useEffect(() => {
    trackBundledMetric();
  }, [patient, isBundledFetched]);

  type PersonaResult = {
    inquiryId: string;
    status: string;
  };

  const handleNext = useCallback(() => nextPage(), [nextPage]);

  const handleSkip = () => {
    nextPage();
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

        nextPage();
      } catch (err) {
        console.error('on_complete_idver_err', err);
        setLoading(false);
        nextPage();
      }
    },
    [nextPage, updatePatient, supabase, patient?.id]
  );

  const openPersona = () => {
    setLoadingPersona(true);
    const client: Client = new Persona.Client({
      templateId: 'itmpl_kvAd3iMoqzRmRr8tsUeAqqcX',
      referenceId: user!.id,
      environmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
      language: language === 'esp' ? 'es' : 'en',
      onReady: () => {
        setLoadingPersona(false);
        client.open();
      },
      onComplete,
    });
  };

  let pageTitle = 'Verify Identity | Onboarding | Zealthy';
  let verifyIdentityTitle =
    'Verify your identity to receive your treatment plan.';
  let verifyIdentityDescription =
    "To access treatment, we need a photo of your driver's license or passport. Telemedicine law requires us to verify your identity with a photo ID before beginning a treatment plan, including prescription medication.";
  let ensureThatHeader = 'Ensure that...';
  let identityVerifiedMessage =
    'Good news! You have already verified your identity. Please click Next button to continue';
  let beginVerificationButton = 'Begin verification';
  let continueVerifyLaterButton = 'Continue and verify later';
  let warningModalTitle =
    'Before your provider reviews your responses and is able to write a {0} medication prescription, you must verify your identity.';
  let warningModalDescription =
    'We recommend that you do this now if you have a photo or a physical copy of your identification.';
  let goBackToVerifyButton = 'Go back to verify identity';
  let nextButton = 'Next';

  if (language === 'esp') {
    pageTitle = 'Verificar Identidad | Incorporación | Zealthy';
    verifyIdentityTitle =
      'Verifique su identidad para recibir su plan de tratamiento.';
    verifyIdentityDescription =
      'Para acceder al tratamiento, necesitamos una foto de su licencia de conducir o pasaporte. La ley de telemedicina nos exige verificar su identidad con una identificación con foto antes de comenzar un plan de tratamiento, incluida la medicación recetada.';
    ensureThatHeader = 'Asegúrese de que...';
    identityVerifiedMessage =
      '¡Buenas noticias! Ya ha verificado su identidad. Por favor, haga clic en el botón Siguiente para continuar';
    beginVerificationButton = 'Comenzar verificación';
    continueVerifyLaterButton = 'Continuar y verificar más tarde';
    warningModalTitle =
      'Antes de que su proveedor revise sus respuestas y pueda escribir una receta de medicamento {0}, debe verificar su identidad.';
    warningModalDescription =
      'Le recomendamos que lo haga ahora si tiene una foto o una copia física de su identificación.';
    goBackToVerifyButton = 'Volver a verificar identidad';
    nextButton = 'Siguiente';
  }

  useEffect(() => {
    if (router.query['payment_intent']) {
      setLoading(true);
    }
    const getPiInfo = async () => {
      const data = await stripe?.retrievePaymentIntent(
        router.query['payment_intent_client_secret'] as string
      );

      const klarnaErrors = [
        'Customer cancelled checkout on Klarna',
        'Customer was declined by Klarna',
        'Klarna checkout was not completed and has expired',
      ];

      // Check if Klarna Payment was cancelled
      const cancelledKlarnaPayment = klarnaErrors.includes(
        data?.paymentIntent?.last_payment_error?.message || ''
      );

      // If so, delete the prescription request and go back to payment page
      if (cancelledKlarnaPayment) {
        await supabaseClient
          .from('prescription_request')
          .delete()
          .eq('uncaptured_payment_intent_id', router.query['payment_intent']!)
          .select();

        window.location.href = (
          router.query['redirect-if-failed'] as string
        ).replaceAll('~', '&');
      } else {
        setLoading(false);
      }
    };
    getPiInfo();
  }, [
    router.query['payment_intent'],
    router.query['payment_intent_client_secret'],
    router.query['redirect-if-failed'],
    stripe,
    supabaseClient,
    router,
  ]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {loading ? (
        <Loading />
      ) : (
        <Container maxWidth="xs">
          <Stack gap={isMobile ? '1.5rem' : '1rem'}>
            <Typography variant="h2">{verifyIdentityTitle}</Typography>
            <Typography>{verifyIdentityDescription}</Typography>
            <Stack gap={isMobile ? '1.5rem' : '3rem'}>
              <CheckmarkList
                header={ensureThatHeader}
                listItems={[
                  language === 'esp'
                    ? 'Su identificación con foto no está borrosa ni oscura'
                    : "Your photo ID isn't blurry or dark",
                  language === 'esp'
                    ? 'Su identificación no está cortada'
                    : "Your ID isn't cut off",
                  language === 'esp'
                    ? 'Su identificación es emitida por el gobierno y no está vencida'
                    : 'Your ID is government issued and not expired',
                ]}
              />
              {patient?.has_verified_identity ? (
                <>
                  <Typography color="green" textAlign="center">
                    {identityVerifiedMessage}
                  </Typography>
                  <Button onClick={handleNext} fullWidth>
                    {nextButton}
                  </Button>
                </>
              ) : (
                <Stack gap={2}>
                  <LoadingButton loading={loadingPersona} onClick={openPersona}>
                    {beginVerificationButton}
                  </LoadingButton>
                  <Button
                    size="small"
                    color="grey"
                    onClick={() => setShowWarningModal(true)}
                    fullWidth
                  >
                    {continueVerifyLaterButton}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Container>
      )}
      <BasicModal isOpen={showWarningModal}>
        <Stack gap={4}>
          <Typography variant="h5">
            {warningModalTitle.replace(
              '{0}',
              language === 'esp'
                ? isMentalHealth
                  ? 'de salud mental'
                  : 'GLP-1'
                : isMentalHealth
                ? 'mental health'
                : 'GLP-1'
            )}
            <br />
            <br />
            {warningModalDescription}
          </Typography>
          <Stack gap={2}>
            <Button
              onClick={() => {
                setShowWarningModal(false);
                openPersona();
              }}
            >
              {goBackToVerifyButton}
            </Button>
            <Button color="grey" onClick={handleSkip}>
              {continueVerifyLaterButton}
            </Button>
          </Stack>
        </Stack>
      </BasicModal>
    </>
  );
};

export default IdentityVerification;
