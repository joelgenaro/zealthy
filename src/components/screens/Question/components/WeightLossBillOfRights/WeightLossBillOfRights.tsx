import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Database } from '@/lib/database.types';
import {
  Container,
  Typography,
  Link,
  Checkbox,
  Stack,
  Box,
} from '@mui/material';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { useIntakeState } from '@/components/hooks/useIntake';
import getConfig from '../../../../../../config';

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossBillOfRights = ({ nextPage }: WeightLossMedicalProps) => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { question_name } = Router.query;
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const language = useLanguage();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (
      question_name === 'WL_FC_Q9' &&
      specificCare !== SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT
    ) {
      createVisitAndNavigateAway(
        [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT],
        {
          navigateAway: false,
          resetValues: true,
          requestedQuestionnaires: [],
          resetMedication: true,
          questionnaires: undefined,
          skipQuestionnaires: [],
        }
      );
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT);
    }
  }, [question_name]);

  const type =
    patient?.region === 'FL'
      ? 'Florida Medical Weight Loss Bill of Rights'
      : 'Medical Weight Loss Bill of Rights';

  async function handleContinue() {
    //window.freshpaint?.track("weight-loss-post-checkout-skip-pa");
    if (!patient?.id) return;
    setLoading(true);
    await supabase
      .from('patient_consent')
      .upsert({ patient_id: patient?.id, type })
      .then(() => {
        setLoading(false);
        nextPage();
      });
  }

  let titleText =
    "You're almost there! Please confirm that you've read the below in order to continue to lasting weight loss.";
  let descriptionText =
    'Medical Weight Loss is a supplement to a healthy diet and exercise program. Your provider will review your responses and develop a treatment plan designed just for you.';
  let linkText = 'Medical Weight Loss Bill of Rights';
  let checkboxText = 'I have read and understood the above-linked information';
  let continueButtonText = 'Continue';

  if (language === 'esp') {
    titleText =
      '¡Ya casi está! Por favor, confirme que ha leído lo siguiente para continuar hacia una pérdida de peso duradera.';
    descriptionText =
      'La pérdida de peso médica es un complemento a una dieta saludable y un programa de ejercicios. Su proveedor revisará sus respuestas y desarrollará un plan de tratamiento diseñado especialmente para usted.';
    linkText =
      'Declaración de Derechos del Consumidor para la Pérdida de Peso Médica';
    checkboxText = 'He leído y entendido la información enlazada arriba';
    continueButtonText = 'Continuar';
  }

  return (
    <Container maxWidth="xs">
      <Stack gap={3}>
        <Typography
          variant="h2"
          sx={{
            fontSize: '20px !important',
            lineHeight: '25px !important',
          }}
        >
          {titleText}
        </Typography>
        <Typography variant="body1">{descriptionText}</Typography>
        <Link
          href={`https://www.${
            siteName === 'FitRx' ? 'fitrxapp' : 'getzealthy'
          }.com/${
            patient?.region === 'FL' ? 'florida-' : ''
          }weight-loss-consumer-bill-of-rights`}
          target="_blank"
          sx={{ textDecoration: 'underline' }}
        >
          {linkText}
        </Link>

        <Box
          sx={{
            width: '100%',
            userSelect: 'none',
            backgroundColor: '#F9F6F6',
            padding: '5px',
            paddingRight: '15px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setChecked(!checked)}
        >
          <Checkbox checked={checked} size="small" />
          <Typography fontSize={`${isMobile ? '10' : '13'}px !important`}>
            {checkboxText}
          </Typography>
        </Box>
      </Stack>

      <LoadingButton
        loading={loading}
        disabled={!checked}
        size="small"
        fullWidth
        sx={{ marginTop: '2rem' }}
        onClick={handleContinue}
      >
        {continueButtonText}
      </LoadingButton>
    </Container>
  );
};

export default WeightLossBillOfRights;
